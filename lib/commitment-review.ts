import type {RecordItem} from './domain';
import {rangeFor} from './reports';
import {planAt,plansFor,periodsInMonth,type PeriodProgress} from './schedule';
export type CommitmentReview={habitKey:string;period:'week'|'month';start:string;end:string;note:string;assessment:'unsure'|'met'|'not-met';nextStep:'keep'|'adjust'|'explore'};
export const assessmentLabels={'unsure':'Prefiero dejarlo sin valorar','met':'Según mi revisión, lo cumplí','not-met':'Según mi revisión, no lo cumplí'};
export const nextStepLabels={'keep':'Continuar con lo que estoy cuidando','adjust':'Quiero ajustar este compromiso','explore':'Me siento listo para explorar otra práctica'};
export function commitmentReviewKey(d:Pick<CommitmentReview,'habitKey'|'start'|'end'>){return `${d.habitKey}:${d.start}:${d.end}`;}
export function reviewDraft(rows:RecordItem[],habitKey:string,date:string,period?:'week'|'month'):CommitmentReview{
 const cadence=period??(planAt(plansFor(rows,habitKey),date)?.period==='week'?'week':'month');
 const {start,end}=rangeFor(cadence,date);
 return {habitKey,period:cadence,start,end,note:'',assessment:'unsure',nextStep:'keep'};
}
export function weeklyReviews(rows:RecordItem[],habitKey:string,month:string,today:string){
 const {start,end}=rangeFor('month',month+'-01');
 const entries=new Map<string,{draft:CommitmentReview;progress?:PeriodProgress}>();
 for(const p of periodsInMonth(rows,habitKey,month,today)){
  const draft=reviewDraft(rows,habitKey,p.start,'week');
  if(draft.start===p.start&&draft.end===p.end)entries.set(commitmentReviewKey(draft),{draft,progress:p});
 }
 // A frequency change or pause must not hide a previously saved weekly note.
 for(const r of rows)if(r.kind==='habit_review'&&r.data.habitKey===habitKey&&r.data.period==='week'&&r.data.start<=end&&r.data.end>=start){
  const draft=r.data as CommitmentReview;if(!entries.has(r.key))entries.set(r.key,{draft});
 }
 return [...entries.values()].sort((a,b)=>a.draft.start.localeCompare(b.draft.start));
}
