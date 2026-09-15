import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();
try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 const files=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
 for(const f of files.filter(f=>f<'20260909143538'))await db.exec(await readFile('supabase/migrations/'+f,'utf8'));
 await db.exec(`insert into auth.users values('00000000-0000-4000-8000-000000000090','legacy-a@example.test',now()),('00000000-0000-4000-8000-000000000091','legacy-b@example.test',now());insert into alianza_private.members values('00000000-0000-4000-8000-000000000090','jose','A','Legacy A'),('00000000-0000-4000-8000-000000000091','neca','B','Legacy B');`);
 for(const f of files.filter(f=>f>='20260909143538'))await db.exec(await readFile('supabase/migrations/'+f,'utf8'));
 const id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
 for(let n=1;n<=4;n++){await db.query('insert into auth.users values($1,$2,now())',[id(n),`p${n}@example.test`]);await db.query("insert into alianza_private.members(id,name) values($1,$2)",[id(n),`Person ${n}`]);}
 async function as(n){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(n)]);await db.exec('set role authenticated');}
 async function data(){return(await db.query('select public.alianza_data(null) v')).rows[0].v;}
 async function pair(p){return(await db.query('select public.alianza_relationship($1::jsonb) v',[JSON.stringify({relationshipVersion:1,dataEpoch:1,...p})])).rows[0].v;}
 await as(1);assert.deepEqual((await data()).pairingIdentity,{enabled:false,name:'',version:0});
 assert.deepEqual(await pair({action:'lookup_recipient',email:'p2@example.test'}),await pair({action:'lookup_recipient',email:'unknown@example.test'}));
 await assert.rejects(()=>pair({action:'lookup_recipient',email:'p2'}),e=>e.code==='22023');
 await as(2);await pair({action:'pairing_visibility',name:'Nombre elegido',enabled:true,version:0});
 await assert.rejects(()=>pair({action:'pairing_visibility',name:'Stale',enabled:false,version:0}),e=>e.code==='PT409');
 await as(1);assert.deepEqual((await pair({action:'lookup_recipient',email:' P2@EXAMPLE.TEST '})).candidate,{name:'Nombre elegido',email:'p2@example.test'});
 await assert.rejects(()=>pair({action:'lookup_recipient',email:'p2@example.test',userId:id(2)}),e=>e.code==='22023');
 const sent=await pair({action:'create_request',email:'p2@example.test'});assert.equal(sent.token,undefined);const request=sent.state.invitations[0];
 assert.equal((await pair({action:'create_request',email:'p2@example.test'})).state.invitations[0].id,request.id);
 await assert.rejects(()=>pair({action:'create_request',email:'p3@example.test'}),e=>e.code==='PT409');
 await as(3);assert.equal((await data()).receivedInvitations.length,0);await assert.rejects(()=>pair({action:'accept_request',id:request.id}),e=>e.code==='PT409');
 await as(2);let snapshot=await data();assert.equal(snapshot.user.coupleId,null);assert.equal(snapshot.receivedInvitations[0].id,request.id);assert(!snapshot.own.some(r=>r.kind==='spaces'));
 assert.equal((await pair({action:'preview_request',id:request.id})).invitation.email,'p1@example.test');
 await db.exec('reset role');await db.query("insert into alianza_private.records(owner,kind,key,data) values($1,'spaces','experience','{\"enabled\":[\"group\"],\"start\":\"group\"}')",[id(2)]);
 await as(2);snapshot=(await pair({action:'accept_request',id:request.id})).state;assert(snapshot.user.coupleId);assert.equal(snapshot.receivedInvitations.length,0);assert.deepEqual(snapshot.own.find(r=>r.kind==='spaces').data,{enabled:['group','couple'],start:'group'});
 const profile=snapshot.own.find(r=>r.kind==='profile').data;assert.equal(profile.shareSchedule,false);assert.equal(profile.shareNotes,false);assert.equal(profile.shareIdeal,false);
 await assert.rejects(()=>pair({action:'accept_request',id:request.id}),e=>e.code==='PT409');
 await as(1);assert.equal((await data()).user.coupleId,snapshot.user.coupleId);assert.equal((await data()).invitations.length,0);
 console.log('PASS exact-email opt-in recognition, default privacy, identity-bound consent, stable pending request, wrong-recipient rejection, independent spaces and single acceptance');
 await as(3);const other=(await pair({action:'create_request',email:'p4@example.test'})).state.invitations[0];await as(4);await pair({action:'reject_request',id:other.id});assert.equal((await data()).receivedInvitations.length,0);
 await as(3);const again=(await pair({action:'create_request',email:'p4@example.test'})).state.invitations[0];await pair({action:'cancel',id:again.id});await as(4);await assert.rejects(()=>pair({action:'accept_request',id:again.id}),e=>e.code==='PT409');
 await as(3);const expired=(await pair({action:'create_request',email:'p4@example.test'})).state.invitations[0];await db.exec('reset role');await db.query("update alianza_private.pair_invitations set expires_at=now()-interval '1 second' where id=$1",[expired.id]);await as(4);assert.equal((await data()).receivedInvitations.length,0);await assert.rejects(()=>pair({action:'accept_request',id:expired.id}),e=>e.code==='PT409');
 for(let n=0;n<20;n++)assert.equal((await pair({action:'lookup_recipient',email:'unknown@example.test'})).candidate,null);
 await assert.rejects(()=>pair({action:'lookup_recipient',email:'unknown@example.test'}),e=>e.code==='PT429');
 await assert.rejects(()=>db.query('select * from alianza_private.pairing_visibility'),e=>e.code==='42501');await assert.rejects(()=>db.query('select * from alianza_private.pairing_lookup_limits'),e=>e.code==='42501');
 await assert.rejects(()=>pair({action:'create_request',email:'p3@example.test',dataEpoch:2}),e=>e.code==='PT409');
 console.log('PASS rejection, cancellation, expiry, rate limits without email history, private tables and stale reset guards');
}catch(e){console.error('FAIL',e.message,e.code??'',e.where??'');process.exitCode=1;}finally{await db.close();}
