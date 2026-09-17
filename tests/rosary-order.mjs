import assert from 'node:assert/strict';
import {rosaryStepOrder,rosaryStep,nextPrayerStep,prayerFor} from '../lib/rosary-guide.ts';
import {liveProgressFor,progressFor} from '../lib/schedule.ts';
const row=(kind,key,data)=>({kind,key,data,owner:'synthetic',version:1,updated:''});
for(const position of ['start','end']){
 const options={include:true,mary:'trinitarian',position},order=rosaryStepOrder(options);
 assert.equal(new Set(order).size,order.length);
 assert.deepEqual(order.slice(0,2),[0,1]);assert.equal(order.at(-1),69);
 for(let i=0;i<order.length-1;i++)assert.equal(nextPrayerStep(order[i],1,options),order[i+1]);
 for(let i=order.length-1;i>0;i--)assert.equal(nextPrayerStep(order[i],-1,options),order[i-1]);
 for(let decade=1;decade<=5;decade++){
  const steps=order.slice(0,-1).map(id=>rosaryStep(id,options)).filter(p=>p.decade===decade);
  assert.equal(steps.filter(p=>p.prayer==='father').length,1);assert.equal(steps.filter(p=>p.prayer==='mary').length,10);assert.equal(steps.filter(p=>p.prayer==='glory').length,1);
 }
 assert.equal(order.filter(id=>rosaryStep(id,options).total===3).length,3);
 assert.equal(prayerFor(rosaryStep(3,options),options).name,'Avemaría · Hija de Dios Padre');
 assert.equal(rosaryStep(3,options).decade,position==='end'?6:0);
 assert.equal(order.indexOf(2)>order.indexOf(66),position==='end');
}
const legacy={include:false,mary:'standard'};
assert.equal(nextPrayerStep(1,1,legacy),6);assert(!rosaryStepOrder(legacy).includes(70));
const rows=[row('habit_plan','exercise',{versions:[{from:'2026-09-16',period:'week',target:3,active:true}]}),row('checks','2026-09-16',{exercise:'done'})];
assert.equal(progressFor(rows,'exercise','2026-09-17','2026-09-17').target,null);
assert.equal(liveProgressFor(rows,'exercise','2026-09-17','2026-09-17').percent,33);
rows.push(row('checks','2026-09-17',{exercise:'done'}));
assert.equal(liveProgressFor(rows,'exercise','2026-09-17','2026-09-17').percent,67);
rows[0].data.versions.push({from:'2026-09-17',period:'month',target:4,unit:'times',active:true});
rows.at(-1).data.exercise=2;
assert.equal(liveProgressFor(rows,'exercise','2026-09-17','2026-09-17').done,2);
assert.equal(liveProgressFor(rows,'exercise','2026-09-17','2026-09-17').percent,50);
console.log('PASS both rosary orders, backward navigation, intact decades, closing invocations, legacy checkpoints and proportional partial-period progress');
