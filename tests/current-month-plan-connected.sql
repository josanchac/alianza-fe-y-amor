-- Execute only in the isolated alianza-pruebas project. Synthetic rows roll back.
begin;
set local statement_timeout='20s';
do $$
declare u uuid:=gen_random_uuid(); other_user uuid:=gen_random_uuid();
begin
 insert into auth.users(id,email,email_confirmed_at) values(u,u::text||'@example.test',now()),(other_user,other_user::text||'@example.test',now());
 insert into alianza_private.members(id,name) values(u,'Prueba sintética mensual'),(other_user,'Prueba sintética aislamiento');
 perform set_config('test.month.owner',u::text,true);
 perform set_config('test.month.other',other_user::text,true);
 perform set_config('request.jwt.claim.sub',u::text,true);
end $$;
set local role authenticated;
do $$
declare initial jsonb; saved jsonb; reopened jsonb; p jsonb; blocked boolean:=false; day text;
begin
 initial:=public.alianza_data(null);day:=initial->>'today';
 perform public.alianza_data(jsonb_build_object('kind','journal','key',day,'version',0,'dataEpoch',1,'data',jsonb_build_object('gratitude','Dato sintético','offering','','meditation','')));
 p:=jsonb_build_object('action','save_current_month','month',left(day,7),'effectiveDate',day,'dataEpoch',1,'relationshipVersion',(initial->'user'->>'relationshipVersion')::int,'version',0,'purposeVersion',0,'purpose','Propósito sintético','items',jsonb_build_array(jsonb_build_object('key','synthetic-walk','version',0,'keep',true,'data',jsonb_build_object('title','Compromiso sintético','moment','Mañana','active',true,'anchor','','minimum','','frequency',jsonb_build_object('period','week','target',3,'unit','times')))));
 saved:=public.alianza_relationship(p)->'state';
 if not exists(select 1 from jsonb_array_elements(saved->'own') r where r->>'kind'='habit' and r->>'key'='synthetic-walk') then raise exception 'Missing saved habit';end if;
 reopened:=public.alianza_data(null);
 if reopened->'own' is distinct from saved->'own' then raise exception 'Reopened records differ';end if;
 if not exists(select 1 from jsonb_array_elements(reopened->'own') r where r->>'kind'='journal' and r->'data'->>'gratitude'='Dato sintético') then raise exception 'Journal not preserved';end if;
 begin perform public.alianza_relationship(p);exception when sqlstate 'PT409' then blocked:=true;end;
 if not blocked then raise exception 'Duplicate version accepted';end if;
 if public.alianza_data(null)->'own' is distinct from saved->'own' then raise exception 'Conflict modified records';end if;
 perform set_config('request.jwt.claim.sub',current_setting('test.month.other'),true);
 if exists(select 1 from jsonb_array_elements(public.alianza_data(null)->'own') r where r->>'key'='synthetic-walk') then raise exception 'Owner isolation failed';end if;
end $$;
reset role;
select 'PASS: connected monthly save, reopen, preservation, stale version and owner isolation; synthetic changes rolled back' as verification;
rollback;
