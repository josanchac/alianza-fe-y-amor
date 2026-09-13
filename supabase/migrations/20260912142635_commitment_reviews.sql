-- Personal period notes and self-assessment. No changes to existing records or sharing.
begin;
create or replace function alianza_private.valid_record(k text, ky text, d jsonb) returns boolean
language plpgsql stable set search_path='' as $$
declare fields text[]; f text; val jsonb; maxlen int; dt text; expected text;
 today text:=to_char(now() at time zone 'America/Costa_Rica','YYYY-MM-DD');
begin
 if k is null or ky is null or d is null or jsonb_typeof(d)<>'object' or octet_length(d::text)>40000 or length(ky)>(case when k='habit_review' then 122 else 100 end) or ky!~'^[a-zA-Z0-9:_-]+$' then return false; end if;
 fields:=case k
 when 'profile' then array['name','ideal','shareSchedule','shareNotes'] || case when d ? 'symbol' then array['symbol'] else array[]::text[] end || case when d ? 'shareIdeal' then array['shareIdeal'] else array[]::text[] end
 when 'habit' then case when d ? 'frequency' then array['title','moment','active','anchor','minimum','frequency'] else array['title','moment','active','anchor','minimum'] end
 when 'preferences' then array['focus','lastSeenRelease']
 when 'journal' then array['gratitude','offering']
 when 'purpose' then array['text','review']
 when 'review' then array['start','end','gratitude','learning','next']
 when 'habit_review' then array['habitKey','period','start','end','note','assessment','nextStep']
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
 if k='habit_review' then
  if not alianza_private.valid_date(d->>'start') or not alianza_private.valid_date(d->>'end') then return false; end if;
  if d->>'start'>today or d->>'start'>d->>'end' or d->>'period' not in ('week','month') then return false; end if;
  if length(d->>'habitKey')>100 or d->>'habitKey'!~'^[a-zA-Z0-9:_-]+$' or length(d->>'note')>4000 then return false; end if;
  if ky<>(d->>'habitKey')||':'||(d->>'start')||':'||(d->>'end') then return false; end if;
  if d->>'assessment' not in ('unsure','met','not-met') or d->>'nextStep' not in ('keep','adjust','explore') then return false; end if;
  if d->>'period'='week' and (extract(isodow from (d->>'start')::date)<>1 or (d->>'end')::date<>(d->>'start')::date+6) then return false; end if;
  if d->>'period'='month' and (right(d->>'start',2)<>'01' or (d->>'end')::date<>((d->>'start')::date+interval '1 month'-interval '1 day')::date) then return false; end if;
  -- Open periods accept notes only, never a final assessment or readiness claim.
  if d->>'end'>=today and (d->>'assessment'<>'unsure' or d->>'nextStep'<>'keep') then return false; end if;
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
  if k='habit_review' and not exists(select 1 from alianza_private.records where owner=uid::text and kind='habit' and key=d->>'habitKey') then raise invalid_parameter_value; end if;
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
commit;
