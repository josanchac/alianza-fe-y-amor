-- No identities, keys, invitations or email sends are included in this migration.
begin;
create table alianza_private.pilot_invitations (
 id uuid primary key default gen_random_uuid(), email text not null unique,
 user_id uuid unique references auth.users(id) on delete restrict,
 label text not null default '' check(length(label)<=80),
 state text not null check(state in ('pending','cancelled','accepted')),
 version integer not null default 1, proof_hash text,
 expires_at timestamptz not null, updated_at timestamptz not null default now(),
 delivery text not null default 'unknown' check(delivery in ('unknown','requested','error')),
 legacy_metrics boolean not null default false,
 accepted_at timestamptz, notice_version text,
 check(email=lower(btrim(email))), check(length(email)<=254),
 check(proof_hash is null or proof_hash ~ '^[a-f0-9]{64}$')
);
create table alianza_private.pilot_invitation_operations (
 id uuid primary key, actor uuid not null references auth.users(id),
 invitation_id uuid not null references alianza_private.pilot_invitations(id),
 action text not null check(action in ('invite','renew','cancel')),
 version integer not null, email text not null,
 created_at timestamptz not null default now(),
 result text not null default 'unknown' check(result in ('unknown','requested','error','cancelled'))
);
alter table alianza_private.pilot_invitations enable row level security;
alter table alianza_private.pilot_invitation_operations enable row level security;
revoke all on alianza_private.pilot_invitations,alianza_private.pilot_invitation_operations from public,anon,authenticated;

-- Use stable identity as well as email. Changing email cannot bypass a cancelled entry.
create function alianza_private.pilot_access_allowed(uid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select not exists(select 1 from alianza_private.pilot_invitations i
 where (i.user_id=uid or i.email=(select lower(btrim(u.email)) from auth.users u where u.id=uid)) and i.state<>'accepted');
$$;
create function alianza_private.require_pilot_access() returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not alianza_private.pilot_access_allowed(auth.uid()) then raise insufficient_privilege; end if;
end $$;
revoke all on function alianza_private.pilot_access_allowed(uuid),alianza_private.require_pilot_access() from public,anon,authenticated;
grant execute on function alianza_private.require_pilot_access() to authenticated;

-- Gate the private entrypoints too; existing public wrappers keep their contract.
alter function alianza_private.data(jsonb) rename to data_before_pilot_invitations;
create function alianza_private.data(payload jsonb default null) returns jsonb language plpgsql security definer set search_path='' as $$
begin perform alianza_private.require_pilot_access();return alianza_private.data_before_pilot_invitations(payload);end $$;
alter function alianza_private.relationship(jsonb) rename to relationship_before_pilot_invitations;
create function alianza_private.relationship(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin perform alianza_private.require_pilot_access();return alianza_private.relationship_before_pilot_invitations(payload);end $$;
alter function alianza_private.community(jsonb) rename to community_before_pilot_invitations;
create function alianza_private.community(payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin perform alianza_private.require_pilot_access();return alianza_private.community_before_pilot_invitations(payload);end $$;
revoke all on function alianza_private.data_before_pilot_invitations(jsonb),alianza_private.relationship_before_pilot_invitations(jsonb),alianza_private.community_before_pilot_invitations(jsonb) from public,anon,authenticated;
revoke all on function alianza_private.data(jsonb),alianza_private.relationship(jsonb),alianza_private.community(jsonb) from public,anon;
grant execute on function alianza_private.data(jsonb),alianza_private.relationship(jsonb),alianza_private.community(jsonb) to authenticated;
create or replace function public.alianza_data(payload jsonb default null) returns jsonb language sql security invoker set search_path='' as $$select alianza_private.data(payload)$$;
create or replace function public.alianza_relationship(payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select alianza_private.relationship(payload)$$;
create or replace function public.alianza_community(payload jsonb default '{}'::jsonb) returns jsonb language sql security invoker set search_path='' as $$select alianza_private.community(payload)$$;
-- Metrics and admin checks already rely on this narrow bridge; pending users disappear from it.
create or replace function alianza_private.account_directory() returns table(id uuid,email text,email_confirmed_at timestamptz)
language sql stable security definer set search_path='' as $$
 select u.id,u.email::text,u.email_confirmed_at from auth.users u join alianza_private.members m on m.id=u.id
 where alianza_private.pilot_access_allowed(u.id);
$$;

-- Only metadata; no content query, tokens, per-person activity or partner assignment.
create function alianza_private.invitation_list() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not alianza_private.is_admin() then raise insufficient_privilege;end if;
 return jsonb_build_object('people',(select coalesce(jsonb_agg(row order by row->>'email'),'[]') from (
 select jsonb_build_object('id',i.id,'email',i.email,'label',i.label,'version',i.version,
 'state',case when i.state='pending' and i.expires_at<=now() then 'expired' else i.state end,
 'delivery',i.delivery,'expiresAt',i.expires_at,'updatedAt',i.updated_at) row from alianza_private.pilot_invitations i
 union all
 select jsonb_build_object('id',null,'email',u.email,'label','','version',0,
 'state',case when u.email_confirmed_at is null then 'legacy_pending' else 'active' end,'delivery',null)
 from alianza_private.members m join auth.users u on u.id=m.id
 where not exists(select 1 from alianza_private.pilot_invitations i where i.user_id=m.id or i.email=lower(btrim(u.email)))
 ) t));
end $$;
create function public.alianza_invitation_list() returns jsonb language sql security invoker set search_path='' as $$select alianza_private.invitation_list()$$;
revoke all on function alianza_private.invitation_list(),public.alianza_invitation_list() from public,anon;
grant execute on function alianza_private.invitation_list(),public.alianza_invitation_list() to authenticated;

-- Privileged backend only. The actor is independently verified by Auth in the Edge Function.
-- Still recheck admin privileges in every transaction, including delivery completion.
create function alianza_private.invitation_operator(p jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare operator_uid uuid:=(p->>'actor')::uuid; a text:=p->>'action'; target text:=lower(btrim(p->>'email'));
 i alianza_private.pilot_invitations; o alianza_private.pilot_invitation_operations;
 uid uuid; confirmed boolean; rid uuid:=(p->>'requestId')::uuid; outcome text;
begin
 perform pg_advisory_xact_lock_shared(8254,42);
 if (select active from public.alianza_service_status where id) then raise sqlstate 'PT503';end if;
 perform 1 from alianza_private.admin_members ad join alianza_private.members m on m.id=ad.user_id
 join auth.users u on u.id=m.id where ad.user_id=operator_uid and u.email_confirmed_at is not null
 and alianza_private.pilot_access_allowed(operator_uid) for share of ad,m;
 if not found then raise insufficient_privilege;end if;
 if p is null or jsonb_typeof(p)<>'object' or octet_length(p::text)>2000
 or p-array['actor','action','email','label','version','requestId','proofHash','result']<>'{}'::jsonb
 or rid is null or a not in('invite','renew','cancel','finish') then raise invalid_parameter_value;end if;
 perform pg_advisory_xact_lock(hashtextextended(operator_uid::text,817));
 if a='finish' then
  select * into o from alianza_private.pilot_invitation_operations where id=rid and pilot_invitation_operations.actor=operator_uid for update;
  outcome:=p->>'result';
  if o.id is null or o.action='cancel' or outcome not in('requested','error','unknown') then raise invalid_parameter_value;end if;
  if o.result<>'unknown' then return jsonb_build_object('result',o.result);end if;
  update alianza_private.pilot_invitation_operations set result=outcome where id=rid;
  update alianza_private.pilot_invitations set delivery=outcome,
    user_id=coalesce(user_id,(select u.id from auth.users u where lower(btrim(u.email))=o.email limit 1))
    where id=o.invitation_id and version=o.version and state='pending';
  return jsonb_build_object('result',outcome);
 end if;
 if target is null or length(target)>254 or target!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 or length(coalesce(p->>'label',''))>80 or coalesce(p->>'version','')!~'^[0-9]{1,8}$' then raise invalid_parameter_value;end if;
 select * into o from alianza_private.pilot_invitation_operations where id=rid;
 if found then
  if o.actor<>operator_uid or o.email<>target or o.action<>a then raise sqlstate 'PT409';end if;
  return jsonb_build_object('replay',true,'result',o.result);
 end if;
 perform pg_advisory_xact_lock(hashtextextended(target,818));
 select * into i from alianza_private.pilot_invitations where email=target for update;
 if coalesce(i.version,0)<>(p->>'version')::integer then raise sqlstate 'PT409';end if;
 select u.id,u.email_confirmed_at is not null into uid,confirmed from auth.users u where lower(btrim(u.email))=target limit 1;
 if i.state='accepted' or (i.id is null and coalesce(confirmed,false)) then raise sqlstate 'PT409';end if;
 if a='cancel' then
  if i.id is null or i.state<>'pending' then raise sqlstate 'PT409';end if;
  update alianza_private.pilot_invitations set state='cancelled',proof_hash=null,version=version+1,updated_at=now() where id=i.id returning * into i;
  insert into alianza_private.pilot_invitation_operations(id,actor,invitation_id,action,version,email,result)
  values(rid,operator_uid,i.id,a,i.version,target,'cancelled');
  return jsonb_build_object('result','cancelled');
 end if;
 if (a='invite' and i.id is not null) or (a='renew' and i.id is null)
 or coalesce(p->>'proofHash','')!~'^[a-f0-9]{64}$' then raise invalid_parameter_value;end if;
 if (select count(*) from alianza_private.pilot_invitation_operations where pilot_invitation_operations.actor=operator_uid and action<>'cancel' and created_at>now()-interval '1 day')>=20
 or (select count(*) from alianza_private.pilot_invitation_operations where email=target and action<>'cancel' and created_at>now()-interval '1 hour')>=3
 or (i.id is not null and i.updated_at>now()-interval '60 seconds') then raise sqlstate 'PT429';end if;
 insert into alianza_private.pilot_invitations(email,user_id,label,state,proof_hash,expires_at,legacy_metrics)
 values(target,uid,btrim(coalesce(p->>'label','')),'pending',p->>'proofHash',now()+interval '24 hours',exists(select 1 from alianza_private.members where id=uid))
 on conflict(email) do update set state='pending',proof_hash=excluded.proof_hash,version=pilot_invitations.version+1,
 expires_at=excluded.expires_at,updated_at=now(),delivery='unknown'
 returning * into i;
 insert into alianza_private.pilot_invitation_operations(id,actor,invitation_id,action,version,email) values(rid,operator_uid,i.id,a,i.version,target);
 return jsonb_build_object('id',i.id,'email',target,'version',i.version,'confirmed',coalesce(confirmed,false),'result','unknown');
end $$;
create function public.alianza_invitation_operator(p jsonb) returns jsonb language sql security invoker set search_path='' as $$select alianza_private.invitation_operator(p)$$;
revoke all on function alianza_private.invitation_operator(jsonb),public.alianza_invitation_operator(jsonb) from public,anon,authenticated;
-- Test harnesses may omit the hosted backend role. Never create a privileged role here.
do $$begin if exists(select 1 from pg_roles where rolname='service_role') then
 grant usage on schema alianza_private to service_role;
 grant execute on function alianza_private.invitation_operator(jsonb),public.alianza_invitation_operator(jsonb) to service_role;
end if;end $$;

create function alianza_private.invitation_entry(p jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); user_email text; i alianza_private.pilot_invitations; a text:=coalesce(p->>'action','status');
begin
 select lower(btrim(u.email)) into user_email from auth.users u where u.id=uid and u.email_confirmed_at is not null;
 if uid is null or user_email is null then raise insufficient_privilege;end if;
 if p is null or jsonb_typeof(p)<>'object' or p-array['action','id','proof','metrics']<>'{}'::jsonb or a not in('status','accept') then raise invalid_parameter_value;end if;
 select * into i from alianza_private.pilot_invitations where user_id=uid or pilot_invitations.email=user_email for update;
 if a='accept' then
  if i.id is null or i.id is distinct from (p->>'id')::uuid or i.email<>user_email
   or coalesce(p->>'proof','')!~'^[a-f0-9]{64}$'
   or i.proof_hash is distinct from encode(sha256(convert_to(p->>'proof','UTF8')),'hex') then raise insufficient_privilege;end if;
  if i.state='accepted' then return jsonb_build_object('state','accepted');end if;
  if i.state<>'pending' or i.expires_at<=now() then raise insufficient_privilege;end if;
  if jsonb_typeof(p->'metrics') is distinct from 'boolean' then raise invalid_parameter_value;end if;
  insert into alianza_private.members(id,name) values(uid,'') on conflict(id) do nothing;
  update alianza_private.pilot_invitations set state='accepted',user_id=uid,accepted_at=now(),notice_version='pilot-privacy-v1',updated_at=now() where id=i.id;
  insert into alianza_private.pilot_consent values(uid,i.legacy_metrics or (p->>'metrics')::boolean,(now() at time zone 'America/Costa_Rica')::date)
   on conflict(user_id) do update set enabled=excluded.enabled;
  return jsonb_build_object('state','accepted');
 end if;
 return jsonb_build_object('state',case when i.id is null then 'existing' when i.state='pending' and i.expires_at<=now() then 'expired' else i.state end,
 'legacyMetrics',coalesce(i.legacy_metrics,true));
end $$;
create function public.alianza_invitation_entry(p jsonb default '{}'::jsonb) returns jsonb language sql security invoker set search_path='' as $$select alianza_private.invitation_entry(p)$$;
revoke all on function alianza_private.invitation_entry(jsonb),public.alianza_invitation_entry(jsonb) from public,anon;
grant execute on function alianza_private.invitation_entry(jsonb),public.alianza_invitation_entry(jsonb) to authenticated;

-- New invitees choose; the prior pilot keeps the agreed automatic measurement.
create function alianza_private.pilot_metrics_legacy(uid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select not exists(select 1 from alianza_private.pilot_invitations where user_id=uid and not legacy_metrics);
$$;
revoke all on function alianza_private.pilot_metrics_legacy(uuid) from public,anon,authenticated;
grant execute on function alianza_private.pilot_metrics_legacy(uuid) to alianza_metrics;
create or replace function alianza_private.pilot_metrics(payload jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=alianza_private.metrics_uid();a text:=coalesce(payload->>'action','status');today date:=(now() at time zone 'America/Costa_Rica')::date;e text:=payload->>'event'; legacy boolean;
begin
 if u is null or not exists(select 1 from alianza_private.account_directory() where id=u and email_confirmed_at is not null) then raise insufficient_privilege;end if;
 if payload is null or jsonb_typeof(payload)<>'object' or payload-array['action','enabled','event']<>'{}'::jsonb then raise invalid_parameter_value;end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,816));
 legacy:=alianza_private.pilot_metrics_legacy(u);
 if legacy then insert into alianza_private.pilot_consent values(u,true,today) on conflict(user_id) do update set enabled=true;
 elsif a='consent' then
  if jsonb_typeof(payload->'enabled') is distinct from 'boolean' then raise invalid_parameter_value;end if;
  insert into alianza_private.pilot_consent values(u,(payload->>'enabled')::boolean,today)
   on conflict(user_id) do update set enabled=excluded.enabled;
  if not (payload->>'enabled')::boolean then delete from alianza_private.pilot_days where user_id=u;end if;
 end if;
 if a='event' then
  if e is null or e not in ('open','load_ok','load_error','save_ok','save_error','slow_load','view_day','view_week','view_month','view_review','view_history','view_prayer','view_groups','view_personal','view_couple') then raise invalid_parameter_value;end if;
  if exists(select 1 from alianza_private.pilot_consent where user_id=u and enabled) then
   insert into alianza_private.pilot_days values(u,today,e,1) on conflict(user_id,day,event) do update set amount=least(pilot_days.amount+1,10000) where excluded.event not like 'view_%' and excluded.event<>'open';
  end if;
 elsif a not in('status','consent') then raise invalid_parameter_value;end if;
 delete from alianza_private.pilot_days where day<today-89;
 return jsonb_build_object('enabled',coalesce((select enabled from alianza_private.pilot_consent where user_id=u),false),'optional',not legacy);
end $$;
alter function alianza_private.pilot_metrics(jsonb) owner to alianza_metrics;
select alianza_private.install_maintenance_triggers();
commit;
