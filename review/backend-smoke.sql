-- Synthetic database authorization checks. Run only in review/backend.json project.
-- Transaction rolls back every fixture; this does not test browser/Auth HTTP flows.
begin;
select set_config('qa.admin',gen_random_uuid()::text,true),set_config('qa.member',gen_random_uuid()::text,true),set_config('qa.request',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at) values(current_setting('qa.admin')::uuid,'qa-admin@example.test',now()),(current_setting('qa.member')::uuid,'qa-member@example.test',now());
insert into alianza_private.members(id,name) values(current_setting('qa.admin')::uuid,'Synthetic Admin'),(current_setting('qa.member')::uuid,'Synthetic Member');
insert into alianza_private.admin_members(user_id) values(current_setting('qa.admin')::uuid);
select set_config('request.jwt.claim.sub',current_setting('qa.member'),true);
set local role authenticated;
do $$ declare r jsonb; begin
 r:=public.alianza_pilot_support(jsonb_build_object('action','submit','id',current_setting('qa.request'),'message','Solicitud sintética de símbolo de rayo'));
 assert r->>'state'='pending','support submission';
 begin perform public.alianza_pilot_support('{"action":"list"}'); raise exception 'Unauthorized listing allowed'; exception when insufficient_privilege then null; end;
 begin perform public.alianza_invitation_list(); raise exception 'Unauthorized invitations allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('qa.admin'),true);
set local role authenticated;
do $$ declare r jsonb; begin
 r:=public.alianza_pilot_support('{"action":"list"}');
 assert jsonb_array_length(r->'requests')=1,'admin sees request';
 perform public.alianza_pilot_support(jsonb_build_object('action','update','id',current_setting('qa.request'),'state','review','version',1));
 r:=public.alianza_relationship('{"action":"create_request","email":"qa-member@example.test","relationshipVersion":1,"dataEpoch":1}');
 perform set_config('qa.pair',r#>>'{state,invitations,0,id}',true);
 assert current_setting('qa.pair') is not null,'pair request';
end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('qa.member'),true);
set local role authenticated;
do $$ declare r jsonb; begin
 r:=public.alianza_pilot_support('{"action":"mine"}');
 assert r#>>'{requests,0,state}'='review','member sees request update';
 r:=public.alianza_data(null);
 assert r#>>'{user,coupleId}' is null,'no pairing before acceptance';
 r:=public.alianza_relationship(jsonb_build_object('action','accept_request','id',current_setting('qa.pair'),'relationshipVersion',1,'dataEpoch',1));
 assert r#>>'{state,user,coupleId}' is not null,'pair accepted';
 r:=public.alianza_data(null);
 assert jsonb_array_length(r#>'{partner,records}')=0,'partner privacy defaults';
end $$;
reset role;
set local role service_role;
do $$ declare r jsonb; p jsonb; begin
 p:=jsonb_build_object('actor',current_setting('qa.admin'),'action','invite','email','qa-new@example.test','version',0,'requestId',gen_random_uuid(),'proofHash',repeat('a',64));
 r:=public.alianza_invitation_operator(p);
 assert r->>'id' is not null,'invitation created';
 assert r->>'email'='qa-new@example.test','normalized recipient';
 r:=public.alianza_invitation_operator(p);
 assert (r->>'replay')::boolean,'idempotent invitation';
 perform public.alianza_invitation_operator(jsonb_build_object('actor',current_setting('qa.admin'),'action','cancel','email','qa-new@example.test','version',1,'requestId',gen_random_uuid(),'proofHash',repeat('a',64)));
end $$;
reset role;
rollback;
select 'PASS: request visibility, admin boundaries, bilateral pairing, default privacy, invitation creation/replay/cancellation; fixtures rolled back' as result;
