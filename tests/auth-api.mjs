// Actual GoTrue JWTs and PostgREST requests; synthetic disposable localhost only.
import {Client} from 'pg';
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
 await assert.rejects(()=>rpc(make(),'data'));
 assert((await make().auth.signUp({email:'public-signup@example.test',password})).error,'Public signup stays disabled');
 const a=await person('owner'),b=await person('partner'),c=await person('outsider');
 await person('unconfirmed',{confirmed:false});const outsider=await person('unenrolled',{enrolled:false});
 assert((await make().auth.signInWithPassword({email:a.email,password:'wrong-password'})).error);
 await assert.rejects(()=>rpc(outsider.client,'data'),e=>e.code==='42501');
 pass('Real Auth accepts confirmed credentials and blocks wrong credentials, unconfirmed login, anonymous and unenrolled API access');
 const initial=await rpc(a.client,'data');assert.equal(initial.user.id,a.id);assert.equal(initial.user.coupleId,null);
 const habit={kind:'habit',key:'exercise',version:0,data:{title:'Compromiso ficticio',moment:'Mañana',active:true,anchor:'',minimum:'',frequency:{period:'week',target:3}}};
 await rpc(a.client,'data',habit);await assert.rejects(()=>rpc(a.client,'data',habit),e=>e.code==='PT409');
 assert(!(await rpc(b.client,'data')).own.some(r=>r.key==='exercise'));
 await assert.rejects(()=>rpc(b.client,'data',{...habit,owner:a.id}),e=>e.code==='22023');
 assert((await a.client.from('records').select('*')).error,'Private tables are not exposed');
 pass('PostgREST isolates personal records, rejects owner injection and rejects stale writes');
 const inv=await rpc(a.client,'relationship',{action:'create',email:b.email,relationshipVersion:1});
 assert.equal((await rpc(a.client,'data')).user.coupleId,null);
 await assert.rejects(()=>rpc(c.client,'relationship',{action:'accept',token:inv.token,relationshipVersion:1}));
 await rpc(b.client,'relationship',{action:'accept',token:inv.token,relationshipVersion:1});
 const linked=await rpc(a.client,'data');assert(linked.user.coupleId);
 assert(!(await rpc(b.client,'data')).partner.records.some(r=>r.key==='exercise'));
 const profile=linked.own.find(r=>r.kind==='profile');
 const share={kind:'profile',key:'me',version:profile.version,relationshipVersion:2,data:{...profile.data,shareSchedule:true,shareNotes:true,shareIdeal:true}};
 await rpc(a.client,'data',share);
 await rpc(a.client,'data',{kind:'habit_review',key:'exercise:2020-08-03:2020-08-09',version:0,data:{habitKey:'exercise',period:'week',start:'2020-08-03',end:'2020-08-09',note:'Nota privada ficticia',assessment:'met',nextStep:'explore'}});
 const shared=await rpc(b.client,'data');assert(shared.partner.records.some(r=>r.key==='exercise'));assert(!shared.partner.records.some(r=>r.kind==='habit_review'));
 await rpc(a.client,'data',{...share,version:profile.version+1,data:{...share.data,shareSchedule:false,shareNotes:false,shareIdeal:false}});
 assert(!(await rpc(b.client,'data')).partner.records.some(r=>r.key==='exercise'));
 pass('Bilateral linking verifies recipient; sharing is opt-in, period notes stay private, and revocation applies to existing JWTs');
 const update=await outsider.client.auth.updateUser({data:{role:'admin',is_admin:true}});assert(!update.error);
 await assert.rejects(()=>rpc(outsider.client,'data'),e=>e.code==='42501');
 const adminClaim=await outsider.client.rpc('alianza_is_admin');assert(!adminClaim.error);assert.equal(adminClaim.data,false);
 assert((await outsider.client.rpc('alianza_admin_activity')).error);
 pass('Editable Auth metadata cannot enroll a user or grant application or admin access');
 // Existing JWT must be unable to reinsert an old draft after an operator reset.
 await sql.query('select alianza_private.reset_personal_records($1,$2,1)',[a.id,a.email]);
 await assert.rejects(()=>rpc(a.client,'data',habit),e=>e.code==='PT409');
 assert.equal((await rpc(a.client,'data')).user.dataEpoch,2);
 await rpc(a.client,'data',{...habit,dataEpoch:2});
 pass('A still-valid Auth session cannot save a pre-reset draft; a refreshed space can start again');
 const refreshed=await a.client.auth.refreshSession();assert(!refreshed.error);assert.equal((await rpc(a.client,'data')).user.id,a.id);
 const refreshToken=refreshed.data.session.refresh_token;assert(!(await a.client.auth.signOut({scope:'global'})).error);
 assert((await make().auth.refreshSession({refresh_token:refreshToken})).error,'Signed-out refresh token rejected');
 await assert.rejects(()=>rpc(a.client,'data'));
 // A previously issued JWT can remain valid until expiry. Membership revocation
 // must therefore be enforced by the database, independently of logout.
 await sql.query('delete from alianza_private.members where id=$1',[c.id]);
 await assert.rejects(()=>rpc(c.client,'data'),e=>e.code==='42501');
 pass('Refresh and sign-out work; membership removal blocks a previously issued JWT immediately');
 await mkdir('test-results',{recursive:true});await writeFile('test-results/auth-api-evidence.json',JSON.stringify({environment:'disposable localhost Auth and PostgREST',cli:'2.117.0',checks},null,2));
}catch(e){console.error('FAIL',e.message);process.exitCode=1;}finally{await sql.end();}
