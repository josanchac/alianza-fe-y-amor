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

 await as(1);
 async function save(kind,key,value,version=0){return(await db.query('select public.alianza_data($1::jsonb) v',[JSON.stringify({kind,key,data:value,version,dataEpoch:1,relationshipVersion:1})])).rows[0].v;}
 const today=(await data()).today;
 const base={title:'Rosarios',moment:'Durante el día',active:true,anchor:'',minimum:'',frequency:{period:'month',target:2,unit:'times'}};
 await save('habit','rosary',base);
 assert.equal((await data()).own.find(r=>r.kind==='habit_plan'&&r.key==='rosary').data.versions.at(-1).unit,'times');
 let count=await save('checks',today,{rosary:'done'});
 count=await save('checks',today,{rosary:2},count.record.version);assert.equal(count.record.data.rosary,2);
 await assert.rejects(()=>save('checks',today,{rosary:3},1),e=>e.code==='PT409');
 count=await save('checks',today,{rosary:'done'},count.record.version);assert.equal(count.record.data.rosary,2);
 count=await save('checks',today,{rosary:1},count.record.version);assert.equal(count.record.data.rosary,1);
 await save('habit','daily',{...base,frequency:{period:'day',target:1}});
 await assert.rejects(()=>save('checks',today,{rosary:1,daily:2},count.record.version),e=>e.code==='22023');
 await assert.rejects(()=>save('checks',today,{rosary:0},count.record.version),e=>e.code==='22023');
 await assert.rejects(()=>save('habit','bad',{...base,frequency:{period:'month',target:100,unit:'times'}}),e=>e.code==='22023');
 await assert.rejects(()=>save('habit','bad',{...base,frequency:{period:'day',target:1,unit:'times'}}),e=>e.code==='22023');
 await save('journal',today,{offering:'Mi día',meditation:'Una luz',gratitude:'Mi familia'});
 await save('prayers','me',{personalIdeal:'Oración personal',marriageIdeal:'',homeShrine:'Oración del Santuario Hogar',alliance:''});
 await save('preferences','experience',{focus:'schedule',lastSeenRelease:'neca-feedback-2026-09-17'});
 await assert.rejects(()=>save('prayers','bad',{personalIdeal:'',marriageIdeal:'',homeShrine:'',alliance:'',extra:'no'}),e=>e.code==='22023');
 await as(2);await assert.rejects(()=>save('checks',today,{rosary:2}),e=>e.code==='22023');const second=await data();assert(!(second.own.some(r=>r.kind==='checks')));assert(!(second.own.some(r=>r.kind==='prayers')));
 console.log('PASS occurrence validation, meditation and private prayers, historical unit plans, repeated daily occasions, stale writes, legacy completion preservation, numeric correction and cross-account isolation');
}catch(e){console.error('FAIL',e.message,e.code??'',e.where??'');process.exitCode=1;}finally{await db.close();}
