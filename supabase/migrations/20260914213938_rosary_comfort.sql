begin;
-- Per-rosary options do not rewrite any existing rosary or its checkpoints.
create table alianza_private.rosary_settings (
 rosary_id uuid primary key references alianza_private.rosaries(id) on delete cascade,
 include_opening boolean not null default true,
 mary text not null default 'standard' check(mary in ('standard','trinitarian'))
);
alter table alianza_private.rosary_settings enable row level security;
revoke all on alianza_private.rosary_settings from public,anon,authenticated,alianza_metrics;
create trigger service_maintenance_guard before insert or update or delete or truncate on alianza_private.rosary_settings for each statement execute function alianza_private.enforce_maintenance();

alter function alianza_private.community(jsonb) rename to community_before_rosary_comfort;
revoke all on function alianza_private.community_before_rosary_comfort(jsonb) from public,anon,authenticated,alianza_metrics;
create function alianza_private.community(payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); m alianza_private.members; r alianza_private.rosaries;
 a text:=coalesce(payload->>'action','snapshot'); result jsonb; key_v text; ck alianza_private.records; h alianza_private.records;
 today date:=(now() at time zone 'America/Costa_Rica')::date; plan jsonb; skip_v boolean:=false;
begin
 if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null) then raise insufficient_privilege;end if;
 if payload is null or jsonb_typeof(payload)<>'object' or octet_length(payload::text)>250000 then raise invalid_parameter_value;end if;
 perform pg_advisory_xact_lock(8254,1);
 select * into m from alianza_private.members where id=u for share;
 if m.id is null then raise insufficient_privilege;end if;
 if a not in ('snapshot','invite_preview') then
  if coalesce((payload->>'dataEpoch')::int,0)<>m.data_epoch then raise exception using errcode='PT409',message='Recargá tu espacio antes de guardar.';end if;
  if payload ? 'relationshipVersion' and (payload->>'relationshipVersion')::int<>m.relationship_version then raise exception using errcode='PT409',message='La vinculación cambió. Actualizá tu espacio.';end if;
 end if;
 if a in ('rosary_opening','rosary_discard','rosary_today','rosary_step') then
  select * into r from alianza_private.rosaries where id=(payload->>'id')::uuid for update;
  if r.id is null or r.owner_id<>u or r.group_id is not null or r.couple_id is not null or r.cancelled then raise insufficient_privilege;end if;
  if a in ('rosary_opening','rosary_discard','rosary_step') and (payload->>'version')::int is distinct from r.progress_version then raise exception using errcode='PT409',message='El rosario cambió en otra pantalla. Actualizá antes de continuar.';end if;
 end if;
 if a='rosary_opening' then
  if r.personal_step<>0 or jsonb_typeof(payload->'include') is distinct from 'boolean' or coalesce(payload->>'mary','') not in ('standard','trinitarian') then raise invalid_parameter_value;end if;
  insert into alianza_private.rosary_settings values(r.id,(payload->>'include')::boolean,payload->>'mary')
  on conflict(rosary_id) do update set include_opening=excluded.include_opening,mary=excluded.mary;
  update alianza_private.rosaries set progress_version=progress_version+1 where id=r.id;
 elsif a='rosary_discard' then
  if r.personal_step=69 or exists(select 1 from alianza_private.rosary_slots where rosary_id=r.id and done) then raise invalid_parameter_value;end if;
  update alianza_private.rosaries set cancelled=true,progress_version=progress_version+1 where id=r.id;
 elsif a='rosary_today' then
  if r.personal_step<>69 or (select count(*) from alianza_private.rosary_contributions where rosary_id=r.id and user_id=u and day=today)<>5 then raise invalid_parameter_value;end if;
  if payload->>'mode'='once' then
   key_v:='rosary-once:'||today::text;
   select * into h from alianza_private.records where owner=u::text and kind='habit' and key=key_v;
   if h.owner is null then
    perform alianza_private.data(jsonb_build_object('kind','habit','key',key_v,'version',0,'dataEpoch',m.data_epoch,'relationshipVersion',m.relationship_version,
      'data',jsonb_build_object('title','Rezar el rosario','moment','Durante el día','active',false,'anchor','','minimum','','frequency',jsonb_build_object('period','day','target',1))));
    update alianza_private.records set data=jsonb_build_object('versions',jsonb_build_array(
     jsonb_build_object('from',today::text,'period','day','target',1,'active',true),
     jsonb_build_object('from',(today+1)::text,'period','day','target',1,'active',false))),version=version+1,updated=now()
    where owner=u::text and kind='habit_plan' and key=key_v;
   end if;
  elsif payload->>'mode'='existing' then
   key_v:=payload->>'habitKey';
   select * into h from alianza_private.records where owner=u::text and kind='habit' and key=key_v;
   select vv into plan from alianza_private.records hr cross join lateral jsonb_array_elements(hr.data->'versions') vv
    where hr.owner=u::text and hr.kind='habit_plan' and hr.key=key_v and vv->>'from'<=today::text order by vv->>'from' desc limit 1;
   if h.owner is null or not coalesce((plan->>'active')::boolean,(h.data->>'active')::boolean,false) then raise invalid_parameter_value;end if;
  else raise invalid_parameter_value;end if;
  select * into ck from alianza_private.records where owner=u::text and kind='checks' and key=today::text;
  if ck.data->>key_v is distinct from 'done' then
   perform alianza_private.data(jsonb_build_object('kind','checks','key',today::text,'version',coalesce(ck.version,0),'dataEpoch',m.data_epoch,'relationshipVersion',m.relationship_version,'data',coalesce(ck.data,'{}'::jsonb)||jsonb_build_object(key_v,'done')));
  end if;
 elsif a='rosary_step' then
  select not include_opening into skip_v from alianza_private.rosary_settings where rosary_id=r.id;
  if coalesce(skip_v,false) and ((r.personal_step=1 and payload->>'step'='6') or (r.personal_step=6 and payload->>'step'='1')) then
   update alianza_private.rosaries set personal_step=(payload->>'step')::int,progress_version=progress_version+1 where id=r.id;
  else
   if coalesce(skip_v,false) and (payload->>'step')::int between 2 and 5 then raise invalid_parameter_value;end if;
   result:=alianza_private.community_before_rosary_comfort(payload);
  end if;
 else result:=alianza_private.community_before_rosary_comfort(payload);
 end if;
 if result is null then result:=alianza_private.community_before_rosary_comfort(jsonb_build_object('action','snapshot'));end if;
 -- Decorate only rosaries already authorized by the existing snapshot boundary.
 return jsonb_set(result,'{rosaries}',coalesce((select jsonb_agg(item||jsonb_build_object('opening',jsonb_build_object('include',coalesce(s.include_opening,true),'mary',coalesce(s.mary,'standard'))) order by ord)
 from jsonb_array_elements(result->'rosaries') with ordinality e(item,ord) left join alianza_private.rosary_settings s on s.rosary_id=(item->>'id')::uuid),'[]'::jsonb));
end $$;
revoke all on function alianza_private.community(jsonb) from public,anon,authenticated,alianza_metrics;
grant execute on function alianza_private.community(jsonb) to authenticated;
-- SQL-language wrappers are rebound explicitly after renaming their former target.
create or replace function public.alianza_community(payload jsonb default '{}'::jsonb) returns jsonb language sql security invoker set search_path='' as $$select alianza_private.community(payload)$$;
commit;
