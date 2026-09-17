begin;

-- Optional daily meditation and personal prayer texts. Both remain private
-- records; no sharing allowlist is expanded by this migration.
alter function alianza_private.valid_record(text,text,jsonb) rename to valid_record_before_alpha9;
create function alianza_private.valid_record(k text,ky text,d jsonb) returns boolean
language plpgsql stable set search_path='' as $$
declare normalized jsonb:=d; entry record;
begin
 if k='preferences' and d->>'lastSeenRelease'='neca-feedback-2026-09-17' then
  normalized:=jsonb_set(d,'{lastSeenRelease}','"community-2026-09"'::jsonb);
  return alianza_private.valid_record_before_alpha9(k,ky,normalized);
 end if;
 if k='prayers' then
  if ky<>'me' or jsonb_typeof(d)<>'object' or not(d ?& array['personalIdeal','marriageIdeal','homeShrine','alliance'])
   or d-array['personalIdeal','marriageIdeal','homeShrine','alliance']<>'{}'::jsonb then return false; end if;
  for entry in select * from jsonb_each(d) loop
   if jsonb_typeof(entry.value)<>'string' or length(entry.value#>>'{}')>12000 then return false; end if;
  end loop;
  return true;
 end if;
 if k='journal' and d ? 'meditation' then
  if jsonb_typeof(d->'meditation')<>'string' or length(d->>'meditation')>12000
   or d-array['gratitude','offering','meditation']<>'{}'::jsonb then return false; end if;
  normalized:=d-'meditation';
 end if;
 return alianza_private.valid_record_before_alpha9(k,ky,normalized);
end $$;
revoke all on function alianza_private.valid_record_before_alpha9(text,text,jsonb),alianza_private.valid_record(text,text,jsonb) from public,anon,authenticated,alianza_metrics;

-- An exact, complete email is enough to recognize an enabled pilot account.
-- There is still no directory or partial search, and the existing daily rate
-- limit remains in force.
alter function alianza_private.relationship(jsonb) rename to relationship_before_alpha9;
create function alianza_private.relationship(payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); m alianza_private.members; email text; target text; attempts_v integer;
begin
 if payload->>'action' is distinct from 'lookup_recipient' then return alianza_private.relationship_before_alpha9(payload); end if;
 if uid is null then raise insufficient_privilege; end if;
 perform pg_advisory_xact_lock(8254,1);
 select * into m from alianza_private.members where id=uid for share;
 select lower(btrim(u.email)) into email from auth.users u where u.id=uid and u.email_confirmed_at is not null;
 if m.id is null or email is null then raise insufficient_privilege; end if;
 if jsonb_typeof(payload)<>'object' or not(payload ?& array['action','email','relationshipVersion','dataEpoch'])
  or payload-array['action','email','relationshipVersion','dataEpoch']<>'{}'::jsonb
  or jsonb_typeof(payload->'relationshipVersion')<>'number' or payload->>'relationshipVersion'!~'^[1-9][0-9]{0,8}$'
  or jsonb_typeof(payload->'dataEpoch')<>'number' or payload->>'dataEpoch'!~'^[1-9][0-9]{0,8}$' then raise invalid_parameter_value; end if;
 if (payload->>'relationshipVersion')::integer<>m.relationship_version or (payload->>'dataEpoch')::integer<>m.data_epoch then
  raise exception using errcode='PT409',message='Tu espacio cambió; actualizalo e intentá de nuevo'; end if;
 target:=lower(btrim(payload->>'email'));
 if jsonb_typeof(payload->'email')<>'string' or length(target)>254 or target!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  or target=email or m.couple_id is not null then raise invalid_parameter_value; end if;
 insert into alianza_private.pairing_lookup_limits as l(user_id,day,attempts) values(uid,current_date,1)
  on conflict(user_id) do update set day=current_date,attempts=case when l.day=current_date then l.attempts+1 else 1 end
  where l.day<>current_date or l.attempts<20 returning attempts into attempts_v;
 if not found then raise exception using errcode='PT429',message='Por hoy alcanzaste el límite de búsquedas'; end if;
 return jsonb_build_object('candidate',(select jsonb_build_object(
   'name',coalesce(nullif(v.display_name,''),nullif(p.data->>'name',''),recipient.name),
   'email',target)
  from auth.users u
  join alianza_private.members recipient on recipient.id=u.id and recipient.couple_id is null
  left join alianza_private.records p on p.owner=recipient.id::text and p.kind='profile' and p.key='me'
  left join alianza_private.pairing_visibility v on v.user_id=recipient.id
  where u.email_confirmed_at is not null and lower(btrim(u.email))=target limit 1));
end $$;
revoke all on function alianza_private.relationship_before_alpha9(jsonb),alianza_private.relationship(jsonb) from public,anon,authenticated;
grant execute on function alianza_private.relationship(jsonb) to authenticated;

-- The current four-person pilot has already authorized aggregate observation.
-- Keep the legacy consent action harmless for an older cached client, while
-- automatically enabling the fixed, content-free pilot events for members.
create or replace function alianza_private.pilot_metrics(payload jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=alianza_private.metrics_uid();a text:=coalesce(payload->>'action','status');today date:=(now() at time zone 'America/Costa_Rica')::date;e text:=payload->>'event';
begin
 if u is null or not exists(select 1 from alianza_private.account_directory() where id=u and email_confirmed_at is not null) then raise insufficient_privilege;end if;
 if payload is null or jsonb_typeof(payload)<>'object' or payload-array['action','enabled','event']<>'{}'::jsonb then raise invalid_parameter_value;end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,816));
 insert into alianza_private.pilot_consent values(u,true,today)
  on conflict(user_id) do update set enabled=true;
 if a='event' then
  if e is null or e not in ('open','load_ok','load_error','save_ok','save_error','slow_load','view_day','view_week','view_month','view_review','view_history','view_prayer','view_groups','view_personal','view_couple') then raise invalid_parameter_value;end if;
  insert into alianza_private.pilot_days values(u,today,e,1)
   on conflict(user_id,day,event) do update set amount=least(pilot_days.amount+1,10000)
   where excluded.event not like 'view_%' and excluded.event<>'open';
 elsif a not in('status','consent') then raise invalid_parameter_value;end if;
 delete from alianza_private.pilot_days where day<today-89;
 return jsonb_build_object('enabled',true);
end $$;
alter function alianza_private.pilot_metrics(jsonb) owner to alianza_metrics;
revoke all on function alianza_private.pilot_metrics(jsonb) from public,anon;
grant execute on function alianza_private.pilot_metrics(jsonb) to authenticated;

select alianza_private.install_maintenance_triggers();
commit;
