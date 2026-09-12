import {Client} from 'pg';import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
const original=new URL(process.env.ALIANZA_TEST_DATABASE_URL??'postgresql://localhost/invalid');
if(!['127.0.0.1','localhost'].includes(original.hostname)||original.pathname!=='/alianza_ci')throw Error('Restoration comparison requires isolated localhost fixtures');
const restored=new URL(original);restored.pathname='/alianza_restore';
const a=new Client({connectionString:original.href}),b=new Client({connectionString:restored.href});
await a.connect();await b.connect();
try{const tables=(await a.query("select tablename from pg_tables where schemaname='alianza_private' order by tablename")).rows.map(r=>r.tablename);for(const t of tables){if(!/^[a-z_]+$/.test(t))throw Error('Unexpected table');const sql=`select to_jsonb(t) v from alianza_private.${t} t order by to_jsonb(t)::text`;assert.deepEqual((await b.query(sql)).rows,(await a.query(sql)).rows);}
assert.deepEqual((await a.query("select id,email,email_confirmed_at from auth.users order by id")).rows,(await b.query("select id,email,email_confirmed_at from auth.users order by id")).rows);
const objects="select p.proname,pg_get_functiondef(p.oid) definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='alianza_private' order by p.proname";assert.deepEqual((await b.query(objects)).rows,(await a.query(objects)).rows);
console.log('PASS Restored synthetic database matches all application tables, identities and functions');await writeFile('test-results/restore-evidence.json',JSON.stringify({scope:'synthetic fixture only',tables,identities:true,functions:true,matched:true},null,2));}finally{await a.end();await b.end();}
