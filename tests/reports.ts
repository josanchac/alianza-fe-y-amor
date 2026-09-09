import assert from 'node:assert/strict';
import {rangeFor,previousRange,calendarPrevious,summarize} from '../lib/reports.ts';
import {type RecordItem} from '../lib/domain.ts';
assert.deepEqual(rangeFor('week','2026-01-01'),{start:'2025-12-29',end:'2026-01-04'});
assert.deepEqual(rangeFor('month','2024-02-10'),{start:'2024-02-01',end:'2024-02-29'});
console.log('PASS Calendar weeks and leap years');
assert.deepEqual(calendarPrevious('month','2026-03-01','2026-03-31'),{start:'2026-02-01',end:'2026-02-28',days:28});
assert.deepEqual(calendarPrevious('year','2024-01-01','2024-02-29'),{start:'2023-01-01',end:'2023-02-28',days:59});
console.log('PASS Equivalent previous calendar periods');
assert.deepEqual(previousRange('2026-01-01','2026-03-31'),{start:'2025-10-03',end:'2025-12-31',days:90});
console.log('PASS Cumulative equal-duration comparisons');
const row=(kind:string,key:string,data:unknown):RecordItem=>({owner:'test',kind,key,data,version:1,updated:'2026-01-03'});
const summary=summarize([
row('checks','2026-01-01',{a:'done',b:'skip'}),row('checks','2026-01-02',{}),row('checks','2026-01-03',{a:'missed'}),row('journal','2026-01-01',{gratitude:'',offering:''})
],[row('rs','a',{type:'rezar',done:true,doneDate:'2026-01-03',planDate:'2026-02-01'}),row('rs','b',{type:'revisar',done:false,doneDate:'',planDate:'2026-01-02'})],'2026-01-01','2026-01-31');
assert.deepEqual(summary,{days:2,done:1,missed:1,skip:1,reflections:0,moments:1,rs:{rezar:1,reencantar:0,revisar:0,renovar:0}});
console.log('PASS Summaries distinguish absent data, skipped habits and actual completion');
