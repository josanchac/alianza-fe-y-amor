-- Additive upgrade: preserve existing records, owners, versions and timestamps.
begin;
lock table alianza_private.records in share row exclusive mode;
create or replace function alianza_private.valid_record(k text, ky text, d jsonb) returns boolean
language plpgsql stable set search_path='' as $$
declare fields text[]; f text; val jsonb; maxlen int; dt text; expected text;
 today text:=to_char(now() at time zone 'America/Costa_Rica','YYYY-MM-DD');
begin
 if k is null or ky is null or d is null or jsonb_typeof(d)<>'object' or octet_length(d::text)>40000 or length(ky)>100 or ky!~'^[a-zA-Z0-9:_-]+$' then return false; end if;
 fields:=case k
 when 'profile' then case when d ? 'symbol' then array['name','ideal','shareSchedule','shareNotes','symbol'] else array['name','ideal','shareSchedule','shareNotes'] end
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
    elsif f in ('shareSchedule','shareNotes','active','done') then
      if jsonb_typeof(d->f)<>'boolean' then return false; end if;
    else
      if jsonb_typeof(d->f)<>'string' then return false; end if;
      maxlen:=case f when 'name' then 60 when 'ideal' then 200 when 'title' then 180 when 'anchor' then 240 when 'minimum' then 240 else 12000 end;
      if length(d->>f)>maxlen then return false; end if;
      if f in ('name','title') and length(btrim(d->>f))=0 then return false; end if;
    end if;
   end loop;
 end if;
 if k='profile' and (ky<>'me' or (d ? 'symbol' and d->>'symbol' not in ('heart','tree','rosary','cross'))) then return false; end if;
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
  insert into alianza_private.records(owner,kind,key,data) values(uid::text,'profile','me',jsonb_build_object('name',member.name,'ideal',member.ideal,'shareSchedule',false,'shareNotes',false)) on conflict do nothing;
 end if;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.updated desc),'[]'::jsonb) into own_rows from alianza_private.records r where owner=uid::text;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.updated desc),'[]'::jsonb) into shared_rows from alianza_private.records r where owner='couple:'||member.couple_id::text;
 select * into spouse from alianza_private.members where couple_id=member.couple_id and id<>uid;
 if found then
  select data into p from alianza_private.records where owner=spouse.id::text and kind='profile' and key='me';
  select coalesce(jsonb_agg(to_jsonb(r) order by r.updated desc),'[]'::jsonb) into partner_rows from alianza_private.records r where owner=spouse.id::text and (
   ((p->>'shareSchedule')::boolean and kind in ('habit','checks','habit_plan')) or ((p->>'shareNotes')::boolean and kind in ('journal','purpose','review')));
  partner:=jsonb_build_object('name',coalesce(p->>'name',spouse.name),'ideal',coalesce(p->>'ideal',spouse.ideal),'shareSchedule',coalesce((p->>'shareSchedule')::boolean,false),'shareNotes',coalesce((p->>'shareNotes')::boolean,false),'symbol',coalesce(p->>'symbol',spouse.symbol),'records',partner_rows);
 end if;
 return jsonb_build_object('user',jsonb_build_object('id',uid,'role',member.role,'symbol',member.symbol,'coupleId',member.couple_id,'email',(select email from auth.users where id=uid)),'couple',jsonb_build_object('emblem',(select emblem from alianza_private.couples where id=member.couple_id)),'own',own_rows,'shared',shared_rows,'partner',partner,'today',to_char(now() at time zone 'America/Costa_Rica','YYYY-MM-DD'));
end $$;
-- The old model supported daily points only. Establish a baseline from the
-- upgrade date; do not reconstruct unknown activation or pause dates.
insert into alianza_private.records(owner,kind,key,data)
select owner,'habit_plan',key,jsonb_build_object('versions',jsonb_build_array(jsonb_build_object('from',to_char(now() at time zone 'America/Costa_Rica','YYYY-MM-DD'),'period','day','target',1,'active',(data->>'active')::boolean)))
from alianza_private.records where kind='habit'
on conflict do nothing;

revoke all on function alianza_private.capture_habit_plan() from public,anon,authenticated;
commit;
