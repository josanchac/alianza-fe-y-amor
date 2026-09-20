import{readFileSync,writeFileSync}from'node:fs';import assert from'node:assert/strict';import{randomUUID}from'node:crypto';
const [file,phase]=process.argv.slice(2),c=JSON.parse(readFileSync(file)),cfg=JSON.parse(readFileSync(new URL('./config.json',import.meta.url)));
assert.equal(cfg.url,'https://xhfqcrmekfjclgazrvrm.supabase.co');
async function call(path,body,token,method='POST'){
const r=await fetch(cfg.url+path,{method,headers:{apikey:cfg.publishableKey,'Content-Type':'application/json',Origin:'https://alianza-revision-integral.josanchac.chatgpt.site',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});return {status:r.status,v:await r.json()};}
const params=link=>{const u=new URL(link);assert.equal(u.origin,'https://alianza-revision-integral.josanchac.chatgpt.site');assert.equal(u.pathname,'/connected/');return Object.fromEntries(new URLSearchParams(u.hash.slice(1)));};
const edge=p=>call('/functions/v1/pilot-invitations',p,c.users[0].token);
const old=params(c.invitationResult.link);
if(phase==='cancel'){
let r=await edge({action:'cancel',email:c.inviteEmail,version:1,requestId:randomUUID()});assert.equal(r.status,200);
r=await call('/auth/v1/verify',{token_hash:old.token_hash,type:old.type});assert.equal(r.status,200);c.invitedUser={id:r.v.user.id,token:r.v.access_token};
r=await call('/rest/v1/rpc/alianza_invitation_entry',{p:{action:'accept',id:old.pilot_invite,proof:old.invite_proof,metrics:false}},c.invitedUser.token);assert.equal(r.status,403,'cancelled app invitation blocked');
writeFileSync(file,JSON.stringify(c),{mode:0o600});console.log('PASS cancellation blocks entry even when Auth token was still valid');
}else if(phase==='renew'){
let r=await edge({action:'renew',email:c.inviteEmail,version:2,requestId:randomUUID()});assert.equal(r.status,200);assert.equal(r.v.result,'generated',JSON.stringify(r));c.renewed=r.v;writeFileSync(file,JSON.stringify(c),{mode:0o600});
const fresh=params(r.v.link);assert.notEqual(fresh.invite_proof,old.invite_proof);
r=await call('/auth/v1/verify',{token_hash:fresh.token_hash,type:fresh.type});assert.equal(r.status,200);const token=r.v.access_token;
r=await call('/rest/v1/rpc/alianza_invitation_entry',{p:{action:'accept',id:fresh.pilot_invite,proof:old.invite_proof,metrics:false}},token);assert.equal(r.status,403,'old proof revoked');
r=await call('/rest/v1/rpc/alianza_invitation_entry',{p:{action:'accept',id:fresh.pilot_invite,proof:fresh.invite_proof,metrics:false}},token);assert.equal(r.status,200);assert.equal(r.v.state,'accepted');
r=await call('/auth/v1/user',{password:c.password},token,'PUT');assert.equal(r.status,200,'set password');
r=await call('/auth/v1/token?grant_type=password',{email:c.inviteEmail,password:c.password});assert.equal(r.status,200,'return login');
r=await call('/rest/v1/rpc/alianza_data',{payload:null},r.v.access_token);assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.v.user.coupleId,null,'individual entry');
r=await call('/auth/v1/verify',{token_hash:fresh.token_hash,type:fresh.type});assert.notEqual(r.status,200,'token single use');
writeFileSync(file,JSON.stringify(c),{mode:0o600});console.log('PASS renewal, old proof rejection, activation, password creation, return login, individual entry and single-use token');
}else if(phase==='finish'){
let r=await call('/auth/v1/token?grant_type=password',{email:c.inviteEmail,password:c.password});assert.equal(r.status,200,'return login');
r=await call('/rest/v1/rpc/alianza_data',{payload:null},r.v.access_token);assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.v.user.coupleId,null);
r=await call('/auth/v1/verify',{token_hash:old.token_hash,type:old.type});assert.notEqual(r.status,200,'used token rejected');
console.log('PASS accepted invite return login, individual data and used token rejection');
}else throw Error('phase required');
