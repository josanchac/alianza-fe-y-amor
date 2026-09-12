import type {RecordItem} from '@/lib/domain';
import {countsFor,monthBefore,monthLabel,periodsInMonth,progressLabel,wasActiveBetween} from '@/lib/schedule';
import {rangeFor} from '@/lib/reports';
type Edit=(kind:string,key:string,title:string,fallback:any)=>void;
export function MonthReview({own,month,today,onMonth,edit}:{own:RecordItem[];month:string;today:string;onMonth:(month:string)=>void;edit:Edit}){
 const previous=monthBefore(month),current=own.find(r=>r.kind==='purpose'&&r.key===month)?.data;
 const prior=own.find(r=>r.kind==='purpose'&&r.key===previous)?.data;
 const {start,end}=rangeFor('month',previous+'-01');
 const notes=own.filter(r=>r.kind==='journal'&&r.key>=start&&r.key<=end&&(r.data.gratitude||r.data.offering));
 return <div className="month-review"><label className="month-control">Mes que quiero preparar<input type="month" value={month} max={today.slice(0,7)} onChange={e=>{if(e.target.value&&e.target.value<=today.slice(0,7))onMonth(e.target.value);}}/></label>
 <section className="card"><p className="eyebrow">MIRAR EL MES ANTERIOR</p><h2>Revisar {monthLabel(previous)}</h2><p>Consultá lo que viviste y anotá qué te ayudó o te costó. Podés volver a esta revisión cuando lo necesités.</p><h3>El propósito que había anotado</h3><p className="preserve">{prior?.text||'No hay un propósito anotado para este mes.'}</p>{prior?.review&&<><h3>Mi revisión guardada</h3><p className="preserve">{prior.review}</p></>}
 <details className="optional-details"><summary>Ver mis compromisos y reflexiones de {monthLabel(previous)}</summary>
 {own.filter(r=>r.kind==='habit').map(h=>{const c=countsFor(own,h.key,start,end);const periods=periodsInMonth(own,h.key,previous,today);if(!c.done&&!c.missed&&!c.skip&&!periods.length&&!wasActiveBetween(own,h.key,start,end))return null;return <div className="review-row" key={h.key}><div><h3>{h.data.title}{h.data.active?'':' · en pausa'}</h3><p>{c.done} días vividos · {c.missed} me costó · {c.skip} no aplicaba</p>{periods.map(p=><p key={p.start+':'+p.end}>{p.start} — {p.end}: {progressLabel(p)}</p>)}</div></div>;})}
 <p className="form-hint">Las semanas van de lunes a domingo y se muestran completas aunque crucen de mes. Cada día cuenta una vez; los días adicionales no compensan otro período. La ausencia de registro no indica incumplimiento.</p>
 {notes.length===0?<p>Sin reflexiones diarias guardadas en ese mes.</p>:notes.sort((a,b)=>a.key.localeCompare(b.key)).map(n=><details key={n.key}><summary>{n.key}</summary><p className="preserve">{n.data.gratitude}</p><p className="preserve">{n.data.offering}</p></details>)}
 </details><button className="soft-button" onClick={()=>edit('purpose',previous,'Mi revisión de '+monthLabel(previous),{text:'',review:''})}>Revisar el mes anterior</button></section>
 <section className="card"><p className="eyebrow">PREPARAR ESTE MES</p><h2>Mi propósito de {monthLabel(month)}</h2><p>Podés mantener el propósito que venís trabajando o elegir otro. Vos decidís qué guardar.</p><p className="preserve">{current?.text||'Todavía no anotaste tu propósito para este mes.'}</p><button className="primary" onClick={()=>edit('purpose',month,'Mi propósito de '+monthLabel(month),{text:'',review:''})}>{current?.text?'Editar mi propósito':'Anotar mi propósito'}</button>{!current?.text&&prior?.text&&<button className="text-button" onClick={()=>edit('purpose',month,'Continuar mi propósito',{text:prior.text,review:current?.review||''})}>Usar el propósito anterior como borrador</button>}</section>
 </div>;
}
