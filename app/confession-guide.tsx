import {SymbolProgress} from './symbol-progress';
import {useState} from 'react';
import {BookOpen,ChevronLeft,ChevronRight,X} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogTrigger,DialogClose} from '@/components/ui/dialog';
// Navigation state only: no answers, record identifiers, telemetry or completion writes.
const questions=[
 '¿Qué lugar doy a Dios en mi vida?',
 '¿Cómo he tratado a mi familia y a quienes me rodean?',
 '¿He herido a alguien con mis acciones o mi enojo?',
 '¿He sido fiel y respetuoso en mis relaciones?',
 '¿He mentido, tomado lo ajeno o actuado con codicia?',
 '¿Cómo he respondido a quien necesitaba mi ayuda?',
];
export function ConfessionGuide({symbol='tree',image}:{symbol?:string;image?:string}){
 const [step,setStep]=useState(0);const [open,setOpen]=useState(false);
 return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><button className="prayer-entry"><BookOpen size={28}/><strong>Prepararme para la confesión</strong><span>Una pregunta a la vez</span><ChevronRight size={20}/></button></DialogTrigger><DialogContent className="editor-dialog contemplation-dialog" showCloseButton={false}>
 <div className="contemplation-top"><DialogTitle>Examen de conciencia</DialogTitle><DialogClose asChild><button className="icon-button" aria-label="Cerrar preparación"><X size={22}/></button></DialogClose></div>
 <DialogDescription className="sr-only">Examen de conciencia guiado</DialogDescription>
 <div className="contemplation-step" aria-live="polite" aria-atomic="true">
 {step===0?<><p className="eyebrow">ANTES DE EMPEZAR</p><h2>Un momento de silencio</h2><p>Pedile a Dios luz para reconocer lo que necesitás cambiar.</p></>:step<=6?<><SymbolProgress value={step-1} total={6} symbol={symbol} image={image} label="Preguntas recorridas"/><p className="eyebrow">PREGUNTA {step} DE 6</p><h2>{questions[step-1]}</h2><p>Tomate el tiempo que necesités.</p></>:<><SymbolProgress value={6} total={6} symbol={symbol} image={image}/><h2>Terminaste este examen</h2><p>Podés llevar lo que reflexionaste a la confesión.</p></>}
 </div>
 <div className="guided-actions">{step>0&&<button className="text-button" onClick={()=>setStep(step-1)}><ChevronLeft size={18}/>Atrás</button>}{step<7?<button className="primary" onClick={()=>setStep(step+1)}>{step===0?'Comenzar':'Siguiente'}<ChevronRight size={18}/></button>:<button className="primary" onClick={()=>{setOpen(false);setStep(0);}}>Finalizar</button>}</div>
 <details className="reading-source"><summary>Orientación y fuentes</summary><p>Preguntas de apoyo elaboradas para Alianza a partir del <a href="https://www.vatican.va/archive/catechism_sp/p3s2_sp.html" target="_blank" rel="noreferrer">Catecismo, 2052–2055</a>.</p><p><a href="https://www.vatican.va/archive/catechism_sp/p2s2c2a4_sp.html" target="_blank" rel="noreferrer">Catecismo, 1451–1460 · Contrición, examen, confesión y reparación</a>.</p><p>Terminar la guía no marca la confesión. Registrá en tu horario el examen o la confesión efectivamente realizados.</p></details>
 </DialogContent></Dialog>;
}
