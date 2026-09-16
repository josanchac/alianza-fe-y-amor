begin;
create table alianza_private.pilot_consent(user_id uuid primary key references auth.users(id) on delete cascade,enabled boolean not null default false,started_on date not null);
create table alianza_private.pilot_days(user_id uuid references auth.users(id) on delete cascade,day date not null,event text not null check(event in ('open','load_ok','load_error','save_ok','save_error','slow_load','view_day','view_week','view_month','view_review','view_history','view_prayer','view_groups','view_personal','view_couple')),amount integer not null check(amount between 1 and 10000),primary key(user_id,day,event));
create index pilot_days_day on alianza_private.pilot_days(day);
alter table alianza_private.pilot_consent enable row level security;
alter table alianza_private.pilot_days enable row level security;
revoke all on alianza_private.pilot_consent,alianza_private.pilot_days from public,anon,authenticated;
grant select,insert,update,delete on alianza_private.pilot_consent,alianza_private.pilot_days to alianza_metrics;
create policy pilot_consent_access on alianza_private.pilot_consent to alianza_metrics using(true) with check(true);
create policy pilot_days_access on alianza_private.pilot_days to alianza_metrics using(true) with check(true);
create function alianza_private.pilot_metrics(payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=alianza_private.metrics_uid();a text:=coalesce(payload->>'action','status');today date:=(now() at time zone 'America/Costa_Rica')::date;e text:=payload->>'event';
begin
 if u is null or not exists(select 1 from alianza_private.account_directory() where id=u and email_confirmed_at is not null) then raise insufficient_privilege;end if;
 if payload is null or jsonb_typeof(payload)<>'object' or payload-array['action','enabled','event']<>'{}'::jsonb then raise invalid_parameter_value;end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,816));
 if a='consent' then
  if jsonb_typeof(payload->'enabled') is distinct from 'boolean' then raise invalid_parameter_value;end if;
  insert into alianza_private.pilot_consent values(u,(payload->>'enabled')::boolean,today) on conflict(user_id) do update set enabled=excluded.enabled,started_on=case when pilot_consent.enabled then pilot_consent.started_on else today end;
  if not (payload->>'enabled')::boolean then delete from alianza_private.pilot_days where user_id=u;end if;
 elsif a='event' then
  if e is null or e not in ('open','load_ok','load_error','save_ok','save_error','slow_load','view_day','view_week','view_month','view_review','view_history','view_prayer','view_groups','view_personal','view_couple') then raise invalid_parameter_value;end if;
  if exists(select 1 from alianza_private.pilot_consent where user_id=u and enabled) then
   insert into alianza_private.pilot_days values(u,today,e,1) on conflict(user_id,day,event) do update set amount=least(pilot_days.amount+1,10000) where excluded.event not like 'view_%' and excluded.event<>'open';
  end if;
 elsif a<>'status' then raise invalid_parameter_value;end if;
 delete from alianza_private.pilot_days where day<today-89;
 return jsonb_build_object('enabled',coalesce((select enabled from alianza_private.pilot_consent where user_id=u),false));
end $$;
create function alianza_private.admin_pilot() returns jsonb language plpgsql security definer set search_path='' as $$
declare today date:=(now() at time zone 'America/Costa_Rica')::date;result jsonb;
begin
 if not alianza_private.is_admin() then raise insufficient_privilege;end if;
 select jsonb_build_object('asOf',today,'consenting',(select count(*) from alianza_private.pilot_consent where enabled),'active7',count(distinct d.user_id) filter(where d.event='open' and d.day>=today-6),'active30',count(distinct d.user_id) filter(where d.event='open'),'totals30',(select coalesce(jsonb_object_agg(event,jsonb_build_object('count',amount,'people',people)),'{}'::jsonb) from (select p.event,sum(p.amount) amount,count(distinct p.user_id) people from alianza_private.pilot_days p join alianza_private.pilot_consent c on c.user_id=p.user_id and c.enabled where p.day between today-29 and today group by p.event) t)) into result from alianza_private.pilot_days d join alianza_private.pilot_consent c on c.user_id=d.user_id and c.enabled where d.day between today-29 and today;
 return result;
end $$;
grant create on schema alianza_private to alianza_metrics;
alter function alianza_private.pilot_metrics(jsonb) owner to alianza_metrics;
alter function alianza_private.admin_pilot() owner to alianza_metrics;
revoke create on schema alianza_private from alianza_metrics;
create function public.alianza_pilot_metrics(payload jsonb default '{}'::jsonb) returns jsonb language sql security invoker set search_path='' as $$select alianza_private.pilot_metrics(payload)$$;
create function public.alianza_admin_pilot() returns jsonb language sql security invoker set search_path='' as $$select alianza_private.admin_pilot()$$;
revoke all on function alianza_private.pilot_metrics(jsonb),alianza_private.admin_pilot(),public.alianza_pilot_metrics(jsonb),public.alianza_admin_pilot() from public,anon;
grant execute on function alianza_private.pilot_metrics(jsonb),alianza_private.admin_pilot(),public.alianza_pilot_metrics(jsonb),public.alianza_admin_pilot() to authenticated;
select alianza_private.install_maintenance_triggers();
commit;
