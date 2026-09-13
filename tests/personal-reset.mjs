import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite(),a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002';
try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 const files=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
 for(const f of files.filter(f=>f<'20260909143538'))await db.exec(await readFile('supabase/migrations/'+f,'utf8'));
 await db.query("insert into auth.users values($1,'a@example.test',now()),($2,'b@example.test',now())",[a,b]);
 await db.query("insert into alianza_private.members values($1,'jose','A',''),($2,'neca','B','')",[a,b]);
 for(const f of files.filter(f=>f>='20260909143538'))await db.exec(await readFile('supabase/migrations/'+f,'utf8'));
 async function as(uid){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role authenticated');}
 async function data(p=null){return(await db.query('select public.alianza_data($1::jsonb) v',[p&&JSON.stringify(p)])).rows[0].v;}
 async function reset(email='a@example.test',epoch=1,backup=null){await db.exec('reset role');return(await db.query('select alianza_private.reset_personal_records($1,$2,$3,$4) id',[a,email,epoch,backup])).rows[0].id;}
 await as(a);await data();await data({kind:'habit',key:'test',version:0,data:{title:'Compromiso ficticio',moment:'Mañana',active:true,anchor:'',minimum:'',frequency:{period:'week',target:3}}});
 await data({kind:'rs',key:'rezar:2020-08-01',version:0,relationshipVersion:1,data:{type:'rezar',periodDate:'2020-08-01',planDate:'',planTime:'',note:'Historia compartida ficticia',done:false,doneDate:''}});
 await as(b);await data();await db.exec('reset role');
 const other=(await db.query('select * from alianza_private.records where owner<>$1 order by owner,kind,key',[a])).rows;
 const own=(await db.query('select * from alianza_private.records where owner=$1 order by kind,key',[a])).rows;
 const members=(await db.query('select id,couple_id,seat,relationship_version from alianza_private.members order by id')).rows;
 const users=(await db.query('select * from auth.users order by id')).rows;
 await assert.rejects(()=>reset('wrong@example.test'));await assert.rejects(()=>reset('a@example.test',99));
 const backup=await reset();assert.equal((await db.query('select count(*)::int n from alianza_private.records where owner=$1',[a])).rows[0].n,0);
 assert.deepEqual((await db.query('select * from alianza_private.records where owner<>$1 order by owner,kind,key',[a])).rows,other);
 assert.deepEqual((await db.query('select id,couple_id,seat,relationship_version from alianza_private.members order by id')).rows,members);
 assert.deepEqual((await db.query('select * from auth.users order by id')).rows,users);
 await as(a);const fresh=await data();assert.equal(fresh.user.dataEpoch,2);assert.equal(fresh.own.length,1);assert.equal(fresh.own[0].data.shareSchedule,false);
 const write={kind:'preferences',key:'experience',version:0,data:{focus:'schedule',lastSeenRelease:''}};
 for(const dataEpoch of [undefined,1])await assert.rejects(()=>data({...write,...(dataEpoch?{dataEpoch}:{})}),e=>e.code==='PT409');
 await data({...write,dataEpoch:2});
 await assert.rejects(()=>db.query('select alianza_private.reset_personal_records($1,$2,2)',[a,'a@example.test']));
 await assert.rejects(()=>db.query('select * from alianza_private.personal_reset_backups'));
 await assert.rejects(()=>db.query('select alianza_private.data_before_reset(null)'));
 const recovery=await reset('a@example.test',2,backup);
 assert.deepEqual((await db.query('select * from alianza_private.records where owner=$1 order by kind,key',[a])).rows,own);
 assert((await db.query('select records from alianza_private.personal_reset_backups where id=$1',[recovery])).rows[0].records.some(r=>r.kind==='preferences'));
 await as(a);assert.equal((await data()).user.dataEpoch,3);await assert.rejects(()=>data({...write,dataEpoch:2}),e=>e.code==='PT409');
 console.log('PASS Recoverable single-account reset preserves Auth, partner and shared history; old writes and client backup access denied; restore preserves post-reset work in a new backup');
}finally{await db.close();}
