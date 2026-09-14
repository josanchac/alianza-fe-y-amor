begin;
create table alianza_private.product_consent(user_id uuid primary key references auth.users(id) on delete cascade,enabled boolean not null default false,started_on date not null default current_date);
create table alianza_private.product_days(user_id uuid references auth.users(id) on delete cascade,day date not null,event text not null check(event in ('open','load_ok','load_error','save_ok','save_error','slow_load','useful_yes','useful_no')),amount integer not null default 1 check(amount between 1 and 10000),primary key(user_id,day,event));
create index product_days_day on alianza_private.product_days(day);
alter table alianza_private.product_consent enable row level security;
alter table alianza_private.product_days enable row level security;
revoke all on alianza_private.product_consent,alianza_private.product_days from public,anon,authenticated;
grant select,insert,update,delete on alianza_private.product_consent,alianza_private.product_days to alianza_metrics;
create policy metrics_consent on alianza_private.product_consent to alianza_metrics using(true) with check(true);
create policy metrics_product on alianza_private.product_days to alianza_metrics using(true) with check(true);
create function alianza_private.product_metrics(payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=alianza_private.metrics_uid();a text:=coalesce(payload->>'action','status');today date:=(now() at time zone 'America/Costa_Rica')::date;enabled_v boolean;
begin
 if u is null or not exists(select 1 from alianza_private.account_directory() where id=u and email_confirmed_at is not null) then raise insufficient_privilege;end if;
 if payload is null or jsonb_typeof(payload)<>'object' or payload-array['action','enabled','event']<>'{}'::jsonb then raise invalid_parameter_value;end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,815));
 if a='consent' then
  if jsonb_typeof(payload->'enabled')<>'boolean' or not(payload?'enabled') then raise invalid_parameter_value;end if;
  insert into alianza_private.product_consent(user_id,enabled,started_on) values(u,(payload->>'enabled')::boolean,today)
  on conflict(user_id) do update set enabled=excluded.enabled,started_on=case when product_consent.enabled then product_consent.started_on else today end;
  if not (payload->>'enabled')::boolean then delete from alianza_private.product_days where user_id=u;end if;
 elsif a='event' then
  if payload->>'event' is null or payload->>'event' not in ('open','load_ok','load_error','save_ok','save_error','slow_load','useful_yes','useful_no') then raise invalid_parameter_value;end if;
  if exists(select 1 from alianza_private.product_consent where user_id=u and enabled) then
   if payload->>'event' in ('useful_yes','useful_no') then delete from alianza_private.product_days where user_id=u and day=today and event in ('useful_yes','useful_no') and event<>payload->>'event';end if;
   insert into alianza_private.product_days values(u,today,payload->>'event',1)
   on conflict(user_id,day,event) do update set amount=least(product_days.amount+1,10000) where excluded.event not in ('open','useful_yes','useful_no');
  end if;
 elsif a<>'status' then raise invalid_parameter_value;end if;
 delete from alianza_private.product_days where day<today-89;
 return jsonb_build_object('enabled',coalesce((select enabled from alianza_private.product_consent where user_id=u),false));
end $$;
grant create on schema alianza_private to alianza_metrics;
alter function alianza_private.product_metrics(jsonb) owner to alianza_metrics;
revoke create on schema alianza_private from alianza_metrics;
create function public.alianza_product_metrics(payload jsonb default '{}'::jsonb) returns jsonb language sql security invoker set search_path='' as $$select alianza_private.product_metrics(payload)$$;
revoke all on function alianza_private.product_metrics(jsonb),public.alianza_product_metrics(jsonb) from public,anon;
grant execute on function alianza_private.product_metrics(jsonb),public.alianza_product_metrics(jsonb) to authenticated;
-- Stop the former mandatory account-level activity collection. Preserve historical
-- rows privately for compatibility; never expose or reuse them in this dashboard.
create or replace function alianza_private.record_activity() returns void language plpgsql security definer set search_path='' as $$begin
 if alianza_private.metrics_uid() is null then raise insufficient_privilege;end if;
end $$;
create or replace function alianza_private.admin_activity() returns jsonb language plpgsql security definer set search_path='' as $$
declare today date:=(now() at time zone 'America/Costa_Rica')::date;n int;totals jsonb;cohorts jsonb;
begin
 if not alianza_private.is_admin() then raise insufficient_privilege;end if;
 select count(*) into n from alianza_private.product_consent where enabled;
 if n<5 then return jsonb_build_object('asOf',today,'suppressed',true,'minimum',5,'windowDays',90);end if;
 select coalesce(jsonb_object_agg(event,jsonb_build_object('count',amount,'people',people)),'{}') into totals from (
  select d.event,sum(d.amount) amount,count(distinct d.user_id) people from alianza_private.product_days d join alianza_private.product_consent c on c.user_id=d.user_id and c.enabled where d.day>=today-29 group by d.event having count(distinct d.user_id)>=5
 ) e;
 with base as(select c.user_id,c.started_on,date_trunc('month',c.started_on)::date cohort from alianza_private.product_consent c where c.enabled and c.started_on<=today-28 and c.started_on>=today-89), results as(
 select cohort,count(*) size,count(*) filter(where exists(select 1 from alianza_private.product_days d where d.user_id=b.user_id and d.event='open' and d.day between b.started_on+21 and b.started_on+27)) retained from base b group by cohort
 ) select coalesce(jsonb_agg(jsonb_build_object('month',cohort,'size',size,'returnedWeek4',retained)),'[]') into cohorts from results where size>=5 and retained>=5 and size-retained>=5;
 return jsonb_build_object('asOf',today,'suppressed',false,'minimum',5,'windowDays',90,'consenting',n,'totals30',totals,'cohorts',cohorts);
end $$;
commit;
