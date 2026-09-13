import {CircleHelp, Plus, ArrowRight, LockKeyhole} from 'lucide-react';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import {ScheduleGuide, RsGuide, MarriageIdealGuide} from './formation-guide';
import {ConfessionGuide} from './confession-guide';
import {suggestedHabits, type Habit} from '@/lib/domain';

export function StartCard({role,onCreate,onCouple,linked=false}:{role:string;linked?:boolean;onCreate:(habit?:Habit)=>void;onCouple:()=>void}){
 return <section className="card start-card">

  <h2>Tu primer compromiso</h2>
  <p>Un acto concreto que quieras llevar a tu día. Podés empezar sin tener un ideal definido.</p>
  <button className="primary" onClick={()=>onCreate()}><Plus size={18}/>Crear mi primer compromiso</button>
  <details className="optional-details"><summary>Necesito una idea para empezar</summary><p>Son ejemplos de la app para redactar un acto concreto, no puntos obligatorios. Adaptá y guardá solo el que elijás.</p><p className="form-hint"><a href="https://schoenstatt.org.br/faca-um-planejamento-espiritual/" target="_blank" rel="noreferrer">Consultar la orientación del Movimiento de Schoenstatt Brasil (portugués)</a></p><div className="idea-list">{suggestedHabits(role).map(h=><button className="idea-button" key={h.title} onClick={()=>onCreate(h)}><span>{h.title}</span><ArrowRight size={18}/></button>)}</div></details>
  {linked&&<button className="text-button" onClick={onCouple}>Prefiero empezar con las 4 Rs <ArrowRight size={16}/></button>}
  <p className="start-private"><LockKeyhole size={15}/> Tu horario es personal. Vos decidís si lo compartís.</p>
 </section>;
}

export function QuickHelp({open,onOpenChange,onNavigate,onInstall,linked=false}:{open:boolean;linked?:boolean;onOpenChange:(open:boolean)=>void;onNavigate:(tab:string)=>void;onInstall:()=>void}){
 const go=(tab:string)=>{onOpenChange(false);onNavigate(tab);};
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="editor-dialog help-dialog" showCloseButton={false}>
  <CircleHelp className="gold-icon" size={28}/><DialogTitle className="dialog-title">¿Qué necesitás hacer?</DialogTitle>
  <DialogDescription>Elegí una tarea para ir directamente a ella.</DialogDescription>
  <div className="help-tasks"><button className="app-menu-row" onClick={()=>go('today')}>Registrar un compromiso<ArrowRight size={18}/></button><button className="app-menu-row" onClick={()=>go('prayer')}>Rezar o preparar mi confesión<ArrowRight size={18}/></button><button className="app-menu-row" onClick={()=>go('path')}>Trabajar mi ideal personal<ArrowRight size={18}/></button>{linked&&<button className="app-menu-row" onClick={()=>go('couple')}>Vivir las 4 Rs en pareja<ArrowRight size={18}/></button>}<button className="app-menu-row" onClick={()=>go('journey')}>Consultar mis registros<ArrowRight size={18}/></button><button className="app-menu-row" onClick={()=>go('settings')}>Privacidad y preferencias<ArrowRight size={18}/></button><button className="app-menu-row" onClick={onInstall}>Instalar Alianza en mi teléfono<ArrowRight size={18}/></button></div>
  <details className="reading-source"><summary>Problemas para volver a entrar</summary><p>Tu usuario es tu correo y la contraseña es la que elegiste. Si la olvidás, pedí un enlace nuevo al administrador. La recuperación automática por correo todavía no está habilitada.</p></details>
  <button className="soft-button" onClick={()=>onOpenChange(false)}>Volver</button>
 </DialogContent></Dialog>;
}
