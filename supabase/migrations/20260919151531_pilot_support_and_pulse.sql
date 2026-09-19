begin;
-- Additive product support. No private journal content is read or copied.
alter function alianza_private.valid_record(text,text,jsonb) rename to valid_record_before_support;
create function alianza_private.valid_record(k text, ky text, d jsonb) returns boolean language sql stable set search_path='' as $$
 select alianza_private.valid_record_before_support(k,ky,case when k in('profile','appearance') and d->>'symbol'='lightning' then jsonb_set(d,'{symbol}','"star"') else d end)
$$;
revoke all on function alianza_private.valid_record(text,text,jsonb),alianza_private.valid_record_before_support(text,text,jsonb) from public,anon,authenticated,alianza_metrics;
alter table alianza_private.members drop constraint if exists members_symbol_check;
alter table alianza_private.members add constraint members_symbol_check check(symbol in ('heart','tree','rosary','cross','flame','anchor','mountain','sun','star','flower','sprout','bird','church','compass','waves','book','lightning'));
create table alianza_private.pilot_support_requests(
 id uuid primary key,user_id uuid not null references auth.users(id),
 message text not null check(length(message) between 2 and 180),
 state text not null default 'pending' check(state in('pending','review','done')),
 version integer not null default 1,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index pilot_support_owner on alianza_private.pilot_support_requests(user_id,created_at);
alter table alianza_private.pilot_support_requests enable row level security;
revoke all on alianza_private.pilot_support_requests from public,anon,authenticated;
create policy support_no_direct_access on alianza_private.pilot_support_requests to anon,authenticated using(false) with check(false);
create function alianza_private.pilot_support(p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); a text:=p->>'action'; rid uuid; r alianza_private.pilot_support_requests; message text:=btrim(p->>'message');
begin
 perform alianza_private.require_pilot_access();
 if not exists(select 1 from alianza_private.account_directory() d where d.id=uid and d.email_confirmed_at is not null) then raise insufficient_privilege;end if;
 if p is null or jsonb_typeof(p)<>'object' or octet_length(p::text)>1500 or p-array['action','id','message','state','version']<>'{}'::jsonb or a is null or a not in('submit','mine','list','update') then raise invalid_parameter_value;end if;
 if a in('list','update') and not alianza_private.is_admin() then raise insufficient_privilege;end if;
 if a in('submit','update') then
  perform pg_advisory_xact_lock_shared(8254,42);
  if(select active from public.alianza_service_status where id) then raise sqlstate 'PT503';end if;
  rid:=(p->>'id')::uuid;if rid is null then raise invalid_parameter_value;end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,820));
  select * into r from alianza_private.pilot_support_requests where id=rid for update;
  if a='submit' then
   if message is null or length(message) not between 2 and 180 then raise invalid_parameter_value;end if;
   if r.id is not null then
    if r.user_id<>uid or r.message<>message then raise sqlstate 'PT409';end if;
   else
    if(select count(*) from alianza_private.pilot_support_requests where user_id=uid and created_at>now()-interval '1 day')>=5 then raise sqlstate 'PT429';end if;
    insert into alianza_private.pilot_support_requests(id,user_id,message) values(rid,uid,message) returning * into r;
   end if;
  else
   if r.id is null or r.version is distinct from (p->>'version')::integer then raise sqlstate 'PT409';end if;
   if p->>'state' is null or p->>'state' not in('pending','review','done') then raise invalid_parameter_value;end if;
   update alianza_private.pilot_support_requests set state=p->>'state',version=version+1,updated_at=now() where id=rid returning * into r;
  end if;
  return jsonb_build_object('id',r.id,'state',r.state,'version',r.version);
 end if;
 return jsonb_build_object('requests',(select coalesce(jsonb_agg(item order by created_at desc),'[]') from(
  select s.created_at,jsonb_build_object('id',s.id,'message',s.message,'state',s.state,'version',s.version,'createdAt',s.created_at,'email',case when a='list' then u.email else null end) item
  from alianza_private.pilot_support_requests s join auth.users u on u.id=s.user_id where a='list' or s.user_id=uid order by s.created_at desc limit 200
 ) x));
end $$;
create function public.alianza_pilot_support(p jsonb) returns jsonb language sql security invoker set search_path='' as $$select alianza_private.pilot_support(p)$$;
revoke all on function alianza_private.pilot_support(jsonb),public.alianza_pilot_support(jsonb) from public,anon;
grant execute on function alianza_private.pilot_support(jsonb),public.alianza_pilot_support(jsonb) to authenticated;

-- Whole weeks, Monday-Sunday, excluding the incomplete current week.
create function alianza_private.pilot_pulse() returns jsonb language plpgsql security definer set search_path='' as $$
declare today date:=(now() at time zone 'America/Costa_Rica')::date; boundary date; result jsonb;
begin
 if not alianza_private.is_admin() then raise insufficient_privilege;end if;
 boundary:=date_trunc('week',today)::date;
 with population as(select c.user_id,c.started_on from alianza_private.pilot_consent c join alianza_private.account_directory() a on a.id=c.user_id where c.enabled and a.email_confirmed_at is not null),
 events as(select d.* from alianza_private.pilot_days d join population c on c.user_id=d.user_id where d.day>=boundary-56 and d.day<boundary),
 weeks as(select boundary-(n*7) as start from generate_series(1,8)n),
 series as(select w.start,count(distinct e.user_id) filter(where e.event='open') as active from weeks w left join events e on e.day between w.start and w.start+6 group by w.start),
 features as(select event,count(distinct user_id) filter(where day>=boundary-7) as current,count(distinct user_id) filter(where day between boundary-14 and boundary-8) as previous from events where event like 'view_%' and day>=boundary-14 group by event)
 select jsonb_build_object('asOf',today,'population',(select count(*) from population),'coverageStart',(select min(started_on) from population),
 'weeks',(select jsonb_agg(jsonb_build_object('start',start,'end',start+6,'active',active) order by start) from series),
 'features',(select coalesce(jsonb_agg(jsonb_build_object('event',event,'current',current,'previous',previous) order by current desc,event),'[]') from features),
 'returning',(select count(distinct a.user_id) from events a where a.event='open' and a.day>=boundary-7 and exists(select 1 from events b where b.user_id=a.user_id and b.event='open' and b.day between boundary-14 and boundary-8)),
 'errors',(select coalesce(sum(amount),0) from events where event in('load_error','save_error') and day>=boundary-7)) into result;
 return result;
end $$;
grant create on schema alianza_private to alianza_metrics;
alter function alianza_private.pilot_pulse() owner to alianza_metrics;
revoke create on schema alianza_private from alianza_metrics;
create function public.alianza_pilot_pulse() returns jsonb language sql security invoker set search_path='' as $$select alianza_private.pilot_pulse()$$;
revoke all on function alianza_private.pilot_pulse(),public.alianza_pilot_pulse() from public,anon;
grant execute on function alianza_private.pilot_pulse(),public.alianza_pilot_pulse() to authenticated;
select alianza_private.install_maintenance_triggers();
commit;
