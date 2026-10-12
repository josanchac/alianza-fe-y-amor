import {useRef,useState} from 'react';
import {Pencil,Plus,Check} from 'lucide-react';
import type {Habit,RecordItem} from '@/lib/domain';
import {frequencyLabel,monthLabel} from '@/lib/schedule';
import {HabitFields} from './habit-fields';
import {BackHeader} from './back-header';
export type PlanItem={key:string;version:number;data:Habit;keep:boolean};
type Snapshot={purpose:string;items:PlanItem[];version:number;purposeVersion:number;effectiveDate:string;baseline:{purpose:string;items:PlanItem[]};confirmed:boolean;editing:PlanItem|null};
export type MonthPlanDrafts=Map<string,Snapshot>;
function snapshot(own:RecordItem[],month:string,today:string):Snapshot{
 const current=month===today.slice(0,7),plan=own.find(r=>r.kind==='month_plan'&&r.key===month),purpose=own.find(r=>r.kind==='purpose'&&r.key===month);
 const items:PlanItem[]=structuredClone(!current&&plan?plan.data.items:own.filter(r=>r.kind==='habit'&&!r.key.startsWith('rosary-once:')&&(current||!r.data.frequency?.course)).map(r=>({key:r.key,version:r.version,data:r.data,keep:!!r.data.active})));
 const text=current?purpose?.data.text??'':plan?.data.purpose??own.find(r=>r.kind==='purpose'&&r.key===today.slice(0,7))?.data.text??'';
 return {purpose:text,items,version:plan?.version??0,purposeVersion:purpose?.version??0,effectiveDate:current?today:month+'-01',baseline:{purpose:text,items:structuredClone(items)},confirmed:!!plan,editing:null};
}
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
function changes(item:PlanItem,base?:PlanItem){
 if(!base)return 'Nuevo compromiso';
 const parts=[];
 if(item.keep!==base.keep)parts.push(item.keep?'Se retoma':'Queda en pausa');
 if(!same(item.data.frequency,base.data.frequency))parts.push(frequencyLabel(base.data.frequency)+' → '+frequencyLabel(item.data.frequency));
 if(item.data.title!==base.data.title)parts.push('Antes: '+base.data.title);
 if(['moment','anchor','minimum'].some(key=>item.data[key as keyof Habit]!==base.data[key as keyof Habit]))parts.push('Detalles ajustados');
 return parts.join(' · ');
}
export function MonthPlanEditor({own,month,today,busy,onPrepare,onBack,drafts,onReload}:{own:RecordItem[];month:string;today:string;busy:boolean;onPrepare?:(payload:Record<string,unknown>)=>Promise<any>;onBack:()=>void;drafts?:MonthPlanDrafts;onReload?:()=>Promise<RecordItem[]|undefined>}){
 const [data,setData]=useState(()=>drafts?.get(month)??snapshot(own,month,today));
 const [sending,setSending]=useState(false),[status,setStatus]=useState(''),[failed,setFailed]=useState(false),[discard,setDiscard]=useState(false);
 const lock=useRef(false),current=month===today.slice(0,7),selected=data.items.filter(i=>i.keep).length;
 const dateLabel=new Intl.DateTimeFormat('es-CR',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(data.effectiveDate+'T12:00:00Z'));
 const dirty=!same({purpose:data.purpose,items:data.items},data.baseline),disabled=busy||sending;
 function change(next:Snapshot){setData(next);if(next.editing||!same({purpose:next.purpose,items:next.items},next.baseline))drafts?.set(month,next);else drafts?.delete(month);setStatus('');setFailed(false);}
 async function save(){
  if(lock.current||!onPrepare)return;lock.current=true;setSending(true);setStatus('');setFailed(false);drafts?.set(month,data);
  try{
   const result=await onPrepare({action:current?'save_current_month':'prepare_month',month,purpose:data.purpose,items:data.items,version:data.version,...(current?{purposeVersion:data.purposeVersion,effectiveDate:data.effectiveDate}:{})});
   if(result===false)throw Error('No se guardó el plan. Tu borrador sigue aquí; podés volver a intentar.');
   const fresh=result?.state?.own as RecordItem[]|undefined;
   if(current&&!fresh)throw Error('No pudimos confirmar el guardado. Tu borrador sigue aquí; revisá la versión guardada antes de reintentar.');
   const next=fresh?snapshot(fresh,month,today):{...data,version:data.version+1,confirmed:true,baseline:structuredClone({purpose:data.purpose,items:data.items})};
   setData(next);drafts?.delete(month);setStatus('Tu plan de '+monthLabel(month)+' quedó guardado.');
  }catch(e){setFailed(true);setStatus((e as Error).message);}finally{lock.current=false;setSending(false);}
 }
 async function reload(){
  if(lock.current)return;lock.current=true;setSending(true);
  try{const fresh=onReload?await onReload():own;if(!fresh)throw Error('No pudimos actualizar. Tu borrador se conserva.');setData(snapshot(fresh,month,today));drafts?.delete(month);setDiscard(false);setFailed(false);setStatus('Se cargó la versión guardada.');}catch(e){setStatus((e as Error).message);}finally{lock.current=false;setSending(false);}
 }
 return <div className="s3-task month-plan-editor app-plan-task"><fieldset disabled={disabled} className="month-plan-controls">
  {data.editing?<>
   <header className="app-plan-header"><BackHeader brand={false} label="Volver al plan" onBack={()=>change({...data,editing:null})}/></header>
   <form id="app-plan-item" className="editor-form app-task-body" onSubmit={e=>{e.preventDefault();const item=data.editing!;if(!item.data.title.trim()||item.data.frequency?.weekdays?.length===0||item.data.frequency?.course?.weekdays?.length===0){setFailed(true);setStatus('Completá el nombre y elegí al menos un día.');return;}const applied={...item,keep:item.data.active};change({...data,items:data.items.some(x=>x.key===item.key)?data.items.map(x=>x.key===item.key?applied:x):[...data.items,applied],editing:null});}}>
    <h2>{data.editing.version?'Editar compromiso':'Nuevo compromiso'}</h2><HabitFields effectiveDate={data.effectiveDate} data={data.editing.data} field={(key,value)=>change({...data,editing:{...data.editing!,data:{...data.editing!.data,[key]:value}}})} first={false} step={1}/>
   </form><footer className="app-task-footer"><div className="app-task-actions"><button type="button" onClick={()=>change({...data,editing:null})}>Cancelar</button><button type="submit" form="app-plan-item" className="primary">Aplicar cambios</button></div><p role={failed?'alert':'status'}>{status}</p></footer>
  </>:<>
   <header className="app-plan-header"><BackHeader brand={false} label="Volver a mi mes" onBack={onBack}/></header><div className="app-task-body"><h2>{'Preparar '+monthLabel(month)}</h2>
   <p className="muted">{current&&data.effectiveDate===today?'Desde hoy, '+dateLabel:'Desde el '+dateLabel}</p>
   <label>Mi propósito (opcional)<textarea maxLength={12000} value={data.purpose} onChange={e=>change({...data,purpose:e.target.value})}/></label>
   {data.purpose!==data.baseline.purpose&&<p className="plan-change">Propósito ajustado</p>}
   <div className="s3-row"><h3>Mis compromisos</h3><label className="s3-check"><input type="checkbox" ref={el=>{if(el)el.indeterminate=selected>0&&selected<data.items.length;}} checked={data.items.length>0&&selected===data.items.length} disabled={!data.items.length} onChange={e=>change({...data,items:data.items.map(i=>({...i,keep:e.target.checked,data:{...i.data,active:e.target.checked}}))})}/>Todos</label></div>
   {data.items.map(item=><article className="s3-plan-item" key={item.key}><div className="s3-row"><label className="s3-check"><input type="checkbox" checked={item.keep} onChange={e=>change({...data,items:data.items.map(x=>x.key===item.key?{...x,keep:e.target.checked,data:{...x.data,active:e.target.checked}}:x)})}/>{item.data.title}</label><button type="button" className="s3-icon" aria-label={'Editar '+item.data.title} onClick={()=>change({...data,editing:structuredClone({...item,data:{...item.data,active:item.keep}})})}><Pencil size={18}/></button></div><p className="muted">{frequencyLabel(item.data.frequency)}</p>{changes(item,data.baseline.items.find(x=>x.key===item.key))&&<p className="plan-change">{changes(item,data.baseline.items.find(x=>x.key===item.key))}</p>}</article>)}
   <button type="button" onClick={()=>change({...data,editing:{key:crypto.randomUUID(),version:0,keep:true,data:{title:'',active:true,moment:'Mañana',anchor:'',minimum:'',frequency:{period:'day',target:1}}}})}><Plus size={18}/>Agregar compromiso</button>
   {!current&&own.some(r=>r.kind==='habit'&&r.data.frequency?.course)&&<p className="muted">Los recorridos por tiempo conservan su avance al cambiar de mes.</p>}
   </div><footer className="app-task-footer"><div className="app-task-actions"><button type="button" className="primary" disabled={disabled||!onPrepare||data.confirmed&&!dirty} onClick={save}><Check size={18}/>{sending?'Guardando…':data.confirmed&&!dirty?'Guardado':'Guardar '+monthLabel(month)}</button></div>
   {failed&&<button type="button" onClick={()=>setDiscard(true)}>Revisar versión guardada</button>}
   {discard&&<section className="notice"><p>¿Reemplazar este borrador con la versión guardada? Se perderán los cambios que todavía no guardaste.</p><button type="button" onClick={reload}>Descartar borrador y actualizar</button><button type="button" onClick={()=>setDiscard(false)}>Conservar mi borrador</button></section>}
   <p role={failed?'alert':'status'}>{status}</p></footer>
  </>}
 </fieldset></div>;
}
