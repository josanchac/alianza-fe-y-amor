import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const db=new PGlite();
const id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
const proof='a'.repeat(64),digest=s=>createHash('sha256').update(s).digest('hex');
const query=async(sql,args=[]) => (await db.query(sql,args)).rows[0]?.v;
try{
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 const files=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
 for(const f of files.filter(f=>f<'20260909143538'))await db.exec(await readFile('supabase/migrations/'+f,'utf8'));
 await db.exec(`insert into auth.users values('${id(1)}','admin@example.test',now()),('${id(2)}','legacy@example.test',null);insert into alianza_private.members values('${id(1)}','jose','A',''),('${id(2)}','neca','B','');`);
 for(const f of files.filter(f=>f>='20260909143538'))await db.exec(await readFile('supabase/migrations/'+f,'utf8'));
 await db.query('insert into alianza_private.admin_members values($1)',[id(1)]);

 const as=async n=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[n?id(n):'']);await db.exec('set role '+(n?'authenticated':'anon'));};
 const support=p=>query('select public.alianza_pilot_support($1::jsonb) v',[JSON.stringify(p)]);
 await db.query('update auth.users set email_confirmed_at=now() where id=$1',[id(2)]);
 await as(2);const rid=randomUUID();const submitted=await support({action:'submit',id:rid,message:'Un símbolo de rayo'});assert.equal(submitted.state,'pending');
 assert.equal((await support({action:'submit',id:rid,message:'Un símbolo de rayo'})).id,rid);
 assert.equal((await support({action:'mine'})).requests.length,1);
 await assert.rejects(()=>support({action:'list'}),e=>e.code==='42501');
 await assert.rejects(()=>query('select public.alianza_pilot_pulse() v'),e=>e.code==='42501');
 await as(1);assert.equal((await support({action:'mine'})).requests.length,0);assert.equal((await support({action:'list'})).requests.length,1);
 await support({action:'update',id:rid,state:'review',version:1});
 await assert.rejects(()=>support({action:'update',id:rid,state:'done',version:1}),e=>e.code==='PT409');
 await as(2);assert.equal((await support({action:'mine'})).requests[0].state,'review');
 await assert.rejects(()=>support({action:'update',id:rid,state:'done',version:2}),e=>e.code==='42501');
 await db.exec('reset role');assert.equal(await query("select alianza_private.valid_record('appearance','me','{\"symbol\":\"lightning\",\"image\":\"\"}') v"),true);
 await db.exec("insert into alianza_private.pilot_consent(user_id,enabled,started_on) select id,true,current_date-80 from auth.users on conflict(user_id) do update set enabled=true,started_on=current_date-80;");
 await db.query("insert into alianza_private.pilot_days values($1,date_trunc('week',(now() at time zone 'America/Costa_Rica')::date)::date-8,'open',1),($1,date_trunc('week',(now() at time zone 'America/Costa_Rica')::date)::date-1,'open',1),($2,date_trunc('week',(now() at time zone 'America/Costa_Rica')::date)::date,'open',1)",[id(1),id(2)]);
 await as(1);const pulse=await query('select public.alianza_pilot_pulse() v');assert.equal(pulse.weeks.length,8);assert.equal(pulse.weeks.at(-1).active,1);assert.equal(pulse.returning,1);assert.equal(pulse.population,2);assert(!JSON.stringify(pulse).includes('@'));assert(!JSON.stringify(pulse).includes('user_id'));
 await db.exec('reset role');await db.query('delete from alianza_private.admin_members where user_id=$1',[id(1)]);
 await as(1);await assert.rejects(()=>query('select public.alianza_pilot_pulse() v'),e=>e.code==='42501');
 await as(null);await assert.rejects(()=>support({action:'mine'}),e=>e.code==='42501');
 console.log('PASS support idempotency, ownership, admin revocation, version checks, lightning validation, whole-week pulse and aggregate-only output');
}catch(e){console.error('FAIL',e.message,e.code??'',e.where??'');process.exitCode=1;}finally{await db.close();}
