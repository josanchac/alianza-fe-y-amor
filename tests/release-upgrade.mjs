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
 await db.exec(await readFile('scripts/operations/create-release-checkpoint.sql','utf8'));
 const rhythms=(await readFile('supabase/migrations/20260916215636_schedule_rhythms.sql','utf8')).replace(/^begin;\s*/i,'').replace(/commit;\s*$/i,'');
 await db.exec('begin;'+rhythms+'\n'+verify+'\ncommit;');
 await db.exec(await readFile('scripts/operations/create-release-checkpoint.sql','utf8'));
 const pilot=(await readFile('supabase/migrations/20260916221507_pilot_metrics.sql','utf8')).replace(/^begin;\s*/i,'').replace(/commit;\s*$/i,'');
 await db.exec('begin;'+pilot+'\n'+verify+'\ncommit;');
 await db.exec(await readFile('scripts/operations/create-release-checkpoint.sql','utf8'));
 const alpha9=(await readFile('supabase/migrations/20260917042604_neca_feedback_alpha9.sql','utf8')).replace(/^begin;\s*/i,'').replace(/commit;\s*$/i,'');
 await db.exec('begin;'+alpha9+'\n'+verify+'\ncommit;');
 await db.exec(await readFile('scripts/operations/create-release-checkpoint.sql','utf8'));
 const alpha10=(await readFile('supabase/migrations/20260917200200_rosary_order_and_commitment_removal.sql','utf8')).replace(/^begin;\s*/i,'').replace(/commit;\s*$/i,'');
 await db.exec('begin;'+alpha10+'\n'+verify+'\ncommit;');
 await db.exec(await readFile('scripts/operations/create-release-checkpoint.sql','utf8'));
 const invitations=(await readFile('supabase/migrations/20260918054033_pilot_invitations.sql','utf8')).replace(/commit;\s*$/i,'');
 await db.exec(invitations+'\n'+verify+'\ncommit;');
 await db.exec(await readFile('scripts/operations/create-release-checkpoint.sql','utf8'));
 const manual=(await readFile('supabase/migrations/20260918062544_manual_pilot_links.sql','utf8')).replace(/commit;\s*$/i,'');
 await db.exec(manual+'\n'+verify+'\ncommit;');
 await db.exec(await readFile('scripts/operations/create-release-checkpoint.sql','utf8'));
 const support=(await readFile('supabase/migrations/20260919151531_pilot_support_and_pulse.sql','utf8')).replace(/commit;\s*$/i,'');
 await db.exec(support+'\n'+verify+'\ncommit;');
 // A silent change to an existing value must fail the same pre-commit check.
 await db.exec("begin;update alianza_private.members set name='changed';");
 await assert.rejects(()=>db.exec(verify),/Existing values changed/);await db.exec('rollback');
 await db.exec(verify);
 console.log('PASS release order: maintenance first, private checkpoint, additive migrations and exact-value verification; altered old values are rejected');
}catch(e){console.error('FAIL',e.message,e.code??'',e.where??'');process.exitCode=1;}finally{await db.close();}
