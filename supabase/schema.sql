-- Private data API for individual accounts and consensual couples. Enrolment is administrator-only.
-- No personal identifiers or credentials belong in this file.
begin;
create schema if not exists alianza_private;
revoke all on schema alianza_private from public, anon, authenticated;
grant usage on schema alianza_private to authenticated;
create table if not exists alianza_private.couples (
 id uuid primary key default gen_random_uuid(),
 emblem text not null default 'neutral' check(emblem in ('neutral','tree-rosary'))
);
create table if not exists alianza_private.members (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'member',
 name text not null, ideal text not null default '',
 couple_id uuid not null references alianza_private.couples(id) on delete restrict,
 seat smallint not null check(seat in (1,2)),
 symbol text not null default 'heart' check(symbol in ('heart','tree','rosary','cross','flame','anchor','mountain','sun','star','flower','sprout','bird','church','compass','waves','book')),
 unique(couple_id,seat)
);
create table if not exists alianza_private.records (
 owner text not null, kind text not null, key text not null,
 data jsonb not null, version integer not null default 1 check(version>0),
 updated timestamptz not null default now(), primary key(owner,kind,key)
);
alter table alianza_private.couples enable row level security;
alter table alianza_private.members enable row level security;
alter table alianza_private.records enable row level security;
revoke all on all tables in schema alianza_private from public,anon,authenticated;

-- Accounts remain independent; memberships identify only the current couple.
alter table alianza_private.members alter column couple_id drop not null, alter column seat drop not null;
alter table alianza_private.members add column relationship_version integer not null default 1 check(relationship_version>0);
alter table alianza_private.members add constraint member_pair_complete check((couple_id is null)=(seat is null));
alter table alianza_private.couples add column archived_at timestamptz,
 add column ideal_text text not null default '' check(length(ideal_text)<=200),
 add column ideal_version integer not null default 0 check(ideal_version>=0);
create table alianza_private.couple_participants(
 couple_id uuid not null references alianza_private.couples(id) on delete restrict,
 user_id uuid not null references auth.users(id) on delete restrict,
 seat smallint not null check(seat in(1,2)),
 consent_source text not null check(consent_source in('existing-pilot','invitation-v1')),
 consent_at timestamptz not null default now(),
 primary key(couple_id,user_id),unique(couple_id,seat)
);
create table alianza_private.pair_invitations(
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references alianza_private.members(id) on delete cascade,
 recipient_email text not null check(length(recipient_email)<=254),
 token_hash text not null unique,
 created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '7 days',
 status text not null default 'pending' check(status in('pending','cancelled','rejected','accepted')),
 resolved_at timestamptz
);
create index pair_invitation_sender on alianza_private.pair_invitations(sender_id,created_at);
create table alianza_private.ideal_confirmations(
 couple_id uuid not null, user_id uuid not null, version integer not null check(version>0),
 confirmed_at timestamptz not null default now(), primary key(couple_id,user_id),
 foreign key(couple_id,user_id) references alianza_private.couple_participants(couple_id,user_id) on delete restrict
);
alter table alianza_private.couple_participants enable row level security;
alter table alianza_private.pair_invitations enable row level security;
alter table alianza_private.ideal_confirmations enable row level security;
revoke all on alianza_private.couple_participants,alianza_private.pair_invitations,alianza_private.ideal_confirmations from public,anon,authenticated;
create policy deny_clients on alianza_private.couple_participants for all to anon,authenticated using(false) with check(false);
create policy deny_clients on alianza_private.pair_invitations for all to anon,authenticated using(false) with check(false);
create policy deny_clients on alianza_private.ideal_confirmations for all to anon,authenticated using(false) with check(false);
create or replace function alianza_private.ideal_view(cid uuid,uid uuid) returns jsonb
language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('text',c.ideal_text,'version',c.ideal_version,
 'confirmations',(select count(*) from alianza_private.ideal_confirmations i where i.couple_id=c.id and i.version=c.ideal_version),
 'confirmedByMe',exists(select 1 from alianza_private.ideal_confirmations i where i.couple_id=c.id and i.user_id=uid and i.version=c.ideal_version))
 from alianza_private.couples c where c.id=cid;
$$;


create or replace function alianza_private.valid_date(v text) returns boolean
language plpgsql immutable set search_path='' as $$
begin
 if v is null or v !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
 return to_char(v::date,'YYYY-MM-DD')=v;
exception when others then return false;
end $$;

create or replace function alianza_private.valid_record(k text, ky text, d jsonb) returns boolean
language plpgsql stable set search_path='' as $$
declare fields text[]; f text; val jsonb; maxlen int; dt text; expected text;
 today text:=to_char(now() at time zone 'America/Costa_Rica','YYYY-MM-DD');
begin
 if k is null or ky is null or d is null or jsonb_typeof(d)<>'object' or octet_length(d::text)>40000 or length(ky)>100 or ky!~'^[a-zA-Z0-9:_-]+$' then return false; end if;
 fields:=case k
 when 'profile' then array['name','ideal','shareSchedule','shareNotes'] || case when d ? 'symbol' then array['symbol'] else array[]::text[] end || case when d ? 'shareIdeal' then array['shareIdeal'] else array[]::text[] end
 when 'habit' then case when d ? 'frequency' then array['title','moment','active','anchor','minimum','frequency'] else array['title','moment','active','anchor','minimum'] end
 when 'preferences' then array['focus','lastSeenRelease']
 when 'journal' then array['gratitude','offering']
 when 'purpose' then array['text','review']
 when 'review' then array['start','end','gratitude','learning','next']
 when 'rs' then array['type','periodDate','planDate','planTime','note','done','doneDate']
 when 'checks' then array(select jsonb_object_keys(d)) else null end;
 if fields is null or not(d ?& fields) or d-fields <> '{}'::jsonb then return false; end if;
 if k='checks' then
   if cardinality(fields)>100 then return false; end if;
   for f,val in select * from jsonb_each(d) loop
    if length(f)>80 or val not in ('"done"'::jsonb,'"missed"'::jsonb,'"skip"'::jsonb) then return false; end if;
   end loop;
 else
   foreach f in array fields loop
    if f='frequency' then
      if jsonb_typeof(d->f)<>'object' or not((d->f) ?& array['period','target']) or (d->f)-array['period','target']<>'{}'::jsonb then return false; end if;
      if (d->f->>'period') not in ('day','week','month') or jsonb_typeof(d->f->'period')<>'string' or jsonb_typeof(d->f->'target')<>'number' or (d->f->>'target')!~'^[1-9][0-9]?$' then return false; end if;
      if (d->f->>'target')::int > (case d->f->>'period' when 'day' then 1 when 'week' then 7 else 28 end) then return false; end if;
    elsif f in ('shareSchedule','shareNotes','shareIdeal','active','done') then
      if jsonb_typeof(d->f)<>'boolean' then return false; end if;
    else
      if jsonb_typeof(d->f)<>'string' then return false; end if;
      maxlen:=case f when 'name' then 60 when 'ideal' then 200 when 'title' then 180 when 'anchor' then 240 when 'minimum' then 240 else 12000 end;
      if length(d->>f)>maxlen then return false; end if;
      if f in ('name','title') and length(btrim(d->>f))=0 then return false; end if;
    end if;
   end loop;
 end if;
 if k='profile' and (ky<>'me' or (d ? 'symbol' and d->>'symbol' not in ('heart','tree','rosary','cross','flame','anchor','mountain','sun','star','flower','sprout','bird','church','compass','waves','book'))) then return false; end if;
 if k='preferences' and (ky<>'experience' or d->>'focus' not in ('schedule','rs','ideal') or d->>'lastSeenRelease' not in ('','journey-2026-09')) then return false; end if;
 if k='habit' and d->>'moment' not in ('Mañana','Durante el día','Noche') then return false; end if;
 if k in ('checks','journal') and (not alianza_private.valid_date(ky) or ky>today) then return false; end if;
 if k='purpose' and ky!~'^\d{4}-(0[1-9]|1[0-2])$' then return false; end if;
 if k='review' and (not alianza_private.valid_date(d->>'start') or not alianza_private.valid_date(d->>'end') or d->>'start'>d->>'end' or d->>'end'>today or ky<>(d->>'start')||':'||(d->>'end')) then return false; end if;
 if k='rs' then
  dt:=d->>'periodDate';
  if not alianza_private.valid_date(dt) or d->>'type' not in ('rezar','reencantar','revisar','renovar') then return false; end if;
  if (d->>'planDate'<>'') and not alianza_private.valid_date(d->>'planDate') then return false; end if;
  if (d->>'doneDate'<>'') and (not alianza_private.valid_date(d->>'doneDate') or d->>'doneDate'>today) then return false; end if;
  if (d->>'done')::boolean and d->>'doneDate'='' then return false; end if;
  if d->>'planTime'!~'^(([01]\d|2[0-3]):[0-5]\d)?$' then return false; end if;
  expected:=(d->>'type')||':'||case d->>'type' when 'rezar' then dt when 'revisar' then left(dt,7) when 'renovar' then left(dt,4) else to_char(date_trunc('week',dt::date),'YYYY-MM-DD') end;
  if ky<>expected then return false; end if;
 end if;
 return true;
end $$;

-- Plans are generated only by the server. Clients cannot write habit_plan.
create or replace function alianza_private.capture_habit_plan() returns trigger
language plpgsql security invoker set search_path='' as $$
declare plan jsonb; history jsonb; today text:=to_char(now() at time zone 'America/Costa_Rica','YYYY-MM-DD');
begin
 if new.kind<>'habit' then return new; end if;
 -- Clients from before this upgrade cannot silently erase a chosen frequency.
 if not(new.data ? 'frequency') then
  new.data:=new.data||jsonb_build_object('frequency',case when tg_op='UPDATE' then coalesce(old.data->'frequency','{"period":"day","target":1}'::jsonb) else '{"period":"day","target":1}'::jsonb end);
 end if;
 plan:=(new.data->'frequency')||jsonb_build_object('from',today,'active',(new.data->>'active')::boolean);
 select data->'versions' into history from alianza_private.records where owner=new.owner and kind='habit_plan' and key=new.key;
 if history is not null and (history->-1)-'from'=plan-'from' then return new; end if;
 -- Same-day edits supersede that day's plan; earlier dates are immutable.
 select coalesce(jsonb_agg(v order by v->>'from'),'[]'::jsonb) into history from jsonb_array_elements(coalesce(history,'[]'::jsonb)) v where v->>'from'<today;
 insert into alianza_private.records(owner,kind,key,data) values(new.owner,'habit_plan',new.key,jsonb_build_object('versions',history||jsonb_build_array(plan)))
 on conflict(owner,kind,key) do update set data=excluded.data,version=alianza_private.records.version+1,updated=now();
 return new;
end $$;
drop trigger if exists capture_habit_plan on alianza_private.records;
create trigger capture_habit_plan before insert or update on alianza_private.records for each row execute function alianza_private.capture_habit_plan();

create or replace function alianza_private.data(payload jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); member alianza_private.members; spouse alianza_private.members;
 p jsonb; own_rows jsonb; shared_rows jsonb; partner_rows jsonb; partner jsonb:=null;
 k text; ky text; d jsonb; v integer; who text; result alianza_private.records;
begin
 if uid is null then raise insufficient_privilege; end if;
 select * into member from alianza_private.members where id=uid for share;
 if not found then raise insufficient_privilege; end if;
 -- Membership is checked against the database every request, never user-editable metadata.
 if not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then raise insufficient_privilege; end if;
 if member.couple_id is not null and not exists(select 1 from alianza_private.couple_participants cp join alianza_private.couples c on c.id=cp.couple_id where cp.user_id=uid and cp.couple_id=member.couple_id and cp.seat=member.seat and c.archived_at is null) then raise insufficient_privilege; end if;
 if payload is not null then
  if jsonb_typeof(payload)<>'object' or not(payload ?& array['kind','key','data','version']) or payload-array['kind','key','data','version','relationshipVersion']<>'{}'::jsonb
    or jsonb_typeof(payload->'kind')<>'string' or jsonb_typeof(payload->'key')<>'string'
    or jsonb_typeof(payload->'version')<>'number' or payload->>'version'!~'^\d{1,9}$'
    then raise invalid_parameter_value; end if;
  k:=payload->>'kind'; ky:=payload->>'key'; d:=payload->'data';v:=(payload->>'version')::integer;
  if not alianza_private.valid_record(k,ky,d) then raise invalid_parameter_value; end if;
  if payload ? 'relationshipVersion' and (jsonb_typeof(payload->'relationshipVersion')<>'number' or payload->>'relationshipVersion'!~'^[1-9][0-9]{0,8}$') then raise invalid_parameter_value; end if;
  if k in('rs','profile') and coalesce((payload->>'relationshipVersion')::integer,1)<>member.relationship_version then raise exception using errcode='PT409',message='La vinculación cambió; actualizá tu espacio'; end if;
  if k='rs' and (member.couple_id is null or not exists(select 1 from alianza_private.couples where id=member.couple_id and archived_at is null)) then raise insufficient_privilege; end if;
  if k='profile' then
   if not(d ? 'shareIdeal') then d:=d||jsonb_build_object('shareIdeal',coalesce((select (data->>'shareIdeal')::boolean from alianza_private.records where owner=uid::text and kind='profile' and key='me'),false)); end if;
   if member.couple_id is null then d:=d||'{"shareSchedule":false,"shareNotes":false,"shareIdeal":false}'::jsonb; end if;
  end if;
  who:=case when k='rs' then 'couple:'||member.couple_id::text else uid::text end;
  if v=0 then
   insert into alianza_private.records(owner,kind,key,data) values(who,k,ky,d) on conflict do nothing returning * into result;
  else
   update alianza_private.records set data=d,version=version+1,updated=now() where owner=who and kind=k and key=ky and version=v returning * into result;
  end if;
  if result.owner is null then raise exception using errcode='PT409',message='Registro modificado en otro dispositivo'; end if;
  return jsonb_build_object('record',to_jsonb(result),'related',case when k='habit' then (select coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) from alianza_private.records r where owner=who and kind='habit_plan' and key=ky) else '[]'::jsonb end);
 end if;
 -- Initialize identity only. Commitments are created only by an explicit user choice.
 if not exists(select 1 from alianza_private.records where owner=uid::text and kind='profile' and key='me') then
  insert into alianza_private.records(owner,kind,key,data) values(uid::text,'profile','me',jsonb_build_object('name',member.name,'ideal','','shareSchedule',false,'shareNotes',false,'shareIdeal',false)) on conflict do nothing;
 end if;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.updated desc),'[]'::jsonb) into own_rows from alianza_private.records r where owner=uid::text;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.updated desc),'[]'::jsonb) into shared_rows from alianza_private.records r where owner='couple:'||member.couple_id::text;
 select * into spouse from alianza_private.members where couple_id=member.couple_id and id<>uid;
 if found then
  select data into p from alianza_private.records where owner=spouse.id::text and kind='profile' and key='me';
  select coalesce(jsonb_agg(to_jsonb(r) order by r.updated desc),'[]'::jsonb) into partner_rows from alianza_private.records r where owner=spouse.id::text and (
   ((p->>'shareSchedule')::boolean and kind in ('habit','checks','habit_plan')) or ((p->>'shareNotes')::boolean and kind in ('journal','purpose','review')));
  partner:=jsonb_build_object('name',coalesce(p->>'name',spouse.name),'ideal',case when coalesce((p->>'shareIdeal')::boolean,false) then coalesce(p->>'ideal','') else '' end,'shareSchedule',coalesce((p->>'shareSchedule')::boolean,false),'shareNotes',coalesce((p->>'shareNotes')::boolean,false),'symbol',coalesce(p->>'symbol',spouse.symbol),'records',partner_rows);
 end if;
 return jsonb_build_object('user',jsonb_build_object('id',uid,'role',member.role,'symbol',member.symbol,'coupleId',member.couple_id,'relationshipVersion',member.relationship_version,'email',(select email from auth.users where id=uid)),'couple',case when member.couple_id is null then null else jsonb_build_object('emblem',(select emblem from alianza_private.couples where id=member.couple_id)) end,'marriageIdeal',alianza_private.ideal_view(member.couple_id,uid),'archives',(select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'archivedAt',c.archived_at) order by c.archived_at desc),'[]'::jsonb) from alianza_private.couple_participants p join alianza_private.couples c on c.id=p.couple_id where p.user_id=uid and c.archived_at is not null),'invitations',(select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'email',i.recipient_email,'expiresAt',i.expires_at) order by i.created_at desc),'[]'::jsonb) from alianza_private.pair_invitations i where i.sender_id=uid and i.status='pending' and i.expires_at>now()),'own',own_rows,'shared',shared_rows,'partner',partner,'today',to_char(now() at time zone 'America/Costa_Rica','YYYY-MM-DD'));
end $$;
-- The public entry point is an invoker; the narrow privileged function above
-- lives in an unexposed schema and independently checks identity and membership.
create or replace function public.alianza_data(payload jsonb default null) returns jsonb
language sql security invoker set search_path='' as $$ select alianza_private.data(payload); $$;
revoke all on all functions in schema alianza_private from public,anon,authenticated;
grant execute on function alianza_private.data(jsonb) to authenticated;
revoke all on function public.alianza_data(jsonb) from public,anon;
grant execute on function public.alianza_data(jsonb) to authenticated;
create policy deny_direct_access on alianza_private.couples for all to anon,authenticated using (false) with check (false);
create policy deny_direct_access on alianza_private.members for all to anon,authenticated using (false) with check (false);
create policy deny_direct_access on alianza_private.records for all to anon,authenticated using (false) with check (false);
-- This is the sole pairing API. The invoker wrapper below exposes only this
-- narrow, identity-checked operation; tables and helper functions stay private.
create or replace function alianza_private.relationship(payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); m alianza_private.members; inviter alianza_private.members;
 inv alianza_private.pair_invitations; action text:=payload->>'action'; allowed text[];
 email text; token text; cid uuid; other_id uuid; v integer; txt text;
begin
 if uid is null or not exists(select 1 from alianza_private.members x join auth.users u on u.id=x.id where x.id=uid and u.email_confirmed_at is not null) then raise insufficient_privilege; end if;
 allowed:=case action when 'create' then array['action','email','relationshipVersion']
 when 'preview' then array['action','token','relationshipVersion']
 when 'accept' then array['action','token','relationshipVersion']
 when 'reject' then array['action','token','relationshipVersion']
 when 'cancel' then array['action','id','relationshipVersion']
 when 'unlink' then array['action','coupleId','relationshipVersion']
 when 'archive' then array['action','id','relationshipVersion']
 when 'ideal_save' then array['action','text','version','coupleId','relationshipVersion']
 when 'ideal_confirm' then array['action','version','coupleId','relationshipVersion'] else null end;
 if allowed is null or jsonb_typeof(payload)<>'object' or not(payload ?& allowed) or payload-allowed<>'{}'::jsonb or octet_length(payload::text)>2000 then raise invalid_parameter_value; end if;
 if jsonb_typeof(payload->'relationshipVersion')<>'number' or (payload->>'relationshipVersion')!~'^[1-9][0-9]{0,8}$' then raise invalid_parameter_value; end if;
 -- Serialize rare relationship transitions. Data writes lock their owner's
 -- membership row; ordered member locks below cannot race a transition.
 perform pg_advisory_xact_lock(8254,1);
 select * into m from alianza_private.members where id=uid;
 if not found then raise insufficient_privilege; end if;
 if m.relationship_version<>(payload->>'relationshipVersion')::integer then raise exception using errcode='PT409',message='La vinculación cambió; actualizá tu espacio'; end if;
 select lower(btrim(u.email)) into email from auth.users u where id=uid and email_confirmed_at is not null;
 if email is null then raise insufficient_privilege; end if;
 if action='archive' then
  if jsonb_typeof(payload->'id')<>'string' or not exists(select 1 from alianza_private.couple_participants p join alianza_private.couples c on c.id=p.couple_id where p.user_id=uid and c.id::text=payload->>'id' and c.archived_at is not null) then raise insufficient_privilege; end if;
  return jsonb_build_object('records',(select coalesce(jsonb_agg(to_jsonb(r) order by r.key desc),'[]'::jsonb) from alianza_private.records r where r.owner='couple:'||(payload->>'id')),'ideal',alianza_private.ideal_view((payload->>'id')::uuid,uid));
 end if;
 if action='create' then
  if m.couple_id is not null then raise invalid_parameter_value; end if;
  if jsonb_typeof(payload->'email')<>'string' or length(payload->>'email')>254 or lower(btrim(payload->>'email'))!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or lower(btrim(payload->>'email'))=email then raise invalid_parameter_value; end if;
  if (select count(*) from alianza_private.pair_invitations where sender_id=uid and created_at>now()-interval '1 day')>=5 then raise exception using errcode='PT429',message='Esperá antes de crear otra invitación'; end if;
  -- No recipient lookup: creation cannot disclose who has an account.
  update alianza_private.pair_invitations set status='cancelled',resolved_at=now() where sender_id=uid and status='pending';
  token:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
  insert into alianza_private.pair_invitations(sender_id,recipient_email,token_hash) values(uid,lower(btrim(payload->>'email')),encode(sha256(convert_to(token,'UTF8')),'hex')) returning * into inv;
  return jsonb_build_object('token',token,'expiresAt',inv.expires_at,'state',alianza_private.data(null));
 elsif action='cancel' then
  update alianza_private.pair_invitations set status='cancelled',resolved_at=now() where id::text=payload->>'id' and sender_id=uid and status='pending';
  return jsonb_build_object('state',alianza_private.data(null));
 elsif action in('preview','accept','reject') then
  if jsonb_typeof(payload->'token')<>'string' or (payload->>'token')!~'^[a-f0-9]{64}$' then raise invalid_parameter_value; end if;
  select * into inv from alianza_private.pair_invitations where token_hash=encode(sha256(convert_to(payload->>'token','UTF8')),'hex') and recipient_email=email and sender_id<>uid and status='pending' and expires_at>now() for update;
  if not found then raise invalid_parameter_value; end if;
  if action='reject' then
   update alianza_private.pair_invitations set status='rejected',resolved_at=now() where id=inv.id;
   return jsonb_build_object('state',alianza_private.data(null));
  end if;
  perform 1 from alianza_private.members where id in(uid,inv.sender_id) order by id for update;
  select * into m from alianza_private.members where id=uid;
  select * into inviter from alianza_private.members where id=inv.sender_id;
  if inviter.id is null or inviter.couple_id is not null or m.couple_id is not null or not exists(select 1 from auth.users where id=inviter.id and email_confirmed_at is not null) then raise invalid_parameter_value; end if;
  if action='preview' then
   return jsonb_build_object('invitation',jsonb_build_object('name',inviter.name,'email',(select u.email from auth.users u where u.id=inviter.id),'expiresAt',inv.expires_at));
  end if;
  insert into alianza_private.couples default values returning id into cid;
  insert into alianza_private.couple_participants(couple_id,user_id,seat,consent_source) values(cid,inv.sender_id,1,'invitation-v1'),(cid,uid,2,'invitation-v1');
  -- The sender consented when creating this specific invitation.
  update alianza_private.couple_participants set consent_at=inv.created_at where couple_id=cid and user_id=inv.sender_id;
  update alianza_private.members set couple_id=cid,seat=case when id=inv.sender_id then 1 else 2 end,relationship_version=relationship_version+1 where id in(uid,inv.sender_id);
  update alianza_private.records set data=data||'{"shareSchedule":false,"shareNotes":false,"shareIdeal":false}'::jsonb,version=version+1,updated=now() where kind='profile' and owner in(uid::text,inv.sender_id::text);
  update alianza_private.pair_invitations set status=case when id=inv.id then 'accepted' else 'cancelled' end,resolved_at=now() where sender_id in(uid,inv.sender_id) and status='pending';
  return jsonb_build_object('state',alianza_private.data(null));
 elsif action in('unlink','ideal_save','ideal_confirm') then
  if m.couple_id is null or jsonb_typeof(payload->'coupleId')<>'string' or payload->>'coupleId'<>m.couple_id::text then raise invalid_parameter_value; end if;
  cid:=m.couple_id;
  perform 1 from alianza_private.members where couple_id=cid order by id for update;
  if not exists(select 1 from alianza_private.couples where id=cid and archived_at is null) then raise insufficient_privilege; end if;
  if action='unlink' then
   update alianza_private.couples set archived_at=now() where id=cid;
   update alianza_private.records set data=data||'{"shareSchedule":false,"shareNotes":false,"shareIdeal":false}'::jsonb,version=version+1,updated=now() where kind='profile' and owner in(select id::text from alianza_private.members where couple_id=cid);
   update alianza_private.members set couple_id=null,seat=null,relationship_version=relationship_version+1 where couple_id=cid;
  else
   if jsonb_typeof(payload->'version')<>'number' or (payload->>'version')!~'^[0-9]{1,9}$' then raise invalid_parameter_value; end if;
   v:=(payload->>'version')::integer;
   if v<>(select ideal_version from alianza_private.couples where id=cid) then raise exception using errcode='PT409',message='El ideal cambió; revisá la frase actual'; end if;
   if action='ideal_save' then
    if jsonb_typeof(payload->'text')<>'string' or length(payload->>'text')>200 then raise invalid_parameter_value; end if;
    txt:=btrim(payload->>'text');
    update alianza_private.couples set ideal_text=txt,ideal_version=ideal_version+1 where id=cid;
    delete from alianza_private.ideal_confirmations where couple_id=cid;
   else
    if (select ideal_text from alianza_private.couples where id=cid)='' then raise invalid_parameter_value; end if;
    insert into alianza_private.ideal_confirmations(couple_id,user_id,version) values(cid,uid,v) on conflict(couple_id,user_id) do update set version=excluded.version,confirmed_at=now();
   end if;
  end if;
  return jsonb_build_object('state',alianza_private.data(null));
 end if;
 raise invalid_parameter_value;
end $$;
create or replace function public.alianza_relationship(payload jsonb) returns jsonb
language sql security invoker set search_path='' as $$select alianza_private.relationship(payload);$$;
revoke all on function alianza_private.ideal_view(uuid,uuid),alianza_private.relationship(jsonb),public.alianza_relationship(jsonb) from public,anon,authenticated;
grant execute on function alianza_private.relationship(jsonb),public.alianza_relationship(jsonb) to authenticated;

commit;
