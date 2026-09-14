import type {RecordItem} from './domain';
import {plansFor,planAt,countsFor} from './schedule';
import {rangeFor,shift} from './reports';
// A weekly/monthly quota is only summed for complete, uniform periods.
// A missing plan is unknown, never reconstructed from today's frequency.
export function commitmentTotals(rows:RecordItem[],key:string,start:string,end:string,today:string){
 const last=end<today?end:today,plans=plansFor(rows,key),seen=new Set<string>();let target=0,unknown=false;
 for(let day=start;day<=last;day=shift(day,1)){
  const p=planAt(plans,day);if(!p){unknown=true;continue;}if(!p.active)continue;
  if(p.period==='day'){if(rows.find(r=>r.kind==='checks'&&r.key===day)?.data[key]!=='skip')target+=p.target;continue;}
  const range=rangeFor(p.period,day),id=range.start+':'+range.end;if(seen.has(id))continue;seen.add(id);
  if(range.start<start||range.end>last){unknown=true;continue;}
  let valid=true;for(let d=range.start;d<=range.end;d=shift(d,1)){const q=planAt(plans,d);if(!q?.active||q.period!==p.period||q.target!==p.target)valid=false;}
  if(valid)target+=p.target;else unknown=true;
 }
 return {...countsFor(rows,key,start,last),target:unknown?null:target,knownTarget:target,partial:unknown};
}
