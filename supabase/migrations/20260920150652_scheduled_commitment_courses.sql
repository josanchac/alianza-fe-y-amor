begin;
-- Additive validation; plans remain server-owned and existing records untouched.
alter function alianza_private.valid_record(text,text,jsonb) rename to valid_record_before_courses;
create function alianza_private.valid_record(k text,ky text,d jsonb) returns boolean
language plpgsql stable security invoker set search_path='' as $$
declare f jsonb; c jsonb; item jsonb;
begin
 if k='habit' and (d->'frequency' ? 'weekdays' or d->'frequency' ? 'course') then
  f:=d->'frequency';
  if f->>'period' is distinct from 'day' then return false; end if;
  if f ? 'weekdays' then
   if f ? 'course' or jsonb_typeof(f->'weekdays') is distinct from 'array' then return false; end if;
   if jsonb_array_length(f->'weekdays') not between 1 and 7 then return false; end if;
   for item in select value from jsonb_array_elements(f->'weekdays') loop
    if jsonb_typeof(item)<>'number' or item::text!~'^[0-6]$' then return false; end if;
   end loop;
   if (select count(distinct value) from jsonb_array_elements(f->'weekdays'))<>jsonb_array_length(f->'weekdays') then return false; end if;
  end if;
  if f ? 'course' then
   c:=f->'course';
   if jsonb_typeof(c) is distinct from 'object' or not(c ?& array['start','days']) or c-array['start','days','resumedOn']<>'{}'::jsonb then return false; end if;
   if f->>'target' is distinct from '1' or coalesce(f->>'unit','days')<>'days' then return false; end if;
   if jsonb_typeof(c->'start') is distinct from 'string' or not coalesce(alianza_private.valid_date(c->>'start'),false) then return false; end if;
   if jsonb_typeof(c->'days') is distinct from 'number' or c->>'days'!~'^[1-9][0-9]{0,2}$' then return false; end if;
   if (c->>'days')::int>365 then return false; end if;
   if c ? 'resumedOn' and (jsonb_typeof(c->'resumedOn') is distinct from 'string' or not coalesce(alianza_private.valid_date(c->>'resumedOn'),false) or c->>'resumedOn'<c->>'start') then return false; end if;
  end if;
  return alianza_private.valid_record_before_courses(k,ky,jsonb_set(d,'{frequency}',f-array['weekdays','course']));
 end if;
 return alianza_private.valid_record_before_courses(k,ky,d);
end $$;
revoke all on function alianza_private.valid_record(text,text,jsonb),alianza_private.valid_record_before_courses(text,text,jsonb) from public,anon,authenticated,alianza_metrics;

create function alianza_private.guard_scheduled_checks() returns trigger
language plpgsql security invoker set search_path='' as $$
declare entry record; plan jsonb; completed int;
begin
 if new.kind<>'checks' then return new; end if;
 for entry in select * from jsonb_each(new.data) loop
  if tg_op='UPDATE' and entry.value is not distinct from old.data->entry.key then continue; end if;
  if entry.value<>'"done"'::jsonb and jsonb_typeof(entry.value)<>'number' then continue; end if;
  select v into plan from alianza_private.records r cross join lateral jsonb_array_elements(r.data->'versions') v
   where r.owner=new.owner and r.kind='habit_plan' and r.key=entry.key and v->>'from'<=new.key order by v->>'from' desc limit 1;
  if plan ? 'weekdays' and not(plan->'weekdays' @> jsonb_build_array(extract(dow from new.key::date)::int)) then
   raise exception using errcode='22023',message='Este compromiso no corresponde a esta fecha';
  end if;
  if plan ? 'course' then
   if new.key<plan->'course'->>'start' then raise exception using errcode='22023',message='El recorrido todavía no comienza'; end if;
   select count(*) into completed from alianza_private.records r where r.owner=new.owner and r.kind='checks'
    and r.key>=plan->'course'->>'start' and r.key<new.key and r.data->entry.key='"done"'::jsonb;
   if completed>=(plan->'course'->>'days')::int then raise exception using errcode='22023',message='Este recorrido ya está completo'; end if;
  end if;
 end loop;
 return new;
end $$;
revoke all on function alianza_private.guard_scheduled_checks() from public,anon,authenticated,alianza_metrics;
create trigger guard_scheduled_checks before insert or update on alianza_private.records for each row execute function alianza_private.guard_scheduled_checks();
commit;
