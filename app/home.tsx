import {ArrowRight} from 'lucide-react';
export type Focus='schedule'|'rs'|'ideal';
export const RELEASE='journey-2026-09';
const options:[Focus,string,string][]=[['schedule','Cuidar un compromiso','Elegí un punto para tu horario y decidí su frecuencia.'],['rs','Vivir las 4 Rs','Prepará un momento en el espacio matrimonial.'],['ideal','Escribir mi ideal personal','Anotá tu propia frase. También podés dejarla pendiente.']];
export function Home({focus,choosing,existing,busy,onChoose,onContinue,onChange,onExplore}:{focus:Focus;choosing:boolean;existing:boolean;busy:boolean;onChoose:(f:Focus)=>void;onContinue:()=>void;onChange:()=>void;onExplore:()=>void}){
 return <><div className="page-heading"><div><p className="eyebrow">A TU RITMO</p><h1>{choosing?'¿Qué te ayudaría hoy?':'Tu espacio para continuar'}</h1></div></div><p className="intro">Elegí lo que más sentido tenga para vos. No necesitás completar todas las secciones.</p>
 {choosing?<div className="home-options">{options.map(([id,title,description])=><button key={id} className="card home-option" disabled={busy} onClick={()=>onChoose(id)}><strong>{title}</strong><span>{description}</span><ArrowRight size={20}/></button>)}</div>:<section className="card"><h2>{options.find(x=>x[0]===focus)?.[1]}</h2><p>Retomá lo que elegiste; podés cambiar tu comienzo cuando quieras.</p><button className="primary" onClick={onContinue}>Continuar <ArrowRight size={18}/></button><button className="text-button" onClick={onChange}>Elegir otro comienzo</button></section>}
 {choosing&&<button className="text-button" onClick={onExplore}>Explorar mi horario sin elegir todavía</button>}
 {existing&&<p className="form-hint">Tus registros siguen en Horario. Las 4 Rs conservan su espacio matrimonial.</p>}
 </>;
}
export function ReleaseNotes({onDismiss,busy}:{onDismiss?:()=>void;busy?:boolean}){return <details className="card optional-details"><summary>Qué cambió en Alianza</summary><p>Inicio te permite elegir qué querés cuidar. En Horario encontrás Mi día, Mi mes e Historial.</p><p>Mi mes reúne la revisión del mes anterior y el propósito del actual. Ahora podés elegir metas en días por semana o por mes. Tus registros anteriores se conservan.</p>{onDismiss&&<button className="text-button" disabled={busy} onClick={onDismiss}>Entendido</button>}</details>;}
