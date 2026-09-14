-- Operator-only verification. Run before committing the additive pilot upgrade.
-- Compare in the database: never return personal rows or checkpoint payloads.
do $$
declare snapshot jsonb; old_table record; actual jsonb;
begin
 if not exists(select 1 from public.alianza_service_status where id and active) then raise exception 'Maintenance must remain active'; end if;
 select payload->'tables' into snapshot from alianza_backup.release_checkpoints
 where verified and captured_at>now()-interval '1 hour' order by captured_at desc limit 1;
 if snapshot is null then raise exception 'A recent verified checkpoint is required'; end if;
 for old_table in select key,value from jsonb_each(snapshot) loop
  execute format('select coalesce(jsonb_agg(to_jsonb(r) order by to_jsonb(r)::text),''[]''::jsonb) from alianza_private.%I r',old_table.key) into actual;
  if actual is distinct from old_table.value then raise exception 'Existing values changed in %',old_table.key; end if;
 end loop;
 if exists(select 1 from pg_tables t where t.schemaname='alianza_private' and not exists(
  select 1 from pg_trigger g where g.tgrelid=format('alianza_private.%I',t.tablename)::regclass and g.tgname='service_maintenance_guard' and g.tgenabled='O'
 )) then raise exception 'Missing maintenance trigger'; end if;
 if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='alianza_private' and c.relkind='r' and not c.relrowsecurity) then raise exception 'Missing private RLS'; end if;
 if exists(select 1 from pg_tables t cross join (values('anon'),('authenticated')) r(role_name)
 where t.schemaname='alianza_private' and has_table_privilege(r.role_name,format('alianza_private.%I',t.tablename),'SELECT,INSERT,UPDATE,DELETE')) then raise exception 'Unexpected direct client privileges'; end if;
end $$;
