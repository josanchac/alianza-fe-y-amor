import {type RecordItem} from './domain.ts';
import {rangeFor,shift} from './reports.ts';
export type Frequency={period:'day'|'week'|'month';target:number;unit?:'days'|'times'};
export type Plan=Frequency&{from:string;active:boolean};
export const daily:Frequency={period:'day',target:1};
export function frequencyLabel(f:Frequency=daily){return f.period==='day'?'Cada día':`${f.target} ${f.unit==='times'?(f.target===1?'vez':'veces'):(f.target===1?'día':'días')} por ${f.period==='week'?'semana':'mes'}`;}
export function registeredCount(value:unknown){return value==='done'?1:typeof value==='number'&&Number.isInteger(value)&&value>0?value:0;}
export function plansFor(rows:RecordItem[],key:string):Plan[]{return rows.find(r=>r.kind==='habit_plan'&&r.key===key)?.data.versions??[];}
export function planAt(plans:Plan[],date:string){return [...plans].reverse().find(p=>p.from<=date);}
export function isActiveOn(rows:RecordItem[],habit:RecordItem,date:string){const plans=plansFor(rows,habit.key);return rows.some(r=>r.kind==='checks'&&r.key===date&&r.data[habit.key])||(plans.length?!!planAt(plans,date)?.active:habit.data.active);}
export function wasActiveBetween(rows:RecordItem[],key:string,start:string,end:string){const plans=plansFor(rows,key);return plans.some((p,i)=>p.active&&p.from<=end&&(!plans[i+1]||plans[i+1].from>start));}
export function monthBefore(month:string){const d=new Date(month+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()-1);return d.toISOString().slice(0,7);}
export function monthLabel(month:string){return new Intl.DateTimeFormat('es-CR',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(month+'-01T12:00:00Z'));}
export function countsFor(rows:RecordItem[],key:string,start:string,end:string){const counts={done:0,missed:0,skip:0};for(const r of rows)if(r.kind==='checks'&&r.key>=start&&r.key<=end){const s=r.data[key];counts.done+=registeredCount(s);if(s==='missed')counts.missed++;if(s==='skip')counts.skip++;}return counts;}
export type PeriodProgress={start:string;end:string;done:number;target:number|null;extra:number;percent:number|null;partial:boolean;open:boolean;unit?:'days'|'times'};
// Every day in a period must have the same plan before a whole-period target
// can be evaluated. Unknown history and mid-period changes are never failures.
export function progressFor(rows:RecordItem[],key:string,date:string,today:string):PeriodProgress {
 const plans=plansFor(rows,key),at=planAt(plans,date);
 const cadence=at?.period??'day';
 const range=cadence==='day'?{start:date,end:date}:rangeFor(cadence,date);
 const end=range.end<today?range.end:today;
 let uniform=!!at?.active;
 for(let day=range.start;day<=end;day=shift(day,1)){
  const p=planAt(plans,day);
  if(!p?.active||p.period!==at?.period||p.target!==at?.target||(p.unit??'days')!==(at?.unit??'days'))uniform=false;
 }
 const count=countsFor(rows,key,range.start,end);
 const target=uniform?(cadence==='day'&&count.skip?0:at!.target):null;
 return {...range,unit:at?.unit,done:count.done,target,extra:target===null?0:Math.max(0,count.done-target),percent:target?Math.min(100,Math.round(count.done/target*100)):null,partial:!uniform,open:range.end>=today};
}
export function periodsInMonth(rows:RecordItem[],key:string,month:string,today:string){
 const {start,end}=rangeFor('month',month+'-01'),last=end<today?end:today;
 const plans=plansFor(rows,key),result=new Map<string,PeriodProgress>();
 for(let date=start;date<=last;date=shift(date,1)){
  const p=planAt(plans,date);
  if(p?.active&&p.period!=='day'){
   const progress=progressFor(rows,key,date,today);
   const id=progress.start+':'+progress.end;
   const old=result.get(id);
   // A later plan in the same period must not hide an earlier transition.
   result.set(id,old?.partial?{...progress,target:null,percent:null,partial:true,extra:0}:progress);
  }
 }
 return [...result.values()];
}
export function progressLabel(p:PeriodProgress){
 const unit=p.unit==='times'?'veces':'días';
 if(p.partial)return `${p.done} ${unit} ${p.unit==='times'?'registradas':'registrados'} · período parcial o con cambios`;
 if(p.target===0)return 'No aplicaba';
 if(p.done>=(p.target??Infinity))return `${p.done} de ${p.target} ${unit} · meta registrada${p.extra?` · ${p.extra} adicionales`:''}`;
 return `${p.done} de ${p.target} ${unit} · ${p.open?'en curso':'faltan registros para confirmar'}`;
}

// The live indicator uses the current agreed goal. Historical evaluation above
// remains conservative when a period includes missing history or plan changes.
export function liveProgressFor(rows:RecordItem[],key:string,date:string,today:string){
 const historical=progressFor(rows,key,date,today),plans=plansFor(rows,key),at=planAt(plans,date);
 if(!at?.active)return {...historical,label:progressLabel(historical)};
 let since=plans.findIndex(p=>p===at);
 while(since>0){const previous=plans[since-1];if(!previous.active||previous.period!==at.period||previous.target!==at.target||(previous.unit??'days')!==(at.unit??'days'))break;since--;}
 const start=plans[since].from>historical.start?plans[since].from:historical.start;
 const end=historical.end<today?historical.end:today;
 const done=countsFor(rows,key,start,end).done,target=at.target;
 const unit=at.unit==='times'?(target===1?'vez':'veces'):(target===1?'día':'días');
 const period=at.period==='week'?'esta semana':at.period==='month'?'este mes':'hoy';
 const partial=start>historical.start;
 return {...historical,done,target,percent:Math.min(100,Math.round(100*done/target)),extra:Math.max(0,done-target),label:`${done} de ${target} ${unit} ${period}${partial?' · desde '+start.slice(8)+'/'+start.slice(5,7):''}`};
}

export function hasHabitHistory(rows:RecordItem[],key:string){
 return rows.some(r=>(r.kind==='checks'&&Object.hasOwn(r.data,key))||(r.kind==='habit_review'&&r.data.habitKey===key));
}
