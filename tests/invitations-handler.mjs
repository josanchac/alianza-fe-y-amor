import assert from 'node:assert/strict';
import {createInvitationHandler} from '../supabase/functions/pilot-invitations/handler.ts';
const actor='00000000-0000-4000-8000-000000000001',invite='00000000-0000-4000-8000-000000000002';
const cfg={supabaseUrl:'https://project.example.test',serviceKey:'synthetic-service-key',appUrl:'https://app.example.test/alianza/',mailReady:true};
let calls=[],allow=true,replay=false,sendFailure=false,finishFailure=false;
async function mock(url,opts){calls.push({url,opts});let body;
 if(url.endsWith('/user'))body={id:actor};
 else if(url.endsWith('alianza_is_admin'))body=allow;
 else if(url.includes('invitation_operator')){const p=JSON.parse(opts.body).p;
 if(p.action==='finish'&&finishFailure)throw Error('timeout');
 body=p.action==='finish'?{result:p.result}:p.action==='cancel'?{result:'cancelled'}:replay?{replay:true,result:'unknown'}:{id:invite,email:'person@example.test',version:1,confirmed:false};}
 else if(url.includes('/invite?')){if(sendFailure)throw Error('ambiguous timeout');body={id:invite};}
 else throw Error('Unexpected request');
 return new Response(JSON.stringify(body),{status:200,headers:{'Content-Type':'application/json'}});
}
const payload={action:'invite',email:'person@example.test',version:0,requestId:actor};
const request=(body=payload,origin='https://app.example.test')=>new Request('https://project.example.test/functions/v1/pilot-invitations',{method:'POST',headers:{Origin:origin,Authorization:'Bearer synthetic-user','Content-Type':'application/json'},body:JSON.stringify(body)});
let handler=createInvitationHandler(cfg,mock);
assert.equal((await handler(request(payload,'https://evil.example.test'))).status,403);assert.equal(calls.length,0);
assert.equal((await handler(new Request('https://example.test',{method:'POST'}))).status,401);
allow=false;assert.equal((await handler(request())).status,403);assert(!calls.some(c=>c.url.includes('/invite?')));
allow=true;calls=[];assert.equal((await createInvitationHandler({...cfg,mailReady:false},mock)(request())).status,503);assert(!calls.some(c=>c.url.includes('invitation_operator')));
calls=[];assert.equal((await handler(request({...payload,actor:invite}))).status,400);
calls=[];let response=await handler(request());assert.deepEqual(await response.json(),{result:'requested'});
const prepare=JSON.parse(calls.find(c=>c.url.includes('invitation_operator')).opts.body).p;
assert.equal(prepare.actor,actor);assert.match(prepare.proofHash,/^[a-f0-9]{64}$/);
const mail=calls.find(c=>c.url.includes('/invite?'));const redirect=new URL(new URL(mail.url).searchParams.get('redirect_to'));assert.equal(redirect.origin,'https://app.example.test');
const hash=new URLSearchParams(redirect.hash.slice(1));assert.equal(hash.get('pilot_invite'),invite);assert.match(hash.get('invite_proof'),/^[a-f0-9]{64}$/);
assert(!JSON.stringify(await (await handler(request({action:'status'}))).json()).includes(cfg.serviceKey));
replay=true;calls=[];response=await handler(request());assert.equal((await response.json()).replay,true);assert(!calls.some(c=>c.url.includes('/invite?')));
replay=false;sendFailure=true;calls=[];assert.equal((await (await handler(request())).json()).result,'unknown');assert.equal(calls.filter(c=>c.url.includes('/invite?')).length,1);
sendFailure=false;finishFailure=true;assert.equal((await (await handler(request())).json()).result,'unknown');
finishFailure=false;calls=[];assert.equal((await (await createInvitationHandler({...cfg,mailReady:false},mock)(request({...payload,action:'cancel'}))).json()).result,'cancelled');assert(!calls.some(c=>c.url.includes('/invite?')));
console.log('PASS invitation handler authentication, fixed destination, disabled-mail gate, safe output, replay and ambiguous-send behavior');
