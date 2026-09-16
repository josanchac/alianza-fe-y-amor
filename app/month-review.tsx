import {ReflectionSummary} from './reflection-summary';
import type {RecordItem} from '@/lib/domain';
import {countsFor,monthBefore,monthLabel,frequencyLabel} from '@/lib/schedule';
import {CommitmentReviewSummary} from './commitment-review';
import {reviewDraft,weeklyReviews} from '@/lib/commitment-review';
import {rangeFor} from '@/lib/reports';
import {SymbolProgress} from './symbol-progress';
import {commitmentTotals} from '@/lib/commitment-totals';
type Edit=(kind:string,key:string,title:string,fallback:any)=>void;
export function MonthReview({own,month,today,onMonth,edit,explore}:{own:RecordItem[];month:string;today:string;onMonth:(month:string)=>void;edit:Edit;explore:()=>void}){
 const current=own.find(r=>r.kind==='purpose'&&r.key===month)?.data,prior=own.find(r=>r.kind==='purpose'&&r.key===monthBefore(month))?.data;
 const {start,end:rawEnd}=rangeFor('month',month+'-01'),end=rawEnd>today?today:rawEnd;
 const appearance=own.find(r=>r.kind==='appearance')?.data;
 return <div className="month-review"><label className="month-control">Mi mes<input type="month" value={month} max={today.slice(0,7)} onChange={e=>{if(e.target.value)onMonth(e.target.value);}}/></label>
 <section className="card month-purpose"><p className="eyebrow">MI PROPÓSITO</p><h2>{monthLabel(month)}</h2>{current?.text&&<p className="preserve">{current.text}</p>}<button className="primary" onClick={()=>edit('purpose',month,'Mi propósito de '+monthLabel(month),{text:'',review:''})}>{current?.text?'Editar mi propósito':'Anotar mi propósito'}</button>{!current?.text&&prior?.text&&<button className="text-button" onClick={()=>edit('purpose',month,'Continuar mi propósito',{text:prior.text,review:current?.review||''})}>Retomar el propósito anterior</button>}{current?.review&&<p className="preserve">{current.review}</p>}</section>
 <h2>Mis compromisos</h2><div className="month-habits">{own.filter(h=>h.kind==='habit').map(h=>{const c=countsFor(own,h.key,start,end),total=commitmentTotals(own,h.key,start,end,today);return <section className="card month-habit" key={h.key}><div className="month-habit-header">{total.target!==null&&total.target>0&&<SymbolProgress value={c.done} total={total.target} symbol={appearance?.symbol} image={appearance?.image}/>}<div><h3>{h.data.title}</h3><p className="muted">{frequencyLabel(h.data.frequency)}</p><p>{c.done?`${c.done} registros${total.target!==null?' de '+total.target+' previstos':''}`:'Sin registros este mes'}</p></div></div><CommitmentReviewSummary own={own} draft={reviewDraft(own,h.key,start,'month')} habit={h} today={today} edit={edit} explore={explore}/>{weeklyReviews(own,h.key,month,today).map(({draft})=><CommitmentReviewSummary key={draft.start} own={own} draft={draft} habit={h} today={today} edit={edit} explore={explore}/>)}</section>;})}</div>
 <ReflectionSummary rows={own} start={start} end={end}/>
 <button className="text-button" onClick={()=>onMonth(monthBefore(month))}>Revisar {monthLabel(monthBefore(month))}</button></div>;
}
