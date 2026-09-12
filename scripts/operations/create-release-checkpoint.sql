-- Operator-only in-database checkpoint. Never export payload through tool logs.
-- This is not an independent disaster-recovery backup or an Auth backup.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
create schema if not exists alianza_backup;
revoke all on schema alianza_backup from public,anon,authenticated,alianza_metrics;
create table if not exists alianza_backup.release_checkpoints(
 id uuid primary key default gen_random_uuid(),
 captured_at timestamptz not null default now(),
 payload jsonb not null,
 verified boolean not null default false
);
alter table alianza_backup.release_checkpoints enable row level security;
revoke all on alianza_backup.release_checkpoints from public,anon,authenticated,alianza_metrics;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='alianza_backup' and tablename='release_checkpoints' and policyname='deny_direct_access') then
  create policy deny_direct_access on alianza_backup.release_checkpoints for all to anon,authenticated,alianza_metrics using(false) with check(false);
 end if;
end $$;
do $$
declare t record; data jsonb:='{}'::jsonb; rows jsonb; checkpoint uuid;
begin
 -- Capture an internally consistent set without changing any application rows.
 for t in select tablename from pg_tables where schemaname='alianza_private' order by tablename loop
  execute format('lock table alianza_private.%I in share mode',t.tablename);
 end loop;
 for t in select tablename from pg_tables where schemaname='alianza_private' order by tablename loop
  execute format('select coalesce(jsonb_agg(to_jsonb(r) order by to_jsonb(r)::text),''[]''::jsonb) from alianza_private.%I r',t.tablename) into rows;
  data:=data||jsonb_build_object(t.tablename,rows);
 end loop;
 insert into alianza_backup.release_checkpoints(payload) values(jsonb_build_object('tables',data,'functions',(
  select coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'definition',pg_get_functiondef(p.oid),'acl',p.proacl::text) order by n.nspname,p.proname),'[]'::jsonb)
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='alianza_private' or (n.nspname='public' and p.proname like 'alianza_%')
 ))) returning id into checkpoint;
 -- Verify the stored copy while writes are still excluded by the same locks.
 for t in select tablename from pg_tables where schemaname='alianza_private' order by tablename loop
  execute format('select coalesce(jsonb_agg(to_jsonb(r) order by to_jsonb(r)::text),''[]''::jsonb) from alianza_private.%I r',t.tablename) into rows;
  if rows is distinct from (select payload->'tables'->t.tablename from alianza_backup.release_checkpoints where id=checkpoint) then raise exception 'Checkpoint comparison failed'; end if;
 end loop;
 update alianza_backup.release_checkpoints set verified=true where id=checkpoint;
end $$;
commit;
