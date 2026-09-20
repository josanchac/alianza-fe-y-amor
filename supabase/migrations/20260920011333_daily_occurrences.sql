begin;
-- Validation-only normalization. Stored frequency and server-owned plans retain
-- the actual daily period. No existing records are updated by this migration.
alter function alianza_private.valid_record(text,text,jsonb) rename to valid_record_before_daily_occurrences;
create function alianza_private.valid_record(k text,ky text,d jsonb) returns boolean
language sql stable security invoker set search_path='' as $$
 select alianza_private.valid_record_before_daily_occurrences(k,ky,
  case when k='habit' and d->'frequency'->>'period'='day' and d->'frequency'->>'unit'='times'
   then jsonb_set(d,'{frequency,period}','"month"'::jsonb) else d end)
$$;
revoke all on function alianza_private.valid_record(text,text,jsonb),alianza_private.valid_record_before_daily_occurrences(text,text,jsonb) from public,anon,authenticated,alianza_metrics;

create or replace function alianza_private.guard_occurrence_counts() returns trigger
language plpgsql security invoker set search_path='' as $$
declare entry record; plan jsonb;
begin
 if new.kind<>'checks' then return new; end if;
 for entry in select * from jsonb_each(new.data) loop
  -- Legacy clients and rosary linkage cannot reduce an existing numeric count.
  if tg_op='UPDATE' and entry.value='"done"'::jsonb and jsonb_typeof(old.data->entry.key)='number' then
   new.data:=jsonb_set(new.data,array[entry.key],old.data->entry.key);continue;
  end if;
  if jsonb_typeof(entry.value)='number' and (tg_op='INSERT' or entry.value is distinct from old.data->entry.key) then
   select v into plan from alianza_private.records r cross join lateral jsonb_array_elements(r.data->'versions') v
    where r.owner=new.owner and r.kind='habit_plan' and r.key=entry.key and v->>'from'<=new.key order by v->>'from' desc limit 1;
   if plan is null or coalesce(plan->>'unit','days')<>'times' or plan->>'period' not in('day','week','month') or not coalesce((plan->>'active')::boolean,false)
    then raise exception using errcode='22023',message='Este compromiso permite un solo registro por día'; end if;
  end if;
 end loop;
 return new;
end $$;
revoke all on function alianza_private.guard_occurrence_counts() from public,anon,authenticated,alianza_metrics;
commit;
