begin;
alter function alianza_private.valid_record(text,text,jsonb) rename to valid_record_before_alpha10;
create function alianza_private.valid_record(k text,ky text,d jsonb) returns boolean language sql stable set search_path='' as $$
 select alianza_private.valid_record_before_alpha10(k,ky,case when k='preferences' and d->>'lastSeenRelease'='rosary-progress-2026-09-17' then jsonb_set(d,'{lastSeenRelease}','"neca-feedback-2026-09-17"'::jsonb) else d end)
$$;
revoke all on function alianza_private.valid_record(text,text,jsonb),alianza_private.valid_record_before_alpha10(text,text,jsonb) from public,anon,authenticated,alianza_metrics;
-- Stable step IDs preserve every existing checkpoint; 69 still means finished.
alter table alianza_private.rosaries drop constraint rosaries_personal_step_check;
alter table alianza_private.rosaries add constraint rosaries_personal_step_check check(personal_step between 0 and 71);
create table alianza_private.rosary_order (
 rosary_id uuid primary key references alianza_private.rosaries(id) on delete cascade,
 position text not null check(position in ('start','end'))
);
alter table alianza_private.rosary_order enable row level security;
revoke all on alianza_private.rosary_order from public,anon,authenticated,alianza_metrics;
create trigger service_maintenance_guard before insert or update or delete or truncate on alianza_private.rosary_order for each statement execute function alianza_private.enforce_maintenance();
alter function alianza_private.community(jsonb) rename to community_before_alpha10;
revoke all on function alianza_private.community_before_alpha10(jsonb) from public,anon,authenticated,alianza_metrics;
create function alianza_private.community(payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();m alianza_private.members;r alianza_private.rosaries;position_v text;
 a text:=coalesce(payload->>'action','snapshot');result jsonb;n int;steps int[];idx int;
 today date:=(now() at time zone 'America/Costa_Rica')::date;
begin
 if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null) then raise insufficient_privilege;end if;
 if payload is null or jsonb_typeof(payload)<>'object' or octet_length(payload::text)>250000 then raise invalid_parameter_value;end if;
 perform pg_advisory_xact_lock(8254,1);
 select * into m from alianza_private.members where id=u for share;
 if m.id is null then raise insufficient_privilege;end if;
 if a in ('rosary_opening','rosary_step') then
  if (payload->>'dataEpoch')::int is distinct from m.data_epoch or (payload ? 'relationshipVersion' and (payload->>'relationshipVersion')::int is distinct from m.relationship_version) then raise exception using errcode='PT409',message='Actualizá tu espacio antes de continuar.';end if;
  select * into r from alianza_private.rosaries where id=(payload->>'id')::uuid for update;
  if r.id is null or r.owner_id<>u or r.group_id is not null or r.couple_id is not null or r.cancelled then raise insufficient_privilege;end if;
  if (payload->>'version')::int is distinct from r.progress_version then raise exception using errcode='PT409',message='El rosario cambió en otra pantalla. Actualizá antes de continuar.';end if;
  select position into position_v from alianza_private.rosary_order where rosary_id=r.id;
 end if;
 if a='rosary_opening' and payload ? 'position' then
  if r.personal_step<>0 or coalesce(payload->>'position','') not in ('start','end') or payload->'include' is distinct from 'true'::jsonb or coalesce(payload->>'mary','') not in ('standard','trinitarian') then raise invalid_parameter_value;end if;
  insert into alianza_private.rosary_settings(rosary_id,include_opening,mary) values(r.id,true,payload->>'mary')
  on conflict(rosary_id) do update set include_opening=true,mary=excluded.mary;
  insert into alianza_private.rosary_order(rosary_id,position) values(r.id,payload->>'position') on conflict(rosary_id) do update set position=excluded.position;
  update alianza_private.rosaries set progress_version=progress_version+1 where id=r.id;
 elsif a='rosary_step' and position_v is not null then
  select array_agg(x order by x) into steps from generate_series(7,66) x;
  steps:=case position_v when 'end' then array[0,1,71,70]||steps||array[2,3,4,5,6,67,68,69] else array[0,1,70,2,3,4,5,6]||steps||array[67,68,69] end;
  n:=(payload->>'step')::int;idx:=array_position(steps,r.personal_step);
  if n is null or idx is null or r.personal_step=69 or (n is distinct from steps[idx+1] and n is distinct from steps[idx-1]) then raise invalid_parameter_value;end if;
  update alianza_private.rosaries set personal_step=n,progress_version=progress_version+1 where id=r.id;
  if n=69 then
   insert into alianza_private.rosary_slots select r.id,x,u,true from generate_series(1,5) x on conflict(rosary_id,decade) do update set done=true;
   insert into alianza_private.rosary_contributions select r.id,u,x,today from generate_series(1,5) x on conflict do nothing;
  end if;
 else
  if a='rosary_opening' and position_v is not null then raise invalid_parameter_value;end if;
  result:=alianza_private.community_before_alpha10(payload);
 end if;
 if result is null then result:=alianza_private.community_before_alpha10(jsonb_build_object('action','snapshot'));end if;
 return jsonb_set(result,'{rosaries}',coalesce((select jsonb_agg(case when cfg.position is null then item else jsonb_set(item,'{opening,position}',to_jsonb(cfg.position)) end order by ord)
 from jsonb_array_elements(result->'rosaries') with ordinality e(item,ord) left join alianza_private.rosary_order cfg on cfg.rosary_id=(item->>'id')::uuid),'[]'::jsonb));
end $$;
revoke all on function alianza_private.community(jsonb) from public,anon,authenticated,alianza_metrics;
grant execute on function alianza_private.community(jsonb) to authenticated;
create or replace function public.alianza_community(payload jsonb default '{}'::jsonb) returns jsonb language sql security invoker set search_path='' as $$select alianza_private.community(payload)$$;

-- Only an unused commitment can be deleted. Existing marks and reviews require
-- deactivation through the normal versioned record API, preserving history.
alter function alianza_private.relationship(jsonb) rename to relationship_before_alpha10;
revoke all on function alianza_private.relationship_before_alpha10(jsonb) from public,anon,authenticated,alianza_metrics;
create function alianza_private.relationship(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();m alianza_private.members;h alianza_private.records;k text;
begin
 if payload->>'action' is distinct from 'delete_habit' then return alianza_private.relationship_before_alpha10(payload);end if;
 if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null) then raise insufficient_privilege;end if;
 if jsonb_typeof(payload)<>'object' or not(payload ?& array['action','key','version','dataEpoch','relationshipVersion']) or payload-array['action','key','version','dataEpoch','relationshipVersion']<>'{}'::jsonb then raise invalid_parameter_value;end if;
 -- All record writers hold a shared membership lock: this excludes concurrent
 -- marks, reviews, resets and edits while checking that deletion is safe.
 select * into m from alianza_private.members where id=u for update;
 if m.id is null then raise insufficient_privilege;end if;
 if (payload->>'dataEpoch')::int is distinct from m.data_epoch or (payload->>'relationshipVersion')::int is distinct from m.relationship_version then raise exception using errcode='PT409',message='Actualizá tu espacio antes de continuar.';end if;
 k:=payload->>'key';select * into h from alianza_private.records where owner=u::text and kind='habit' and key=k for update;
 if h.owner is null then raise insufficient_privilege;end if;
 if (payload->>'version')::int is distinct from h.version then raise exception using errcode='PT409',message='El compromiso cambió. Volvé a abrirlo.';end if;
 if exists(select 1 from alianza_private.records where owner=u::text and ((kind='checks' and data ? k) or (kind='habit_review' and data->>'habitKey'=k))) then raise exception using errcode='PT409',message='El compromiso tiene registros. Elegí dejar de seguirlo para conservar su historial.';end if;
 delete from alianza_private.records where owner=u::text and key=k and kind in ('habit_plan','habit');
 return jsonb_build_object('state',alianza_private.data(null));
end $$;
revoke all on function alianza_private.relationship(jsonb) from public,anon,authenticated,alianza_metrics;
grant execute on function alianza_private.relationship(jsonb) to authenticated;
create or replace function public.alianza_relationship(payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select alianza_private.relationship(payload)$$;
commit;
