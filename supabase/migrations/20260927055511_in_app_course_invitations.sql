begin;
create table alianza_private.course_invitations(
 id uuid primary key default gen_random_uuid(),group_id uuid not null references alianza_private.groups(id) on delete cascade,
 sender uuid not null references alianza_private.members(id),recipient uuid not null references alianza_private.members(id),
 status text not null default 'pending' check(status in ('pending','declined','accepted')),
 created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '7 days',
 version integer not null default 1,check(sender<>recipient)
);
create index course_invitation_recipient on alianza_private.course_invitations(recipient,expires_at);
alter table alianza_private.course_invitations enable row level security;
revoke all on alianza_private.course_invitations from public,anon,authenticated,alianza_metrics;
alter function alianza_private.community(jsonb) rename to community_before_session3;
create function alianza_private.community(payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); m alianza_private.members; a text:=coalesce(payload->>'action','snapshot'); recipient_id uuid; g uuid; invitation alianza_private.course_invitations; result jsonb; prefs jsonb; rosary alianza_private.rosaries;
begin
 perform alianza_private.require_pilot_access();select * into m from alianza_private.members where id=u for share;
 if m.id is null then raise insufficient_privilege;end if;
 if a in ('course_invite','course_accept','course_decline','course_restore') then
  if (payload->>'dataEpoch')::int is distinct from m.data_epoch or (payload->>'relationshipVersion')::int is distinct from m.relationship_version then raise exception using errcode='PT409',message='Actualizá tu espacio antes de continuar';end if;
  if a='course_invite' then
   g:=(payload->>'groupId')::uuid;
   if not coalesce(alianza_private.can_group(g,u,'invites'),false) then raise insufficient_privilege;end if;
   if (select count(*) from alianza_private.course_invitations where sender=u and created_at>now()-interval '1 day')>=20 then raise exception using errcode='22023',message='Llegaste al límite de invitaciones por hoy';end if;
   select au.id into recipient_id from auth.users au join alianza_private.members mm on mm.id=au.id where lower(btrim(au.email))=lower(btrim(payload->>'email')) and au.email_confirmed_at is not null and alianza_private.pilot_access_allowed(au.id);
   if recipient_id is null or recipient_id=u then raise exception using errcode='22023',message='No se pudo crear la invitación. Revisá el correo de la cuenta del piloto';end if;
   if exists(select 1 from alianza_private.group_members where group_id=g and user_id=recipient_id) then raise exception using errcode='22023',message='Esta persona ya pertenece al curso';end if;
   perform pg_advisory_xact_lock(hashtext(g::text),hashtext(recipient_id::text));
   if not exists(select 1 from alianza_private.course_invitations where group_id=g and course_invitations.recipient=recipient_id and status in ('pending','declined') and expires_at>now()) then
    insert into alianza_private.course_invitations(group_id,sender,recipient) values(g,u,recipient_id);
   end if;
  else
   select * into invitation from alianza_private.course_invitations where id=(payload->>'id')::uuid and course_invitations.recipient=u for update;
   if invitation.id is null then raise insufficient_privilege;end if;
   if invitation.expires_at<=now() or not coalesce(alianza_private.can_group(invitation.group_id,invitation.sender,'invites'),false) then raise exception using errcode='22023',message='Esta invitación ya no está vigente';end if;
   if invitation.version is distinct from (payload->>'version')::int or invitation.status='accepted' then raise exception using errcode='PT409',message='La invitación cambió. Actualizá tu espacio';end if;
   if a='course_accept' then
    if invitation.status<>'pending' then raise invalid_parameter_value;end if;
    if (select count(*) from alianza_private.group_members where group_id=invitation.group_id)>=200 then raise invalid_parameter_value;end if;
    insert into alianza_private.group_members(group_id,user_id,name) values(invitation.group_id,u,coalesce(nullif(m.name,''),'Integrante')) on conflict do nothing;
   elsif a='course_restore' and invitation.status<>'declined' then raise invalid_parameter_value;
   elsif a='course_decline' and invitation.status<>'pending' then raise invalid_parameter_value;
   end if;
   update alianza_private.course_invitations set status=case a when 'course_accept' then 'accepted' when 'course_decline' then 'declined' else 'pending' end,version=version+1 where id=invitation.id;
  end if;
  result:=alianza_private.community_before_session3(jsonb_build_object('action','snapshot'));
 else result:=alianza_private.community_before_session3(payload);end if;
 if a='invite_revoke' then update alianza_private.course_invitations set expires_at=now(),version=version+1 where group_id=(payload->>'groupId')::uuid and status in ('pending','declined') and expires_at>now();end if;
 if a='rosary_create' and payload->>'scope'='personal' then
  select data into prefs from alianza_private.records where owner=u::text and kind='rosary_preferences' and key='me';
  select * into rosary from alianza_private.rosaries where id=(payload->>'id')::uuid and owner_id=u;
  if prefs is not null and rosary.progress_version=0 and rosary.personal_step=0 then
   result:=alianza_private.community_before_session3(jsonb_build_object('action','rosary_opening','id',rosary.id,'version',0,'dataEpoch',m.data_epoch,'relationshipVersion',m.relationship_version)||prefs);
  end if;
 end if;
 return result||jsonb_build_object('invitations',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'groupId',i.group_id,'name',g.name,'senderName',s.name,'status',i.status,'version',i.version,'expiresAt',i.expires_at) order by i.created_at desc) from alianza_private.course_invitations i join alianza_private.groups g on g.id=i.group_id join alianza_private.members s on s.id=i.sender where i.recipient=u and i.status in ('pending','declined') and i.expires_at>now() and alianza_private.can_group(i.group_id,i.sender,'invites')),'[]'::jsonb));
end $$;
revoke all on function alianza_private.community_before_session3(jsonb),alianza_private.community(jsonb) from public,anon,authenticated;
grant execute on function alianza_private.community(jsonb) to authenticated;
select alianza_private.install_maintenance_triggers();
commit;
