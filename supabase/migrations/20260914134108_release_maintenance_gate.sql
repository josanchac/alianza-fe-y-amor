begin;
create table public.alianza_service_status(id boolean primary key default true check(id),active boolean not null default false,required_version text);
insert into public.alianza_service_status(id) values(true);
alter table public.alianza_service_status enable row level security;
revoke all on public.alianza_service_status from public,anon,authenticated,alianza_metrics;
grant select on public.alianza_service_status to anon,authenticated;
create policy service_status_read on public.alianza_service_status for select to anon,authenticated using(true);

-- Runs on every application-table write, including an older already-open client.
-- Operators do not carry an end-user JWT. No private row is returned or logged.
create function alianza_private.enforce_maintenance() returns trigger language plpgsql security definer set search_path='' as $$
declare s public.alianza_service_status; v text;
begin
 if auth.uid() is not null or current_setting('role',true) in ('authenticated','anon','alianza_metrics') then
  perform pg_advisory_xact_lock_shared(8254,42);
  select * into s from public.alianza_service_status where id;
  if s.active then raise sqlstate 'PT503' using message='Estamos actualizando Alianza. Volvé en unos minutos.';end if;
  v:=coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-client-info','');
  if s.required_version is not null and v<>'alianza/'||s.required_version then raise sqlstate 'PT426' using message='Hay una nueva versión de Alianza. Actualizá la página antes de guardar.';end if;
 end if;
 return null;
end $$;
revoke all on function alianza_private.enforce_maintenance() from public,anon,authenticated,alianza_metrics;

create function alianza_private.install_maintenance_triggers() returns void language plpgsql set search_path='' as $$
declare t record;
begin
 for t in select tablename from pg_tables where schemaname='alianza_private' order by tablename loop
  execute format('drop trigger if exists service_maintenance_guard on alianza_private.%I',t.tablename);
  execute format('create trigger service_maintenance_guard before insert or update or delete or truncate on alianza_private.%I for each statement execute function alianza_private.enforce_maintenance()',t.tablename);
 end loop;
end $$;
revoke all on function alianza_private.install_maintenance_triggers() from public,anon,authenticated,alianza_metrics;
select alianza_private.install_maintenance_triggers();
commit;
