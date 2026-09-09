-- Private data API for a single married couple. Enrolment is administrator-only.
-- No personal identifiers or credentials belong in this file.
begin;
create schema if not exists alianza_private;
revoke all on schema alianza_private from public, anon, authenticated;
grant usage on schema alianza_private to authenticated;
create table if not exists alianza_private.members (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null unique check(role in ('jose','neca')),
 name text not null, ideal text not null
);
create table if not exists alianza_private.records (
 owner text not null, kind text not null, key text not null,
 data jsonb not null, version integer not null default 1 check(version>0),
 updated timestamptz not null default now(), primary key(owner,kind,key)
);
alter table alianza_private.members enable row level security;
alter table alianza_private.records enable row level security;
revoke all on all tables in schema alianza_private from public,anon,authenticated;

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
 when 'profile' then array['name','ideal','shareSchedule','shareNotes']
 when 'habit' then array['title','moment','active','anchor','minimum']
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
    if f in ('shareSchedule','shareNotes','active','done') then
      if jsonb_typeof(d->f)<>'boolean' then return false; end if;
    else
      if jsonb_typeof(d->f)<>'string' then return false; end if;
      maxlen:=case f when 'name' then 60 when 'ideal' then 200 when 'title' then 180 when 'anchor' then 240 when 'minimum' then 240 else 12000 end;
      if length(d->>f)>maxlen then return false; end if;
      if f in ('name','ideal','title') and length(btrim(d->>f))=0 then return false; end if;
    end if;
   end loop;
 end if;
 if k='profile' and ky<>'me' then return false; end if;
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

create or replace function alianza_private.data(payload jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); member alianza_private.members; spouse alianza_private.members;
 p jsonb; own_rows jsonb; shared_rows jsonb; partner_rows jsonb; partner jsonb:=null;
 k text; ky text; d jsonb; v integer; who text; result alianza_private.records; h jsonb; i int;
begin
 if uid is null then raise insufficient_privilege; end if;
 select * into member from alianza_private.members where id=uid;
 if not found then raise insufficient_privilege; end if;
 -- Membership is checked against the database every request, never user-editable metadata.
 if not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then raise insufficient_privilege; end if;
 if payload is not null then
  if jsonb_typeof(payload)<>'object' or not(payload ?& array['kind','key','data','version']) or payload-array['kind','key','data','version']<>'{}'::jsonb
    or jsonb_typeof(payload->'kind')<>'string' or jsonb_typeof(payload->'key')<>'string'
    or jsonb_typeof(payload->'version')<>'number' or payload->>'version'!~'^\d{1,9}$'
    then raise invalid_parameter_value; end if;
  k:=payload->>'kind'; ky:=payload->>'key'; d:=payload->'data';v:=(payload->>'version')::integer;
  if not alianza_private.valid_record(k,ky,d) then raise invalid_parameter_value; end if;
  who:=case when k='rs' then 'couple' else uid::text end;
  if v=0 then
   insert into alianza_private.records(owner,kind,key,data) values(who,k,ky,d) on conflict do nothing returning * into result;
  else
   update alianza_private.records set data=d,version=version+1,updated=now() where owner=who and kind=k and key=ky and version=v returning * into result;
  end if;
  if result.owner is null then raise exception using errcode='PT409',message='Registro modificado en otro dispositivo'; end if;
  return jsonb_build_object('record',to_jsonb(result));
 end if;
 -- Initial records are inserted once, transactionally, without overwriting edits.
 if not exists(select 1 from alianza_private.records where owner=uid::text and kind='profile' and key='me') then
  insert into alianza_private.records(owner,kind,key,data) values(uid::text,'profile','me',jsonb_build_object('name',member.name,'ideal',member.ideal,'shareSchedule',false,'shareNotes',false)) on conflict do nothing;
  for h,i in select value,ordinality::int from jsonb_array_elements(jsonb_build_array(
   jsonb_build_object('title','Ofrecer mi día a la Mater','moment','Mañana','anchor','Después de despertarme','minimum','Una frase de ofrecimiento','active',true),
   jsonb_build_object('title',case when member.role='jose' then 'Liderar con un gesto concreto de amor' else 'Vivir un gesto concreto de fe y confianza' end,'moment','Durante el día','anchor','Al comenzar mi actividad principal','minimum','Un gesto pequeño y consciente','active',true),
   jsonb_build_object('title','Cuidar mi descanso y mi cuerpo','moment','Durante el día','anchor','Después de almorzar','minimum','Dos minutos de pausa','active',true),
   jsonb_build_object('title','Agradecer y revisar mi propósito particular','moment','Noche','anchor','Antes de acostarme','minimum','Agradecer una cosa y mirar mi propósito','active',true)
  )) with ordinality loop
   insert into alianza_private.records(owner,kind,key,data) values(uid::text,'habit','starter-'||(i-1),h) on conflict do nothing;
  end loop;
 end if;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.updated desc),'[]'::jsonb) into own_rows from alianza_private.records r where owner=uid::text;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.updated desc),'[]'::jsonb) into shared_rows from alianza_private.records r where owner='couple';
 select * into spouse from alianza_private.members where id<>uid;
 if found then
  select data into p from alianza_private.records where owner=spouse.id::text and kind='profile' and key='me';
  select coalesce(jsonb_agg(to_jsonb(r) order by r.updated desc),'[]'::jsonb) into partner_rows from alianza_private.records r where owner=spouse.id::text and (
   ((p->>'shareSchedule')::boolean and kind in ('habit','checks')) or ((p->>'shareNotes')::boolean and kind in ('journal','purpose','review')));
  partner:=jsonb_build_object('name',coalesce(p->>'name',spouse.name),'ideal',coalesce(p->>'ideal',spouse.ideal),'shareSchedule',coalesce((p->>'shareSchedule')::boolean,false),'shareNotes',coalesce((p->>'shareNotes')::boolean,false),'records',partner_rows);
 end if;
 return jsonb_build_object('user',jsonb_build_object('id',uid,'role',member.role,'email',(select email from auth.users where id=uid)),'own',own_rows,'shared',shared_rows,'partner',partner,'today',to_char(now() at time zone 'America/Costa_Rica','YYYY-MM-DD'));
end $$;
-- The public entry point is an invoker; the narrow privileged function above
-- lives in an unexposed schema and independently checks identity and membership.
create or replace function public.alianza_data(payload jsonb default null) returns jsonb
language sql security invoker set search_path='' as $$ select alianza_private.data(payload); $$;
revoke all on all functions in schema alianza_private from public,anon,authenticated;
grant execute on function alianza_private.data(jsonb) to authenticated;
revoke all on function public.alianza_data(jsonb) from public,anon;
grant execute on function public.alianza_data(jsonb) to authenticated;
create policy deny_direct_access on alianza_private.members for all to anon,authenticated using (false) with check (false);
create policy deny_direct_access on alianza_private.records for all to anon,authenticated using (false) with check (false);
commit;
