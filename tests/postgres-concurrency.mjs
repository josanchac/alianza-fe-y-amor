// Integration gate for an EMPTY, disposable localhost PostgreSQL database only.
import {Client} from 'pg';
import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const url=new URL(process.env.ALIANZA_TEST_DATABASE_URL??'postgresql://localhost/invalid');
if(!['127.0.0.1','localhost'].includes(url.hostname)||url.pathname!=='/alianza_ci')throw Error('Use the isolated localhost database alianza_ci. Remote databases are refused.');
const admin=new Client({connectionString:url.href});await admin.connect();
const evidence=[];const pass=name=>{evidence.push(name);console.log('PASS '+name);};
const clients=new Set();
async function clientFor(uid){const c=new Client({connectionString:url.href});await c.connect();clients.add(c);await c.query("set statement_timeout='10s';set lock_timeout='8s';begin;set local role authenticated");await c.query("select set_config('request.jwt.claim.sub',$1,true)",[uid]);return c;}
async function close(c){clients.delete(c);await c.end();}
const id=n=>'10000000-0000-4000-8000-'+String(n).padStart(12,'0');let counter=10;
async function person(){const n=counter++;const uid=id(n),email=`person${n}@example.test`;await admin.query('insert into auth.users values($1,$2,now())',[uid,email]);await admin.query("insert into alianza_private.members(id,name) values($1,'Persona de prueba')",[uid]);await rpc(uid,'data',null);return {uid,email};}
async function rpc(uid,api,payload){const c=await clientFor(uid);try{const v=(await c.query(`select public.alianza_${api}($1::jsonb) v`,[payload===null?null:JSON.stringify(payload)])).rows[0].v;await c.query('commit');return v;}catch(e){await c.query('rollback');throw e;}finally{await close(c);}}
async function start(uid,api,payload){const c=await clientFor(uid);const pid=(await c.query('select pg_backend_pid() pid')).rows[0].pid;const promise=c.query(`select public.alianza_${api}($1::jsonb) v`,[JSON.stringify(payload)]).then(async r=>{await c.query('commit');return {ok:true,value:r.rows[0].v};},async e=>{await c.query('rollback');return {ok:false,code:e.code};}).finally(()=>close(c));return {pid,promise};}
async function blocked(pids){const until=Date.now()+5000;while(Date.now()<until){const r=await admin.query("select count(*)::int n from pg_stat_activity where pid=any($1::int[]) and wait_event_type='Lock'",[pids]);if(r.rows[0].n===pids.length)return;await new Promise(r=>setTimeout(r,20));}throw Error('Expected independent connections waiting on locks');}
async function simultaneous(operations){await admin.query('begin;select pg_advisory_xact_lock(8254,1)');try{const pending=[];for(const op of operations)pending.push(await start(...op));await blocked(pending.map(p=>p.pid));await admin.query('commit');return await Promise.all(pending.map(p=>p.promise));}catch(e){await admin.query('rollback');throw e;}}
async function invitation(sender,recipient){return rpc(sender.uid,'relationship',{action:'create',email:recipient.email,relationshipVersion:1});}
async function couple(){const a=await person(),b=await person();const inv=await invitation(a,b);const state=(await rpc(b.uid,'relationship',{action:'accept',token:inv.token,relationshipVersion:1})).state;return {a,b,cid:state.user.coupleId};}
try{
assert.equal((await admin.query("select current_database() db,to_regnamespace('alianza_private') existing")).rows[0].existing,null,'Refuse a nonempty application database');
await admin.query(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
const files=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
for(const file of files.filter(f=>f<'20260909143538'))await admin.query(await readFile('supabase/migrations/'+file,'utf8'));
await admin.query("insert into auth.users values($1,'original-a@example.test',now()),($2,'original-b@example.test',now());",[id(1),id(2)]);
await admin.query("insert into alianza_private.members values($1,'jose','A',''),($2,'neca','B','')",[id(1),id(2)]);
await rpc(id(1),'data',null);await rpc(id(1),'data',{kind:'purpose',key:'2026-08',data:{text:'Propósito de prueba',review:'Revisión de prueba'},version:0});
const before=(await admin.query('select * from alianza_private.records order by owner,kind,key')).rows;
for(const file of files.filter(f=>f>='20260909143538'))await admin.query(await readFile('supabase/migrations/'+file,'utf8'));
assert.deepEqual((await admin.query('select * from alianza_private.records order by owner,kind,key')).rows,before);
pass('All incremental migrations preserve original personal records on PostgreSQL');
{
 const a=await person(),b=await person(),inv=await invitation(a,b);const results=await simultaneous([[b.uid,'relationship',{action:'accept',token:inv.token,relationshipVersion:1}],[b.uid,'relationship',{action:'accept',token:inv.token,relationshipVersion:1}]]);
 assert.equal(results.filter(x=>x.ok).length,1);assert.equal(results.find(x=>!x.ok).code,'PT409');
 const s=await rpc(a.uid,'data',null);assert(s.user.coupleId);assert.equal((await admin.query('select count(*)::int n from alianza_private.couple_participants where couple_id=$1',[s.user.coupleId])).rows[0].n,2);
 pass('Two simultaneous accepts create one couple and two participants');
}
{
 const a=await person(),b=await person(),c=await person();const x=await invitation(a,c),y=await invitation(b,c);
 const results=await simultaneous([[c.uid,'relationship',{action:'accept',token:x.token,relationshipVersion:1}],[c.uid,'relationship',{action:'accept',token:y.token,relationshipVersion:1}]]);
 assert.equal(results.filter(r=>r.ok).length,1);assert.equal(results.find(r=>!r.ok).code,'PT409');
 const sa=await rpc(a.uid,'data',null),sb=await rpc(b.uid,'data',null);assert.equal([sa,sb].filter(s=>s.user.coupleId).length,1);
 pass('Competing invitations cannot bind one account to two couples');
}
for(const cancelFirst of [false,true]){
 const a=await person(),b=await person(),inv=await invitation(a,b);
 const accept=[b.uid,'relationship',{action:'accept',token:inv.token,relationshipVersion:1}],cancel=[a.uid,'relationship',{action:'cancel',id:inv.state.invitations[0].id,relationshipVersion:1}];
 const results=await simultaneous(cancelFirst?[cancel,accept]:[accept,cancel]);assert.equal(results.filter(r=>r.ok).length,1);
 const state=await rpc(b.uid,'data',null);const status=(await admin.query('select status from alianza_private.pair_invitations where id=$1',[inv.state.invitations[0].id])).rows[0].status;
 assert.equal(status,state.user.coupleId?'accepted':'cancelled');
 assert(results.filter(r=>!r.ok).every(r=>['PT409','22023'].includes(r.code)));
}
pass('Accept versus cancel is consistent in both queue orders');
for(const unlinkFirst of [false,true]){
 const {a,b,cid}=await couple();const state=await rpc(a.uid,'data',null);const profile=state.own.find(r=>r.kind==='profile');const payload={kind:'profile',key:'me',data:{...profile.data,shareSchedule:true,shareNotes:true,shareIdeal:true},version:profile.version,relationshipVersion:2};
 const held=await clientFor(unlinkFirst?b.uid:a.uid);
 try{
  if(unlinkFirst)await held.query('select public.alianza_relationship($1) v',[JSON.stringify({action:'unlink',coupleId:cid,relationshipVersion:2})]);
  else await held.query('select public.alianza_data($1) v',[JSON.stringify(payload)]);
  const waiting=unlinkFirst?await start(a.uid,'data',payload):await start(b.uid,'relationship',{action:'unlink',coupleId:cid,relationshipVersion:2});
  await blocked([waiting.pid]);await held.query('commit');const result=await waiting.promise;
  assert.equal(result.ok,!unlinkFirst);if(unlinkFirst)assert.equal(result.code,'PT409');
 }finally{await held.query('rollback');await close(held);}
 const now=await rpc(a.uid,'data',null),p=now.own.find(r=>r.kind==='profile').data;assert.equal(now.partner,null);assert.equal(p.shareSchedule,false);assert.equal(p.shareNotes,false);assert.equal(p.shareIdeal,false);
}
pass('Save versus unlink cannot restore old sharing permissions in either ordering');
{
 const {a,b,cid}=await couple();const held=await clientFor(a.uid);
 const payload={kind:'rs',key:'rezar:2026-08-01',data:{type:'rezar',periodDate:'2026-08-01',planDate:'',planTime:'',note:'Encuentro concurrente ficticio',done:false,doneDate:''},version:0,relationshipVersion:2};
 try{await held.query('select public.alianza_data($1)',[JSON.stringify(payload)]);const waiting=await start(b.uid,'relationship',{action:'unlink',coupleId:cid,relationshipVersion:2});await blocked([waiting.pid]);await held.query('commit');assert((await waiting.promise).ok);}finally{await close(held);}
 const archive=await rpc(a.uid,'relationship',{action:'archive',id:cid,relationshipVersion:3});assert.equal(archive.records[0].data.note,payload.data.note);
 pass('A shared save already in flight remains in its original archive after unlink');
}
{
 const {a,b,cid}=await couple();await rpc(a.uid,'relationship',{action:'ideal_save',coupleId:cid,text:'Frase de prueba',version:0,relationshipVersion:2});
 const results=await simultaneous([[a.uid,'relationship',{action:'ideal_confirm',coupleId:cid,version:1,relationshipVersion:2}],[b.uid,'relationship',{action:'ideal_save',coupleId:cid,text:'Frase nueva',version:1,relationshipVersion:2}]]);
 assert(results.every(r=>r.ok));const s=await rpc(a.uid,'data',null);assert.equal(s.marriageIdeal.text,'Frase nueva');assert.equal(s.marriageIdeal.confirmations,0);
 pass('Concurrent ideal confirmation and revision do not confirm the new phrase');
}
{
 const {a,b}=await couple();const original=await rpc(a.uid,'data',null),profile=original.own.find(r=>r.kind==='profile');
 await rpc(a.uid,'data',{kind:'profile',key:'me',version:profile.version,relationshipVersion:2,data:{...profile.data,shareSchedule:true,shareNotes:true,shareIdeal:true}});
 await rpc(a.uid,'data',{kind:'habit',key:'period-note',version:0,data:{title:'Compromiso ficticio',moment:'Mañana',active:true,anchor:'',minimum:'',frequency:{period:'week',target:3}}});
 const payload={kind:'habit_review',key:'period-note:2026-08-03:2026-08-09',version:0,data:{habitKey:'period-note',period:'week',start:'2026-08-03',end:'2026-08-09',note:'Nota privada ficticia',assessment:'met',nextStep:'explore'}};
 await rpc(a.uid,'data',payload);
 const held=await clientFor(a.uid);
 try{await held.query('select public.alianza_data($1)',[JSON.stringify({...payload,version:1,data:{...payload.data,note:'Revisión guardada primero'}})]);
  const waiting=await start(a.uid,'data',{...payload,version:1,data:{...payload.data,note:'Borrador desactualizado'}});await blocked([waiting.pid]);await held.query('commit');const result=await waiting.promise;assert.equal(result.ok,false);assert.equal(result.code,'PT409');
 }finally{await close(held);}
 const own=await rpc(a.uid,'data',null),partner=await rpc(b.uid,'data',null);
 assert.equal(own.own.find(r=>r.kind==='habit_review').data.note,'Revisión guardada primero');assert.deepEqual(own.own.filter(r=>r.kind==='checks'),original.own.filter(r=>r.kind==='checks'));
 assert(partner.partner.records.some(r=>r.kind==='habit'));assert(!partner.partner.records.some(r=>r.kind==='habit_review'));
 pass('Concurrent period reviews preserve the first save, remain private despite sharing and never fabricate daily checks');
}
const rls=(await admin.query("select c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='alianza_private' and c.relkind='r'")).rows;assert(rls.every(r=>r.relrowsecurity));
for(const role of ['anon','authenticated','alianza_metrics'])for(const table of ['records','pair_invitations','couple_participants','ideal_confirmations'])assert.equal((await admin.query('select has_table_privilege($1,$2,$3) ok',[role,'alianza_private.'+table,'SELECT,INSERT,UPDATE,DELETE'])).rows[0].ok,false);
assert.equal((await admin.query("select count(*)::int n from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'alianza_%' and p.prosecdef")).rows[0].n,0);
pass('Private tables retain RLS and no content privileges for clients or metrics; public entry points remain invokers');
await mkdir('test-results',{recursive:true});await writeFile('test-results/postgres-evidence.json',JSON.stringify({database:'isolated synthetic PostgreSQL',serverVersion:(await admin.query('show server_version')).rows[0].server_version,checks:evidence},null,2));
}catch(e){console.error('FAIL',e.message,e.code??'');process.exitCode=1;}finally{for(const c of clients){try{await c.query('rollback');await c.end();}catch{}}await admin.end();}
