import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite(),id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
try{
 await db.exec("create schema test_clock; create function test_clock.now() returns timestamptz language sql stable as $$select coalesce(nullif(current_setting('test.now',true),'')::timestamptz,pg_catalog.now())$$;grant usage on schema test_clock to public;grant execute on function test_clock.now() to public;");
 await db.query("select set_config('test.now','2026-12-30T12:00:00-06:00',false)");
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 const files=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
 for(const f of files.filter(f=>f<'20260909143538'))await db.exec((await readFile('supabase/migrations/'+f,'utf8')).replace(/\bnow\(\)/g,'test_clock.now()'));
 for(let n=1;n<=4;n++)await db.query('insert into auth.users values($1,$2,now())',[id(n),`session${n}@example.test`]);
 await db.query("insert into alianza_private.members values($1,'jose','A','Uno'),($2,'neca','B','Dos')",[id(1),id(2)]);
 for(const f of files.filter(f=>f>='20260909143538'))await db.exec((await readFile('supabase/migrations/'+f,'utf8')).replace(/\bnow\(\)/g,'test_clock.now()'));
 for(let n=3;n<=4;n++)await db.query("insert into alianza_private.members(id,name) values($1,'Synthetic')",[id(n)]);
 await db.query('insert into alianza_private.admin_members values($1)',[id(1)]);
 const as=async n=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id(n)]);await db.exec('set role authenticated');};
 const rpc=async(name,p)=> (await db.query(`select public.${name}($1::jsonb) v`,[p===null?null:JSON.stringify({dataEpoch:1,relationshipVersion:1,...p})])).rows[0].v;
 const data=p=>rpc('alianza_data',p??null),act=p=>rpc('alianza_community',p??{}),pair=p=>rpc('alianza_relationship',p);
 const save=(kind,key,data,version=0)=>rpc('alianza_data',{kind,key,data,version});
 const h={title:'Caminar',moment:'Mañana',anchor:'',minimum:'',active:true,frequency:{period:'week',target:3,unit:'times'}};
 await as(1);let state=await data();const rv=state.user.relationshipVersion;
 await save('habit','walk',h);await save('habit','course',{...h,title:'Novena',frequency:{period:'day',target:1,unit:'days',course:{start:'2026-12-30',days:9,weekdays:[0,1,2,3,4,5,6]}}});
 await save('checks','2026-12-30',{walk:1,course:'done'});await save('journal','2026-12-30',{gratitude:'Synthetic',offering:'',meditation:''});
 await save('purpose','2026-12',{text:'Original',review:'Existing review'});
 const before=await data(),get=(s,k,key)=>s.own.find(r=>r.kind===k&&r.key===key);
 const walk=get(before,'habit','walk'),course=get(before,'habit','course');
 await pair({action:'prepare_month',month:'2027-01',purpose:'Future purpose',items:[{key:'walk',version:walk.version,keep:true,data:{...h,frequency:{period:'week',target:5,unit:'times'}}}],version:0});
 await db.query("select set_config('test.now','2026-12-31T12:00:00-06:00',false)");
 let payload={action:'save_current_month',month:'2026-12',effectiveDate:'2026-12-31',purpose:'New purpose',purposeVersion:1,version:0,items:[{key:'walk',version:1,keep:false,data:h},{key:'course',version:1,keep:true,data:course.data},{key:'new',version:0,keep:true,data:{...h,title:'Lectura'}}]};
 let result=(await pair(payload)).state;
 assert.equal(get(result,'habit','walk').data.active,false);assert.equal(get(result,'habit','new').version,1);assert.equal(get(result,'habit','course').version,1,'Unchanged course must not be rewritten');assert.deepEqual(get(result,'habit','course').data,course.data);
 assert.deepEqual(get(result,'checks','2026-12-30'),get(before,'checks','2026-12-30'));assert.deepEqual(get(result,'journal','2026-12-30'),get(before,'journal','2026-12-30'));
 assert.equal(get(result,'purpose','2026-12').data.review,'Existing review');assert.equal(get(result,'purpose','2026-12').data.text,'New purpose');
 const history=get(result,'habit_plan','walk').data.versions;assert.equal(history[0].from,'2026-12-30');assert.equal(history[0].active,true);assert.equal(history.at(-1).from,'2026-12-31');assert.equal(history.at(-1).active,false);
 const future=get(result,'month_plan','2027-01');assert.equal(future.data.items[0].version,2);assert.equal(future.data.items[0].data.frequency.target,5);assert.equal(future.data.purpose,'Future purpose');
 await assert.rejects(()=>pair(payload),e=>e.code==='PT409');assert.deepEqual((await data()).own,result.own,'Duplicate cannot write twice');
 const freshPayload=()=>({action:'save_current_month',month:'2026-12',effectiveDate:'2026-12-31',purpose:'New purpose',purposeVersion:get(result,'purpose','2026-12').version,version:get(result,'month_plan','2026-12').version,items:result.own.filter(r=>r.kind==='habit').map(r=>({key:r.key,version:r.version,keep:r.data.active,data:r.data}))});
 // All-or-nothing: a stale final item must roll back every earlier change and purpose.
 payload=freshPayload();payload.purpose='Must not persist';payload.items[0].data={...payload.items[0].data,title:'Must not persist'};payload.items.at(-1).version=0;
 const stable=JSON.stringify((await data()).own);await assert.rejects(()=>pair(payload),e=>e.code==='PT409');assert.equal(JSON.stringify((await data()).own),stable);
 payload=freshPayload();await assert.rejects(()=>pair({...payload,items:payload.items.slice(1)}),e=>e.code==='PT409');
 await assert.rejects(()=>pair({...payload,purposeVersion:0}),e=>e.code==='PT409');
 await assert.rejects(()=>pair({...payload,effectiveDate:'2026-12-30'}),e=>e.code==='PT409');
 await assert.rejects(()=>pair({...payload,dataEpoch:2}),e=>e.code==='PT409');await assert.rejects(()=>pair({...payload,relationshipVersion:rv+1}),e=>e.code==='PT409');
 await assert.rejects(()=>pair({...payload,items:[payload.items[0],payload.items[0]]}),e=>e.code==='22023');
 await assert.rejects(()=>pair({...payload,items:[{...payload.items[0],data:{...h,frequency:{period:'week',target:0}}}]}),e=>e.code==='22023');
 await as(3);await assert.rejects(()=>pair(payload),e=>e.code==='PT409');assert.equal((await data()).own.filter(r=>r.kind==='habit').length,0);await as(1);
 // Reactivation retains history; repeated no-change save preserves habit versions.
 payload=freshPayload();payload.items=payload.items.map(i=>i.key==='walk'?{...i,keep:true}:i);result=(await pair(payload)).state;
 const v=get(result,'habit','walk').version;assert.equal(get(result,'habit','walk').data.active,true);
 result=(await pair(freshPayload())).state;assert.equal(get(result,'habit','walk').version,v);
 // UTC January 1 is still December 31 in Costa Rica.
 await db.query("select set_config('test.now','2027-01-01T05:59:00Z',false)");
 result=(await pair(freshPayload())).state;assert.equal(result.today,'2026-12-31');
 await db.query("select set_config('test.now','2027-01-01T06:00:00Z',false)");
 await assert.rejects(()=>pair(freshPayload()),e=>e.code==='PT409');
 result=await data();assert.equal(result.today,'2027-01-01');assert.equal(get(result,'habit','walk').data.frequency.target,5,'Future authored plan still takes effect after current-month changes');assert.equal(get(result,'purpose','2027-01').data.text,'Future purpose');
 const janPlan=get(result,'month_plan','2027-01'),janPurpose=get(result,'purpose','2027-01');
 const january={...freshPayload(),month:'2027-01',effectiveDate:'2027-01-01',purposeVersion:janPurpose.version,version:janPlan.version,purpose:'January adjusted'};
 result=(await pair(january)).state;assert.equal(get(result,'purpose','2027-01').data.text,'January adjusted');assert.equal(get(result,'purpose','2026-12').data.review,'Existing review');
 // Catalog checks for the added privileged wrapper and existing private table.
 await db.exec('reset role');const permissions=(await db.query("select has_function_privilege('anon','alianza_private.relationship(jsonb)','EXECUTE') anon,has_function_privilege('authenticated','alianza_private.relationship_before_current_month(jsonb)','EXECUTE') old,has_table_privilege('authenticated','alianza_private.month_plans','SELECT') direct")).rows[0];assert.deepEqual(permissions,{anon:false,old:false,direct:false});
 console.log('PASS atomic current month: creation, pause/reactivation, unchanged courses, history/notes, stale versions/epoch/relation, duplicates, isolation, future plan retention and CR December/January boundary');
}catch(e){console.error('FAIL',e.message,e.code??'',e.where??'');process.exitCode=1;}finally{await db.close();}
