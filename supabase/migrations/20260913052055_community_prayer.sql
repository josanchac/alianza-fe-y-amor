begin;
-- Additive release: never rewrite existing personal or matrimonial records.
create table alianza_private.groups (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 80),
 owner_id uuid not null references alianza_private.members(id), symbol text not null default 'heart' check(symbol in ('heart','tree','rosary','cross','flame','star')), ideal text not null default '' check(length(ideal)<=500),
 motto text not null default '' check(length(motto)<=120), version integer not null default 1,
 created_at timestamptz not null default now()
);
create table alianza_private.group_members (
 group_id uuid references alianza_private.groups(id), user_id uuid references alianza_private.members(id),
 name text not null check(length(name) between 1 and 60), joined_at timestamptz not null default now(),
 primary key(group_id,user_id)
);
create table alianza_private.group_invites (
 id uuid primary key default gen_random_uuid(), group_id uuid references alianza_private.groups(id), token_hash text unique not null,
 created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '7 days', revoked boolean not null default false
);
create table alianza_private.group_purposes (
 id uuid primary key default gen_random_uuid(), group_id uuid references alianza_private.groups(id),
 title text not null check(length(title) between 1 and 240), reason text not null default '' check(length(reason)<=500),
 starts_on date not null, ends_on date not null, target integer not null check(target between 1 and 100),
 unit text not null check(unit in ('person','couple')), decision text not null default '' check(length(decision)<=500),
 version integer not null default 1, check(ends_on>=starts_on and ends_on-starts_on<=366)
);
create table alianza_private.purpose_members (
 purpose_id uuid references alianza_private.group_purposes(id), user_id uuid references alianza_private.members(id),
 unit_id text not null, share boolean not null default false, primary key(purpose_id,user_id)
);
create table alianza_private.purpose_logs (
 purpose_id uuid references alianza_private.group_purposes(id), unit_id text not null, day date not null,
 amount integer not null check(amount between 0 and 20), version integer not null default 1,
 primary key(purpose_id,unit_id,day)
);
create table alianza_private.group_meetings (
 group_id uuid primary key references alianza_private.groups(id), data jsonb not null, version integer not null default 1
);
create table alianza_private.meeting_rsvps (
 group_id uuid references alianza_private.groups(id), user_id uuid references alianza_private.members(id),
 meeting_version integer not null, attending boolean not null, primary key(group_id,user_id)
);
create table alianza_private.rosaries (
 id uuid primary key, owner_id uuid not null references alianza_private.members(id),
 group_id uuid references alianza_private.groups(id), couple_id uuid references alianza_private.couples(id),
 mystery text not null check(mystery in ('joyful','luminous','sorrowful','glorious')),
 mode text not null check(mode in ('free','sequential')), intention text not null default '' check(length(intention)<=500),
 cancelled boolean not null default false, created_at timestamptz not null default now(), check(group_id is null or couple_id is null)
);
create table alianza_private.rosary_slots (
 rosary_id uuid references alianza_private.rosaries(id), decade integer check(decade between 1 and 5),
 user_id uuid references alianza_private.members(id), done boolean not null default false,
 primary key(rosary_id,decade)
);
create table alianza_private.rosary_contributions (
 rosary_id uuid references alianza_private.rosaries(id), user_id uuid references alianza_private.members(id),
 decade integer check(decade between 1 and 5), day date not null,
 primary key(rosary_id,user_id,decade)
);
create index groups_owner on alianza_private.groups(owner_id);
create index group_members_user on alianza_private.group_members(user_id);
create index group_purposes_group on alianza_private.group_purposes(group_id);
create index purpose_members_user on alianza_private.purpose_members(user_id);
create index rosaries_group on alianza_private.rosaries(group_id);
create index rosaries_couple on alianza_private.rosaries(couple_id);
create index rosaries_owner on alianza_private.rosaries(owner_id,created_at);
create index rosary_contributions_user on alianza_private.rosary_contributions(user_id);
-- One explicit owner-only draft; no spiritual text enters metrics or group views.
alter function alianza_private.valid_record(text,text,jsonb) rename to valid_record_before_community;
revoke all on function alianza_private.valid_record_before_community(text,text,jsonb) from public,anon,authenticated,alianza_metrics;
create function alianza_private.valid_record(k text,ky text,d jsonb) returns boolean language plpgsql stable set search_path='' as $$
begin
 if k='ideal_draft' then return coalesce(ky='me' and jsonb_typeof(d)='object' and d ?& array['stage','notes'] and d-array['stage','notes']='{}'::jsonb and d->>'stage' in ('learn','discover','ready') and jsonb_typeof(d->'notes')='string' and length(d->>'notes')<=4000,false); end if;
 if k='preferences' and d->>'lastSeenRelease'='community-2026-09' then d:=jsonb_set(d,'{lastSeenRelease}','"simple-2026-09"');end if;
 return alianza_private.valid_record_before_community(k,ky,d);
end $$;
revoke all on function alianza_private.valid_record(text,text,jsonb) from public,anon,authenticated,alianza_metrics;
-- Deny direct access, including the dedicated metrics role. Only narrow RPCs below.
do $$declare t text;begin foreach t in array array['groups','group_members','group_invites','group_purposes','purpose_members','purpose_logs','group_meetings','meeting_rsvps','rosaries','rosary_slots','rosary_contributions'] loop
 execute format('alter table alianza_private.%I enable row level security',t);
 execute format('revoke all on alianza_private.%I from public,anon,authenticated,alianza_metrics',t);
 execute format('create policy deny_clients on alianza_private.%I for all to anon,authenticated using(false) with check(false)',t);
end loop;end $$;
create function alianza_private.can_pray(r alianza_private.rosaries,u uuid) returns boolean language sql stable set search_path='' as $$
 select case when r.group_id is not null then exists(select 1 from alianza_private.group_members where group_id=r.group_id and user_id=u)
 when r.couple_id is not null then exists(select 1 from alianza_private.members where id=u and couple_id=r.couple_id)
 else r.owner_id=u end;
$$;
create function alianza_private.community(payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); m alianza_private.members; a text:=coalesce(payload->>'action','snapshot'); g uuid; new_id uuid; id_partner uuid;
 gr alianza_private.groups; p alianza_private.group_purposes; r alianza_private.rosaries; slot alianza_private.rosary_slots;
 unit_id_v text; token text; result jsonb:='{}'; v integer; n integer; dt date; d jsonb; ck alianza_private.records;
 today date:=(now() at time zone 'America/Costa_Rica')::date; created_v boolean;
begin
 if u is null or not exists(select 1 from auth.users where auth.users.id=u and email_confirmed_at is not null) then raise insufficient_privilege;end if;
 if payload is null or jsonb_typeof(payload)<>'object' or octet_length(payload::text)>12000 then raise invalid_parameter_value;end if;
 -- Same lock order as relationship changes: membership cannot be revoked mid-write.
 perform pg_advisory_xact_lock(8254,1);
 select * into m from alianza_private.members where members.id=u for share;
 if m.id is null then raise insufficient_privilege;end if;
 if a not in ('snapshot','invite_preview') and payload ? 'relationshipVersion' and (payload->>'relationshipVersion')::int<>m.relationship_version then raise exception using errcode='PT409',message='La vinculación cambió. Actualizá tu espacio.';end if;
 if a not in ('snapshot','invite_preview') and coalesce((payload->>'dataEpoch')::int,0)<>m.data_epoch then raise exception using errcode='PT409',message='Recargá tu espacio antes de guardar.';end if;
 if payload ? 'groupId' then
  g:=(payload->>'groupId')::uuid;
  select * into gr from alianza_private.groups where groups.id=g;
  if gr.id is null or not exists(select 1 from alianza_private.group_members where group_id=g and user_id=u) then raise insufficient_privilege;end if;
 end if;
 if a='group_create' then
  if (select count(*) from alianza_private.groups where owner_id=u)>=20 then raise invalid_parameter_value;end if;
  new_id:=coalesce((payload->>'id')::uuid,gen_random_uuid());
  insert into alianza_private.groups(id,name,owner_id) values(new_id,trim(payload->>'name'),u) on conflict do nothing returning * into gr;
  if gr.id is null then select * into gr from alianza_private.groups where groups.id=new_id and owner_id=u;end if;
  if gr.id is null then raise insufficient_privilege;end if;g:=gr.id;
  insert into alianza_private.group_members(group_id,user_id,name) values(g,u,trim(payload->>'displayName')) on conflict do nothing;
 elsif a='group_update' then
  if g is null or gr.owner_id<>u then raise insufficient_privilege;end if;
  update alianza_private.groups set name=trim(payload->>'name'),ideal=payload->>'ideal',motto=payload->>'motto',symbol=coalesce(payload->>'symbol',symbol),version=version+1 where groups.id=g and version=(payload->>'version')::int;
  if not found then raise exception using errcode='PT409',message='El grupo cambió. Actualizá.';end if;
 elsif a='group_leave' then
  if g is null or gr.owner_id=u then raise invalid_parameter_value;end if;
  update alianza_private.purpose_members set share=false where user_id=u and purpose_id in(select gp.id from alianza_private.group_purposes gp where gp.group_id=g);
  delete from alianza_private.rosary_slots where user_id=u and not done and rosary_id in(select rr.id from alianza_private.rosaries rr where rr.group_id=g);
  delete from alianza_private.group_members where group_id=g and user_id=u;
 elsif a='group_transfer' then
  if g is null or gr.owner_id<>u or not exists(select 1 from alianza_private.group_members where group_id=g and user_id=(payload->>'userId')::uuid) then raise insufficient_privilege;end if;
  update alianza_private.groups set owner_id=(payload->>'userId')::uuid,version=version+1 where groups.id=g;
 elsif a='invite_create' then
  if g is null or gr.owner_id<>u then raise insufficient_privilege;end if;
  if (select count(*) from alianza_private.group_invites where group_id=g and created_at>now()-interval '1 day')>=20 then raise invalid_parameter_value;end if;
  token:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
  insert into alianza_private.group_invites(group_id,token_hash) values(g,encode(sha256(convert_to(token,'UTF8')),'hex'));
  result:=jsonb_build_object('token',token);
 elsif a='invite_revoke' then
  if g is null or gr.owner_id<>u then raise insufficient_privilege;end if;
  update alianza_private.group_invites set revoked=true where group_id=g;
 elsif a in ('invite_preview','invite_join') then
  select group_id into g from alianza_private.group_invites where token_hash=encode(sha256(convert_to(payload->>'token','UTF8')),'hex') and not revoked and expires_at>now();
  if g is null then raise invalid_parameter_value;end if;
  if a='invite_preview' then return jsonb_build_object('invitation',(select jsonb_build_object('name',name) from alianza_private.groups where groups.id=g));end if;
  if (select count(*) from alianza_private.group_members where group_id=g)>=200 then raise invalid_parameter_value;end if;
  insert into alianza_private.group_members(group_id,user_id,name) values(g,u,trim(payload->>'displayName')) on conflict do nothing;
 elsif a='purpose_create' then
  if g is null or gr.owner_id<>u then raise insufficient_privilege;end if;
  new_id:=coalesce((payload->>'id')::uuid,gen_random_uuid());
  insert into alianza_private.group_purposes(id,group_id,title,reason,starts_on,ends_on,target,unit) values(new_id,g,payload->>'title',coalesce(payload->>'reason',''),(payload->>'start')::date,(payload->>'end')::date,(payload->>'target')::int,payload->>'unit') on conflict do nothing;
  if not found and not exists(select 1 from alianza_private.group_purposes where group_purposes.id=new_id and group_id=g) then raise insufficient_privilege;end if;
 elsif a in ('purpose_join','purpose_log','purpose_review') then
  select * into p from alianza_private.group_purposes where group_purposes.id=(payload->>'id')::uuid;
  if p.id is null or g is null or p.group_id<>g then raise insufficient_privilege;end if;
  if a='purpose_review' then
   if gr.owner_id<>u then raise insufficient_privilege;end if;
   update alianza_private.group_purposes set decision=payload->>'decision',version=version+1 where group_purposes.id=p.id and version=(payload->>'version')::int;
   if not found then raise exception using errcode='PT409',message='La revisión cambió.';end if;
  else
   unit_id_v:=case when p.unit='person' then u::text else 'couple:'||m.couple_id::text end;
   if unit_id_v is null then raise invalid_parameter_value;end if;
   if a='purpose_join' then
    insert into alianza_private.purpose_members(purpose_id,user_id,unit_id,share) values(p.id,u,unit_id_v,(payload->>'share')::boolean)
    on conflict(purpose_id,user_id) do update set unit_id=excluded.unit_id,share=excluded.share;
   else
    if not exists(select 1 from alianza_private.purpose_members where purpose_id=p.id and user_id=u and unit_id=unit_id_v) then raise insufficient_privilege;end if;
    dt:=(payload->>'day')::date;n:=(payload->>'amount')::int;v:=(payload->>'version')::int;
    if dt is null or dt<p.starts_on or dt>p.ends_on or dt>today or n is null or v is null then raise invalid_parameter_value;end if;
    if v=0 then insert into alianza_private.purpose_logs(purpose_id,unit_id,day,amount) values(p.id,unit_id_v,dt,n) on conflict do nothing;
    else update alianza_private.purpose_logs set amount=n,version=version+1 where purpose_id=p.id and unit_id=unit_id_v and day=dt and version=v;end if;
    if not found then raise exception using errcode='PT409',message='Este registro cambió. Actualizá.';end if;
   end if;
  end if;
 elsif a='meeting_save' then
  if g is null or gr.owner_id<>u then raise insufficient_privilege;end if;
  d:=payload->'data';
  if jsonb_typeof(d) is distinct from 'object' then raise invalid_parameter_value;end if;
  if not(d ?& array['date','time','place','material','question','roles']) or d-array['date','time','place','material','question','roles']<>'{}'::jsonb or exists(select 1 from jsonb_each(d) e where jsonb_typeof(e.value)<>'string') or not alianza_private.valid_date(d->>'date') or d->>'time'!~'^([01][0-9]|2[0-3]):[0-5][0-9]$' or length(d->>'place')>300 or length(d->>'question')>500 or length(d->>'roles')>500 or length(d->>'material')>1000 or (d->>'material'<>'' and d->>'material'!~'^https://[^[:space:]]+$') then raise invalid_parameter_value;end if;
  if (payload->>'version')::int=0 then insert into alianza_private.group_meetings(group_id,data) values(g,d) on conflict do nothing;
  else update alianza_private.group_meetings set data=d,version=version+1 where group_id=g and version=(payload->>'version')::int;end if;
  if not found then raise exception using errcode='PT409',message='El encuentro cambió.';end if;
 elsif a='meeting_rsvp' then
  if g is null or not exists(select 1 from alianza_private.group_meetings where group_id=g and version=(payload->>'version')::int) then raise invalid_parameter_value;end if;
  insert into alianza_private.meeting_rsvps values(g,u,(payload->>'version')::int,(payload->>'attending')::boolean) on conflict(group_id,user_id) do update set meeting_version=excluded.meeting_version,attending=excluded.attending;
 elsif a='rosary_create' then
  new_id:=(payload->>'id')::uuid;
  if (select count(*) from alianza_private.rosaries where owner_id=u and created_at>now()-interval '1 day')>=30 then raise invalid_parameter_value;end if;
  if coalesce(payload->>'scope','') not in ('personal','couple','group') or (payload->>'scope'='couple' and m.couple_id is null) or (payload->>'scope'='group' and g is null) then raise invalid_parameter_value;end if;
  insert into alianza_private.rosaries(id,owner_id,group_id,couple_id,mystery,mode,intention) values(new_id,u,case when payload->>'scope'='group' then g end,case when payload->>'scope'='couple' then m.couple_id end,payload->>'mystery',payload->>'mode',coalesce(payload->>'intention','')) on conflict do nothing;
  created_v:=found;
  if not created_v then
   select * into r from alianza_private.rosaries rr where rr.id=new_id and rr.owner_id=u;
   if r.id is null or not alianza_private.can_pray(r,u) then raise insufficient_privilege;end if;
   if r.group_id is distinct from (case when payload->>'scope'='group' then g end) or r.couple_id is distinct from (case when payload->>'scope'='couple' then m.couple_id end) or r.mode is distinct from payload->>'mode' or r.mystery is distinct from payload->>'mystery' or r.intention is distinct from coalesce(payload->>'intention','') then raise exception using errcode='PT409',message='El rosario ya existe con otra configuración. Actualizá.';end if;
  end if;
  -- A replay never recreates reservations that participants have released.
  if created_v and payload->>'scope'='couple' and payload->>'mode'='sequential' then
   if coalesce(payload->>'startsWith','') not in ('me','partner') then raise invalid_parameter_value;end if;
   select mm.id into id_partner from alianza_private.members mm where mm.couple_id=m.couple_id and mm.id<>u;
   if id_partner is null then raise invalid_parameter_value;end if;
   insert into alianza_private.rosary_slots(rosary_id,decade,user_id)
   select new_id,x,case when (x%2=1)=(coalesce(payload->>'startsWith','me')='me') then u else id_partner end from generate_series(1,5) x on conflict do nothing;
  end if;
 elsif a in ('rosary_reserve','rosary_release','rosary_complete','rosary_cancel','rosary_link') then
  select * into r from alianza_private.rosaries where rosaries.id=(payload->>'id')::uuid for update;
  if r.id is null or not alianza_private.can_pray(r,u) then raise insufficient_privilege;end if;
  if a='rosary_cancel' then
   if r.owner_id<>u and not exists(select 1 from alianza_private.groups where groups.id=r.group_id and owner_id=u) then raise insufficient_privilege;end if;
   update alianza_private.rosaries set cancelled=true where rosaries.id=r.id;
  elsif a='rosary_link' then
   select count(*) into n from alianza_private.rosary_contributions where rosary_id=r.id and user_id=u and day=today;
   if coalesce(payload->>'kind','') not in ('full','decade','community') or n=0 or (payload->>'kind'='full' and n<5) or (payload->>'kind'='community' and r.group_id is null and r.couple_id is null) then raise invalid_parameter_value;end if;
   if not exists(select 1 from alianza_private.records where owner=u::text and kind='habit' and key=payload->>'habitKey' and (data->>'active')::boolean) then raise invalid_parameter_value;end if;
   select * into ck from alianza_private.records where owner=u::text and kind='checks' and key=today::text;
   perform alianza_private.data(jsonb_build_object('kind','checks','key',today::text,'version',coalesce(ck.version,0),'dataEpoch',m.data_epoch,'relationshipVersion',m.relationship_version,'data',coalesce(ck.data,'{}'::jsonb)||jsonb_build_object(payload->>'habitKey','done')));
  else
   n:=(payload->>'decade')::int;if n is null or n<1 or n>5 or r.cancelled then raise invalid_parameter_value;end if;
   select * into slot from alianza_private.rosary_slots where rosary_id=r.id and decade=n;
   if a='rosary_release' then
    if slot.user_id<>u and r.owner_id<>u and not exists(select 1 from alianza_private.groups where groups.id=r.group_id and owner_id=u) then raise insufficient_privilege;end if;
    delete from alianza_private.rosary_slots where rosary_id=r.id and decade=n and not done;
   elsif a='rosary_reserve' then
    insert into alianza_private.rosary_slots values(r.id,n,u,false) on conflict do nothing;
    if not found and slot.user_id<>u then raise exception using errcode='PT409',message='Esta decena ya está reservada.';end if;
   else
    if r.mode='sequential' and exists(select 1 from generate_series(1,n-1) x where not exists(select 1 from alianza_private.rosary_slots s where s.rosary_id=r.id and s.decade=x and s.done)) then raise invalid_parameter_value;end if;
    if slot.user_id is not null and slot.user_id<>u and not slot.done then raise exception using errcode='PT409',message='Otra persona reservó esta decena.';end if;
    insert into alianza_private.rosary_slots values(r.id,n,u,true) on conflict(rosary_id,decade) do update set done=true where rosary_slots.user_id=u;
    insert into alianza_private.rosary_contributions values(r.id,u,n,today) on conflict do nothing;
   end if;
  end if;
 elsif a<>'snapshot' then raise invalid_parameter_value;
 end if;
 -- Snapshot: only current group members and couple members can read common data.
 return result||jsonb_build_object('groups',coalesce((select jsonb_agg(jsonb_build_object(
  'id',gg.id,'name',gg.name,'symbol',gg.symbol,'ideal',gg.ideal,'motto',gg.motto,'version',gg.version,'ownerId',gg.owner_id,
  'members',(select jsonb_agg(jsonb_build_object('id',gm.user_id,'name',gm.name)) from alianza_private.group_members gm where gm.group_id=gg.id),
  'meeting',(select jsonb_build_object('data',mt.data,'version',mt.version,'responses',(select coalesce(jsonb_agg(jsonb_build_object('userId',rv.user_id,'attending',rv.attending)),'[]') from alianza_private.meeting_rsvps rv where rv.group_id=gg.id and rv.meeting_version=mt.version)) from alianza_private.group_meetings mt where mt.group_id=gg.id),
  'purposes',(select coalesce(jsonb_agg(jsonb_build_object('id',pp.id,'title',pp.title,'reason',pp.reason,'start',pp.starts_on,'end',pp.ends_on,'target',pp.target,'unit',pp.unit,'decision',pp.decision,'version',pp.version,
   'joined',exists(select 1 from alianza_private.purpose_members pm where pm.purpose_id=pp.id and pm.user_id=u and pm.unit_id=case when pp.unit='person' then u::text else 'couple:'||m.couple_id::text end),
   'share',coalesce((select pm.share from alianza_private.purpose_members pm where pm.purpose_id=pp.id and pm.user_id=u),false),
   'logs',(select coalesce(jsonb_agg(jsonb_build_object('day',pl.day,'amount',pl.amount,'version',pl.version)),'[]') from alianza_private.purpose_logs pl where pl.purpose_id=pp.id and pl.unit_id=case when pp.unit='person' then u::text else 'couple:'||m.couple_id::text end and exists(select 1 from alianza_private.purpose_members pm where pm.purpose_id=pp.id and pm.user_id=u and pm.unit_id=pl.unit_id)),
   'summary',alianza_private.purpose_summary(pp.id)
  ) order by pp.starts_on desc),'[]') from alianza_private.group_purposes pp where pp.group_id=gg.id)
 ) order by gg.created_at) from alianza_private.groups gg join alianza_private.group_members mine on mine.group_id=gg.id and mine.user_id=u),'[]'),
 'rosaries',coalesce((select jsonb_agg(jsonb_build_object('id',rr.id,'ownerId',rr.owner_id,'groupId',rr.group_id,'coupleId',rr.couple_id,'mystery',rr.mystery,'mode',rr.mode,'intention',rr.intention,'cancelled',rr.cancelled,
  'slots',(select coalesce(jsonb_agg(jsonb_build_object('decade',s.decade,'userId',s.user_id,'done',s.done)),'[]') from alianza_private.rosary_slots s where s.rosary_id=rr.id),
  'mine',(select coalesce(jsonb_agg(jsonb_build_object('decade',cc.decade,'day',cc.day)),'[]') from alianza_private.rosary_contributions cc where cc.rosary_id=rr.id and cc.user_id=u)
 ) order by rr.created_at desc) from alianza_private.rosaries rr where alianza_private.can_pray(rr,u)),'[]'));
end $$;
-- Aggregate only consenting units, with no filters or individual drilldown.
-- Couples contribute once and require BOTH current spouses to consent in this group.
create function alianza_private.purpose_summary(pid uuid) returns jsonb language sql stable set search_path='' as $$
 with p as(select * from alianza_private.group_purposes where id=pid), units as (
 select pm.unit_id from alianza_private.purpose_members pm join p on p.id=pm.purpose_id
 join alianza_private.group_members gm on gm.group_id=p.group_id and gm.user_id=pm.user_id
 join alianza_private.members m on m.id=pm.user_id
 where pm.share and pm.unit_id=case when p.unit='person' then m.id::text else 'couple:'||m.couple_id::text end
 group by pm.unit_id,p.unit having p.unit='person' or count(*)=2
 ), totals as(select units.unit_id,least(p.target,coalesce(sum(l.amount),0)) amount,count(l.day)>0 recorded from units cross join p left join alianza_private.purpose_logs l on l.purpose_id=p.id and l.unit_id=units.unit_id group by units.unit_id,p.target)
 select case when count(*)>=5 and count(*) filter(where recorded)>=5 then jsonb_build_object('units',count(*),'recordedUnits',count(*) filter(where recorded),'amount',sum(amount),'target',count(*)*(select target from p)) else null end from totals;
$$;
create function public.alianza_community(payload jsonb default '{}'::jsonb) returns jsonb language sql security invoker set search_path='' as $$select alianza_private.community(payload)$$;
revoke all on function alianza_private.can_pray(alianza_private.rosaries,uuid),alianza_private.purpose_summary(uuid),alianza_private.community(jsonb),public.alianza_community(jsonb) from public,anon,authenticated,alianza_metrics;
grant execute on function alianza_private.community(jsonb),public.alianza_community(jsonb) to authenticated;
commit;
