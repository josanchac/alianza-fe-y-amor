-- Current-month preparation is atomic and effective only on the server's CR date.
-- Existing future-month preparation and all other relationship actions are preserved.
begin;
alter function alianza_private.relationship(jsonb) rename to relationship_before_current_month;
create function alianza_private.relationship(payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 u uuid:=auth.uid(); m alianza_private.members; item jsonb; old alianza_private.records;
 p alianza_private.records; mp alianza_private.month_plans; d jsonb; saved alianza_private.records;
 target text:=to_char(now() at time zone 'America/Costa_Rica','YYYY-MM');
 effective text:=to_char(now() at time zone 'America/Costa_Rica','YYYY-MM-DD');
 next_version int; result_items jsonb:='[]'::jsonb;
begin
 if payload->>'action' is distinct from 'save_current_month' then
  return alianza_private.relationship_before_current_month(payload);
 end if;
 perform alianza_private.require_pilot_access();
 select * into m from alianza_private.members where id=u for update;
 if u is null or m.id is null then raise insufficient_privilege;end if;
 if (payload->>'dataEpoch')::int is distinct from m.data_epoch or (payload->>'relationshipVersion')::int is distinct from m.relationship_version then
  raise exception using errcode='PT409',message='Tu espacio cambió. Tu borrador se conserva; actualizá antes de guardar';
 end if;
 if payload->>'month' is distinct from target or payload->>'effectiveDate' is distinct from effective then
  raise exception using errcode='PT409',message='Cambió la fecha del plan. Revisá la fecha actual antes de guardar';
 end if;
 if jsonb_typeof(payload->'items') is distinct from 'array' or jsonb_array_length(payload->'items')>100
 or jsonb_typeof(payload->'purpose') is distinct from 'string' or length(payload->>'purpose')>12000
 or jsonb_typeof(payload->'version') is distinct from 'number' or payload->>'version' !~ '^[0-9]{1,9}$'
 or jsonb_typeof(payload->'purposeVersion') is distinct from 'number' or payload->>'purposeVersion' !~ '^[0-9]{1,9}$'
 then raise invalid_parameter_value;end if;
 if (select count(distinct x->>'key') from jsonb_array_elements(payload->'items') x)<>jsonb_array_length(payload->'items') then raise invalid_parameter_value;end if;
 -- Bring a previously scheduled plan into effect before validating the submitted snapshot.
 perform alianza_private.apply_month_plans(u);
 select * into mp from alianza_private.month_plans where owner=u and month=target and epoch=m.data_epoch for update;
 if coalesce(mp.version,0)<>(payload->>'version')::int then
  raise exception using errcode='PT409',message='El plan cambió. Tu borrador se conserva; revisá la versión actual';
 end if;
 select * into p from alianza_private.records where owner=u::text and kind='purpose' and key=target for update;
 if coalesce(p.version,0)<>(payload->>'purposeVersion')::int then
  raise exception using errcode='PT409',message='El propósito o la revisión cambió. Tu borrador se conserva';
 end if;
 for item in select value from jsonb_array_elements(payload->'items') loop
  if jsonb_typeof(item->'keep') is distinct from 'boolean' or jsonb_typeof(item->'version') is distinct from 'number'
  or item->>'version' !~ '^[0-9]{1,9}$' or item->>'key' like 'rosary-once:%'
  or not coalesce(alianza_private.valid_record('habit',item->>'key',item->'data'),false) then raise invalid_parameter_value;end if;
  select * into old from alianza_private.records where owner=u::text and kind='habit' and key=item->>'key' for update;
  if coalesce(old.version,0)<>(item->>'version')::int then
   raise exception using errcode='PT409',message='Un compromiso cambió. Tu borrador se conserva; revisá la versión actual';
  end if;
 end loop;
 if exists(select 1 from alianza_private.records r where r.owner=u::text and r.kind='habit' and r.key not like 'rosary-once:%'
  and not exists(select 1 from jsonb_array_elements(payload->'items') x where x->>'key'=r.key)) then
  raise exception using errcode='PT409',message='Se agregó otro compromiso. Tu borrador se conserva; revisá la versión actual';
 end if;
 perform set_config('alianza.plan_date',effective,true);
 for item in select value from jsonb_array_elements(payload->'items') loop
  select * into old from alianza_private.records where owner=u::text and kind='habit' and key=item->>'key';
  d:=jsonb_set(item->'data','{active}',item->'keep');
  if old.owner is null or old.data is distinct from d then
   insert into alianza_private.records(owner,kind,key,data) values(u::text,'habit',item->>'key',d)
   on conflict(owner,kind,key) do update set data=excluded.data,version=alianza_private.records.version+1,updated=now()
   returning * into saved;
   next_version:=saved.version;
   -- Keep already authored future choices effective, without changing their content.
   -- Advance only references to the exact version this operation has replaced.
   update alianza_private.month_plans future set data=jsonb_set(future.data,'{items}',
    (select jsonb_agg(case when x->>'key'=item->>'key' and (x->>'version')::int=coalesce(old.version,0)
     then jsonb_set(x,'{version}',to_jsonb(next_version)) else x end order by pos)
     from jsonb_array_elements(future.data->'items') with ordinality as entries(x,pos))),
    version=future.version+1,updated=now()
   where future.owner=u and future.epoch=m.data_epoch and future.month>target and not future.applied
    and exists(select 1 from jsonb_array_elements(future.data->'items') x where x->>'key'=item->>'key' and (x->>'version')::int=coalesce(old.version,0));
  else next_version:=old.version;
  end if;
  result_items:=result_items||jsonb_build_array(item||jsonb_build_object('version',next_version,'data',d));
 end loop;
 perform set_config('alianza.plan_date','',true);
 d:=coalesce(p.data,'{"text":"","review":""}'::jsonb)||jsonb_build_object('text',payload->>'purpose');
 if p.owner is null or p.data is distinct from d then
  insert into alianza_private.records(owner,kind,key,data) values(u::text,'purpose',target,d)
  on conflict(owner,kind,key) do update set data=excluded.data,version=alianza_private.records.version+1,updated=now();
 end if;
 insert into alianza_private.month_plans(owner,month,epoch,data,applied)
 values(u,target,m.data_epoch,jsonb_build_object('purpose',payload->>'purpose','items',result_items,'effectiveDate',effective),true)
 on conflict(owner,month,epoch) do update set data=excluded.data,applied=true,version=alianza_private.month_plans.version+1,updated=now();
 return jsonb_build_object('state',alianza_private.data(null));
end $$;
revoke all on function alianza_private.relationship_before_current_month(jsonb),alianza_private.relationship(jsonb) from public,anon,authenticated;
grant execute on function alianza_private.relationship(jsonb) to authenticated;
commit;
