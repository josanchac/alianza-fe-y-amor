import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite(),
  ids = Array.from(
    { length: 12 },
    (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  );
try {
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`,
  );
  const files = (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const f of files.filter((f) => f < "20260909143538"))
    await db.exec(await readFile("supabase/migrations/" + f, "utf8"));
  for (const [i, id] of ids.entries())
    await db.query("insert into auth.users values($1,$2,now())", [
      id,
      `user${i}@example.test`,
    ]);
  await db.query(
    "insert into alianza_private.members values($1,'jose','A',''),($2,'neca','B','')",
    ids.slice(0, 2),
  );
  for (const f of files.filter((f) => f >= "20260909143538"))
    await db.exec(await readFile("supabase/migrations/" + f, "utf8"));
  for (const id of ids.slice(2))
    await db.query(
      "insert into alianza_private.members(id,role,name) values($1,'member','Synthetic')",
      [id],
    );
  await db.query("insert into alianza_private.admin_members values($1)", [
    ids[0],
  ]);
  async function as(id) {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec("set role authenticated");
  }
  async function act(payload = {}) {
    return (
      await db.query("select public.alianza_community($1::jsonb) v", [
        JSON.stringify({ dataEpoch: 1, ...payload }),
      ])
    ).rows[0].v;
  }
  async function data(payload = null) {
    return (
      await db.query("select public.alianza_data($1::jsonb) v", [
        payload && JSON.stringify(payload),
      ])
    ).rows[0].v;
  }
  async function metrics(p = {}) {
    return (
      await db.query("select public.alianza_product_metrics($1::jsonb) v", [
        JSON.stringify(p),
      ])
    ).rows[0].v;
  }
  const today=(await db.query("select (now() at time zone 'America/Costa_Rica')::date::text d")).rows[0].d;
  const past=(await db.query("select ((now() at time zone 'America/Costa_Rica')::date-3)::text d")).rows[0].d;
  await as(ids[0]);
  let st=await act({action:'group_create',name:'Delegation test',displayName:'Leader'});const g=st.groups[0].id;
  const token=(await act({action:'invite_create',groupId:g})).token;
  for(const id of ids.slice(1)){await as(id);await act({action:'invite_join',token,displayName:'Member'});}
  await as(ids[0]);
  st=await act({action:'group_permissions',groupId:g,version:1,coordinators:[],permissions:{rosary:{mode:'selected',users:[ids[1]]},meeting:{mode:'selected',users:[ids[2]]}}});
  await as(ids[3]);
  await assert.rejects(()=>act({action:'rosary_create',id:crypto.randomUUID(),groupId:g,scope:'group',mystery:'joyful',mode:'free'}));
  await assert.rejects(()=>act({action:'group_permissions',groupId:g,version:2,coordinators:[ids[3]],permissions:{}}));
  await as(ids[1]);
  const rid=crypto.randomUUID();await act({action:'rosary_create',id:rid,groupId:g,scope:'group',mystery:'joyful',mode:'free'});
  await assert.rejects(()=>act({action:'task_create',id:crypto.randomUUID(),groupId:g,title:'No permission',assignee:ids[1]}));
  await as(ids[2]);const task=crypto.randomUUID();await act({action:'task_create',id:task,groupId:g,title:'Prepare material',assignee:ids[3]});
  await as(ids[4]);await assert.rejects(()=>act({action:'task_complete',groupId:g,id:task,version:1,done:true}));
  await as(ids[3]);st=await act({action:'task_complete',groupId:g,id:task,version:1,done:true});assert.equal(st.groups[0].tasks[0].done,true);
  await assert.rejects(()=>act({action:'task_complete',groupId:g,id:task,version:1,done:false}));
  await as(ids[0]);
  await act({action:'group_permissions',groupId:g,version:2,coordinators:[],permissions:{rosary:{mode:'coordinators',users:[]}}});
  await as(ids[1]);await assert.rejects(()=>act({action:'rosary_create',id:crypto.randomUUID(),groupId:g,scope:'group',mystery:'joyful',mode:'free'}));
  // Personal checkpoints survive snapshots, reject wrong accounts and stale versions.
  const personal=crypto.randomUUID();await act({action:'rosary_create',id:personal,scope:'personal',mystery:'joyful',mode:'free'});
  st=await act({action:'rosary_step',id:personal,step:1,version:0});assert.equal(st.rosaries.find(r=>r.id===personal).personalStep,1);assert.equal(st.rosaries.find(r=>r.id===personal).mine.length,0);
  await assert.rejects(()=>act({action:'rosary_step',id:personal,step:3,version:1}));
  await assert.rejects(()=>act({action:'rosary_step',id:personal,step:2,version:0}));
  await as(ids[0]);await assert.rejects(()=>act({action:'rosary_step',id:personal,step:2,version:1}));
  await as(ids[1]);for(let step=2;step<=69;step++)st=await act({action:'rosary_step',id:personal,step,version:step-1});
  assert.equal(st.rosaries.find(r=>r.id===personal).mine.length,5);
  await assert.rejects(()=>act({action:'rosary_step',id:personal,step:69,version:69}));
// Alpha.5: configured opening is private, synchronized and cannot change mid-prayer.
  const configurable=crypto.randomUUID();await act({action:'rosary_create',id:configurable,scope:'personal',mystery:'joyful',mode:'free'});
  st=await act({action:'rosary_opening',id:configurable,version:0,include:false,mary:'trinitarian'});
  assert.deepEqual(st.rosaries.find(r=>r.id===configurable).opening,{include:false,mary:'trinitarian'});
  await assert.rejects(()=>act({action:'rosary_opening',id:configurable,version:0,include:true,mary:'standard'}));
  await act({action:'rosary_step',id:configurable,version:1,step:1});
  await assert.rejects(()=>act({action:'rosary_step',id:configurable,version:2,step:2}));
  await act({action:'rosary_step',id:configurable,version:2,step:6});
  await act({action:'rosary_step',id:configurable,version:3,step:1});
  await assert.rejects(()=>act({action:'rosary_opening',id:configurable,version:4,include:true,mary:'standard'}));
  await assert.rejects(()=>act({action:'rosary_discard',id:configurable,version:3}));
  await as(ids[0]);await assert.rejects(()=>act({action:'rosary_discard',id:configurable,version:4}));
  assert(!(await act()).rosaries.some(r=>r.id===configurable));
  await as(ids[1]);st=await act({action:'rosary_discard',id:configurable,version:4});
  assert.equal(st.rosaries.find(r=>r.id===configurable).cancelled,true);
  assert.equal(st.rosaries.find(r=>r.id===configurable).mine.length,0);
  await assert.rejects(()=>act({action:'rosary_step',id:configurable,version:5,step:6}));
  await assert.rejects(()=>act({action:'rosary_today',id:configurable,mode:'once'}));
  await assert.rejects(()=>act({action:'rosary_discard',id:personal,version:69}));
  await assert.rejects(()=>act({action:'rosary_discard',id:rid,version:0}));
  // Exactly-once day marking preserves other checks and makes no future obligation.
  await data({kind:'habit',key:'regular-rosary',version:0,dataEpoch:1,data:{title:'Mi rosario',active:true,moment:'Mañana',anchor:'',minimum:''}});
  await data({kind:'checks',key:today,version:0,dataEpoch:1,data:{other:'missed'}});
  await act({action:'rosary_today',id:personal,mode:'existing',habitKey:'regular-rosary'});
  let own=(await data()).own;let check=own.find(r=>r.kind==='checks'&&r.key===today);
  assert.equal(check.data.other,'missed');assert.equal(check.data['regular-rosary'],'done');
  const checkVersion=check.version;
  await act({action:'rosary_today',id:personal,mode:'existing',habitKey:'regular-rosary'});
  assert.equal((await data()).own.find(r=>r.kind==='checks'&&r.key===today).version,checkVersion);
  await act({action:'rosary_today',id:personal,mode:'once'});const onceState=(await data()).own;
  await act({action:'rosary_today',id:personal,mode:'once'});own=(await data()).own;
  assert.deepEqual(own,onceState);
  const onceKey='rosary-once:'+today,one=own.find(r=>r.kind==='habit'&&r.key===onceKey);
  assert.equal(one.data.active,false);
  const versions=own.find(r=>r.kind==='habit_plan'&&r.key===onceKey).data.versions;
  assert.equal(versions.length,2);assert.equal(versions[0].from,today);assert.equal(versions[0].active,true);assert.equal(versions[1].active,false);assert(versions[1].from>today);
  await assert.rejects(()=>db.query('select * from alianza_private.rosary_settings'));
  await assert.rejects(()=>db.query("select alianza_private.community_before_rosary_comfort('{}')"));
  await data({kind:'spaces',key:'experience',data:{enabled:['group'],start:'group'},version:0,dataEpoch:1});
  assert((await data()).own.some(r=>r.kind==='spaces'));await as(ids[0]);assert(!(await data()).own.some(r=>r.kind==='spaces'));
  // Each member sees only their own capital log, including the coordinator.
  const capital=crypto.randomUUID();await act({action:'capital_create',id:capital,groupId:g,title:'Our intention',start:past,end:today});
  for(const [i,id] of ids.entries()){await as(id);await act({action:'capital_share',id:capital,groupId:g,share:true});if(i<6)await act({action:'capital_log',id:capital,groupId:g,day:past,amount:2,version:0});}
  await as(ids[0]);st=await act();assert.equal(st.groups[0].capital[0].mine.length,1);assert.equal(st.groups[0].capital[0].summary,null);
  const purpose=crypto.randomUUID();await act({action:'purpose_create',id:purpose,groupId:g,title:'Listen',start:past,end:today,target:1,unit:'person'});
  for(const [i,id] of ids.entries()){await as(id);await act({action:'purpose_join',id:purpose,groupId:g,share:true});if(i<6)await act({action:'purpose_log',id:purpose,groupId:g,day:past,amount:1,version:0});}
  await db.exec('reset role');await db.query('update alianza_private.group_purposes set ends_on=$1 where id=$2',[past,purpose]);await db.query('update alianza_private.capital_campaigns set ends_on=$1 where id=$2',[past,capital]);
  await as(ids[0]);st=await act();const report=st.groups[0].purposes[0].summary;assert.deepEqual(report,{participation:'40–60%',completed:'40–60%'});assert.deepEqual(st.groups[0].capital[0].summary,{range:'10–19'});
  await as(ids[6]);await act({action:'purpose_log',id:purpose,groupId:g,day:past,amount:1,version:0});assert.deepEqual((await act()).groups[0].purposes[0].summary,report,'Corrections cannot reveal live differences');
  await act({action:'purpose_join',id:purpose,groupId:g,share:false});assert.equal((await act()).groups[0].purposes[0].summary,null,'Consent change suppresses publication rather than recalculating');
  await act({action:'capital_share',id:capital,groupId:g,share:false});assert.equal((await act()).groups[0].capital[0].summary,null);
  await assert.rejects(()=>db.query('select * from alianza_private.capital_logs'));
  await as(ids[0]);await assert.rejects(()=>act({action:'group_update',groupId:g,version:3,name:'Test',ideal:'',motto:'',photo:'javascript:alert(1)'}));
  await db.exec('reset role');await db.query('update public.alianza_service_status set active=true');
  await as(ids[1]);await assert.rejects(()=>data({kind:'spaces',key:'experience',data:{enabled:['personal'],start:'personal'},version:1,dataEpoch:1}),e=>e.code==='PT503');
  await assert.rejects(()=>db.query('update public.alianza_service_status set active=false'));
  await db.exec('reset role');await db.query("update public.alianza_service_status set active=false,required_version='test-new'");
  await as(ids[1]);await assert.rejects(()=>data({kind:'spaces',key:'experience',data:{enabled:['personal'],start:'personal'},version:1,dataEpoch:1}),e=>e.code==='PT426');
  await db.query("select set_config('request.headers',$1,false)",[JSON.stringify({'x-client-info':'alianza/test-new'})]);
  await data({kind:'spaces',key:'experience',data:{enabled:['personal'],start:'personal'},version:1,dataEpoch:1});
  await db.exec('reset role;set role anon');assert.equal((await db.query('select active from public.alianza_service_status')).rows[0].active,false);await assert.rejects(()=>db.query('select * from alianza_private.records'));
  console.log('PASS alpha renewal: task delegation, revocation, stale writes, checkpoints, isolation, protected publications, maintenance and obsolete-client guards');
} finally {await db.close();}
