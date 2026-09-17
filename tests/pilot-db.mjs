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
 for(let n=1;n<=4;n++){await db.query('insert into auth.users values($1,$2,now())',[id(n),`p${n}@example.test`]);await db.query('insert into alianza_private.members(id,name) values($1,$2)',[id(n),`Person ${n}`]);}
 await db.query('insert into alianza_private.admin_members values($1)',[id(1)]);
 async function as(n){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[n?id(n):'']);await db.exec('set role '+(n?'authenticated':'anon'));}
 async function metrics(p={}){return(await db.query('select public.alianza_pilot_metrics($1::jsonb) v',[JSON.stringify(p)])).rows[0].v;}
 async function admin(){return(await db.query('select public.alianza_admin_pilot() v')).rows[0].v;}
 await as(1);await metrics({action:'event',event:'open'});assert.equal((await admin()).active30,0);
 for(let n=1;n<=4;n++){await as(n);await metrics({action:'consent',enabled:true});await metrics({action:'event',event:'open'});await metrics({action:'event',event:'view_day'});await metrics({action:'event',event:'view_day'});}
 await as(1);await metrics({action:'event',event:'save_error'});let v=await admin();assert.equal(v.consenting,4);assert.equal(v.active7,4);assert.equal(v.totals30.view_day.count,4);assert.equal(v.totals30.save_error.people,1);assert(!JSON.stringify(v).includes('@'));assert(!JSON.stringify(v).includes('user_id'));
 assert((await db.query('select public.alianza_admin_activity() v')).rows[0].v.suppressed);
 await assert.rejects(()=>metrics({action:'event',event:'view_day',note:'secret'}),e=>e.code==='22023');await assert.rejects(()=>metrics({action:'event',event:'confession'}),e=>e.code==='22023');
 await as(2);await assert.rejects(admin,e=>e.code==='42501');await metrics({action:'consent',enabled:false});await as(1);assert.equal((await admin()).active30,3);
 await db.exec('reset role;set role alianza_metrics');await assert.rejects(()=>db.query('select * from alianza_private.records'),e=>e.code==='42501');await db.exec('reset role');await db.query('delete from alianza_private.admin_members where user_id=$1',[id(1)]);await as(1);await assert.rejects(admin,e=>e.code==='42501');await as(null);await assert.rejects(admin,e=>e.code==='42501');
 console.log('PASS four-person pilot, one-person errors visible, explicit consent, daily deduplication, revocation/deletion, metadata-only payloads, general threshold unchanged and private-content isolation');
}catch(e){console.error('FAIL',e.message,e.code??'',e.where??'');process.exitCode=1;}finally{await db.close();}
