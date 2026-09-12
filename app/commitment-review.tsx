import type {RecordItem} from '@/lib/domain';
import {assessmentLabels,nextStepLabels,commitmentReviewKey,type CommitmentReview} from '@/lib/commitment-review';
type Edit=(kind:string,key:string,title:string,data:any)=>void;
export function CommitmentReviewFields({data,today,field}:{data:CommitmentReview;today:string;field:(key:string,value:string)=>void}){
 const open=data.end>=today;
 return <><p>{data.period==='week'?'Semana':'Mes'} · {data.start} — {data.end}</p><p className="form-hint">Esta nota y tu valoración son privadas. No se comparten con tu cónyuge ni aparecen en la actividad del administrador.</p>
 <label>Qué me ayudó, qué me costó o qué quiero recordar<textarea rows={4} maxLength={4000} value={data.note} onChange={e=>field('note',e.target.value)}/></label>
 {open?<p>El período sigue en curso. Podés guardar notas y hacer tu valoración cuando termine.</p>:<><label>Mi valoración de este período<select value={data.assessment} onChange={e=>field('assessment',e.target.value)}>{Object.entries(assessmentLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><p className="form-hint">Podés valorar lo vivido aunque falten marcas. Tu valoración no agrega días ni cambia los recuentos.</p>
 <details className="optional-details"><summary>Decidir mi próximo paso (opcional)</summary><label>Qué quiero hacer después<select value={data.nextStep} onChange={e=>field('nextStep',e.target.value)}>{Object.entries(nextStepLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><p>Vos decidís cuándo estás listo. No se agrega ni modifica ningún compromiso al guardar esta elección.</p></details></>}
 </>;
}
export function CommitmentReviewSummary({own,draft,habit,today,edit,explore}:{own:RecordItem[];draft:CommitmentReview;habit:RecordItem;today:string;edit:Edit;explore:()=>void}){
 const key=commitmentReviewKey(draft),saved=own.find(r=>r.kind==='habit_review'&&r.key===key)?.data as CommitmentReview|undefined;
 return <div className="commitment-review"><p>{draft.period==='week'?'Semana':'Mes'} · {draft.start} — {draft.end}</p>
 {saved&&<><p className="preserve">{saved.note}</p><p>{assessmentLabels[saved.assessment]}</p>{saved.end<today&&saved.nextStep!=='keep'&&<><p>{nextStepLabels[saved.nextStep]}</p>{saved.nextStep==='explore'?<button className="text-button" onClick={explore}>Explorar un próximo paso</button>:<button className="text-button" onClick={()=>edit('habit',habit.key,'Editar compromiso',habit.data)}>Ajustar este compromiso</button>}</>}</>}
 <button className="text-button" onClick={()=>edit('habit_review',key,'Revisar: '+habit.data.title,draft)}>{saved?'Editar mi nota y valoración':'Anotar o valorar este período'}</button>
 </div>;
}
