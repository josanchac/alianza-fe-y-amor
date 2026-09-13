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
 for(const f of files.filter(f=>f>='20260909143538'&&!f.endsWith('_voluntary_personalization.sql')))await db.exec(await readFile('supabase/migrations/'+f,'utf8'));
 async function as(uid){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role authenticated');}
 async function data(p=null){return(await db.query('select public.alianza_data($1::jsonb) v',[p&&JSON.stringify(p)])).rows[0].v;}
 await as(a);await data();await as(b);await data();await db.exec('reset role');
 const before=(await db.query('select * from alianza_private.records order by owner,kind,key')).rows;
 await db.exec(await readFile('supabase/migrations/'+files.find(f=>f.endsWith('_voluntary_personalization.sql')),'utf8'));
 assert.deepEqual((await db.query('select * from alianza_private.records order by owner,kind,key')).rows,before);
 await as(a);let profile=(await data()).own.find(r=>r.kind==='profile');
 await data({kind:'profile',key:'me',version:profile.version,data:{...profile.data,name:'',shareSchedule:true,shareNotes:true,shareIdeal:true}});
 const image='data:image/jpeg;base64,/9j//9k=';
 const row=await data({kind:'appearance',key:'me',version:0,data:{symbol:'',image}});assert.equal(row.record.data.image,image);
 for(const invalid of [{symbol:'',image:'https://example.test/tracker.jpg'},{symbol:'',image:'data:image/svg+xml;base64,AAAA'},{symbol:'tree',image},{symbol:'',image:'data:image/jpeg;base64,/9j/AAAA'},{symbol:'invalid',image:''},{symbol:'',image:'',owner:b},{symbol:null,image:''},{symbol:'',image:'x'.repeat(31000)}])await assert.rejects(()=>data({kind:'appearance',key:'me',version:1,data:invalid}));
 await assert.rejects(()=>data({kind:'appearance',key:b,version:0,data:{symbol:'tree',image:''}}));
 await assert.rejects(()=>data({kind:'appearance',key:'me',version:0,data:{symbol:'tree',image:''}}),e=>e.code==='PT409');
 await data({kind:'preferences',key:'experience',version:0,data:{focus:'ideal',lastSeenRelease:'simple-2026-09'}});
 await as(b);const other=await data();assert(!other.partner.records.some(r=>r.kind==='appearance'));assert(!other.own.some(r=>r.kind==='appearance'));
 await db.exec('reset role;set role alianza_metrics');await assert.rejects(()=>db.query('select * from alianza_private.records'));
 await db.exec('reset role');const saved=(await db.query('select alianza_private.reset_personal_records($1,$2,1) id',[a,'a@example.test'])).rows[0].id;
 await as(a);assert(!(await data()).own.some(r=>r.kind==='appearance'));await assert.rejects(()=>data({kind:'appearance',key:'me',version:0,dataEpoch:1,data:{symbol:'tree',image:''}}),e=>e.code==='PT409');
 await db.exec('reset role');await db.query('select alianza_private.reset_personal_records($1,$2,2,$3)',[a,'a@example.test',saved]);await as(a);assert.equal((await data()).own.find(r=>r.kind==='appearance').data.image,image);
 console.log('PASS Personalization: preservation, optional name, image validation, private ownership, stale writes and recoverable reset');
}finally{await db.close();}
