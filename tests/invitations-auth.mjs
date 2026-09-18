// Actual GoTrue JWTs and PostgREST requests; synthetic disposable localhost only.
import {Client} from 'pg';
import {createInvitationHandler} from '../supabase/functions/pilot-invitations/handler.ts';
import {createClient} from '@supabase/supabase-js';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const config=JSON.parse(await readFile(process.env.ALIANZA_AUTH_STATUS_FILE,'utf8'));
const api=new URL(config.API_URL),db=new URL(config.DB_URL);
if(api.hostname!=='127.0.0.1'||api.port!=='54321'||db.hostname!=='127.0.0.1'||db.port!=='54322'||db.pathname!=='/postgres')throw Error('Refuse anything except disposable localhost Supabase');
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const make=()=>createClient(api.href,config.ANON_KEY,options);
const operator=createClient(api.href,config.SERVICE_ROLE_KEY,options),sql=new Client({connectionString:db.href});
const checks=[];const pass=name=>{checks.push(name);console.log('PASS '+name);};
const password='Synthetic-only-password!4';
async function person(label,{confirmed=true,enrolled=true}={}){
 const email=`${label}@example.test`,result=await operator.auth.admin.createUser({email,password,email_confirm:confirmed});assert(!result.error,'Synthetic account creation');const id=result.data.user.id;
 if(enrolled)await sql.query("insert into alianza_private.members(id,name) values($1,'Persona ficticia')",[id]);
 const client=make(),login=await client.auth.signInWithPassword({email,password});
 if(confirmed)assert(!login.error,'Confirmed synthetic login: '+(login.error?.code??'')+' HTTP '+(login.error?.status??''));else assert(login.error,'Unconfirmed account must not sign in');
 return {id,email,client,login};
}
async function rpc(client,endpoint,payload=null){const {data,error}=await client.rpc(`alianza_${endpoint}`,{payload});if(error)throw Object.assign(Error('RPC '+endpoint+' failed: '+error.code),{code:error.code});return data;}
try{
 await sql.connect();assert.equal((await sql.query("select to_regnamespace('alianza_private') existing")).rows[0].existing,null,'Refuse existing app schema');
 const migrations=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
 for(const file of migrations.filter(f=>f<'20260909143538'))await sql.query(await readFile('supabase/migrations/'+file,'utf8'));
 // The historical migration deliberately requires the two original pilot seats.
 // Reproduce those seats with synthetic Auth users, never production identities.
 for(const [label,role] of [['legacy-a','jose'],['legacy-b','neca']]){
  const r=await operator.auth.admin.createUser({email:label+'@example.test',password,email_confirm:true});assert(!r.error);
  await sql.query('insert into alianza_private.members values($1,$2,$3,$4)',[r.data.user.id,role,'Persona ficticia','']);
 }
 for(const file of migrations.filter(f=>f>='20260909143538'))await sql.query(await readFile('supabase/migrations/'+file,'utf8'));
 await sql.query("notify pgrst, 'reload schema'");
 // Wait for asynchronous schema cache notification, not an arbitrary success delay.
 for(let attempt=0;attempt<50;attempt++){const r=await make().rpc('alianza_data',{payload:null});if(r.error?.code!=='PGRST202')break;if(attempt===49)throw Error('Schema cache did not refresh');await new Promise(r=>setTimeout(r,100));}

 const admin=await person('invitation-admin');
 await sql.query('insert into alianza_private.admin_members(user_id) values($1)',[admin.id]);
 const session=admin.login.data.session;
 let nativeRequests=0;
 const handler=createInvitationHandler({supabaseUrl:api.origin,serviceKey:config.SERVICE_ROLE_KEY,appUrl:'https://app.example.test/'},async(url,opts)=>{
  assert(!/\/auth\/v1\/(invite|recover)(\?|$)/.test(url),'Never send email');
  if(url.endsWith('/admin/generate_link'))nativeRequests++;
  return fetch(url,opts);
 });
 const invoke=async(body,bearer=session.access_token)=>{
  const r=await handler(new Request('https://edge.example.test/',{method:'POST',headers:{Origin:'https://app.example.test',Authorization:'Bearer '+bearer,'Content-Type':'application/json'},body:JSON.stringify(body)}));
  return {status:r.status,body:await r.json()};
 };
 const operation=(action,email,version=0)=>({action,email,version,requestId:crypto.randomUUID()});
 const issued=async(action,email,version=0)=>{const r=await invoke(operation(action,email,version));assert.equal(r.status,200);assert.equal(r.body.result,'generated','Native link generation');return new URLSearchParams(new URL(r.body.link).hash.slice(1));};
 const verify=async(hash)=>{const client=make();const r=await client.auth.verifyOtp({token_hash:hash.get('token_hash'),type:hash.get('type')});assert(!r.error,'Real token verification: '+r.error?.code);return client;};
 const accept=(client,hash)=>client.rpc('alianza_invitation_entry',{p:{action:'accept',id:hash.get('pilot_invite'),proof:hash.get('invite_proof'),metrics:false}});
 const cooldown=email=>sql.query("update alianza_private.pilot_invitations set updated_at=now()-interval '2 minutes' where email=$1",[email]);
 assert.equal((await invoke({action:'status'},'invalid')).status,401);
 const nonadmin=await person('not-admin');assert.equal((await invoke({action:'status'},nonadmin.login.data.session.access_token)).status,403);
 assert.equal(nativeRequests,0);
 const email='new-invite@example.test',first=await issued('invite',email);
 const personClient=await verify(first);
 assert((await personClient.rpc('alianza_data',{payload:null})).error,'Pending user cannot enter data');
 assert(!(await personClient.auth.updateUser({password})).error);
 assert(!(await accept(personClient,first)).error);
 assert.equal((await rpc(personClient,'data')).user.coupleId,null);
 assert((await make().auth.verifyOtp({token_hash:first.get('token_hash'),type:'invite'})).error,'Native token single use');
 assert.equal((await invoke(operation('renew',email,1))).status,409,'No administrative recovery for accepted accounts');
 pass('Real handler, Auth and PostgREST create a one-use invitation without SMTP and activate an individual account');
 const legacy=await person('prior-unconfirmed',{confirmed:false});
 const before=(await sql.query('select row_to_json(m) v from alianza_private.members m where id=$1',[legacy.id])).rows[0].v;
 const old=await issued('invite',legacy.email);
 await cooldown(legacy.email);
 const renewed=await issued('renew',legacy.email,1);
 const renewedClient=await verify(renewed);
 assert((await accept(renewedClient,old)).error,'Old proof denied after renewal');
 assert.equal((await invoke(operation('cancel',legacy.email,2))).body.result,'cancelled');
 assert((await accept(renewedClient,renewed)).error,'Cancelled proof denied with valid JWT');
 assert((await renewedClient.rpc('alianza_data',{payload:null})).error,'Cancelled user has no app access');
 await cooldown(legacy.email);
 const final=await issued('renew',legacy.email,3);assert.equal(final.get('type'),'recovery');
 const finalClient=await verify(final);assert(!(await finalClient.auth.updateUser({password:'Another-synthetic-password!5'})).error);
 assert(!(await accept(finalClient,final)).error);
 assert.deepEqual((await sql.query('select row_to_json(m) v from alianza_private.members m where id=$1',[legacy.id])).rows[0].v,before);
 pass('Existing unconfirmed Auth identity survives renewal, cancellation and confirmed-but-incomplete recovery; old proofs cannot activate');
 const expiring=await issued('invite','expired@example.test'),expiredClient=await verify(expiring);
 await sql.query("update alianza_private.pilot_invitations set expires_at=now()-interval '1 minute' where email='expired@example.test'");
 assert((await accept(expiredClient,expiring)).error);
 const replay=operation('invite','replay@example.test');assert.equal((await invoke(replay)).body.result,'generated');const count=nativeRequests;
 const repeated=await invoke(replay);assert.equal(repeated.body.replay,true);assert.equal(repeated.body.link,undefined);assert.equal(nativeRequests,count);
 pass('Real API rejects expired activation and does not generate or expose another link on request replay');
 await mkdir('test-results',{recursive:true});await writeFile('test-results/invitations-auth-evidence.json',JSON.stringify({environment:'disposable localhost Auth and PostgREST',checks},null,2));
}catch(e){console.error('FAIL',e.message);process.exitCode=1;}finally{await sql.end();}
