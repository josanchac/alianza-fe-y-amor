-- Narrow bridge for the managed auth schema; metrics role never receives content access.
create function alianza_private.metrics_uid() returns uuid language sql stable security definer set search_path='' as $$select auth.uid()$$;
create function alianza_private.account_directory() returns table(id uuid,email text,email_confirmed_at timestamptz) language sql stable security definer set search_path='' as $$select u.id,u.email::text,u.email_confirmed_at from auth.users u join alianza_private.members m on m.id=u.id$$;
revoke all on function alianza_private.metrics_uid(),alianza_private.account_directory() from public,anon,authenticated;
grant execute on function alianza_private.metrics_uid(),alianza_private.account_directory() to alianza_metrics;
drop policy alianza_metrics_accounts on auth.users;
revoke select(id,email,email_confirmed_at) on auth.users from alianza_metrics;
alter policy metrics_days_write on alianza_private.activity_days with check(user_id=(select alianza_private.metrics_uid()) and day=(now() at time zone 'America/Costa_Rica')::date);
create or replace function alianza_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select alianza_private.metrics_uid() is not null and exists(select 1 from alianza_private.admin_members a join alianza_private.members m on m.id=a.user_id join alianza_private.account_directory() u on u.id=m.id where a.user_id=alianza_private.metrics_uid() and u.email_confirmed_at is not null);
$$;
create or replace function alianza_private.record_activity() returns void language plpgsql security definer set search_path='' as $$
begin
 if alianza_private.metrics_uid() is null or not exists(select 1 from alianza_private.members m join alianza_private.account_directory() u on u.id=m.id where m.id=alianza_private.metrics_uid() and u.email_confirmed_at is not null) then raise insufficient_privilege; end if;
 insert into alianza_private.activity_days(user_id,day) values(alianza_private.metrics_uid(),(now() at time zone 'America/Costa_Rica')::date) on conflict do nothing;
end $$;
create or replace function alianza_private.admin_activity() returns jsonb language plpgsql security definer set search_path='' as $$
declare today date:=(now() at time zone 'America/Costa_Rica')::date; result jsonb;
begin
 if not alianza_private.is_admin() then raise insufficient_privilege; end if;
 select jsonb_build_object('startedOn',(select started_on from alianza_private.activity_config limit 1),'asOf',today,
 'couples',count(distinct m.couple_id),'accounts',count(*),'activated',count(*) filter(where u.email_confirmed_at is not null),
 'active7',count(*) filter(where a.last_day>=today-6),'active30',count(*) filter(where a.last_day>=today-29),
 'members',coalesce(jsonb_agg(jsonb_build_object('email',u.email,'activated',u.email_confirmed_at is not null,'lastDay',a.last_day,'days7',a.days7,'days30',a.days30) order by u.email),'[]'::jsonb)) into result
 from alianza_private.members m join alianza_private.account_directory() u on u.id=m.id
 left join lateral(select max(day) last_day,count(*) filter(where day>=today-6) days7,count(*) filter(where day>=today-29) days30 from alianza_private.activity_days where user_id=m.id) a on true;
 return result;
end $$;
