-- Expand optional profile artwork without rewriting any user records.
begin;
alter table alianza_private.members drop constraint members_symbol_check;
alter table alianza_private.members add constraint members_symbol_check check(symbol in ('heart','tree','rosary','cross','flame','anchor','mountain','sun','star','flower','sprout','bird','church','compass','waves','book'));

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
commit;
