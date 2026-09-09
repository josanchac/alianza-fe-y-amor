import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create schema auth;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
await db.exec(await readFile('supabase/schema.sql','utf8'));
const a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002',c='00000000-0000-4000-8000-000000000003';
await db.query(`insert into auth.users values($1,'first@example.test',now()),($2,'second@example.test',now()),($3,'outsider@example.test',now())`,[a,b,c]);
await db.query(`insert into alianza_private.members values($1,'jose','Primero','Líder de amor'),($2,'neca','Segunda','Mujer de fe')`,[a,b]);
async function as(id,role='authenticated'){await db.exec('reset role');await db.query(`select set_config('request.jwt.claim.sub',$1,false)`,[id||'']);await db.exec('set role '+role);}
async function call(payload=null){return (await db.query('select public.alianza_data($1::jsonb) value',[payload===null?null:JSON.stringify(payload)])).rows[0].value;}
async function rejects(fn,code){await assert.rejects(fn,e=>e.code===code);}
let passed=0;async function test(name,fn){await fn();console.log('PASS '+name);passed++;}
const day='2026-01-02';const note={kind:'journal',key:day,data:{gratitude:'Privado',offering:'Texto personal'},version:0};
await test('Anonymous and unenrolled users cannot enter',async()=>{await as(null,'anon');await rejects(()=>call(),'42501');await as(c);await rejects(()=>call(),'42501');});
await test('Profiles default private and starter habits initialize once',async()=>{await as(a);let s=await call();assert.equal(s.own.length,5);assert.equal(s.own.find(x=>x.kind==='profile').data.shareNotes,false);assert.equal((await call()).own.length,5);});
await test('Personal entries stay private across accounts',async()=>{await call(note);await as(b);let s=await call();assert.equal(s.partner.records.length,0);assert.equal(s.own.some(x=>x.kind==='journal'),false);});
await test('Raw tables and internal validators are inaccessible',async()=>{await rejects(()=>db.query('select * from alianza_private.records'),'42501');await rejects(()=>db.query('select * from alianza_private.members'),'42501');await rejects(()=>db.query("select alianza_private.valid_record('profile','me','{}')"),'42501');});
await test('Owner cannot be supplied or forged',async()=>{await rejects(()=>call({...note,owner:a}),'22023');let s=await call(note);assert.equal(s.record.owner,b);});
await test('Sharing notes works and revocation immediately filters server responses',async()=>{await as(a);let p=(await call()).own.find(x=>x.kind==='profile');await call({...p,data:{...p.data,shareNotes:true},version:p.version,owner:undefined,updated:undefined});await as(b);let s=await call();assert.equal(s.partner.records.length,1);assert.equal(s.partner.records[0].owner,a);await as(a);p=(await call()).own.find(x=>x.kind==='profile');await call({kind:p.kind,key:p.key,data:{...p.data,shareNotes:false},version:p.version});await as(b);assert.equal((await call()).partner.records.length,0);});
await test('Schedule sharing excludes notes',async()=>{await as(a);let p=(await call()).own.find(x=>x.kind==='profile');await call({kind:p.kind,key:p.key,data:{...p.data,shareSchedule:true},version:p.version});await as(b);let s=await call();assert.equal(s.partner.records.length,4);assert(s.partner.records.every(x=>x.kind==='habit'));});
const r={kind:'rs',key:'rezar:'+day,version:0,data:{type:'rezar',periodDate:day,planDate:'',planTime:'',note:'Juntos',done:true,doneDate:day}};
await test('Marital records are shared and concurrent edits never silently overwrite',async()=>{await as(a);await call(r);await as(b);assert.equal((await call()).shared.length,1);await rejects(()=>call(r),'PT409');await call({...r,version:1,data:{...r.data,note:'Actualizado'}});await as(a);await rejects(()=>call({...r,version:1}),'PT409');assert.equal((await call()).shared[0].data.note,'Actualizado');});
await test('Dates, periods, values, lengths and unexpected fields are validated on server',async()=>{
await rejects(()=>call({...note,key:'2026-02-30'}),'22023');await rejects(()=>call({...note,key:'2099-01-01'}),'22023');
await rejects(()=>call({...note,data:{...note.data,gratitude:'x'.repeat(12001)}}),'22023');
await rejects(()=>call({...note,data:{...note.data,shareNotes:true}}),'22023');
await rejects(()=>call({...r,key:'rezar:2026-01-03'}),'22023');
await rejects(()=>call({kind:'review',key:'2026-01-02:2026-01-01',version:0,data:{start:'2026-01-02',end:'2026-01-01',gratitude:'',learning:'',next:''}}),'22023');
await rejects(()=>call({kind:'checks',key:day,version:0,data:{a:'admin'}}),'22023');
await rejects(()=>call({...note,version:-1}),'22023');
await rejects(()=>call({...note,version:0.5}),'22023');
});
await test('Unconfirmed accounts are denied even when enrolled',async()=>{await db.exec('reset role');await db.query('update auth.users set email_confirmed_at=null where id=$1',[b]);await as(b);await rejects(()=>call(),'42501');});
await test('Membership revocation takes effect without waiting for token expiry',async()=>{await db.exec('reset role');await db.query('delete from alianza_private.members where id=$1',[a]);await as(a);await rejects(()=>call(),'42501');});
await db.close();console.log(`${passed} PostgreSQL authentication/privacy test groups passed.`);
