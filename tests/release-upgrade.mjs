// Exercise the actual release order with synthetic data, never a remote database.
import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();
try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 const files=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
 const run=async f=>db.exec(await readFile('supabase/migrations/'+f,'utf8'));
 for(const f of files.filter(f=>f<'20260909143538'))await run(f);
 await db.exec(`insert into auth.users values('00000000-0000-4000-8000-000000000001','a@example.test',now()),('00000000-0000-4000-8000-000000000002','b@example.test',now());insert into alianza_private.members values('00000000-0000-4000-8000-000000000001','jose','A',''),('00000000-0000-4000-8000-000000000002','neca','B','');`);
 for(const f of files.filter(f=>f>='20260909143538'&&f<'20260913052055'))await run(f);
 await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);select public.alianza_data(null);reset role;select set_config('request.jwt.claim.sub','',false);`);
 await run('20260914134108_release_maintenance_gate.sql');
 await db.exec('begin;select pg_advisory_xact_lock(8254,42);update public.alianza_service_status set active=true;commit');
 await db.exec(await readFile('scripts/operations/create-release-checkpoint.sql','utf8'));
 const pending=files.filter(f=>f>='20260913052055'&&f<'20260914134108');
 const combined=(await Promise.all(pending.map(f=>readFile('supabase/migrations/'+f,'utf8')))).map(s=>s.replace(/^begin;\s*/i,'').replace(/commit;\s*$/i,'')).join('\n');
 const verify=await readFile('scripts/operations/verify-release-checkpoint.sql','utf8');
 await db.exec('begin;'+combined+'\nselect alianza_private.install_maintenance_triggers();\n'+verify+'\ncommit;');
 // Rehearse alpha.5 on the alpha.4 snapshot without changing previous rows.
 await db.exec(await readFile('scripts/operations/create-release-checkpoint.sql','utf8'));
 const comfort=(await readFile('supabase/migrations/20260914213938_rosary_comfort.sql','utf8')).replace(/^begin;\s*/i,'').replace(/commit;\s*$/i,'');
 await db.exec('begin;'+comfort+'\n'+verify+'\ncommit;');
 // Rehearse alpha.6: pending invitations and journals remain byte-for-byte intact.
 await db.exec(await readFile('scripts/operations/create-release-checkpoint.sql','utf8'));
 const pairing=(await readFile('supabase/migrations/20260915030736_pairing_requests.sql','utf8')).replace(/^begin;\s*/i,'').replace(/commit;\s*$/i,'');
 await db.exec('begin;'+pairing+'\n'+verify+'\ncommit;');
 // A silent change to an existing value must fail the same pre-commit check.
 await db.exec("begin;update alianza_private.members set name='changed';");
 await assert.rejects(()=>db.exec(verify),/Existing values changed/);await db.exec('rollback');
 await db.exec(verify);
 console.log('PASS release order: maintenance first, private checkpoint, additive migrations and exact-value verification; altered old values are rejected');
}catch(e){console.error('FAIL',e.message,e.code??'',e.where??'');process.exitCode=1;}finally{await db.close();}
