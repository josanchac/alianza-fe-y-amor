// Run with a protected fixture file created through the temporary Auth admin helper.
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const fixturePath=process.argv[2];
if(!fixturePath)throw Error('Fixture file required');
const c=JSON.parse(readFileSync(fixturePath));
const cfg=JSON.parse(readFileSync(new URL('./config.json',import.meta.url)));
assert.equal(cfg.url,'https://xhfqcrmekfjclgazrvrm.supabase.co');
const origin='https://alianza-revision-integral.josanchac.chatgpt.site';
async function call(path,body,token,extra={}){
 const r=await fetch(cfg.url+path,{method:'POST',headers:{apikey:cfg.publishableKey,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...extra},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
 const v=await r.json();return {status:r.status,v};
}
for(const user of c.users){const r=await call('/auth/v1/token?grant_type=password',{email:user.email,password:c.password});assert.equal(r.status,200,'Auth password login');user.token=r.v.access_token;}
writeFileSync(fixturePath,JSON.stringify(c),{mode:0o600});
const edge=(body,token,from=origin)=>call('/functions/v1/pilot-invitations',body,token,{Origin:from});
assert.equal((await edge({action:'status'})).status,401,'anonymous blocked');
assert.equal((await edge({action:'status'},c.users[1].token)).status,403,'member blocked');
assert.equal((await edge({action:'status'},c.users[0].token,'https://example.test')).status,403,'foreign origin blocked');
let r=await edge({action:'status'},c.users[0].token);assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.v.manualLinks,true);
const request={action:'invite',email:c.inviteEmail,label:'Invitación sintética',version:0,requestId:randomUUID()};
r=await edge(request,c.users[0].token);assert.equal(r.status,200,JSON.stringify(r));
c.invitationResult=r.v;writeFileSync(fixturePath,JSON.stringify(c),{mode:0o600});
console.log('PASS real Auth login, endpoint permissions and origin checks; invitation result keys:',Object.keys(r.v).join(','));
