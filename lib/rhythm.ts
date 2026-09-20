import type {RecordItem} from './domain';
import {plansFor,planAt,isActiveOn,courseProgress,registeredCount,liveProgressFor,type Frequency} from './schedule';
export function frequencyAt(rows:RecordItem[],habit:RecordItem,date:string):Frequency|undefined{
 const plans=plansFor(rows,habit.key);return plans.length?planAt(plans,date):habit.data.frequency??{period:'day',target:1};
}
export function rhythmProgress(rows:RecordItem[],date:string,today:string,period:Frequency['period']){
 const checks=rows.find(r=>r.kind==='checks'&&r.key===date)?.data??{};
 const habits=rows.filter(h=>h.kind==='habit'&&isActiveOn(rows,h,date)&&frequencyAt(rows,h,date)?.period===period);
 const skipped=period==='day'?habits.filter(h=>checks[h.key]==='skip').length:0;
 const applicable=habits.filter(h=>period!=='day'||(checks[h.key]!=='skip'&&!courseProgress(rows,h.key,date,frequencyAt(rows,h,date))?.paused));
 const values=applicable.map(h=>period==='day'?Math.min(1,registeredCount(checks[h.key])/Math.max(1,frequencyAt(rows,h,date)?.target??1)):(()=>{const p=liveProgressFor(rows,h.key,date,today);return p.target?Math.min(1,p.done/p.target):null;})());
 const value=values.reduce<number>((s,v)=>s+(v??0),0);
 return {habits,skipped,total:applicable.length,done:values.filter(v=>v===1).length,value,percent:values.length&&!values.includes(null)?Math.round(value/values.length*100):null};
}
