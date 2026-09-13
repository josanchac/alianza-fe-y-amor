-- Operator-only, recoverable reset of ONE person's records. No Auth deletion.
begin;
alter table alianza_private.members add column data_epoch integer not null default 1 check(data_epoch>0);
create table alianza_private.personal_reset_backups (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete restrict,
 created_at timestamptz not null default now(),
 epoch integer not null,
 records jsonb not null,
 restored_at timestamptz
);
alter table alianza_private.personal_reset_backups enable row level security;
revoke all on alianza_private.personal_reset_backups from public,anon,authenticated,alianza_metrics;

alter function alianza_private.data(jsonb) rename to data_before_reset;
revoke all on function alianza_private.data_before_reset(jsonb) from public,anon,authenticated;
create function alianza_private.data(payload jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare epoch integer; result jsonb;
begin
 select data_epoch into epoch from alianza_private.members where id=auth.uid() for share;
 if epoch is null then raise insufficient_privilege; end if;
 if payload is not null then
  if payload ? 'dataEpoch' and (jsonb_typeof(payload->'dataEpoch')<>'number' or payload->>'dataEpoch'!~'^[1-9][0-9]{0,8}$') then raise invalid_parameter_value; end if;
  if coalesce((payload->>'dataEpoch')::integer,1)<>epoch then raise exception using errcode='PT409',message='Tu espacio se reinició. Recargá la aplicación antes de guardar.'; end if;
 end if;
 result:=alianza_private.data_before_reset(payload-'dataEpoch');
 if payload is null then result:=jsonb_set(result,'{user,dataEpoch}',to_jsonb(epoch)); end if;
 return result;
end $$;
revoke all on function alianza_private.data(jsonb) from public,anon;
grant execute on function alianza_private.data(jsonb) to authenticated;

alter function alianza_private.relationship(jsonb) rename to relationship_before_reset;
revoke all on function alianza_private.relationship_before_reset(jsonb) from public,anon,authenticated;
create function alianza_private.relationship(payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare epoch integer;
begin
 -- Same lock order as relationship transitions and the operator reset.
 perform pg_advisory_xact_lock(8254,1);
 select data_epoch into epoch from alianza_private.members where id=auth.uid() for share;
 if epoch is null then raise insufficient_privilege; end if;
 if payload ? 'dataEpoch' and (jsonb_typeof(payload->'dataEpoch')<>'number' or payload->>'dataEpoch'!~'^[1-9][0-9]{0,8}$') then raise invalid_parameter_value; end if;
 if coalesce((payload->>'dataEpoch')::integer,1)<>epoch then raise exception using errcode='PT409',message='Tu espacio se reinició. Recargá la aplicación antes de continuar.'; end if;
 return alianza_private.relationship_before_reset(payload-'dataEpoch');
end $$;
revoke all on function alianza_private.relationship(jsonb) from public,anon;
grant execute on function alianza_private.relationship(jsonb) to authenticated;

-- No public RPC, client grants or metrics grants. Caller must already have
-- operator table privileges. UUID + confirmed email + expected epoch guard scope.
-- Restore also backs up the current state, so post-reset work is recoverable.
create function alianza_private.reset_personal_records(target uuid, expected_email text, expected_epoch integer, restore_backup uuid default null) returns uuid
language plpgsql security invoker set search_path='' as $$
declare m alianza_private.members; backup_id uuid; snapshot jsonb; old_backup alianza_private.personal_reset_backups; saved alianza_private.records;
begin
 perform pg_advisory_xact_lock(8254,1);
 select * into m from alianza_private.members where id=target for update;
 if m.id is null or not exists(select 1 from auth.users where id=target and email_confirmed_at is not null and lower(email)=lower(expected_email)) then raise insufficient_privilege; end if;
 if expected_epoch is null or m.data_epoch<>expected_epoch then raise exception using errcode='PT409',message='Account changed; verify metadata again'; end if;
 if restore_backup is not null then
  select * into old_backup from alianza_private.personal_reset_backups where id=restore_backup and user_id=target and restored_at is null for update;
  if old_backup.id is null then raise invalid_parameter_value; end if;
 end if;
 select coalesce(jsonb_agg(to_jsonb(r) order by kind,key),'[]'::jsonb) into snapshot from alianza_private.records r where owner=target::text;
 insert into alianza_private.personal_reset_backups(user_id,epoch,records) values(target,m.data_epoch,snapshot) returning id into backup_id;
 delete from alianza_private.records where owner=target::text;
 if restore_backup is not null then
  -- Separate statements: inserting a habit can create its plan in a trigger.
  for saved in select * from jsonb_populate_recordset(null::alianza_private.records,old_backup.records) order by kind,key loop
   insert into alianza_private.records(owner,kind,key,data,version,updated)
   values(saved.owner,saved.kind,saved.key,case when saved.kind='profile' then saved.data||'{"shareSchedule":false,"shareNotes":false,"shareIdeal":false}'::jsonb else saved.data end,saved.version,saved.updated)
   on conflict(owner,kind,key) do update set data=excluded.data,version=excluded.version,updated=excluded.updated;
  end loop;
  update alianza_private.personal_reset_backups set restored_at=now() where id=restore_backup;
 end if;
 update alianza_private.members set data_epoch=data_epoch+1 where id=target;
 return backup_id;
end $$;
revoke all on function alianza_private.reset_personal_records(uuid,text,integer,uuid) from public,anon,authenticated,alianza_metrics;
commit;
