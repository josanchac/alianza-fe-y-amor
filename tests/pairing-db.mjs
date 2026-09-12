import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();
try{
await db.exec(`create role anon;create role authenticated;create schema auth;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
const files=(await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')).sort();
for(const f of files.filter(x=>x<'20260909143538'))await db.exec(await readFile('supabase/migrations/'+f,'utf8'));
const id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');const [a,b,c,d,e,f,outsider]=[1,2,3,4,5,6,7].map(id);
for(let n=1;n<=7;n++)await db.query('insert into auth.users values($1,$2,now())',[id(n),`person${n}@example.test`]);
await db.query("insert into alianza_private.members values($1,'jose','A','Original A'),($2,'neca','B','Original B')",[a,b]);
for(const fn of files.filter(x=>x>='20260909143538'&&x<'20260912132546'))await db.exec(await readFile('supabase/migrations/'+fn,'utf8'));
async function as(user,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user??'']);await db.exec('set role '+role);}
async function data(payload=null){return(await db.query('select public.alianza_data($1::jsonb) v',[payload&&JSON.stringify(payload)])).rows[0].v;}
async function pair(payload){return(await db.query('select public.alianza_relationship($1::jsonb) v',[JSON.stringify(payload)])).rows[0].v;}
const save=(kind,key,value,version=0,relationshipVersion)=>data({kind,key,data:value,version,...(relationshipVersion?{relationshipVersion}:{})});
const rs={type:'rezar',periodDate:'2026-08-01',planDate:'',planTime:'',note:'Original shared note',done:false,doneDate:''};
await as(a);await data();await save('rs','rezar:2026-08-01',rs);
await save('purpose','2026-08',{text:'Personal purpose',review:'Private review'});
await as(b);await data();
await db.exec('reset role');const original=(await db.query('select * from alianza_private.records order by owner,kind,key')).rows;
// A legacy singleton must retain its existing shared records in its own archive.
const singleton=(await db.query('insert into alianza_private.couples default values returning id')).rows[0].id;
await db.query("insert into alianza_private.members(id,name,couple_id,seat) values($1,'C',$2,1)",[c,singleton]);
await db.query("insert into alianza_private.records(owner,kind,key,data) values($1,'rs','rezar:2026-08-01',$2)",['couple:'+singleton,JSON.stringify({...rs,note:'Singleton history'})]);
await db.exec(await readFile('supabase/migrations/'+files.find(x=>x.endsWith('_bilateral_pairing.sql')),'utf8'));
for(const x of [d,e,f])await db.query("insert into alianza_private.members(id,name) values($1,'Individual')",[x]);
for(const row of original){assert.deepEqual((await db.query('select * from alianza_private.records where owner=$1 and kind=$2 and key=$3',[row.owner,row.kind,row.key])).rows[0],row);}
await as(c);let cs=await data();assert.equal(cs.user.coupleId,null);assert.equal(cs.user.relationshipVersion,2);assert.equal(cs.archives[0].id,singleton);assert.equal(cs.own.find(r=>r.kind==='profile').data.ideal,'');
assert.equal((await pair({action:'archive',id:singleton,relationshipVersion:2})).records[0].data.note,'Singleton history');
await as(a);let old=await data();assert(old.user.coupleId);assert.equal(old.shared[0].data.note,rs.note);assert.equal(old.partner.ideal,'');
console.log('PASS Upgrade preserves original records and established couples; singleton history is archived and new accounts start individual');
await as(d);let ds=await data();const epoch=ds.user.relationshipVersion;
await assert.rejects(()=>save('rs','rezar:2026-08-01',rs),x=>x.code==='42501');
const invitation=await pair({action:'create',email:' PERSON3@example.test ',relationshipVersion:epoch});assert.equal(invitation.token.length,64);assert.equal(invitation.state.user.coupleId,null);
const token=invitation.token;
await db.exec('reset role');const stored=(await db.query('select token_hash from alianza_private.pair_invitations')).rows[0].token_hash;assert.notEqual(stored,token);
await as(e);await data();await assert.rejects(()=>pair({action:'preview',token,relationshipVersion:1}),x=>x.code==='22023');
await as(c);const preview=await pair({action:'preview',token,relationshipVersion:2});assert.equal(preview.invitation.email,'person4@example.test');assert.equal((await data()).user.coupleId,null);
cs=(await pair({action:'accept',token,relationshipVersion:2})).state;const couple=cs.user.coupleId;assert(couple);assert.equal(cs.user.relationshipVersion,3);assert.equal(cs.shared.length,0);assert.equal(cs.archives[0].id,singleton);assert.equal(cs.marriageIdeal.text,'');
await assert.rejects(()=>pair({action:'accept',token,relationshipVersion:3}),x=>x.code==='22023');
await as(d);ds=await data();assert.equal(ds.user.coupleId,couple);assert.equal(ds.partner.shareSchedule,false);assert.equal(ds.partner.shareNotes,false);assert.equal(ds.partner.ideal,'');
await assert.rejects(()=>save('rs','rezar:2026-08-01',rs),x=>x.code==='PT409'); // old client from before link
await save('rs','rezar:2026-08-01',{...rs,note:'New couple only'},0,ds.user.relationshipVersion);
console.log('PASS Invitation preview makes no link; only the verified recipient accepts once, with sharing off and old clients blocked after transition');
let profile=ds.own.find(r=>r.kind==='profile');
await save('profile','me',{...profile.data,ideal:'My private ideal',shareIdeal:true,shareNotes:true},profile.version,ds.user.relationshipVersion);
await as(c);cs=await data();assert.equal(cs.partner.ideal,'My private ideal');
cs=(await pair({action:'ideal_save',text:'Our freely written phrase',version:0,coupleId:couple,relationshipVersion:3})).state;
assert.equal(cs.marriageIdeal.confirmations,0);
cs=(await pair({action:'ideal_confirm',version:1,coupleId:couple,relationshipVersion:3})).state;assert.equal(cs.marriageIdeal.confirmations,1);
await pair({action:'ideal_confirm',version:1,coupleId:couple,relationshipVersion:3});assert.equal((await data()).marriageIdeal.confirmations,1);
await as(d);ds=(await pair({action:'ideal_confirm',version:1,coupleId:couple,relationshipVersion:2})).state;assert.equal(ds.marriageIdeal.confirmations,2);
ds=(await pair({action:'ideal_save',text:'Revised phrase',version:1,coupleId:couple,relationshipVersion:2})).state;assert.equal(ds.marriageIdeal.confirmations,0);
await as(c);await assert.rejects(()=>pair({action:'ideal_confirm',version:1,coupleId:couple,relationshipVersion:3}),x=>x.code==='PT409');
console.log('PASS Ideal remains optional; both confirm the same revision and editing invalidates previous confirmations');
cs=(await pair({action:'unlink',coupleId:couple,relationshipVersion:3})).state;assert.equal(cs.user.coupleId,null);assert.equal(cs.partner,null);assert.equal(cs.shared.length,0);assert.equal(cs.archives.length,2);
await as(d);ds=await data();assert.equal(ds.partner,null);assert.equal(ds.own.find(r=>r.kind==='profile').data.ideal,'My private ideal');assert.equal(ds.own.find(r=>r.kind==='profile').data.shareIdeal,false);
await assert.rejects(()=>save('profile','me',{...profile.data,shareNotes:true},profile.version,2),x=>x.code==='PT409');
const archived=await pair({action:'archive',id:couple,relationshipVersion:3});assert.equal(archived.records[0].data.note,'New couple only');assert.equal(archived.ideal.text,'Revised phrase');
const invite2=await pair({action:'create',email:'person5@example.test',relationshipVersion:3});
await as(e);let es=(await pair({action:'accept',token:invite2.token,relationshipVersion:1})).state;assert.notEqual(es.user.coupleId,couple);assert.equal(es.shared.length,0);assert.equal(es.partner.ideal,'');assert.equal(es.archives.length,0);
await assert.rejects(()=>pair({action:'archive',id:couple,relationshipVersion:2}),x=>x.code==='42501');
await as(d);await assert.rejects(()=>save('rs','rezar:2026-08-01',{...rs,note:'Stale'},1,2),x=>x.code==='PT409');
console.log('PASS Unlink revokes personal sharing, preserves original archives and prevents stale writes or transfer to a new partner');
await as(f);await data();let x=await pair({action:'create',email:'absent@example.test',relationshipVersion:1});assert(x.token);assert.equal(x.state.invitations[0].email,'absent@example.test');
await pair({action:'cancel',id:x.state.invitations[0].id,relationshipVersion:1});assert.equal((await data()).invitations.length,0);
x=await pair({action:'create',email:'person3@example.test',relationshipVersion:1});await as(c);await pair({action:'reject',token:x.token,relationshipVersion:4});await assert.rejects(()=>pair({action:'accept',token:x.token,relationshipVersion:4}),err=>err.code==='22023');
await as(f);x=await pair({action:'create',email:'person3@example.test',relationshipVersion:1});
await db.exec('reset role');await db.query("update alianza_private.pair_invitations set expires_at=now()-interval '1 second' where sender_id=$1",[f]);
await as(c);await assert.rejects(()=>pair({action:'accept',token:x.token,relationshipVersion:4}),err=>err.code==='22023');
await as(outsider);await assert.rejects(()=>pair({action:'create',email:'x@example.test',relationshipVersion:1}),err=>err.code==='42501');
await as(null,'anon');await assert.rejects(()=>pair({action:'create',email:'x@example.test',relationshipVersion:1}),err=>err.code==='42501');
await db.exec('reset role;set role alianza_metrics');for(const table of ['pair_invitations','couple_participants','ideal_confirmations','records'])await assert.rejects(()=>db.query('select * from alianza_private.'+table),err=>err.code==='42501');
console.log('PASS Cancellation, rejection, expiration, nonmember denial, nonenumerating creation and metrics isolation');
await db.exec('reset role');
const acl=(await db.query("select has_function_privilege('anon','public.alianza_relationship(jsonb)','execute') a,has_function_privilege('authenticated','alianza_private.ideal_view(uuid,uuid)','execute') b")).rows[0];assert.deepEqual(acl,{a:false,b:false});
}catch(error){console.error(error.message,error.code,error.where);process.exitCode=1;}finally{await db.close();}
