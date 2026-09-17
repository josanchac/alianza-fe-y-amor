import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ChevronLeft,ChevronRight,Cross,Pause,SlidersHorizontal} from 'lucide-react';
import {type Rosary,type CommunityAction,MYSTERIES} from '@/lib/community';
import {ROSARY_STEPS,DEFAULT_OPENING,prayerFor,nextPrayerStep,THREE_MARY_SOURCE,type RosaryOpening} from '@/lib/rosary-guide';
import {LITANY,LITANY_SOURCE} from '@/lib/rosary-litany';
import {localDate} from '@/lib/domain';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {usePrayerScreen} from './use-prayer-screen';
export function RosaryMap({step}:{step:number}){
 const current=ROSARY_STEPS[Math.min(step,ROSARY_STEPS.length-1)];
 return <svg className="rosary-map" viewBox="0 0 300 255" role="img" aria-label={step>=ROSARY_STEPS.length?'Rosario concluido':current.decade===0?'Oraciones iniciales':current.decade===6?'Oraciones finales':`Misterio ${current.decade} de 5`}>
 <ellipse cx="150" cy="100" rx="106" ry="76" fill="none" className="rosary-thread"/>
 {Array.from({length:50},(_,i)=>{const d=Math.floor(i/10)+1,b=i%10+1,angle=(90+(i+.5)*360/50)*Math.PI/180;const index=7+(d-1)*12+b;const done=step>index,active=current.decade===d&&current.bead===b;return <circle key={i} cx={150+106*Math.cos(angle)} cy={100+76*Math.sin(angle)} r={active?5.8:3.8} className={active?'bead-current':done?'bead-complete':'bead-pending'}/>;})}
 {Array.from({length:5},(_,i)=>{const a=(90+i*72)*Math.PI/180,idx=7+i*12;return <circle key={i} cx={150+106*Math.cos(a)} cy={100+76*Math.sin(a)} r="5" className={step===idx?'bead-current':step>idx?'bead-complete':'bead-pending'}/>;})}
 <path className="rosary-thread" d="M150 177v55m-9-7h18" fill="none"/>
 {[186,195,204].map((y,i)=><circle key={y} cx="150" cy={y} r="3" className={step>3+i?'bead-complete':'bead-pending'}/>)}
 <text x="150" y="96" textAnchor="middle">{step>=ROSARY_STEPS.length?'5 / 5':current.decade>0&&current.decade<6?`${current.decade} / 5`:current.decade===0?'Inicio':'Cierre'}</text>
 <text className="rosary-map-caption" x="150" y="120" textAnchor="middle">{current.decade>0&&current.decade<6?'misterio':'Mi rosario'}</text>
 </svg>;
}

function readLocal(key:string){try{return localStorage.getItem(key)||'';}catch{return '';}}
function writeLocal(key:string,value:string){try{localStorage.setItem(key,value);}catch{/* Optional device preference. */}}
function remembered(key:string){try{return sessionStorage.getItem(key)||'';}catch{return '';}}
export function PersonalRosary({r,act,busy,habits=[],checks={},onLinked}:{r:Rosary;act:CommunityAction;busy:boolean;habits?:{key:string;data:{title:string;active:boolean}}[];checks?:Record<string,string>;onLinked?:()=>void}){
 const resumeKey='alianza-rosary-open:'+r.ownerId,autoKey='alianza-rosary-auto:'+r.ownerId;
 const step=r.personalStep??(r.slots.filter(s=>s.done).length===5?ROSARY_STEPS.length:0),finished=step>=ROSARY_STEPS.length;
 const opening=r.opening??DEFAULT_OPENING,current=ROSARY_STEPS[Math.min(step,ROSARY_STEPS.length-1)],prayer=prayerFor(current,opening);
 const [active,setActive]=useState(()=>!r.cancelled&&!finished&&remembered(resumeKey)===r.id);
 const [expanded,setExpanded]=useState(false),[options,setOptions]=useState(false),[confirm,setConfirm]=useState<'pause'|'discard'|null>(null),[error,setError]=useState('');
 const [font,setFont]=useState(()=>Math.max(20,Math.min(32,Number(readLocal('alianza-prayer-font'))||24)));
 const [awake,setAwake]=useState(()=>readLocal('alianza-prayer-awake')!=='off');
 const [litany,setLitany]=useState<number|null>(null),[linked,setLinked]=useState(''),[automatic,setAutomatic]=useState(()=>readLocal(autoKey));
 const [draft,setDraft]=useState<RosaryOpening>(opening);
 const [saving,setSaving]=useState(false),[cooling,setCooling]=useState(false);
 const coolTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(coolTimer.current)clearTimeout(coolTimer.current);},[]);
 const sending=useRef(false),cooldown=useRef(0),autoOnFinish=useRef(false),body=useRef<HTMLDivElement>(null);
 const disabled=busy||saving||cooling;
 const wake=usePrayerScreen(active&&(!finished||litany!==null),awake);
 const today=localDate(),completedToday=finished&&r.mine.filter(m=>m.day===today).length===5;
 const candidates=habits.filter(h=>/rosario/i.test(h.data.title));
 const isMarked=(key:string)=>checks[key]==='done'||Number(checks[key])>0||linked===key;
 useEffect(()=>{if(step===0)setDraft(opening);},[r.opening,step]);
 useEffect(()=>{body.current?.scrollTo?.({top:0,behavior:'instant'});},[step,litany,confirm,options]);
 useEffect(()=>{if(active){try{sessionStorage.setItem(resumeKey,r.id);}catch{}}},[active,r.id,resumeKey]);
 useEffect(()=>{
  if(!active)return;
  // A browser Back gesture opens the same pause confirmation as the visible button.
  const marker='rosary:'+r.id;
  history.pushState({...history.state,alianzaPrayer:marker},'');
  const back=()=>{setConfirm('pause');history.pushState({...history.state,alianzaPrayer:marker},'');};
  const unloading=(e:BeforeUnloadEvent)=>{if(!finished){e.preventDefault();e.returnValue='';}};
  window.addEventListener('popstate',back);window.addEventListener('beforeunload',unloading);
  return()=>{window.removeEventListener('popstate',back);window.removeEventListener('beforeunload',unloading);if(history.state?.alianzaPrayer===marker)history.back();};
 },[active,r.id]); // One history entry for the whole prayer, including its closing.
 function close(){try{sessionStorage.removeItem(resumeKey);}catch{}setActive(false);setConfirm(null);setOptions(false);setLitany(null);}
 async function run(payload:Record<string,unknown>){if(sending.current)return false;sending.current=true;setSaving(true);setError('');try{await act(payload);return true;}catch(e){setError((e as Error).message);return false;}finally{sending.current=false;setSaving(false);}}
 async function move(direction:1|-1){
  if(disabled||Date.now()<cooldown.current)return;
  const next=nextPrayerStep(step,direction,opening);
  autoOnFinish.current=next===ROSARY_STEPS.length;
  if(await run({action:'rosary_step',id:r.id,step:next,version:r.progressVersion??0})){cooldown.current=Date.now()+350;setCooling(true);coolTimer.current=setTimeout(()=>setCooling(false),350);setExpanded(false);}else autoOnFinish.current=false;
 }
 async function link(key?:string){
  if(key&&isMarked(key))return;
  if(await run({action:'rosary_today',id:r.id,mode:key?'existing':'once',...(key?{habitKey:key}:{})})){setLinked(key||'rosary-once:'+today);onLinked?.();}
 }
 useEffect(()=>{
  if(!autoOnFinish.current||!completedToday||disabled)return;
  autoOnFinish.current=false;
  if(automatic&&candidates.some(h=>h.key===automatic)&&!isMarked(automatic))void link(automatic);
 },[finished,completedToday,disabled,automatic]);
 async function start(){
  if(step===0&&(draft.include!==opening.include||draft.mary!==opening.mary)){
   if(!await run({action:'rosary_opening',id:r.id,version:r.progressVersion??0,...draft}))return;
  }
  setActive(true);
 }
 function fontChange(delta:number){const size=Math.max(20,Math.min(32,font+delta));setFont(size);writeLocal('alianza-prayer-font',String(size));}
 function openLitany(){setLitany(0);setOptions(false);setActive(true);}
 const completion=<div className="rosary-completion"><h3>Rosario concluido</h3><p>Quedó registrado en tus rosarios.</p>{completedToday&&<section className="rosary-link"><h4>Mi compromiso de hoy</h4>{candidates.length?candidates.map(h=><div key={h.key}><button className="soft-button" disabled={disabled||isMarked(h.key)} onClick={()=>link(h.key)}>{isMarked(h.key)?'Ya está marcado':candidates.length===1?'Marcar mi compromiso':h.data.title}</button>{!h.key.startsWith('rosary-once:')&&<label className="prayer-toggle"><input type="checkbox" checked={automatic===h.key} onChange={e=>{const value=e.target.checked?h.key:'';setAutomatic(value);writeLocal(autoKey,value);}}/>Marcarlo automáticamente en mis próximos rosarios en este dispositivo</label>}</div>):<button className="soft-button" disabled={disabled||!!linked} onClick={()=>link()}>{linked?'Añadido a hoy':'Añadir solo por hoy'}</button>}</section>}<button className="soft-button" onClick={openLitany}>Rezar las letanías</button>{active&&<button className="primary" onClick={close}>Terminar</button>}</div>;
 if(r.cancelled)return null;
 return <section className="card personal-rosary"><p className="eyebrow">MI ROSARIO</p><h2>Misterios {MYSTERIES[r.mystery].name.toLowerCase()}</h2>{r.intention&&<p className="muted preserve">{r.intention}</p>}
 {!active&&<><RosaryMap step={step}/>{finished?completion:<>{step===0&&<div className="rosary-opening"><h3>Oraciones iniciales</h3><label className="prayer-toggle"><input type="checkbox" checked={draft.include} disabled={disabled} onChange={e=>setDraft({...draft,include:e.target.checked})}/>Un Padre nuestro y tres Avemarías</label>{draft.include&&<div className="prayer-choices" role="group" aria-label="Tres Avemarías"><button className="soft-button" aria-pressed={draft.mary==='standard'} onClick={()=>setDraft({...draft,mary:'standard'})}>Habituales</button><button className="soft-button" aria-pressed={draft.mary==='trinitarian'} onClick={()=>setDraft({...draft,mary:'trinitarian'})}>Hija, Madre y Esposa</button></div>}</div>}<button className="primary" disabled={disabled} onClick={start}><Cross size={22}/>{step?'Continuar rezando':'Empezar a rezar'}</button><button className="text-button" disabled={disabled} onClick={()=>setConfirm('discard')}>Descartar este rosario</button></>}{error&&<p role="alert" className="notice">{error}</p>}</>}
 <Dialog open={active||confirm==='discard'} onOpenChange={open=>{if(!open&&!disabled)setConfirm(active?'pause':null);}}>
 <DialogContent className="rosary-focus" showCloseButton={false} onPointerDownOutside={e=>e.preventDefault()} onInteractOutside={e=>e.preventDefault()} onEscapeKeyDown={e=>{e.preventDefault();if(!disabled)setConfirm(active?'pause':null);}} style={{'--prayer-size':font+'px'} as CSSProperties}>
 <header className="rosary-focus-header"><div><DialogTitle>Mi rosario</DialogTitle><DialogDescription>Misterios {MYSTERIES[r.mystery].name.toLowerCase()}</DialogDescription></div><button className="text-button" disabled={disabled} onClick={()=>finished&&litany===null?close():setConfirm('pause')}><Pause size={22}/>{finished&&litany===null?'Cerrar':'Pausar'}</button></header>
 <div className="rosary-focus-body" ref={body}>
 {confirm?<div className="prayer-confirm"><h3>{confirm==='discard'?'¿Descartar este rosario?':'¿Pausar el rosario?'}</h3><p>{confirm==='discard'?'Se quitará de tus rosarios pendientes. No se registrará como rezado.':'Tu avance está guardado. Podés continuar después.'}</p><button className="primary" disabled={disabled} onClick={()=>setConfirm(null)}>Seguir rezando</button><button className="soft-button" disabled={disabled} onClick={async()=>{if(confirm==='pause')close();else if(await run({action:'rosary_discard',id:r.id,version:r.progressVersion??0}))close();}}>{confirm==='discard'?'Sí, descartar':'Guardar y salir'}</button></div>
 :options?<div className="prayer-options"><h3>A mi manera</h3><div className="prayer-size-controls"><span>Tamaño de letra</span><button className="soft-button" aria-label="Reducir letra" disabled={font<=20} onClick={()=>fontChange(-2)}>A−</button><button className="soft-button" aria-label="Aumentar letra" disabled={font>=32} onClick={()=>fontChange(2)}>A+</button></div><label className="prayer-toggle"><input type="checkbox" checked={awake} onChange={e=>{setAwake(e.target.checked);writeLocal('alianza-prayer-awake',e.target.checked?'on':'off');}}/>Mantener la pantalla encendida</label>{awake&&<p className="muted">{wake==='on'?'Pantalla encendida durante el rezo.':'Si el teléfono lo permite, la pantalla permanecerá encendida.'}</p>}<p>{opening.include?'Un Padre nuestro y tres Avemarías al inicio.':'Sin el bloque inicial de Padre nuestro y tres Avemarías.'}</p>{opening.include&&<p>{opening.mary==='trinitarian'?'Hija del Padre, Madre del Hijo y Esposa del Espíritu Santo.':'Avemarías habituales.'}</p>}<button className="primary" onClick={()=>setOptions(false)}>Volver al rezo</button>{!finished&&<button className="text-button" disabled={disabled} onClick={()=>setConfirm('discard')}>Descartar este rosario</button>}<a className="quiet-source" href={THREE_MARY_SOURCE} target="_blank" rel="noreferrer">Oraciones · Holy Rosary Parish</a><a className="quiet-source" href={LITANY_SOURCE} target="_blank" rel="noreferrer">Letanías · Santa Sede</a></div>
 :litany!==null?<div className="litany-prayer" aria-live="polite"><p className="eyebrow">LETANÍAS · {litany+1} DE {LITANY.length}</p><h3>{LITANY[litany].call}</h3><p className="prayer-text">{LITANY[litany].response}</p></div>
 :finished?completion:<><RosaryMap step={step}/><p className="eyebrow">{current.decade===0?'ORACIONES INICIALES':current.decade===6?'ORACIONES FINALES':MYSTERIES[r.mystery].items[current.decade-1]}</p><div className="current-prayer" aria-live="polite"><h3>{prayer.name}</h3>{current.bead&&<p>{current.bead} de {current.total}</p>}</div><button className="text-button prayer-expand" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'Ocultar oración':'Ver oración'}</button>{expanded&&<p className="prayer-text">{prayer.text}</p>}</>}
 {error&&active&&<p role="alert" className="notice">{error}</p>}
 </div>
 {!confirm&&!options&&(!finished||litany!==null)&&<footer className="rosary-focus-footer"><button className="primary prayer-advance" disabled={disabled} onClick={()=>{if(litany!==null)setLitany(litany===LITANY.length-1?null:litany+1);else void move(1);}}>{litany!==null?(litany===LITANY.length-1?'Terminar letanías':'Avanzar'):step===ROSARY_STEPS.length-1?'Terminé el rosario':'Avanzar'}<ChevronRight size={28}/></button><div className="prayer-secondary"><button className="text-button" disabled={disabled||(litany!==null?litany===0:step===0)} onClick={()=>litany!==null?setLitany(litany-1):move(-1)}><ChevronLeft size={22}/>Atrás</button><button className="text-button" aria-label="Opciones del rezo" onClick={()=>setOptions(true)}><SlidersHorizontal size={22}/>Opciones</button></div></footer>}
 </DialogContent></Dialog>
 </section>;
}
