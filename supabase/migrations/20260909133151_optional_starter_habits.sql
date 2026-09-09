begin;
create or replace function alianza_private.data(payload jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); member alianza_private.members; spouse alianza_private.members;
 p jsonb; own_rows jsonb; shared_rows jsonb; partner_rows jsonb; partner jsonb:=null;
 k text; ky text; d jsonb; v integer; who text; result alianza_private.records;
begin
 if uid is null then raise insufficient_privilege; end if;
 select * into member from alianza_private.members where id=uid;
 if not found then raise insufficient_privilege; end if;
 -- Membership is checked against the database every request, never user-editable metadata.
 if not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then raise insufficient_privilege; end if;
 if payload is not null then
  if jsonb_typeof(payload)<>'object' or not(payload ?& array['kind','key','data','version']) or payload-array['kind','key','data','version']<>'{}'::jsonb
    or jsonb_typeof(payload->'kind')<>'string' or jsonb_typeof(payload->'key')<>'string'
    or jsonb_typeof(payload->'version')<>'number' or payload->>'version'!~'^\d{1,9}$'
    then raise invalid_parameter_value; end if;
  k:=payload->>'kind'; ky:=payload->>'key'; d:=payload->'data';v:=(payload->>'version')::integer;
  if not alianza_private.valid_record(k,ky,d) then raise invalid_parameter_value; end if;
  who:=case when k='rs' then 'couple' else uid::text end;
  if v=0 then
   insert into alianza_private.records(owner,kind,key,data) values(who,k,ky,d) on conflict do nothing returning * into result;
  else
   update alianza_private.records set data=d,version=version+1,updated=now() where owner=who and kind=k and key=ky and version=v returning * into result;
  end if;
  if result.owner is null then raise exception using errcode='PT409',message='Registro modificado en otro dispositivo'; end if;
  return jsonb_build_object('record',to_jsonb(result));
 end if;
 -- Initialize identity only. Commitments are created only by an explicit user choice.
 if not exists(select 1 from alianza_private.records where owner=uid::text and kind='profile' and key='me') then
  insert into alianza_private.records(owner,kind,key,data) values(uid::text,'profile','me',jsonb_build_object('name',member.name,'ideal',member.ideal,'shareSchedule',false,'shareNotes',false)) on conflict do nothing;
 end if;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.updated desc),'[]'::jsonb) into own_rows from alianza_private.records r where owner=uid::text;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.updated desc),'[]'::jsonb) into shared_rows from alianza_private.records r where owner='couple';
 select * into spouse from alianza_private.members where id<>uid;
 if found then
  select data into p from alianza_private.records where owner=spouse.id::text and kind='profile' and key='me';
  select coalesce(jsonb_agg(to_jsonb(r) order by r.updated desc),'[]'::jsonb) into partner_rows from alianza_private.records r where owner=spouse.id::text and (
   ((p->>'shareSchedule')::boolean and kind in ('habit','checks')) or ((p->>'shareNotes')::boolean and kind in ('journal','purpose','review')));
  partner:=jsonb_build_object('name',coalesce(p->>'name',spouse.name),'ideal',coalesce(p->>'ideal',spouse.ideal),'shareSchedule',coalesce((p->>'shareSchedule')::boolean,false),'shareNotes',coalesce((p->>'shareNotes')::boolean,false),'records',partner_rows);
 end if;
 return jsonb_build_object('user',jsonb_build_object('id',uid,'role',member.role,'email',(select email from auth.users where id=uid)),'own',own_rows,'shared',shared_rows,'partner',partner,'today',to_char(now() at time zone 'America/Costa_Rica','YYYY-MM-DD'));
end $$;
-- Remove only unused, unchanged examples from the old first-login seed.
-- A modified example or any reference in a daily check is preserved.
with defaults as (
 select m.id::text as owner, 'starter-'||(x.ordinality-1)::text as key, x.value as data
 from alianza_private.members m cross join lateral jsonb_array_elements(jsonb_build_array(
   jsonb_build_object('title','Ofrecer mi día a la Mater','moment','Mañana','anchor','Después de despertarme','minimum','Una frase de ofrecimiento','active',true),
   jsonb_build_object('title',case when m.role='jose' then 'Liderar con un gesto concreto de amor' else 'Vivir un gesto concreto de fe y confianza' end,'moment','Durante el día','anchor','Al comenzar mi actividad principal','minimum','Un gesto pequeño y consciente','active',true),
   jsonb_build_object('title','Cuidar mi descanso y mi cuerpo','moment','Durante el día','anchor','Después de almorzar','minimum','Dos minutos de pausa','active',true),
   jsonb_build_object('title','Agradecer y revisar mi propósito particular','moment','Noche','anchor','Antes de acostarme','minimum','Agradecer una cosa y mirar mi propósito','active',true)
 )) with ordinality x
)
delete from alianza_private.records r using defaults d
where r.owner=d.owner and r.kind='habit' and r.key=d.key and r.version=1 and r.data=d.data
and not exists(select 1 from alianza_private.records c where c.owner=r.owner and c.kind='checks' and c.data ? r.key);
commit;
