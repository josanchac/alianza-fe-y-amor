import {RosaryResumeEntry} from './rosary-resume-entry';
import {rosaryArtwork} from "@/lib/rosary-artwork";
import {useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {ChevronLeft,ChevronRight,Cross,Pause,Settings} from 'lucide-react';
import {type Rosary,type CommunityAction,MYSTERIES} from '@/lib/community';
import {ROSARY_STEPS,DEFAULT_OPENING,prayerFor,nextPrayerStep,THREE_MARY_SOURCE,CONTRITION_SOURCE,rosaryStep,rosaryStepOrder,type RosaryOpening} from '@/lib/rosary-guide';
import {LITANY,LITANY_SOURCE} from '@/lib/rosary-litany';
import {localDate} from '@/lib/domain';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {usePrayerScreen} from './use-prayer-screen';
export function RosaryMap({step,opening=DEFAULT_OPENING}:{step:number;opening?:RosaryOpening}){
 const current=rosaryStep(step,opening);
 const artwork=useMemo(()=>`data:image/svg+xml,${encodeURIComponent(rosaryArtwork(step,opening))}`,[step,opening]);
 return <svg className="rosary-map" viewBox="0 0 342 306" role="img" aria-label={step===69?'Rosario concluido':current.decade===0?'Oraciones iniciales':current.decade===6?'Oraciones finales':`Misterio ${current.decade} de 5${current.bead?`, Avemaría ${current.bead} de 10`:''}`}>
 <image href={artwork} width="342" height="306"/>
 </svg>;
}

function readLocal(key:string){try{return localStorage.getItem(key)||'';}catch{return '';}}
function writeLocal(key:string,value:string){try{localStorage.setItem(key,value);}catch{/* Optional device preference. */}}
function remembered(key:string){try{return sessionStorage.getItem(key)||'';}catch{return '';}}
export function PersonalRosary({r,act,busy,habits=[],checks={},onLinked,compact=false,onActiveChange}:{r:Rosary;compact?:boolean;onActiveChange?:(active:boolean)=>void;act:CommunityAction;busy:boolean;habits?:{key:string;data:{title:string;active:boolean}}[];checks?:Record<string,string>;onLinked?:()=>void}){
 const resumeKey='alianza-rosary-open:'+r.ownerId,autoKey='alianza-rosary-auto:'+r.ownerId;
 const step=r.personalStep??(r.slots.filter(s=>s.done).length===5?ROSARY_STEPS.length:0),finished=step===69;
 const opening=r.opening??DEFAULT_OPENING,current=rosaryStep(step,opening),prayer=prayerFor(current,opening);
 const [active,setActive]=useState(()=>!r.cancelled&&!finished&&remembered(resumeKey)===r.id);
 const [showRecord,setShowRecord]=useState(false);
 const [preferencesOpen,setPreferencesOpen]=useState(false),[expanded,setExpanded]=useState(false),[options,setOptions]=useState(false),[confirm,setConfirm]=useState<'pause'|'discard'|null>(null),[error,setError]=useState('');
 const [font,setFont]=useState(()=>Math.max(20,Math.min(32,Number(readLocal('alianza-prayer-font'))||24)));
 const [awake,setAwake]=useState(()=>readLocal('alianza-prayer-awake')!=='off');
 const [litany,setLitany]=useState<number|null>(null),[linked,setLinked]=useState(''),[automatic,setAutomatic]=useState(()=>readLocal(autoKey));
 const [draft,setDraft]=useState<RosaryOpening>(()=>step===0?{...opening,include:true,position:opening.position??'end'}:opening);
 const [saving,setSaving]=useState(false),[cooling,setCooling]=useState(false);
 const coolTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(coolTimer.current)clearTimeout(coolTimer.current);},[]);
 const sending=useRef(false),cooldown=useRef(0),autoOnFinish=useRef(false),body=useRef<HTMLDivElement>(null);
 const disabled=busy||saving||cooling;
 const litanyScroll=useRef(0);
 const wake=usePrayerScreen(active&&(!finished||litany!==null),awake);
 const today=localDate(),completedToday=finished&&r.mine.filter(m=>m.day===today).length===5;
 const candidates=habits.filter(h=>/rosario/i.test(h.data.title));
 const isMarked=(key:string)=>checks[key]==='done'||Number(checks[key])>0||linked===key;
 useEffect(()=>{if(step===0)setDraft({...opening,include:true,position:opening.position??'end'});},[r.opening,step]);
 useLayoutEffect(()=>{body.current?.scrollTo?.({top:litany!==null&&!options&&!confirm?litanyScroll.current:0,behavior:'instant'});},[step,litany,confirm,options]);
 useEffect(()=>{onActiveChange?.(active);},[active]);
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
  if(step===0&&(draft.include!==opening.include||draft.mary!==opening.mary||draft.position!==opening.position)){
   if(!await run({action:'rosary_opening',id:r.id,version:r.progressVersion??0,...draft}))return;
  }
  setActive(true);
 }
 function fontChange(delta:number){const size=Math.max(20,Math.min(32,font+delta));setFont(size);writeLocal('alianza-prayer-font',String(size));}
 function openLitany(){litanyScroll.current=0;setLitany(0);setOptions(false);setActive(true);}
 const completion=<div className="rosary-completion"><h3>Rosario concluido</h3><p>Quedó registrado en tus rosarios.</p>{completedToday&&<section className="rosary-link"><h4>Mi compromiso de hoy</h4>{candidates.length?candidates.map(h=><div key={h.key}><button className="soft-button" disabled={disabled||isMarked(h.key)} onClick={()=>link(h.key)}>{isMarked(h.key)?'Ya está marcado':candidates.length===1?'Marcar mi compromiso':h.data.title}</button>{!h.key.startsWith('rosary-once:')&&<label className="prayer-toggle"><input type="checkbox" checked={automatic===h.key} onChange={e=>{const value=e.target.checked?h.key:'';setAutomatic(value);writeLocal(autoKey,value);}}/>Marcarlo automáticamente en mis próximos rosarios en este dispositivo</label>}</div>):<button className="soft-button" disabled={disabled||!!linked} onClick={()=>link()}>{linked?'Añadido a hoy':'Añadir solo por hoy'}</button>}</section>}<button className="soft-button" onClick={openLitany}>Rezar las letanías</button>{active&&<button className="primary" onClick={close}>Terminar</button>}</div>;
 if(r.cancelled)return null;
 return <section className={compact?"personal-rosary compact-rosary":"card personal-rosary"}>{compact?<><RosaryResumeEntry r={r} disabled={disabled} onOpen={()=>void start()}/>{error&&!active&&<p role="alert">{error}</p>}</>:<><p className="eyebrow">MI ROSARIO</p><h2>Misterios {MYSTERIES[r.mystery].name.toLowerCase()}</h2>{r.intention&&(!finished||showRecord||active)&&<p className="muted preserve">{r.intention}</p>}
 {!active&&<>{!finished&&<RosaryMap step={step} opening={opening}/>} {finished?<><p className="rosary-finished-label">✓ Rosario concluido{r.mine.length>0&&<> · {r.mine.map(m=>m.day).sort().at(-1)}</>}</p><button className="soft-button" onClick={()=>setShowRecord(!showRecord)}>{showRecord?'Cerrar registro':'Ver registro'}</button>{showRecord&&completion}</>:<>{step===0&&<button className="action-button s3-icon" aria-label="Preferencias de este rosario" aria-expanded={preferencesOpen} onClick={()=>setPreferencesOpen(!preferencesOpen)}><Settings size={22}/></button>}{step===0&&preferencesOpen&&<div className="rosary-opening"><h3>Padre nuestro y tres Avemarías</h3><p>¿Cuándo querés rezarlos?</p><div className="prayer-choices" role="group" aria-label="Cuándo rezar el Padre nuestro y las tres Avemarías"><button className="soft-button" disabled={disabled} aria-pressed={draft.position==='start'} onClick={()=>setDraft({...draft,position:'start'})}>Al inicio</button><button className="soft-button" disabled={disabled} aria-pressed={draft.position==='end'} onClick={()=>setDraft({...draft,position:'end'})}>Después de los cinco misterios</button></div>{draft.include&&<div className="prayer-choices" role="group" aria-label="Tres Avemarías"><button className="soft-button" aria-pressed={draft.mary==='standard'} onClick={()=>setDraft({...draft,mary:'standard'})}>Habituales</button><button className="soft-button" aria-pressed={draft.mary==='trinitarian'} onClick={()=>setDraft({...draft,mary:'trinitarian'})}>Hija, Madre y Esposa</button></div>}</div>}<button className="primary" disabled={disabled} onClick={start}><Cross size={22}/>{step?'Continuar rezando':'Empezar a rezar'}</button><button className="action-button" data-action="sensitive" disabled={disabled} onClick={()=>setConfirm('discard')}>Descartar este rosario</button></>}{error&&<p role="alert" className="notice">{error}</p>}</>}
 </>}
 <Dialog open={active||confirm==='discard'} onOpenChange={open=>{if(!open&&!disabled)setConfirm(active?'pause':null);}}>
 <DialogContent className="rosary-focus" showCloseButton={false} onPointerDownOutside={e=>e.preventDefault()} onInteractOutside={e=>e.preventDefault()} onEscapeKeyDown={e=>{e.preventDefault();if(!disabled)setConfirm(active?'pause':null);}} style={{'--prayer-size':font+'px'} as CSSProperties}>
 <header className="rosary-focus-header"><div><DialogTitle>Mi rosario</DialogTitle><DialogDescription>Misterios {MYSTERIES[r.mystery].name.toLowerCase()}</DialogDescription></div><button className="action-button" data-action="secondary" disabled={disabled} onClick={()=>finished&&litany===null?close():setConfirm('pause')}><Pause size={22}/>{finished&&litany===null?'Cerrar':'Pausar'}</button></header>
 <div className={"rosary-focus-body"+(!confirm&&!options&&!finished&&litany===null?" rosary-reading"+(expanded?" prayer-is-expanded":""):"")} ref={body} onScroll={e=>{if(litany!==null&&!options&&!confirm)litanyScroll.current=e.currentTarget.scrollTop;}}>
 {confirm?<div className="prayer-confirm"><h3>{confirm==='discard'?'¿Descartar este rosario?':'¿Pausar el rosario?'}</h3><p>{confirm==='discard'?'Se quitará de tus rosarios pendientes. No se registrará como rezado.':'Tu avance está guardado. Podés continuar después.'}</p><button className="primary" disabled={disabled} onClick={()=>setConfirm(null)}>Seguir rezando</button><button className="soft-button" disabled={disabled} onClick={async()=>{if(confirm==='pause')close();else if(await run({action:'rosary_discard',id:r.id,version:r.progressVersion??0}))close();}}>{confirm==='discard'?'Sí, descartar':'Guardar y salir'}</button></div>
  :options?<div className="prayer-options prayer-settings"><h3>A mi manera</h3>
 <div className="prayer-settings-group">
 <div className="prayer-settings-row"><span>Tamaño de letra</span><div className="prayer-letter-buttons"><button type="button" className="soft-button" aria-label="Reducir letra" disabled={font<=20} onClick={()=>fontChange(-2)}>A−</button><button type="button" className="soft-button" aria-label="Aumentar letra" disabled={font>=32} onClick={()=>fontChange(2)}>A+</button></div></div>
 <div className="prayer-settings-row"><label htmlFor={'prayer-awake-'+r.id}>Mantener la pantalla encendida</label><button id={'prayer-awake-'+r.id} type="button" role="switch" aria-checked={awake} aria-label="Mantener la pantalla encendida" className="prayer-awake-switch" onClick={()=>{setAwake(!awake);writeLocal('alianza-prayer-awake',!awake?'on':'off');}}><span aria-hidden="true"/></button></div>
 {awake&&<p className="prayer-settings-status">{wake==='on'?'Pantalla encendida durante el rezo.':'Si el teléfono lo permite, la pantalla permanecerá encendida.'}</p>}
 </div>
 <div className="prayer-settings-group">
 <details className="prayer-settings-detail"><summary>Este rosario</summary><div>{r.intention&&<p className="preserve">{r.intention}</p>}<p>{opening.include?(opening.position==='end'?'Un Padre nuestro y tres Avemarías después de los cinco misterios.':'Un Padre nuestro y tres Avemarías al inicio.'):'Sin el bloque inicial de Padre nuestro y tres Avemarías.'}</p>{opening.include&&<p>{opening.mary==='trinitarian'?'Hija del Padre, Madre del Hijo y Esposa del Espíritu Santo.':'Avemarías habituales.'}</p>}</div></details>
 <details className="prayer-settings-detail"><summary>Fuentes de las oraciones</summary><div><a className="quiet-source" href={THREE_MARY_SOURCE} target="_blank" rel="noreferrer">Oraciones · Holy Rosary Parish</a><a className="quiet-source" href={CONTRITION_SOURCE} target="_blank" rel="noreferrer">Acto de contrición · Santa Sede</a><a className="quiet-source" href={LITANY_SOURCE} target="_blank" rel="noreferrer">Letanías · Santa Sede</a></div></details>
 </div>
 {!finished&&<button className="action-button prayer-discard" data-action="sensitive" disabled={disabled} onClick={()=>setConfirm('discard')}>Descartar este rosario</button>}
 </div>
 :litany!==null?<div className="litany-prayer"><h3>Letanías</h3>{LITANY.map((line,index)=><div className="litany-line" key={index}><p className="litany-call">{line.call}</p>{line.response&&<p className="litany-response">{line.response}</p>}</div>)}</div>
 :finished?completion:<>{step===68&&<button className="soft-button litany-after-salve" onClick={openLitany}>Rezar las letanías (opcional)</button>}<RosaryMap step={step} opening={opening}/><p className="eyebrow">{current.decade===0?'ORACIONES INICIALES':current.decade===6?'ORACIONES FINALES':MYSTERIES[r.mystery].items[current.decade-1]}</p><div className="current-prayer" aria-live="polite"><h3>{prayer.name}</h3>{current.bead&&<p>{current.bead} de {current.total}</p>}</div><button className="action-button prayer-expand" data-action="disclosure" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'Ocultar oración':'Ver oración'}</button>{expanded&&<p className="prayer-text">{prayer.text}</p>}</>}
 {error&&active&&<p role="alert" className="notice">{error}</p>}
 </div>
 {!confirm&&options&&<footer className="rosary-focus-footer prayer-settings-footer"><button type="button" className="soft-button" onClick={()=>setOptions(false)}>Volver al rezo</button></footer>}
 {!confirm&&!options&&(!finished||litany!==null)&&<footer className={"rosary-focus-footer"+(litany!==null?" litany-footer":"")}><button className="primary prayer-advance" disabled={litany===null&&disabled} onClick={()=>{if(litany!==null)setLitany(null);else void move(1);}}>{litany!==null?'Terminar letanías':step===ROSARY_STEPS.length-1?'Terminé el rosario':'Avanzar'}{litany===null&&<ChevronRight size={28}/>}</button><div className="prayer-secondary">{litany===null&&<button className="action-button" data-action="navigation" disabled={disabled||step===0} onClick={()=>move(-1)}><ChevronLeft size={22}/>Atrás</button>}<button className="action-button" data-action="secondary" aria-label="Opciones del rezo" onClick={()=>setOptions(true)}><Settings size={22}/></button></div></footer>}
 </DialogContent></Dialog>
 </section>;
}
