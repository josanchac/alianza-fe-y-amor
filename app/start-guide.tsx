import {CircleHelp, Plus, ArrowRight, LockKeyhole} from 'lucide-react';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import {suggestedHabits, type Habit} from '@/lib/domain';

export function StartCard({role,onCreate,onCouple}:{role:string;onCreate:(habit?:Habit)=>void;onCouple:()=>void}){
 return <section className="card start-card">
  <p className="eyebrow">A TU RITMO</p>
  <h2>Empezá con algo pequeño.</h2>
  <p>Tu horario está vacío. Elegí un solo compromiso que tenga sentido para vos; podés añadir más cuando quieras.</p>
  <button className="primary" onClick={()=>onCreate()}><Plus size={18}/>Crear mi primer compromiso</button>
  <details className="optional-details"><summary>Necesito una idea para empezar</summary><p>Elegí una idea, adaptala y guardala solo si la querés en tu horario.</p><div className="idea-list">{suggestedHabits(role).map(h=><button className="idea-button" key={h.title} onClick={()=>onCreate(h)}><span>{h.title}</span><ArrowRight size={18}/></button>)}</div></details>
  <button className="text-button" onClick={onCouple}>Prefiero empezar con las 4 Rs <ArrowRight size={16}/></button>
  <p className="start-private"><LockKeyhole size={15}/> Tu horario es personal. Vos decidís si lo compartís.</p>
 </section>;
}

export function QuickHelp({open,onOpenChange,onNavigate}:{open:boolean;onOpenChange:(open:boolean)=>void;onNavigate:(tab:string)=>void}){
 const go=(tab:string)=>{onOpenChange(false);onNavigate(tab);};
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="editor-dialog help-dialog" showCloseButton={false}>
  <CircleHelp className="gold-icon" size={28}/><DialogTitle className="dialog-title">Una guía a mano</DialogTitle>
  <DialogDescription>No hay que llenarlo todo. Usá lo que te ayude, a tu ritmo.</DialogDescription>
  <details open><summary>¿Por dónde empiezo?</summary><p>En «Hoy», creá un compromiso y elegí en qué momento del día querés vivirlo. Cuando lo hagás, tocá su casilla. Con eso basta para empezar.</p><button className="text-button" onClick={()=>go('today')}>Ir a mi horario</button></details>
  <details><summary>¿Qué son el horario y el propósito?</summary><p>El horario espiritual reúne pequeños compromisos para vivir tu ideal. El propósito particular es un aspecto concreto que querés cultivar este mes. Podés añadirlo más adelante desde «Mi propósito y mi reflexión».</p></details>
  <details><summary>¿Cómo usamos las 4 Rs?</summary><p>Rezar: un momento diario ante Dios. Reencantar: un encuentro semanal para disfrutar juntos. Revisar: mirar la vida del mes. Renovar: renovar la entrega cada año.</p><p>Elegí una R para preparar o registrar un encuentro. La fecha, las preguntas y las notas ayudan; no hace falta llenar cada campo. Lo que guarden aquí es compartido entre ustedes.</p><button className="text-button" onClick={()=>go('couple')}>Ir a las 4 Rs</button></details>
  <details><summary>¿Y si un día no lo hago?</summary><p>Podés dejarlo sin marcar. En los tres puntos del compromiso también están «Me costó» y «Hoy no aplicaba». Una casilla vacía no se cuenta como un incumplimiento.</p><p>Si necesitás menos compromisos, abrí sus tres puntos → Editar → Más opciones y apagá «Incluir en mi horario». El historial se conserva.</p></details>
  <details><summary>¿Quién puede ver lo que escribo?</summary><p>Tu horario y tus reflexiones son privados dentro de la app. En «Ajustes» podés dar o quitar visibilidad a tu cónyuge. Las 4 Rs pertenecen al espacio compartido. Allí también se explica el alcance de la privacidad.</p><button className="text-button" onClick={()=>go('settings')}>Revisar mi privacidad</button></details>
  <details><summary>¿Dónde veo mi avance?</summary><p>En «Camino» podés revisar semanas, meses, años o un período elegido y compararlos. Los resúmenes se forman con sus registros; no tenés que volver a escribirlos.</p><button className="text-button" onClick={()=>go('journey')}>Mirar mi camino</button></details>
  <details><summary>¿Cómo pongo recordatorios?</summary><p>En «Ajustes», elegí una hora y tocá «Añadir al calendario». Abrí el archivo y confirmá que se agregue al calendario del celular. Los avisos son opcionales y dependen de ese calendario.</p></details>
  <details><summary>¿Cómo vuelvo a entrar?</summary><p>Guardá la dirección de Alianza. Tu usuario es tu correo electrónico y la contraseña es la que elegiste. El enlace privado solo se usa una vez para establecerla.</p><p>Si olvidás la contraseña y no podés entrar, pedí un enlace nuevo al administrador. La recuperación automática por correo todavía no está habilitada.</p></details>
  <button className="primary" onClick={()=>onOpenChange(false)}>Entendido, volver</button>
 </DialogContent></Dialog>;
}
