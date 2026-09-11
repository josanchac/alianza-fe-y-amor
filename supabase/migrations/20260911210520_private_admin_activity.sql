-- Activity is collected independently of spiritual records. No content backfill.
create role alianza_metrics nologin noinherit;
grant alianza_metrics to postgres;
create table alianza_private.admin_members(user_id uuid primary key references auth.users(id) on delete cascade);
create table alianza_private.activity_days(user_id uuid references auth.users(id) on delete cascade, day date not null, primary key(user_id,day));
create table alianza_private.activity_config(started_on date not null);
insert into alianza_private.activity_config values((now() at time zone 'America/Costa_Rica')::date);
alter table alianza_private.admin_members enable row level security;
alter table alianza_private.activity_days enable row level security;
alter table alianza_private.activity_config enable row level security;
revoke all on alianza_private.admin_members,alianza_private.activity_days,alianza_private.activity_config from public,anon,authenticated;
grant usage on schema alianza_private,auth to alianza_metrics;
grant execute on function auth.uid() to alianza_metrics;
grant select(id,email,email_confirmed_at) on auth.users to alianza_metrics;
create policy alianza_metrics_accounts on auth.users for select to alianza_metrics using(true);
grant select(id,couple_id) on alianza_private.members to alianza_metrics;
grant select on alianza_private.admin_members,alianza_private.activity_days,alianza_private.activity_config to alianza_metrics;
grant insert on alianza_private.activity_days to alianza_metrics;
create policy metrics_members on alianza_private.members for select to alianza_metrics using(true);
create policy metrics_admin on alianza_private.admin_members for select to alianza_metrics using(true);
create policy metrics_days_read on alianza_private.activity_days for select to alianza_metrics using(true);
create policy metrics_days_write on alianza_private.activity_days for insert to alianza_metrics with check(user_id=(select auth.uid()) and day=(now() at time zone 'America/Costa_Rica')::date);
create policy metrics_config on alianza_private.activity_config for select to alianza_metrics using(true);
create function alianza_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from alianza_private.admin_members a join alianza_private.members m on m.id=a.user_id join auth.users u on u.id=m.id where a.user_id=auth.uid() and u.email_confirmed_at is not null);
$$;
create function alianza_private.record_activity() returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from alianza_private.members m join auth.users u on u.id=m.id where m.id=auth.uid() and u.email_confirmed_at is not null) then raise insufficient_privilege; end if;
 insert into alianza_private.activity_days(user_id,day) values(auth.uid(),(now() at time zone 'America/Costa_Rica')::date) on conflict do nothing;
end $$;
create function alianza_private.admin_activity() returns jsonb language plpgsql security definer set search_path='' as $$
declare today date:=(now() at time zone 'America/Costa_Rica')::date; result jsonb;
begin
 if not alianza_private.is_admin() then raise insufficient_privilege; end if;
 select jsonb_build_object('startedOn',(select started_on from alianza_private.activity_config limit 1),'asOf',today,
 'couples',count(distinct m.couple_id),'accounts',count(*),'activated',count(*) filter(where u.email_confirmed_at is not null),
 'active7',count(*) filter(where a.last_day>=today-6),'active30',count(*) filter(where a.last_day>=today-29),
 'members',coalesce(jsonb_agg(jsonb_build_object('email',u.email,'activated',u.email_confirmed_at is not null,'lastDay',a.last_day,'days7',a.days7,'days30',a.days30) order by u.email),'[]'::jsonb)) into result
 from alianza_private.members m join auth.users u on u.id=m.id
 left join lateral(select max(day) last_day,count(*) filter(where day>=today-6) days7,count(*) filter(where day>=today-29) days30 from alianza_private.activity_days where user_id=m.id) a on true;
 return result;
end $$;
grant create on schema alianza_private to alianza_metrics;
alter function alianza_private.is_admin() owner to alianza_metrics;
alter function alianza_private.record_activity() owner to alianza_metrics;
alter function alianza_private.admin_activity() owner to alianza_metrics;
revoke create on schema alianza_private from alianza_metrics;
revoke all on function alianza_private.is_admin(),alianza_private.record_activity(),alianza_private.admin_activity() from public,anon,authenticated;
grant execute on function alianza_private.is_admin(),alianza_private.record_activity(),alianza_private.admin_activity() to authenticated;
create function public.alianza_is_admin() returns boolean language sql security invoker set search_path='' as $$select alianza_private.is_admin()$$;
create function public.alianza_record_activity() returns void language sql security invoker set search_path='' as $$select alianza_private.record_activity()$$;
create function public.alianza_admin_activity() returns jsonb language sql security invoker set search_path='' as $$select alianza_private.admin_activity()$$;
revoke all on function public.alianza_is_admin(),public.alianza_record_activity(),public.alianza_admin_activity() from public,anon;
grant execute on function public.alianza_is_admin(),public.alianza_record_activity(),public.alianza_admin_activity() to authenticated;
