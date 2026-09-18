begin;
-- Retain the existing access, rate-limit and idempotency checks. Never store raw links.
alter function alianza_private.invitation_operator(jsonb) rename to invitation_operator_before_manual;
revoke all on function alianza_private.invitation_operator_before_manual(jsonb) from public,anon,authenticated;
create function alianza_private.invitation_operator(p jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb; current_link boolean;
begin
 result:=alianza_private.invitation_operator_before_manual(p);
 if p->>'action'='finish' then
  select i.state='pending' and i.version=o.version and i.expires_at>now()
  into current_link from alianza_private.pilot_invitation_operations o
  join alianza_private.pilot_invitations i on i.id=o.invitation_id
  where o.id=(p->>'requestId')::uuid for update of i;
  result:=result||jsonb_build_object('current',coalesce(current_link,false));
 end if;
 return result;
end $$;
revoke all on function alianza_private.invitation_operator(jsonb) from public,anon,authenticated;
do $$begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on function alianza_private.invitation_operator_before_manual(jsonb) from service_role;
 grant execute on function alianza_private.invitation_operator(jsonb) to service_role;
end if;end $$;
create or replace function public.alianza_invitation_operator(p jsonb) returns jsonb
language sql security invoker set search_path='' as $$select alianza_private.invitation_operator(p)$$;
commit;
