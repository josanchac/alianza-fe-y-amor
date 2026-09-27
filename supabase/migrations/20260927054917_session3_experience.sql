begin;
-- Session 3: additive DTOs, explicit sharing, future plans and recipient-bound invitations.
-- No existing journal, check or membership is rewritten by this migration.
alter function alianza_private.valid_record(text,text,jsonb) rename to valid_record_before_session3;
create function alianza_private.valid_record(k text,ky text,d jsonb) returns boolean language plpgsql stable security invoker set search_path='' as $$
declare f jsonb; entry record; v jsonb;
begin
 if d is null or jsonb_typeof(d)<>'object' then return false; end if;
 if k='rosary_preferences' then
  return coalesce(ky='me' and d ?& array['include','mary','position'] and d-array['include','mary','position']='{}'::jsonb and d->'include'='true'::jsonb and d->>'mary' in ('standard','trinitarian') and d->>'position' in ('start','end'),false);
 end if;
 if k='appearance' and d ? 'progressStyle' then
  if jsonb_typeof(d->'progressStyle') is distinct from 'string' or d->>'progressStyle' not in ('fill','ring') then return false; end if;
  return alianza_private.valid_record_before_session3(k,ky,d-'progressStyle');
 end if;
 if k='sharing' then
  if ky<>'me' or octet_length(d::text)>64000 or not(d ?& array['categories','symbol','relationshipVersion']) or d-array['categories','symbol','relationshipVersion']<>'{}'::jsonb or jsonb_typeof(d->'symbol')<>'boolean' or jsonb_typeof(d->'relationshipVersion') is distinct from 'number' or d->>'relationshipVersion'!~'^[1-9][0-9]{0,8}$' or jsonb_typeof(d->'categories')<>'object' then return false; end if;
  for entry in select * from jsonb_each(d->'categories') loop
   if entry.key not in ('habit','gratitude','offering','meditation','review') then return false; end if;
   f:=entry.value;
   if jsonb_typeof(f)<>'object' or not(f ?& array['mode','keys','future','progress']) or f-array['mode','keys','future','progress']<>'{}'::jsonb or jsonb_typeof(f->'mode') is distinct from 'string' or f->>'mode' not in ('private','all','choose') or jsonb_typeof(f->'keys')<>'array' or jsonb_typeof(f->'future')<>'boolean' or jsonb_typeof(f->'progress')<>'boolean' then return false; end if;
   if jsonb_array_length(f->'keys')>1000 then return false; end if;
   for v in select value from jsonb_array_elements(f->'keys') loop
    if jsonb_typeof(v)<>'string' or length(v#>>'{}')>100 then return false; end if;
   end loop;
  end loop;
  return true;
 end if;
 if k='habit' and d->'frequency' ? 'course' and d->'frequency'->'course' ? 'weekdays' then
  f:=d->'frequency';v:=f->'course'->'weekdays';
  if jsonb_typeof(v)<>'array' or jsonb_array_length(v) not between 1 and 7 then return false; end if;
  if exists(select 1 from jsonb_array_elements(v) x where jsonb_typeof(x)<>'number' or x::text!~'^[0-6]$') then return false; end if;
  return alianza_private.valid_record_before_session3(k,ky,jsonb_set(d,'{frequency,course}',(f->'course')-'weekdays'));
 end if;
 return alianza_private.valid_record_before_session3(k,ky,d);
end $$;
revoke all on function alianza_private.valid_record(text,text,jsonb),alianza_private.valid_record_before_session3(text,text,jsonb) from public,anon,authenticated,alianza_metrics;

create function alianza_private.share_selected(policy jsonb,category text,ky text) returns boolean language sql immutable security invoker set search_path='' as $$
 select coalesce(policy->'categories'->category->>'mode' in ('all','choose') and
 ((policy->'categories'->category->>'mode'='all' and policy->'categories'->category->>'future'='true') or policy->'categories'->category->'keys' ? ky),false)
$$;
revoke all on function alianza_private.share_selected(jsonb,text,text) from public,anon,authenticated,alianza_metrics;

-- Monthly plans are stored separately from active habits, applied exactly once at month start.
create table alianza_private.month_plans(
 owner uuid references alianza_private.members(id) on delete cascade, month text not null,
 data jsonb not null, version integer not null default 1, applied boolean not null default false,
 updated timestamptz not null default now(), epoch integer not null, primary key(owner,month,epoch)
);
alter table alianza_private.month_plans enable row level security;
revoke all on alianza_private.month_plans from public,anon,authenticated,alianza_metrics;

-- A transaction-local effective date allows server-owned history to retain the month boundary.
create or replace function alianza_private.capture_habit_plan() returns trigger language plpgsql security invoker set search_path='' as $$
declare plan jsonb; history jsonb; today text:=coalesce(nullif(current_setting('alianza.plan_date',true),''),to_char(now() at time zone 'America/Costa_Rica','YYYY-MM-DD'));
begin
 if new.kind<>'habit' then return new; end if;
 if not(new.data ? 'frequency') then new.data:=new.data||jsonb_build_object('frequency',case when tg_op='UPDATE' then coalesce(old.data->'frequency','{"period":"day","target":1}'::jsonb) else '{"period":"day","target":1}'::jsonb end);end if;
 plan:=(new.data->'frequency')||jsonb_build_object('from',today,'active',(new.data->>'active')::boolean);
 select data->'versions' into history from alianza_private.records where owner=new.owner and kind='habit_plan' and key=new.key;
 if history is not null and (history->-1)-'from'=plan-'from' then return new;end if;
 select coalesce(jsonb_agg(v order by v->>'from'),'[]'::jsonb) into history from jsonb_array_elements(coalesce(history,'[]'::jsonb)) v where v->>'from'<today;
 insert into alianza_private.records(owner,kind,key,data) values(new.owner,'habit_plan',new.key,jsonb_build_object('versions',history||jsonb_build_array(plan))) on conflict(owner,kind,key) do update set data=excluded.data,version=alianza_private.records.version+1,updated=now();
 return new;
end $$;

create function alianza_private.apply_month_plans(u uuid) returns void language plpgsql security invoker set search_path='' as $$
declare plan record; item jsonb; old alianza_private.records; d jsonb;
begin
 for plan in select * from alianza_private.month_plans where owner=u and epoch=(select data_epoch from alianza_private.members where id=u) and not applied and month<=to_char(now() at time zone 'America/Costa_Rica','YYYY-MM') order by month for update loop
  perform set_config('alianza.plan_date',plan.month||'-01',true);
  for item in select value from jsonb_array_elements(plan.data->'items') loop
   select * into old from alianza_private.records where owner=u::text and kind='habit' and key=item->>'key' for update;
   -- If changed since the plan, keep the newer user edit. Never overwrite silently.
   if old.owner is not null and old.version<>(item->>'version')::int then continue;end if;
   if old.owner is null and (item->>'version')::int<>0 then continue;end if;
   d:=jsonb_set(item->'data','{active}',item->'keep');
   insert into alianza_private.records(owner,kind,key,data) values(u::text,'habit',item->>'key',d)
    on conflict(owner,kind,key) do update set data=excluded.data,version=alianza_private.records.version+1,updated=now();
  end loop;
  perform set_config('alianza.plan_date','',true);
  insert into alianza_private.records(owner,kind,key,data) values(u::text,'purpose',plan.month,jsonb_build_object('text',plan.data->>'purpose','review','')) on conflict do nothing;
  update alianza_private.month_plans set applied=true where owner=u and month=plan.month and epoch=plan.epoch;
 end loop;
end $$;
revoke all on function alianza_private.apply_month_plans(uuid) from public,anon,authenticated,alianza_metrics;

alter function alianza_private.relationship(jsonb) rename to relationship_before_session3;
create function alianza_private.relationship(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); m alianza_private.members; item jsonb; plan alianza_private.month_plans; target text;
begin
 if payload->>'action' is distinct from 'prepare_month' then return alianza_private.relationship_before_session3(payload);end if;
 perform alianza_private.require_pilot_access();select * into m from alianza_private.members where id=u for update;
 if m.id is null then raise insufficient_privilege;end if;
 if (payload->>'dataEpoch')::int is distinct from m.data_epoch or (payload->>'relationshipVersion')::int is distinct from m.relationship_version then raise exception using errcode='PT409',message='Actualizá tu espacio antes de guardar';end if;
 target:=payload->>'month';
 if target is distinct from to_char((now() at time zone 'America/Costa_Rica')+interval '1 month','YYYY-MM') or jsonb_typeof(payload->'items') is distinct from 'array' or jsonb_array_length(payload->'items')>100 or jsonb_typeof(payload->'purpose') is distinct from 'string' or length(payload->>'purpose')>12000 then raise invalid_parameter_value;end if;
 if (select count(distinct x->>'key') from jsonb_array_elements(payload->'items') x)<>jsonb_array_length(payload->'items') then raise invalid_parameter_value;end if;
 for item in select value from jsonb_array_elements(payload->'items') loop
  if jsonb_typeof(item->'keep') is distinct from 'boolean' or jsonb_typeof(item->'version') is distinct from 'number' or item->>'version'!~'^[0-9]{1,9}$' or not coalesce(alianza_private.valid_record('habit',item->>'key',item->'data'),false) then raise invalid_parameter_value;end if;
  if exists(select 1 from alianza_private.records where owner=u::text and kind='habit' and key=item->>'key' and version<>(item->>'version')::int) or ((item->>'version')::int>0 and not exists(select 1 from alianza_private.records where owner=u::text and kind='habit' and key=item->>'key')) then raise exception using errcode='PT409',message='Un compromiso cambió. Revisá el plan actualizado';end if;
 end loop;
 if coalesce((payload->>'version')::int,0)=0 then
  insert into alianza_private.month_plans(owner,month,epoch,data) values(u,target,m.data_epoch,jsonb_build_object('purpose',payload->>'purpose','items',payload->'items')) on conflict do nothing returning * into plan;
 else
  update alianza_private.month_plans set data=jsonb_build_object('purpose',payload->>'purpose','items',payload->'items'),version=version+1,updated=now() where owner=u and epoch=m.data_epoch and month=target and version=(payload->>'version')::int and not applied returning * into plan;
 end if;
 if plan.owner is null then raise exception using errcode='PT409',message='El plan cambió en otro dispositivo. Actualizá antes de guardar';end if;
 return jsonb_build_object('state',alianza_private.data(null));
end $$;
revoke all on function alianza_private.relationship_before_session3(jsonb),alianza_private.relationship(jsonb) from public,anon,authenticated;
grant execute on function alianza_private.relationship(jsonb) to authenticated;

alter function alianza_private.data(jsonb) rename to data_before_session3;
create function alianza_private.data(payload jsonb default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; u uuid:=auth.uid(); spouse alianza_private.members; policy jsonb; r record; d jsonb; rows jsonb:='[]'; f text; m alianza_private.members;
begin
 perform alianza_private.require_pilot_access();select * into m from alianza_private.members where id=u for share;
 if m.id is null then raise insufficient_privilege;end if;
 if payload->>'kind'='sharing' and ((payload->>'relationshipVersion')::int is distinct from m.relationship_version or (payload->'data'->>'relationshipVersion')::int is distinct from m.relationship_version) then raise exception using errcode='PT409',message='La vinculación cambió';end if;
 perform alianza_private.apply_month_plans(u);
 result:=alianza_private.data_before_session3(payload);
 if payload is not null then return result;end if;
 result:=jsonb_set(result,'{own}',(result->'own')||coalesce((select jsonb_agg(jsonb_build_object('owner',u,'kind','month_plan','key',month,'version',version,'updated',updated,'data',data||jsonb_build_object('applied',applied))) from alianza_private.month_plans where owner=u and epoch=m.data_epoch),'[]'::jsonb));
 select * into spouse from alianza_private.members where couple_id=m.couple_id and id<>u;
 if spouse.id is null then return result;end if;
 select data into policy from alianza_private.records where owner=spouse.id::text and kind='sharing' and key='me';
 if policy is null then return result;end if; -- Preserve legacy explicit choices until migrated by their owner.
 if (policy->>'relationshipVersion')::int is distinct from spouse.relationship_version then policy:='{}'::jsonb;end if;
 for r in select * from alianza_private.records where owner=spouse.id::text and kind in ('habit','checks','journal','purpose','review') loop
  d:='{}';
  if r.kind='habit' and alianza_private.share_selected(policy,'habit',r.key) then d:=jsonb_build_object('title',r.data->'title','frequency',r.data->'frequency','moment',r.data->'moment','active',r.data->'active');
  elsif r.kind='checks' and policy->'categories'->'habit'->>'progress'='true' then
   select coalesce(jsonb_object_agg(key,value),'{}') into d from jsonb_each(r.data) where alianza_private.share_selected(policy,'habit',key);
  elsif r.kind='journal' then
   foreach f in array array['gratitude','offering','meditation'] loop
    if alianza_private.share_selected(policy,f,r.key) then d:=d||jsonb_build_object(f,r.data->f);end if;
   end loop;
  elsif r.kind in ('purpose','review') and alianza_private.share_selected(policy,'review',r.kind||':'||r.key) then d:=r.data;
  end if;
  if d<>'{}'::jsonb then rows:=rows||jsonb_build_array(jsonb_build_object('owner',r.owner,'kind',r.kind,'key',r.key,'version',r.version,'updated',r.updated,'data',d));end if;
 end loop;
 result:=jsonb_set(result,'{partner,records}',rows);
 result:=jsonb_set(result,'{partner,symbol}',to_jsonb(''::text));
 if policy->>'symbol'='true' then
  select data into d from alianza_private.records where owner=spouse.id::text and kind='appearance' and key='me';
  result:=jsonb_set(result,'{partner,appearance}',coalesce(d,jsonb_build_object('symbol',spouse.symbol,'image','')));
 end if;
 return result;
end $$;
revoke all on function alianza_private.data_before_session3(jsonb),alianza_private.data(jsonb) from public,anon,authenticated;
grant execute on function alianza_private.data(jsonb) to authenticated;

-- Additional day filter for bounded, non-consecutive commitments.
create function alianza_private.guard_course_weekdays() returns trigger language plpgsql security invoker set search_path='' as $$
declare e record; p jsonb; scheduled integer;
begin
 if new.kind<>'checks' then return new;end if;
 for e in select * from jsonb_each(new.data) loop
  if tg_op='UPDATE' and e.value is not distinct from old.data->e.key then continue;end if;
  if e.value<>'"done"'::jsonb and jsonb_typeof(e.value)<>'number' then continue;end if;
  select v into p from alianza_private.records r cross join lateral jsonb_array_elements(r.data->'versions') v where r.owner=new.owner and r.kind='habit_plan' and r.key=e.key and v->>'from'<=new.key order by v->>'from' desc limit 1;
  if p->'course' ? 'weekdays' and not(p->'course'->'weekdays' @> jsonb_build_array(extract(dow from new.key::date)::int)) then raise exception using errcode='22023',message='Este compromiso no corresponde a esta fecha';end if;
  if p->'course' ? 'weekdays' then
   select count(*) into scheduled from generate_series((p->'course'->>'start')::date,new.key::date,interval '1 day') d where p->'course'->'weekdays' @> jsonb_build_array(extract(dow from d)::int);
   if scheduled>(p->'course'->>'days')::int then raise exception using errcode='22023',message='Este compromiso ya terminó';end if;
  end if;
 end loop;
 return new;
end $$;
revoke all on function alianza_private.guard_course_weekdays() from public,anon,authenticated,alianza_metrics;
create trigger guard_course_weekdays before insert or update on alianza_private.records for each row execute function alianza_private.guard_course_weekdays();
commit;
