begin;
-- Additive alpha, not applied to the pilot. All new tables remain private.
alter table alianza_private.groups add column photo text not null default '', add column symbol_image text not null default '', add column permissions jsonb not null default '{}', add column coordinators uuid[] not null default '{}';
alter table alianza_private.groups add constraint group_photo_size check(length(photo)<=180000), add constraint group_symbol_size check(length(symbol_image)<=30000);
alter table alianza_private.rosaries add column personal_step int not null default 0 check(personal_step between 0 and 69), add column progress_version int not null default 0;
-- Preserve already completed personal rosaries; never rewrite contribution dates.
update alianza_private.rosaries r set personal_step=69 where r.group_id is null and r.couple_id is null and (select count(*) from alianza_private.rosary_slots s where s.rosary_id=r.id and s.done)=5;
create table alianza_private.capital_campaigns(id uuid primary key,group_id uuid not null references alianza_private.groups(id),title text not null check(length(title) between 1 and 240),starts_on date not null,ends_on date not null,version int not null default 1,check(ends_on>=starts_on and ends_on-starts_on<=366));
create table alianza_private.capital_members(campaign_id uuid references alianza_private.capital_campaigns(id),user_id uuid references alianza_private.members(id),share boolean not null default false,primary key(campaign_id,user_id));
create table alianza_private.capital_logs(campaign_id uuid references alianza_private.capital_campaigns(id),user_id uuid references alianza_private.members(id),day date not null,amount int not null check(amount between 0 and 100),version int not null default 1,primary key(campaign_id,user_id,day));
create table alianza_private.group_tasks(id uuid primary key,group_id uuid not null references alianza_private.groups(id),title text not null check(length(title) between 1 and 240),assignee uuid not null references alianza_private.members(id),done boolean not null default false,version int not null default 1);
create table alianza_private.group_materials(id uuid primary key,group_id uuid not null references alianza_private.groups(id),title text not null check(length(title) between 1 and 500),url text not null default '' check(length(url)<=1000 and (url='' or url~'^https://[^[:space:]]+$')));
create table alianza_private.group_publications(kind text not null,id uuid not null,fingerprint text not null,summary jsonb,created_at timestamptz not null default now(),primary key(kind,id));
alter table alianza_private.capital_campaigns enable row level security;alter table alianza_private.capital_members enable row level security;alter table alianza_private.capital_logs enable row level security;alter table alianza_private.group_tasks enable row level security;alter table alianza_private.group_materials enable row level security;alter table alianza_private.group_publications enable row level security;
revoke all on alianza_private.capital_campaigns,alianza_private.capital_members,alianza_private.capital_logs,alianza_private.group_tasks,alianza_private.group_materials,alianza_private.group_publications from public,anon,authenticated,alianza_metrics;
create index capital_campaign_group on alianza_private.capital_campaigns(group_id);create index group_task_group on alianza_private.group_tasks(group_id);create index group_material_group on alianza_private.group_materials(group_id);
alter function alianza_private.valid_record(text,text,jsonb) rename to valid_record_before_spaces;
revoke all on function alianza_private.valid_record_before_spaces(text,text,jsonb) from public,anon,authenticated,alianza_metrics;
create function alianza_private.valid_record(k text,ky text,d jsonb) returns boolean language plpgsql stable set search_path='' as $$
begin
 if k='spaces' then return coalesce(ky='experience' and jsonb_typeof(d)='object' and d ?& array['enabled','start'] and d-array['enabled','start']='{}'::jsonb and jsonb_typeof(d->'enabled')='array' and jsonb_array_length(d->'enabled') between 1 and 3 and d->>'start' in ('personal','couple','group') and (d->'enabled') ? (d->>'start') and not exists(select 1 from jsonb_array_elements(d->'enabled') v where jsonb_typeof(v)<>'string' or v#>>'{}' not in ('personal','couple','group')),false);end if;
 return alianza_private.valid_record_before_spaces(k,ky,d);
end $$;
revoke all on function alianza_private.valid_record(text,text,jsonb) from public,anon,authenticated,alianza_metrics;
create function alianza_private.can_group(g uuid,u uuid,cap text) returns boolean language sql stable set search_path='' as $$
 select exists(select 1 from alianza_private.groups gg join alianza_private.group_members gm on gm.group_id=gg.id and gm.user_id=u where gg.id=g and (gg.owner_id=u or u=any(gg.coordinators) or gg.permissions->cap->>'mode'='all' or (gg.permissions->cap->>'mode'='selected' and (gg.permissions->cap->'users') ? u::text) or (not gg.permissions ? cap and cap='rosary')));
$$;
revoke all on function alianza_private.can_group(uuid,uuid,text) from public,anon,authenticated,alianza_metrics;
-- One immutable release per completed period. Consent/membership changes hide it,
-- never recompute it. No exact counts, time filters, identities or live updates.
create function alianza_private.collective_summary(kind_v text,id_v uuid) returns jsonb language plpgsql set search_path='' as $$
declare group_v uuid;end_v date;fingerprint_v text;pub alianza_private.group_publications;result jsonb;units int;recorded int;completed int;amount_v int;target_v int;
begin
 if kind_v='purpose' then select group_id,ends_on,target into group_v,end_v,target_v from alianza_private.group_purposes where id=id_v;
 else select group_id,ends_on into group_v,end_v from alianza_private.capital_campaigns where id=id_v;end if;
 if group_v is null or not exists(select 1 from alianza_private.group_members where group_id=group_v and user_id=auth.uid()) then return null;end if;
 if end_v>=(now() at time zone 'America/Costa_Rica')::date-1 then return null;end if;
 select md5(coalesce(string_agg(gm.user_id::text||':'||coalesce(m.couple_id::text,'')||':'||coalesce(case when kind_v='purpose' then (select pm.share::text||pm.unit_id from alianza_private.purpose_members pm where pm.purpose_id=id_v and pm.user_id=gm.user_id) else (select cm.share::text from alianza_private.capital_members cm where cm.campaign_id=id_v and cm.user_id=gm.user_id) end,'false'),',' order by gm.user_id),'')) into fingerprint_v from alianza_private.group_members gm join alianza_private.members m on m.id=gm.user_id where gm.group_id=group_v;
 select * into pub from alianza_private.group_publications where kind=kind_v and id=id_v;
 if found then return case when pub.fingerprint=fingerprint_v then pub.summary else null end;end if;
 if kind_v='purpose' then
  with p as(select * from alianza_private.group_purposes where id=id_v), consenting as(
   select pm.unit_id from alianza_private.purpose_members pm join p on p.id=pm.purpose_id join alianza_private.group_members gm on gm.group_id=p.group_id and gm.user_id=pm.user_id join alianza_private.members m on m.id=pm.user_id
   where pm.share and pm.unit_id=case when p.unit='person' then m.id::text else 'couple:'||m.couple_id::text end group by pm.unit_id,p.unit having p.unit='person' or count(*)=2
  ),totals as(select c.unit_id,coalesce(sum(l.amount),0) amount from consenting c left join alianza_private.purpose_logs l on l.purpose_id=id_v and l.unit_id=c.unit_id group by c.unit_id)
  select count(*),count(*) filter(where amount>0),count(*) filter(where amount>=target_v) into units,recorded,completed from totals;
  if units>=10 and recorded>=5 and units-recorded>=5 and completed>=5 and units-completed>=5 then result:=jsonb_build_object('participation',(floor(recorded*100.0/units/20)*20)::int||'–'||least(100,(floor(recorded*100.0/units/20)*20+20)::int)||'%','completed',(floor(completed*100.0/units/20)*20)::int||'–'||least(100,(floor(completed*100.0/units/20)*20+20)::int)||'%');end if;
 else
  with totals as(select cm.user_id,coalesce(sum(cl.amount),0) amount from alianza_private.capital_members cm join alianza_private.group_members gm on gm.group_id=group_v and gm.user_id=cm.user_id left join alianza_private.capital_logs cl on cl.campaign_id=cm.campaign_id and cl.user_id=cm.user_id where cm.campaign_id=id_v and cm.share group by cm.user_id)
  select count(*),count(*) filter(where amount>0),coalesce(sum(amount),0) into units,recorded,amount_v from totals;
  if units>=10 and recorded>=5 and units-recorded>=5 and amount_v>=10 then result:=jsonb_build_object('range',(floor(amount_v/10.0)*10)::int||'–'||(floor(amount_v/10.0)*10+9)::int);end if;
 end if;
 insert into alianza_private.group_publications values(kind_v,id_v,fingerprint_v,result,now()) on conflict do nothing;
 return result;
end $$;
revoke all on function alianza_private.collective_summary(text,uuid) from public,anon,authenticated,alianza_metrics;
create or replace function alianza_private.purpose_summary(pid uuid) returns jsonb language sql volatile set search_path='' as $$select alianza_private.collective_summary('purpose',pid)$$;
create or replace function alianza_private.community(payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); m alianza_private.members; a text:=coalesce(payload->>'action','snapshot'); g uuid; new_id uuid; id_partner uuid;
 gr alianza_private.groups; p alianza_private.group_purposes; r alianza_private.rosaries; slot alianza_private.rosary_slots;
 unit_id_v text; token text; result jsonb:='{}'; v integer; n integer; dt date; d jsonb; ck alianza_private.records;
 today date:=(now() at time zone 'America/Costa_Rica')::date; created_v boolean; campaign alianza_private.capital_campaigns; rule record; cap_v text;
begin
 if u is null or not exists(select 1 from auth.users where auth.users.id=u and email_confirmed_at is not null) then raise insufficient_privilege;end if;
 if payload is null or jsonb_typeof(payload)<>'object' or octet_length(payload::text)>250000 then raise invalid_parameter_value;end if;
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
  if g is null or not alianza_private.can_group(g,u,'identity') then raise insufficient_privilege;end if;
  if (coalesce(payload->>'photo','')<>'' and (length(payload->>'photo')>180000 or payload->>'photo'!~'^data:image/jpeg;base64,/9j/[A-Za-z0-9+/]*={0,2}$')) or (coalesce(payload->>'symbolImage','')<>'' and (length(payload->>'symbolImage')>30000 or payload->>'symbolImage'!~'^data:image/jpeg;base64,/9j/[A-Za-z0-9+/]*={0,2}$')) then raise invalid_parameter_value;end if;
  update alianza_private.groups set photo=coalesce(payload->>'photo',photo),symbol_image=coalesce(payload->>'symbolImage',symbol_image),name=trim(payload->>'name'),ideal=payload->>'ideal',motto=payload->>'motto',symbol=coalesce(payload->>'symbol',symbol),version=version+1 where groups.id=g and version=(payload->>'version')::int;
  if not found then raise exception using errcode='PT409',message='El grupo cambió. Actualizá.';end if;
 elsif a='group_leave' then
  if g is null or gr.owner_id=u then raise invalid_parameter_value;end if;
  update alianza_private.purpose_members set share=false where user_id=u and purpose_id in(select gp.id from alianza_private.group_purposes gp where gp.group_id=g);
  delete from alianza_private.rosary_slots where user_id=u and not done and rosary_id in(select rr.id from alianza_private.rosaries rr where rr.group_id=g);
  update alianza_private.capital_members set share=false where user_id=u and campaign_id in(select id from alianza_private.capital_campaigns where group_id=g);
  update alianza_private.groups set coordinators=array_remove(coordinators,u),permissions=(select coalesce(jsonb_object_agg(e.key,jsonb_set(e.value,'{users}',coalesce((select jsonb_agg(elem.value) from jsonb_array_elements(e.value->'users') elem(value) where elem.value#>>'{}'<>u::text),'[]'::jsonb))),'{}') from jsonb_each(permissions) e),version=version+1 where id=g;
  delete from alianza_private.group_members where group_id=g and user_id=u;
 elsif a='group_transfer' then
  if g is null or gr.owner_id<>u or not exists(select 1 from alianza_private.group_members where group_id=g and user_id=(payload->>'userId')::uuid) then raise insufficient_privilege;end if;
  update alianza_private.groups set owner_id=(payload->>'userId')::uuid,version=version+1 where groups.id=g;
 elsif a='invite_create' then
  if g is null or not alianza_private.can_group(g,u,'invites') then raise insufficient_privilege;end if;
  if (select count(*) from alianza_private.group_invites where group_id=g and created_at>now()-interval '1 day')>=20 then raise invalid_parameter_value;end if;
  token:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
  insert into alianza_private.group_invites(group_id,token_hash) values(g,encode(sha256(convert_to(token,'UTF8')),'hex'));
  result:=jsonb_build_object('token',token);
 elsif a='invite_revoke' then
  if g is null or not alianza_private.can_group(g,u,'invites') then raise insufficient_privilege;end if;
  update alianza_private.group_invites set revoked=true where group_id=g;
 elsif a in ('invite_preview','invite_join') then
  select group_id into g from alianza_private.group_invites where token_hash=encode(sha256(convert_to(payload->>'token','UTF8')),'hex') and not revoked and expires_at>now();
  if g is null then raise invalid_parameter_value;end if;
  if a='invite_preview' then return jsonb_build_object('invitation',(select jsonb_build_object('name',name) from alianza_private.groups where groups.id=g));end if;
  if (select count(*) from alianza_private.group_members where group_id=g)>=200 then raise invalid_parameter_value;end if;
  insert into alianza_private.group_members(group_id,user_id,name) values(g,u,trim(payload->>'displayName')) on conflict do nothing;
 elsif a='purpose_create' then
  if g is null or not alianza_private.can_group(g,u,'purpose') then raise insufficient_privilege;end if;
  new_id:=coalesce((payload->>'id')::uuid,gen_random_uuid());
  insert into alianza_private.group_purposes(id,group_id,title,reason,starts_on,ends_on,target,unit) values(new_id,g,payload->>'title',coalesce(payload->>'reason',''),(payload->>'start')::date,(payload->>'end')::date,(payload->>'target')::int,payload->>'unit') on conflict do nothing;
  if not found and not exists(select 1 from alianza_private.group_purposes where group_purposes.id=new_id and group_id=g) then raise insufficient_privilege;end if;
 elsif a in ('purpose_join','purpose_log','purpose_review') then
  select * into p from alianza_private.group_purposes where group_purposes.id=(payload->>'id')::uuid;
  if p.id is null or g is null or p.group_id<>g then raise insufficient_privilege;end if;
  if a='purpose_review' then
   if not alianza_private.can_group(g,u,'purpose') then raise insufficient_privilege;end if;
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
  if g is null or not alianza_private.can_group(g,u,'meeting') then raise insufficient_privilege;end if;
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
  if payload->>'scope'='group' and not alianza_private.can_group(g,u,'rosary') then raise insufficient_privilege;end if;
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
   if r.owner_id<>u and not alianza_private.can_group(r.group_id,u,'rosary') then raise insufficient_privilege;end if;
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
    if slot.user_id<>u and r.owner_id<>u and not alianza_private.can_group(r.group_id,u,'rosary') then raise insufficient_privilege;end if;
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
 elsif a='group_permissions' then
  if g is null or (gr.owner_id<>u and not u=any(gr.coordinators)) then raise insufficient_privilege;end if;
  d:=payload->'permissions';if d is null or jsonb_typeof(d)<>'object' or d-array['rosary','purpose','meeting','capital','materials','invites','identity']<>'{}'::jsonb or jsonb_typeof(payload->'coordinators') is distinct from 'array' or jsonb_array_length(payload->'coordinators')>200 then raise invalid_parameter_value;end if;
  for rule in select * from jsonb_each(d) loop
   if jsonb_typeof(rule.value)<>'object' or not rule.value ?& array['mode','users'] or rule.value-array['mode','users']<>'{}'::jsonb or coalesce(rule.value->>'mode','') not in ('coordinators','selected','all') or jsonb_typeof(rule.value->'users')<>'array' or jsonb_array_length(rule.value->'users')>200 then raise invalid_parameter_value;end if;
   if exists(select 1 from jsonb_array_elements_text(rule.value->'users') elem(value) where not exists(select 1 from alianza_private.group_members where group_id=g and user_id::text=elem.value)) then raise invalid_parameter_value;end if;
  end loop;
  if exists(select 1 from jsonb_array_elements_text(payload->'coordinators') elem(value) where not exists(select 1 from alianza_private.group_members where group_id=g and user_id::text=elem.value)) then raise invalid_parameter_value;end if;
  update alianza_private.groups set permissions=d,coordinators=array(select elem.value::uuid from jsonb_array_elements_text(payload->'coordinators') elem(value)),version=version+1 where id=g and version=(payload->>'version')::int;
  if not found then raise exception using errcode='PT409',message='Los permisos cambiaron. Actualizá.';end if;
 elsif a='purpose_update' then
  if g is null or not alianza_private.can_group(g,u,'purpose') then raise insufficient_privilege;end if;
  update alianza_private.group_purposes set title=payload->>'title',reason=coalesce(payload->>'reason',''),version=version+1 where id=(payload->>'id')::uuid and group_id=g and version=(payload->>'version')::int;
  if not found then raise exception using errcode='PT409',message='El propósito cambió. Actualizá.';end if;
 elsif a='capital_create' then
  if g is null or not alianza_private.can_group(g,u,'capital') then raise insufficient_privilege;end if;
  insert into alianza_private.capital_campaigns(id,group_id,title,starts_on,ends_on) values((payload->>'id')::uuid,g,payload->>'title',(payload->>'start')::date,(payload->>'end')::date);
 elsif a in ('capital_log','capital_share') then
  select * into campaign from alianza_private.capital_campaigns where id=(payload->>'id')::uuid and group_id=g;
  if campaign.id is null then raise insufficient_privilege;end if;
  if a='capital_share' then
   if jsonb_typeof(payload->'share') is distinct from 'boolean' then raise invalid_parameter_value;end if;
   insert into alianza_private.capital_members values(campaign.id,u,(payload->>'share')::boolean) on conflict(campaign_id,user_id) do update set share=excluded.share;
  else
   dt:=(payload->>'day')::date;n:=(payload->>'amount')::int;v:=(payload->>'version')::int;
   if dt is null or dt<campaign.starts_on or dt>campaign.ends_on or dt>today or n is null or v is null then raise invalid_parameter_value;end if;
   insert into alianza_private.capital_members values(campaign.id,u,false) on conflict do nothing;
   if v=0 then insert into alianza_private.capital_logs(campaign_id,user_id,day,amount) values(campaign.id,u,dt,n) on conflict do nothing;
   else update alianza_private.capital_logs set amount=n,version=version+1 where campaign_id=campaign.id and user_id=u and day=dt and version=v;end if;
   if not found then raise exception using errcode='PT409',message='El aporte cambió. Actualizá.';end if;
  end if;
 elsif a='task_create' then
  if g is null or not alianza_private.can_group(g,u,'meeting') or not exists(select 1 from alianza_private.group_members where group_id=g and user_id=(payload->>'assignee')::uuid) then raise insufficient_privilege;end if;
  insert into alianza_private.group_tasks(id,group_id,title,assignee) values((payload->>'id')::uuid,g,payload->>'title',(payload->>'assignee')::uuid);
 elsif a='task_complete' then
  if g is null or jsonb_typeof(payload->'done') is distinct from 'boolean' then raise invalid_parameter_value;end if;
  update alianza_private.group_tasks set done=(payload->>'done')::boolean,version=version+1 where id=(payload->>'id')::uuid and group_id=g and version=(payload->>'version')::int and (assignee=u or alianza_private.can_group(g,u,'meeting'));
  if not found then raise exception using errcode='PT409',message='El encargo cambió o no te corresponde.';end if;
 elsif a='material_create' then
  if g is null or not alianza_private.can_group(g,u,'materials') then raise insufficient_privilege;end if;
  insert into alianza_private.group_materials values((payload->>'id')::uuid,g,payload->>'title',coalesce(payload->>'url',''));
 elsif a='rosary_step' then
  select * into r from alianza_private.rosaries where id=(payload->>'id')::uuid for update;
  if r.id is null or r.owner_id<>u or r.group_id is not null or r.couple_id is not null or r.cancelled then raise insufficient_privilege;end if;
  n:=(payload->>'step')::int;v:=(payload->>'version')::int;
  if n is null or v is null or n<0 or n>69 or r.personal_step=69 or abs(n-r.personal_step)<>1 then raise invalid_parameter_value;end if;
  update alianza_private.rosaries set personal_step=n,progress_version=progress_version+1 where id=r.id and progress_version=v;
  if not found then raise exception using errcode='PT409',message='El rosario avanzó en otra pantalla. Actualizá.';end if;
  -- Only the explicit final confirmation records the full personal rosary.
  if n=69 then
   insert into alianza_private.rosary_slots select r.id,x,u,true from generate_series(1,5) x on conflict(rosary_id,decade) do update set done=true;
   insert into alianza_private.rosary_contributions select r.id,u,x,today from generate_series(1,5) x on conflict do nothing;
  end if;
 elsif a<>'snapshot' then raise invalid_parameter_value;
 end if;
 -- Snapshot: only current group members and couple members can read common data.
 return result||jsonb_build_object('groups',coalesce((select jsonb_agg(jsonb_build_object(
  'id',gg.id,'name',gg.name,'photo',gg.photo,'symbolImage',gg.symbol_image,'permissions',gg.permissions,'coordinators',to_jsonb(gg.coordinators),
 'tasks',(select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'title',t.title,'assignee',t.assignee,'done',t.done,'version',t.version)),'[]') from alianza_private.group_tasks t where t.group_id=gg.id),
 'materials',(select coalesce(jsonb_agg(jsonb_build_object('id',mt.id,'title',mt.title,'url',mt.url)),'[]') from alianza_private.group_materials mt where mt.group_id=gg.id),
 'capital',(select coalesce(jsonb_agg(jsonb_build_object('id',cc.id,'title',cc.title,'start',cc.starts_on,'end',cc.ends_on,'version',cc.version,'share',coalesce((select cm.share from alianza_private.capital_members cm where cm.campaign_id=cc.id and cm.user_id=u),false),'mine',(select coalesce(jsonb_agg(jsonb_build_object('day',cl.day,'amount',cl.amount,'version',cl.version)),'[]') from alianza_private.capital_logs cl where cl.campaign_id=cc.id and cl.user_id=u),'summary',alianza_private.collective_summary('capital',cc.id)) order by cc.starts_on desc),'[]') from alianza_private.capital_campaigns cc where cc.group_id=gg.id),'symbol',gg.symbol,'ideal',gg.ideal,'motto',gg.motto,'version',gg.version,'ownerId',gg.owner_id,
  'members',(select jsonb_agg(jsonb_build_object('id',gm.user_id,'name',gm.name)) from alianza_private.group_members gm where gm.group_id=gg.id),
  'meeting',(select jsonb_build_object('data',mt.data,'version',mt.version,'responses',(select coalesce(jsonb_agg(jsonb_build_object('userId',rv.user_id,'attending',rv.attending)),'[]') from alianza_private.meeting_rsvps rv where rv.group_id=gg.id and rv.meeting_version=mt.version)) from alianza_private.group_meetings mt where mt.group_id=gg.id),
  'purposes',(select coalesce(jsonb_agg(jsonb_build_object('id',pp.id,'title',pp.title,'reason',pp.reason,'start',pp.starts_on,'end',pp.ends_on,'target',pp.target,'unit',pp.unit,'decision',pp.decision,'version',pp.version,
   'joined',exists(select 1 from alianza_private.purpose_members pm where pm.purpose_id=pp.id and pm.user_id=u and pm.unit_id=case when pp.unit='person' then u::text else 'couple:'||m.couple_id::text end),
   'share',coalesce((select pm.share from alianza_private.purpose_members pm where pm.purpose_id=pp.id and pm.user_id=u),false),
   'logs',(select coalesce(jsonb_agg(jsonb_build_object('day',pl.day,'amount',pl.amount,'version',pl.version)),'[]') from alianza_private.purpose_logs pl where pl.purpose_id=pp.id and pl.unit_id=case when pp.unit='person' then u::text else 'couple:'||m.couple_id::text end and exists(select 1 from alianza_private.purpose_members pm where pm.purpose_id=pp.id and pm.user_id=u and pm.unit_id=pl.unit_id)),
   'summary',alianza_private.purpose_summary(pp.id)
  ) order by pp.starts_on desc),'[]') from alianza_private.group_purposes pp where pp.group_id=gg.id)
 ) order by gg.created_at) from alianza_private.groups gg join alianza_private.group_members mine on mine.group_id=gg.id and mine.user_id=u),'[]'),
 'rosaries',coalesce((select jsonb_agg(jsonb_build_object('id',rr.id,'personalStep',rr.personal_step,'progressVersion',rr.progress_version,'ownerId',rr.owner_id,'groupId',rr.group_id,'coupleId',rr.couple_id,'mystery',rr.mystery,'mode',rr.mode,'intention',rr.intention,'cancelled',rr.cancelled,
  'slots',(select coalesce(jsonb_agg(jsonb_build_object('decade',s.decade,'userId',s.user_id,'done',s.done)),'[]') from alianza_private.rosary_slots s where s.rosary_id=rr.id),
  'mine',(select coalesce(jsonb_agg(jsonb_build_object('decade',cc.decade,'day',cc.day)),'[]') from alianza_private.rosary_contributions cc where cc.rosary_id=rr.id and cc.user_id=u)
 ) order by rr.created_at desc) from alianza_private.rosaries rr where alianza_private.can_pray(rr,u)),'[]'));
end $$;

commit;
