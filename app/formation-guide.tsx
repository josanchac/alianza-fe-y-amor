import {useState} from 'react';
import {R_TYPES} from '@/lib/domain';

export const formationSources = {
 rs: 'https://ramadefamilias.cl/web2025/wp-content/uploads/2025/08/Las-4R.pdf',
 schedule: 'https://ramadefamilias.cl/web2025/wp-content/uploads/2025/10/R9.-Vivir-segun-Nuestro-Ideal.pdf',
 marriage: 'https://ramadefamilias.cl/web2025/wp-content/uploads/2025/10/R8.-Descubriendo-Nuestro-Nombre-nuestro-Ideal-Matrimonial.pdf',
};

export function FormationSource({topic}:{topic:keyof typeof formationSources}){
 const label={rs:'Las cuatro R · pp. 1–5',schedule:'Vivir según nuestro Ideal · pp. 3–5',marriage:'Descubriendo nuestro Ideal Matrimonial · pp. 1–4'}[topic];
 return <p className="form-hint"><a href={formationSources[topic]} target="_blank" rel="noreferrer">{label} (PDF)</a><br/>Rama de Familias de Schoenstatt, Chile.</p>;
}

export function ScheduleGuide(){return <details className="optional-details"><summary>Repasar el sentido del horario espiritual</summary><p>El horario espiritual ayuda a llevar el ideal a la vida mediante actos concretos y su revisión personal. Se prepara según la originalidad de cada persona, también cuando se trabaja un ideal matrimonial.</p><p>En la alianza con María, este esfuerzo se ofrece como contribución al Capital de Gracias. Abarca la relación con Dios, con los demás, con el trabajo y con uno mismo.</p><p>Podés repasar la fuente y conversar tus puntos con quien te acompaña espiritualmente.</p><FormationSource topic="schedule"/><p className="form-hint"><a href="https://schoenstatt.org.br/faca-um-planejamento-espiritual/" target="_blank" rel="noreferrer">Horario espiritual · Schoenstatt Brasil (portugués)</a></p></details>;}

export function PurposeGuide({onUse}:{onUse?:(text:string)=>void}){
 const [step,setStep]=useState(-1),[answers,setAnswers]=useState(['','','']);const questions=['¿Qué actitud querés cultivar?','¿Para qué querés trabajarla?','¿Qué acción concreta vas a practicar?'];
 if(step<0)return <button type="button" className="soft-button" onClick={()=>setStep(0)}>Ayudame a formularlo</button>;
 return <section className="purpose-helper"><p className="eyebrow">{step+1} DE 3</p><label>{questions[step]}<textarea rows={2} maxLength={300} value={answers[step]} onChange={e=>setAnswers(a=>a.map((v,i)=>i===step?e.target.value:v))}/></label><div className="guided-actions"><button type="button" className="text-button" onClick={()=>setStep(step-1)}>Atrás</button>{step<2?<button type="button" className="soft-button" onClick={()=>setStep(step+1)}>Siguiente</button>:<button type="button" className="soft-button" onClick={()=>{onUse?.(answers.filter(Boolean).join('. '));setStep(-1);}}>Usar como borrador</button>}</div><FormationSource topic="schedule"/></section>;
}

export function PersonalIdealGuide(){return <section><h3>Podés ir descubriéndolo</h3><p>Anotá lo que reconocés en tu vida y conversalo con quien te acompaña.</p><p>No hace falta tener una frase para usar Alianza.</p></section>;}

export function RsGuide(){return <><ul className="brief-list">{R_TYPES.map(r=><li key={r.id}><strong>{r.title} · {r.rhythm}</strong><span>{r.description}</span></li>)}</ul><FormationSource topic="rs"/></>;}

export function MarriageIdealGuide(){return <details className="optional-details"><summary>¿Y si todavía no tenemos ideal matrimonial?</summary><p>No necesitan inventar una frase para poder comenzar a usar la app. Pueden dejar su ideal pendiente y buscar acompañamiento en el Movimiento.</p><p>El material de la Rama de Familias sitúa su formulación dentro de un proceso previo: reconocer la historia del matrimonio y escuchar las voces del tiempo, del ser y del alma. Propone recoger ese trabajo con el apoyo del asesor.</p><p>Esta explicación orienta la consulta; no reemplaza ese proceso formativo.</p><FormationSource topic="marriage"/></details>;}
