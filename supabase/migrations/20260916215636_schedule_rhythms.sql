begin;
-- Existing marks and plans are left untouched. Missing unit means distinct days.
alter function alianza_private.valid_record(text,text,jsonb) rename to valid_record_before_rhythms;
create function alianza_private.valid_record(k text,ky text,d jsonb) returns boolean
language plpgsql stable set search_path='' as $$
declare normalized jsonb:=d; f jsonb; entry record;
begin
 if k='habit' and d->'frequency' ? 'unit' then
  f:=d->'frequency';
  if f->>'unit' not in('days','times') or jsonb_typeof(f->'unit')<>'string' then return false; end if;
  if f->>'unit'='times' then
   if f->>'period' not in('week','month') or jsonb_typeof(f->'target')<>'number' or f->>'target'!~'^[1-9][0-9]?$' then return false; end if;
   f:=jsonb_set(f,'{target}','1');
  end if;
  normalized:=jsonb_set(d,'{frequency}',f-'unit');
 elsif k='checks' and jsonb_typeof(d)='object' then
  for entry in select * from jsonb_each(d) loop
   if jsonb_typeof(entry.value)='number' then
    if entry.value::text!~'^[1-9][0-9]?$' then return false; end if;
    normalized:=jsonb_set(normalized,array[entry.key],'"done"');
   end if;
  end loop;
 end if;
 return alianza_private.valid_record_before_rhythms(k,ky,normalized);
end $$;
revoke all on function alianza_private.valid_record_before_rhythms(text,text,jsonb),alianza_private.valid_record(text,text,jsonb) from public,anon,authenticated,alianza_metrics;

create function alianza_private.guard_occurrence_counts() returns trigger
language plpgsql security invoker set search_path='' as $$
declare entry record; plan jsonb;
begin
 if new.kind<>'checks' then return new; end if;
 for entry in select * from jsonb_each(new.data) loop
  -- A legacy completion (including rosary linkage) must never erase a larger count.
  if tg_op='UPDATE' and entry.value='"done"'::jsonb and jsonb_typeof(old.data->entry.key)='number' then
   new.data:=jsonb_set(new.data,array[entry.key],old.data->entry.key);continue;
  end if;
  if jsonb_typeof(entry.value)='number' and (tg_op='INSERT' or entry.value is distinct from old.data->entry.key) then
   select v into plan from alianza_private.records r cross join lateral jsonb_array_elements(r.data->'versions') v
    where r.owner=new.owner and r.kind='habit_plan' and r.key=entry.key and v->>'from'<=new.key order by v->>'from' desc limit 1;
   if plan is null or coalesce(plan->>'unit','days')<>'times' or plan->>'period' not in('week','month') or not coalesce((plan->>'active')::boolean,false)
    then raise exception using errcode='22023',message='Este compromiso cuenta días, no varias ocasiones'; end if;
  end if;
 end loop;
 return new;
end $$;
revoke all on function alianza_private.guard_occurrence_counts() from public,anon,authenticated,alianza_metrics;
create trigger guard_occurrence_counts before insert or update on alianza_private.records for each row execute function alianza_private.guard_occurrence_counts();
commit;
