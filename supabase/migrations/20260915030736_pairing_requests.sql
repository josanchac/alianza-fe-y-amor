begin;
-- Additive upgrade: no existing account, invitation or journal is changed.
create table alianza_private.pairing_visibility(
 user_id uuid primary key references alianza_private.members(id) on delete cascade,
 enabled boolean not null default false,
 display_name text not null check(length(display_name)<=80),
 version integer not null default 1 check(version>0)
);
create table alianza_private.pairing_lookup_limits(
 user_id uuid primary key references alianza_private.members(id) on delete cascade,
 day date not null, attempts integer not null check(attempts between 1 and 20)
);
alter table alianza_private.pairing_visibility enable row level security;
alter table alianza_private.pairing_lookup_limits enable row level security;
revoke all on alianza_private.pairing_visibility,alianza_private.pairing_lookup_limits from public,anon,authenticated;
create index pair_invitation_recipient_pending on alianza_private.pair_invitations(recipient_email,expires_at) where status='pending';

alter function alianza_private.data(jsonb) rename to data_before_pair_requests;
create function alianza_private.data(payload jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb; uid uuid:=auth.uid();
begin
 result:=alianza_private.data_before_pair_requests(payload);
 if payload is not null then return result; end if;
 return result||jsonb_build_object(
  'pairingIdentity',coalesce((select jsonb_build_object('enabled',enabled,'name',display_name,'version',version) from alianza_private.pairing_visibility where user_id=uid),'{"enabled":false,"name":"","version":0}'::jsonb),
  'receivedInvitations',(select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'name',coalesce(nullif(p.data->>'name',''),s.name),'email',su.email,'expiresAt',i.expires_at) order by i.created_at desc),'[]'::jsonb)
   from alianza_private.pair_invitations i
   join auth.users ru on ru.id=uid and lower(btrim(ru.email))=i.recipient_email and ru.email_confirmed_at is not null
   join alianza_private.members r on r.id=uid and r.couple_id is null
   join alianza_private.members s on s.id=i.sender_id and s.couple_id is null
   join auth.users su on su.id=s.id and su.email_confirmed_at is not null
   left join alianza_private.records p on p.owner=s.id::text and p.kind='profile' and p.key='me'
   where i.sender_id<>uid and i.status='pending' and i.expires_at>now()));
end $$;
create or replace function public.alianza_data(payload jsonb default null) returns jsonb
language sql security invoker set search_path='' as $$select alianza_private.data(payload);$$;
revoke all on function alianza_private.data_before_pair_requests(jsonb),alianza_private.data(jsonb) from public,anon,authenticated;
grant execute on function alianza_private.data(jsonb) to authenticated;

alter function alianza_private.relationship(jsonb) rename to relationship_before_requests;
create function alianza_private.relationship(payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); m alianza_private.members; inviter alianza_private.members;
 action text:=payload->>'action'; allowed text[]; email text; target text; result jsonb;
 inv alianza_private.pair_invitations; cid uuid; identity_version integer; who uuid;
begin
 if action not in('lookup_recipient','pairing_visibility','create_request','preview_request','accept_request','reject_request') then
  return alianza_private.relationship_before_requests(payload);
 end if;
 if uid is null then raise insufficient_privilege; end if;
 perform pg_advisory_xact_lock(8254,1);
 select * into m from alianza_private.members where id=uid for share;
 select lower(btrim(u.email)) into email from auth.users u where u.id=uid and u.email_confirmed_at is not null;
 if m.id is null or email is null then raise insufficient_privilege; end if;
 allowed:=array['action','relationshipVersion','dataEpoch']||case action
  when 'lookup_recipient' then array['email'] when 'create_request' then array['email']
  when 'pairing_visibility' then array['enabled','name','version'] else array['id'] end;
 if jsonb_typeof(payload)<>'object' or not(payload ?& allowed) or payload-allowed<>'{}'::jsonb or octet_length(payload::text)>2000
  or jsonb_typeof(payload->'relationshipVersion')<>'number' or payload->>'relationshipVersion'!~'^[1-9][0-9]{0,8}$'
  or jsonb_typeof(payload->'dataEpoch')<>'number' or payload->>'dataEpoch'!~'^[1-9][0-9]{0,8}$' then raise invalid_parameter_value; end if;
 if (payload->>'relationshipVersion')::integer<>m.relationship_version or (payload->>'dataEpoch')::integer<>m.data_epoch then
  raise exception using errcode='PT409',message='Tu espacio cambió; actualizalo e intentá de nuevo'; end if;
 if action in('lookup_recipient','create_request') then
  target:=lower(btrim(payload->>'email'));
  if jsonb_typeof(payload->'email')<>'string' or length(target)>254 or target!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or target=email or m.couple_id is not null then raise invalid_parameter_value; end if;
 end if;
 if action='lookup_recipient' then
  insert into alianza_private.pairing_lookup_limits as l(user_id,day,attempts) values(uid,current_date,1)
   on conflict(user_id) do update set day=current_date,attempts=case when l.day=current_date then l.attempts+1 else 1 end
   where l.day<>current_date or l.attempts<20 returning attempts into identity_version;
  if not found then raise exception using errcode='PT429',message='Por hoy alcanzaste el límite de búsquedas. Podés enviar la solicitud por correo completo'; end if;
  return jsonb_build_object('candidate',(select jsonb_build_object('name',v.display_name,'email',target)
   from alianza_private.pairing_visibility v join auth.users u on u.id=v.user_id
   where v.enabled and btrim(v.display_name)<>'' and u.email_confirmed_at is not null and lower(btrim(u.email))=target limit 1));
 elsif action='pairing_visibility' then
  if jsonb_typeof(payload->'enabled')<>'boolean' or jsonb_typeof(payload->'name')<>'string' or length(payload->>'name')>80
   or ((payload->>'enabled')::boolean and btrim(payload->>'name')='')
   or jsonb_typeof(payload->'version')<>'number' or payload->>'version'!~'^[0-9]{1,9}$' then raise invalid_parameter_value; end if;
  identity_version:=coalesce((select version from alianza_private.pairing_visibility where user_id=uid),0);
  if identity_version<>(payload->>'version')::integer then raise exception using errcode='PT409',message='Esta preferencia cambió; volvé a abrirla'; end if;
  insert into alianza_private.pairing_visibility(user_id,enabled,display_name) values(uid,(payload->>'enabled')::boolean,btrim(payload->>'name'))
   on conflict(user_id) do update set enabled=excluded.enabled,display_name=excluded.display_name,version=pairing_visibility.version+1;
 elsif action='create_request' then
  if exists(select 1 from alianza_private.pair_invitations where sender_id=uid and status='pending' and expires_at>now() and recipient_email=target) then
   return jsonb_build_object('state',alianza_private.data(null)); end if;
  if exists(select 1 from alianza_private.pair_invitations where sender_id=uid and status='pending' and expires_at>now()) then
   raise exception using errcode='PT409',message='Ya tenés una solicitud pendiente. Podés retomarla o cancelarla'; end if;
  result:=alianza_private.relationship_before_requests(jsonb_set(payload,'{action}','"create"'));
  return result-'token';
 else
  if jsonb_typeof(payload->'id')<>'string' then raise invalid_parameter_value; end if;
  select * into inv from alianza_private.pair_invitations where id::text=payload->>'id' and recipient_email=email and sender_id<>uid and status='pending' and expires_at>now() for update;
  if not found then raise exception using errcode='PT409',message='Esta solicitud ya no está disponible para esta cuenta'; end if;
  if action='reject_request' then
   update alianza_private.pair_invitations set status='rejected',resolved_at=now() where id=inv.id;
  else
   perform 1 from alianza_private.members where id in(uid,inv.sender_id) order by id for update;
   select * into m from alianza_private.members where id=uid;
   select * into inviter from alianza_private.members where id=inv.sender_id;
   if inviter.id is null or inviter.couple_id is not null or m.couple_id is not null or not exists(select 1 from auth.users where id=inviter.id and email_confirmed_at is not null) then raise invalid_parameter_value; end if;
   if action='preview_request' then
    return jsonb_build_object('invitation',jsonb_build_object('name',coalesce((select nullif(data->>'name','') from alianza_private.records where owner=inviter.id::text and kind='profile' and key='me'),inviter.name),'email',(select u.email from auth.users u where u.id=inviter.id),'expiresAt',inv.expires_at)); end if;
   insert into alianza_private.couples default values returning id into cid;
   insert into alianza_private.couple_participants(couple_id,user_id,seat,consent_source) values(cid,inv.sender_id,1,'invitation-v1'),(cid,uid,2,'invitation-v1');
   update alianza_private.couple_participants set consent_at=inv.created_at where couple_id=cid and user_id=inv.sender_id;
   update alianza_private.members set couple_id=cid,seat=case when id=inv.sender_id then 1 else 2 end,relationship_version=relationship_version+1 where id in(uid,inv.sender_id);
   update alianza_private.records set data=data||'{"shareSchedule":false,"shareNotes":false,"shareIdeal":false}'::jsonb,version=version+1,updated=now() where kind='profile' and owner in(uid::text,inv.sender_id::text);
   -- Enable only the mutually accepted space; preserve each person's other choices.
   foreach who in array array[uid,inv.sender_id] loop
    insert into alianza_private.records as r(owner,kind,key,data) values(who::text,'spaces','experience','{"enabled":["personal","couple"],"start":"personal"}'::jsonb)
     on conflict(owner,kind,key) do update set data=jsonb_set(r.data,'{enabled}',(r.data->'enabled')||'"couple"'::jsonb),version=r.version+1,updated=now()
     where not(r.data->'enabled' @> '["couple"]'::jsonb);
   end loop;
   update alianza_private.pair_invitations set status=case when id=inv.id then 'accepted' else 'cancelled' end,resolved_at=now() where sender_id in(uid,inv.sender_id) and status='pending';
  end if;
 end if;
 return jsonb_build_object('state',alianza_private.data(null));
end $$;
create or replace function public.alianza_relationship(payload jsonb) returns jsonb
language sql security invoker set search_path='' as $$select alianza_private.relationship(payload);$$;
revoke all on function alianza_private.relationship_before_requests(jsonb),alianza_private.relationship(jsonb) from public,anon,authenticated;
grant execute on function alianza_private.relationship(jsonb) to authenticated;
select alianza_private.install_maintenance_triggers();
commit;
