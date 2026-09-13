import {ArrowRight,Sun,Heart,Sprout} from 'lucide-react';
export type Focus='schedule'|'rs'|'ideal';
export const RELEASE='community-2026-09';
const options:[Focus,string,string][]=[['schedule','Cuidar un compromiso','Un paso concreto.'],['rs','Vivir las 4 Rs','Un momento juntos.'],['ideal','Escribir mi ideal personal','Mi frase, cuando esté listo.']];
export function Home({focus,choosing,existing,busy,linked=false,onChoose,onContinue,onChange,onExplore}:{focus:Focus;choosing:boolean;existing:boolean;busy:boolean;linked?:boolean;onChoose:(f:Focus)=>void;onContinue:()=>void;onChange:()=>void;onExplore:()=>void}){
 return <><div className="page-heading"><div><p className="eyebrow">A TU RITMO</p><h1>{choosing?'¿Qué te ayudaría hoy?':'Tu espacio para continuar'}</h1></div></div><p className="intro">Un solo paso es suficiente.</p>
 {choosing?<div className="home-options">{options.filter(o=>o[0]!=='rs'||linked).map(([id,title,description])=><button key={id} className="card home-option" disabled={busy} onClick={()=>onChoose(id)}><strong>{title}</strong><span>{description}</span><ArrowRight size={20}/></button>)}</div>:<section className="card"><h2>{options.find(x=>x[0]===focus)?.[1]}</h2><button className="primary" onClick={onContinue}>Continuar <ArrowRight size={18}/></button><button className="text-button" onClick={onChange}>Elegir otro comienzo</button></section>}
 {choosing&&<button className="text-button" onClick={onExplore}>Explorar mi horario sin elegir todavía</button>}
 </>;
}
export function ReleaseNotes({onDismiss,busy}:{onDismiss?:()=>void;busy?:boolean}){return <section className="card release-note"><h2>Más caminos para vivir la alianza</h2><p>Tus registros siguen guardados.</p><details className="optional-details"><summary>Ver novedades</summary><ul className="brief-list"><li>Rosarios personales, de pareja y de grupo.</li><li>Propósitos y encuentros del curso.</li><li>Mi camino para retomar el ideal a tu ritmo.</li></ul></details>{onDismiss&&<button className="soft-button" disabled={busy} onClick={onDismiss}>Entendido</button>}</section>;}
