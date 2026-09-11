import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create schema auth;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);alter table auth.users enable row level security;
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
const migrations=(await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')).sort();
for(const f of migrations.filter(x=>!x.endsWith('_multi_couple_isolation.sql')&&!x.endsWith('_private_admin_activity.sql')&&!x.endsWith('_metrics_auth_boundary.sql')))await db.exec(await readFile('supabase/migrations/'+f,'utf8'));
const ids=[1,2,3,4,5].map(i=>'00000000-0000-4000-8000-'+String(i).padStart(12,'0'));const[a,b,c,d,out]=ids;
for(const id of ids)await db.query('insert into auth.users values($1,$2,now())',[id,id+'@example.test']);
await db.query("insert into alianza_private.members values($1,'jose','A',''),($2,'neca','B','')",[a,b]);
await db.exec(await readFile('supabase/migrations/'+migrations.find(x=>x.endsWith('_multi_couple_isolation.sql')),'utf8'));
await db.exec(await readFile('supabase/migrations/20260911210520_private_admin_activity.sql','utf8'));
await db.exec(await readFile('supabase/migrations/20260911210958_metrics_auth_boundary.sql','utf8')); 
const pair='10000000-0000-4000-8000-000000000002';await db.query('insert into alianza_private.couples(id) values($1)',[pair]);
await db.query("insert into alianza_private.members(id,name,couple_id,seat) values($1,'C',$3,1),($2,'D',$3,2)",[c,d,pair]);
await db.query('insert into alianza_private.admin_members values($1)',[a]);
await db.exec('alter table auth.users add column encrypted_password text');
async function as(id,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec('set role '+role);}
async function rpc(name){return(await db.query('select public.'+name+'() value')).rows[0].value;}
async function data(payload=null){return(await db.query('select public.alianza_data($1::jsonb) value',[payload&&JSON.stringify(payload)])).rows[0].value;}
const deny=fn=>assert.rejects(fn,e=>e.code==='42501');
await as(c);await data({kind:'journal',key:'2026-01-01',version:0,data:{gratitude:'SECRET_OTHER_PAIR',offering:'NEVER_ADMIN'}});
await as(b);await data({kind:'journal',key:'2026-01-01',version:0,data:{gratitude:'SECRET_SPOUSE',offering:'NOT_SHARED'}});
for(const id of[b,c,d,out]){await as(id);assert.equal(await rpc('alianza_is_admin'),false);await deny(()=>rpc('alianza_admin_activity'));}
await as(null,'anon');await deny(()=>rpc('alianza_admin_activity'));await deny(()=>rpc('alianza_record_activity'));
await as(out);await deny(()=>rpc('alianza_record_activity'));
await as(c);await rpc('alianza_record_activity');await rpc('alianza_record_activity');
await deny(()=>db.query('select * from alianza_private.activity_days'));await deny(()=>db.query('insert into alianza_private.admin_members values($1)',[c]));
await as(a);assert.equal(await rpc('alianza_is_admin'),true);const result=await rpc('alianza_admin_activity');assert.equal(result.accounts,4);assert.equal(result.active7,1);assert.equal(result.members.find(x=>x.email.startsWith(c)).days7,1);
assert.deepEqual(Object.keys(result.members[0]).sort(),['email','activated','lastDay','days7','days30'].sort());
assert(!JSON.stringify(result).includes('SECRET'));assert(!JSON.stringify(await data()).includes('SECRET'));await deny(()=>db.query('select * from alianza_private.records'));
await db.exec('reset role;set role alianza_metrics');await deny(()=>db.query('select * from alianza_private.records'));await deny(()=>db.query('select name from alianza_private.members'));await deny(()=>db.query('select * from auth.users'));await db.exec('reset role');
await db.query('delete from alianza_private.admin_members where user_id=$1',[a]);await as(a);await deny(()=>rpc('alianza_admin_activity'));
await db.exec('reset role');await db.query('update auth.users set email_confirmed_at=null where id=$1',[d]);await as(d);await deny(()=>rpc('alianza_record_activity'));
await db.close();console.log('PASS admin authorization, revocation, anonymous/nonmember denial, daily deduplication, exact metadata contract, spouse/couple privacy and metrics role content denial');
