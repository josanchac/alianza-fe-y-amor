import type {RecordItem} from '@/lib/domain';
import {monthBefore,monthLabel} from '@/lib/schedule';

type Props={own:RecordItem[];month:string;busy:boolean;onMonth:(month:string)=>void;onReview:()=>void;onPrepare:()=>void;onPlan:()=>void;edit:(kind:string,key:string,title:string,fallback:any)=>void};

/** Current-month entry only. Purpose editing and the atomic commitment-plan editor have separate entry actions. */
export function CurrentMonthHome({own,month,busy,onMonth,onReview,onPrepare,onPlan,edit}:Props){
 const purpose=own.find(r=>r.kind==='purpose'&&r.key===month);
 const previous=monthBefore(month);
 const previousPurpose=own.find(r=>r.kind==='purpose'&&r.key===previous);
 const previousReview=own.find(r=>r.kind==='purpose'&&r.key===previous)?.data.review;
 // A saved blank review is still a deliberate save; don't demand written answers.
 const hasPreviousActivity=own.some(r=>r.kind==='purpose'&&r.key===previous||r.kind==='checks'&&r.key.startsWith(previous)||r.kind==='journal'&&r.key.startsWith(previous));
 const habits=own.filter(r=>r.kind==='habit'&&!r.key.startsWith('rosary-once:'));
 return <section className="f4-month-home">
  <label className="month-control">Mi mes<input aria-label="Mi mes" type="month" value={month} max={month} onChange={e=>{if(e.target.value)onMonth(e.target.value);}}/></label>
  <div className="s3-row"><h2>Preparar {monthLabel(month)}</h2><span className="status-label">Mes actual</span></div>
  {hasPreviousActivity&&!previousReview?.trim()&&<section className="card"><h3>{monthLabel(previous)} quedó sin revisar</h3><p>Podés retomarlo cuando quieras, sin detener este mes.</p><button onClick={()=>onMonth(previous)}>Revisar {monthLabel(previous)}</button></section>}
  <section className="card"><h3>Mi propósito</h3><p className="preserve">{purpose?.data.text||'¿Qué quiero cuidar este mes?'}</p><button disabled={busy} onClick={()=>edit('purpose',month,'Mi propósito',{text:'',review:''})}>{purpose?.data.text?'Editar mi propósito':'Definir mi propósito'}</button>{!purpose?.data.text&&previousPurpose?.data.text&&<button disabled={busy} onClick={()=>edit('purpose',month,'Continuar mi propósito',{text:previousPurpose.data.text,review:purpose?.data.review??''})}>Retomar el propósito anterior</button>}</section>
  <section className="card"><h3>Mis compromisos</h3><p className="muted">Los ajustes se aplican desde hoy. Los registros anteriores se conservan.</p>
   {!habits.length&&<p>Todavía no tenés compromisos.</p>}
   {habits.length>0&&<p>{habits.filter(h=>h.data.active).length} en mi horario{habits.some(h=>!h.data.active)&&<> · {habits.filter(h=>!h.data.active).length} en pausa</>}</p>}
   <button disabled={busy} onClick={onPlan}>Elegir y ajustar compromisos</button>
  </section>
  <div className="s3-actions"><button onClick={onReview}>Reflexionar sobre este mes</button><button onClick={onPrepare}>Preparar el siguiente mes</button></div>
  <button onClick={()=>onMonth(previous)}>Revisar {monthLabel(previous)}</button>
 </section>;
}
