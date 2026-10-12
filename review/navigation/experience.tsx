import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,Check,Plus,MoreHorizontal,Sun,Cross,UserRound,Pencil,Heart,Users} from 'lucide-react';
import {HabitFields} from '../../app/habit-fields';
import {SymbolProgress} from '../../app/symbol-progress';
import {useScrollChrome} from '../../app/navigation-scroll';
import {useDialogViewport} from '../../app/dialog-viewport';
import {frequencyLabel} from '../../lib/schedule';
import {localDate,type Habit} from '../../lib/domain';

type View='home'|'history'|'record'|'form';
type Section='today'|'prayer'|'settings';
type Space='personal'|'couple'|'group';
type Item={id:string;data:Habit;count:number};
const initialItems:Item[]=[
 {id:'morning',data:{title:'Oración de la mañana',moment:'Mañana',active:true,anchor:'',minimum:'',frequency:{period:'day',target:1,unit:'days'}},count:1},
 {id:'exercise',data:{title:'Ejercicio',moment:'Durante el día',active:true,anchor:'',minimum:'',frequency:{period:'week',target:3,unit:'times'}},count:1},
 {id:'rosary',data:{title:'Rezar el rosario',moment:'Noche',active:true,anchor:'',minimum:'',frequency:{period:'month',target:2,unit:'times'}},count:0},
];
const spaces=[['personal','Personal'],['couple','Pareja'],['group','Cursos']] as const;
const mysteries=['Misterios dolorosos','Misterios luminosos','Misterios gloriosos','Misterios gozosos'];
const dayLabel=(offset:number)=>{const d=new Date(localDate()+'T12:00:00');d.setDate(d.getDate()-offset);return d.toLocaleDateString('es-CR',{day:'numeric',month:'long'});};

/** Isolated visual proposal. All changes remain in memory; no pilot transport. */
export function NavigationExperience({initialView='home',volume=4}:{initialView?:View;volume?:number}){
 useDialogViewport();
 const dayChrome=useScrollChrome();
 const [view,setView]=useState<View>(initialView),[section,setSection]=useState<Section>('today'),[space,setSpace]=useState<Space>('personal');
 const [period,setPeriod]=useState('day'),[offset,setOffset]=useState(0),[selected,setSelected]=useState(0),[compact,setCompact]=useState(false);
 const [items,setItems]=useState<Item[]>(()=>[...structuredClone(initialItems),...Array.from({length:Math.max(0,volume-3)},(_,i)=>({id:'extra-'+i,data:{...structuredClone(initialItems[1].data),title:'Compromiso de prueba '+(i+4)},count:0}))]);
 const [draft,setDraft]=useState<Habit>(()=>structuredClone(initialItems[1].data)),[editId,setEditId]=useState('exercise'),[menu,setMenu]=useState<string|null>(null),[message,setMessage]=useState('');
 const [pastCounts,setPastCounts]=useState<Record<number,Record<string,number>>>({});
 const compactBrand=useRef<HTMLDivElement>(null),returnStart=useRef<HTMLSpanElement>(null),[raised,setRaised]=useState(false);
 const origin=useRef<{view:View;y:number;focus:string}[]>([]),brandEnd=useRef<HTMLSpanElement>(null),screenHeading=useRef<HTMLHeadingElement>(null),restore=useRef<{y:number;focus:string}|null>(null),baseline=useRef(JSON.stringify(initialItems[1].data));
 const dirty=view==='form'&&JSON.stringify(draft)!==baseline.current;
 useEffect(()=>{const guard=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[dirty]);
 useEffect(()=>{
  let frame=0;
  const measure=()=>{frame=0;const progress=Math.max(0,Math.min(1,-(brandEnd.current?.getBoundingClientRect().top??1)/64));compactBrand.current?.style.setProperty('--nr-compact-progress',String(progress));setCompact(progress>0);setRaised((returnStart.current?.getBoundingClientRect().top??1)<-4);};
  const update=()=>{if(!frame)frame=requestAnimationFrame(measure);};
  measure();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
  return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update);cancelAnimationFrame(frame);};
 },[view]);
 useLayoutEffect(()=>{const previous=restore.current;restore.current=null;window.scrollTo({top:previous?.y??0,behavior:'instant'});if(previous?.focus)document.getElementById(previous.focus)?.focus({preventScroll:true});else if(view!=='home')screenHeading.current?.focus({preventScroll:true});},[view]);
 function open(next:View,focus:string){origin.current.push({view,y:window.scrollY,focus});setMenu(null);setMessage('');setView(next);}
 function back(){if(dirty&&!window.confirm('¿Descartar los cambios de este ejemplo?'))return;const previous=origin.current.pop();restore.current=previous??{y:0,focus:''};setView(previous?.view??'home');setMenu(null);}
 function edit(item:Item,focus:string){setEditId(item.id);setDraft(structuredClone(item.data));baseline.current=JSON.stringify(item.data);open('form',focus);}
 function save(){setItems(list=>list.map(item=>item.id===editId?{...item,data:structuredClone(draft)}:item));baseline.current=JSON.stringify(draft);const previous=origin.current.pop();restore.current=previous??{y:0,focus:''};setView(previous?.view??'home');setMessage('Cambios guardados en este ejemplo.');}
 function root(next:Section){origin.current=[];setView('home');setSection(next);setMenu(null);setMessage('');window.scrollTo({top:0,behavior:'instant'});}
 const countFor=(item:Item)=>offset===0?item.count:pastCounts[offset]?.[item.id]??0;
 const dailyItems=items.filter(item=>item.data.frequency?.period==='day');
 function mark(id:string,delta:number){if(offset>0){setPastCounts(previous=>({...previous,[offset]:{...previous[offset],[id]:Math.max(0,Math.min(99,(previous[offset]?.[id]??0)+delta))}}));return;}setItems(list=>list.map(item=>item.id===id?{...item,count:Math.max(0,Math.min(99,item.count+delta))}:item));}
 const backControl=<button type="button" className="nr-back" onClick={back}><ChevronLeft size={21}/>Volver</button>;
 const historyRows=Array.from({length:24},(_,i)=><button key={i} id={'nr-record-'+i} className="nr-history-row" onClick={()=>{setSelected(i);open('record','nr-record-'+i);}}><span className="nr-completed"><Check size={18}/></span><span><strong>{mysteries[i%4]}</strong><small>Concluido · {dayLabel(i+1)}</small></span><ChevronRight size={18}/></button>);
 if(view==='form')return <div className="nr nr-task" data-review-view="form">
  <header className="nr-task-header">{backControl}<span>Solo vos</span></header>
  <form id="nr-commitment-form" className="nr-task-body" onSubmit={e=>{e.preventDefault();save();}}>
   <h1 ref={screenHeading} tabIndex={-1}>Editar compromiso</h1>
   <p className="nr-muted">Ejemplo de prueba · Los cambios no afectan tu app.</p>
   <HabitFields data={draft} field={(key,value)=>setDraft(d=>({...d,[key]:value}))} first={false} step={1}/>
  </form>
  <footer className="nr-task-footer"><span>{dirty?'Cambios sin guardar':'Sin cambios'}</span><button className="nr-primary" type="submit" form="nr-commitment-form" disabled={!dirty}>Guardar</button></footer>
 </div>;
 return <div className="nr" data-review-view={view} data-day-view={view==='home'&&space==='personal'&&section==='today'&&period==='day'}>
  {view==='home'?<>
   <header className="nr-brand"><img src="./emblem.svg" alt=""/><div>Alianza<small>FE Y AMOR</small></div></header><span ref={brandEnd} className="nr-brand-end"/>
   <div ref={compactBrand} className="nr-compact-brand" data-visible={compact} aria-hidden={!compact}><img src="./emblem.svg" alt="Alianza"/><span>{spaces.find(s=>s[0]===space)?.[1]}</span></div>
   <nav className="nr-spaces" aria-label="Cambiar espacio">{spaces.map(([id,label])=><button key={id} aria-pressed={space===id} onClick={()=>{setSpace(id);setMenu(null);setMessage('');}}>{label}</button>)}</nav>
   {space==='personal'&&section==='today'&&<nav className="nr-views" aria-label="Vistas personales">{[['day','Mi día'],['month','Mi mes'],['path','Mi recorrido']].map(([id,label])=><button key={id} aria-pressed={period===id} onClick={()=>{setPeriod(id);setMenu(null);}}>{label}</button>)}</nav>}
  </>:<><span ref={returnStart} className="nr-return-start" aria-hidden="true"/><header className="nr-return-header" data-raised={raised}>{backControl}<img src="./emblem.svg" alt="Alianza"/></header></>}
  <main className="nr-main">
   {message&&<p role="status" className="nr-status">{message}</p>}
   {view==='home'&&space==='personal'&&section==='today'&&<>
    {period==='day'?<>
     <div className="nr-date"><button aria-label="Día anterior" onClick={()=>setOffset(v=>v+1)}><ChevronLeft size={20}/></button><span>{offset===0?'Hoy · ':''}{dayLabel(offset)}</span><button aria-label="Día siguiente" disabled={offset===0} onClick={()=>setOffset(v=>Math.max(0,v-1))}><ChevronRight size={20}/></button></div>
     <span ref={dayChrome.marker} className="nr-day-start" aria-hidden="true"/><header ref={dayChrome.surface} className="nr-title-row" data-raised={dayChrome.raised}><h1>Mi día</h1><div className="nr-day-progress"><SymbolProgress value={dailyItems.filter(i=>countFor(i)>0).length} total={dailyItems.length} symbol="tree" label="Compromisos diarios"/><small>Mi avance</small></div></header>
     <section className="nr-purpose"><small>MI PROPÓSITO DEL MES</small><p>Escuchar con paciencia y estar presente en mi familia.</p></section>
     <h2 className="nr-section-title">Mis compromisos</h2>
     {items.map(item=><article className="nr-habit" key={item.id}>
      <button className="nr-check" role="checkbox" aria-checked={countFor(item)>0} aria-label={item.data.title} onClick={()=>{if(countFor(item)>1){if(window.confirm('¿Deshacer todos los registros de este ejemplo?'))mark(item.id,-countFor(item));}else mark(item.id,countFor(item)?-1:1);}}>{countFor(item)>0&&<Check size={19}/>}</button>
      <div className="nr-habit-copy"><strong>{item.data.title}</strong><small>{frequencyLabel(item.data.frequency)}</small>{countFor(item)>0&&<div className="nr-occurrences"><span>{countFor(item)} {offset===0?'hoy':'en esta fecha'}</span>{item.data.frequency?.unit==='times'&&<button aria-label={'Agregar otro · '+item.data.title} onClick={()=>mark(item.id,1)}><Plus size={16}/></button>}</div>}</div>
      <button id={'nr-actions-'+item.id} className="nr-more" aria-label={'Opciones · '+item.data.title} aria-expanded={menu===item.id} onClick={()=>setMenu(menu===item.id?null:item.id)}><MoreHorizontal size={22}/></button>
      {menu===item.id&&<div className="nr-actions" role="group" aria-label={'Acciones de '+item.data.title}>{countFor(item)>0&&<button onClick={()=>{mark(item.id,-1);setMenu(null);setMessage('Se deshizo el último registro del ejemplo.');}}>Deshacer último</button>}<button onClick={()=>edit(item,'nr-actions-'+item.id)}>Editar compromiso</button><button onClick={()=>setMenu(null)}>Cerrar opciones</button></div>}
     </article>)}
     <button id="nr-edit-example" className="nr-list-row" onClick={()=>edit(items.find(i=>i.id==='exercise')!,'nr-edit-example')}><Pencil size={20}/><span>Probar edición de un compromiso</span><ChevronRight size={18}/></button>
    </>:period==='month'?<>
     <h1>Mi mes</h1><p className="nr-muted">{new Date().toLocaleDateString('es-CR',{month:'long',year:'numeric'})}</p><section className="nr-purpose"><small>MI PROPÓSITO</small><p>Escuchar con paciencia y estar presente en mi familia.</p></section>
     <button id="nr-month-edit" className="nr-list-row" onClick={()=>edit(items[1],'nr-month-edit')}><Pencil size={20}/><span>Ajustar un compromiso</span><ChevronRight size={18}/></button><p className="nr-muted">Esta prueba evalúa la navegación y edición. El cierre mensual completo permanece en la versión anterior.</p>
    </>:<><h1>Mi recorrido</h1><p className="nr-muted">Consulta de ejemplo</p><button id="nr-path-history" className="nr-list-row" onClick={()=>open('history','nr-path-history')}><Cross size={20}/><span>Mis aportes al rosario<small>24 registros ficticios</small></span><ChevronRight size={18}/></button></>}
   </>}
   {view==='home'&&space==='personal'&&section==='prayer'&&<><h1>Oración</h1><p className="nr-muted">Un momento con Dios</p><button id="nr-open-history" className="nr-list-row" onClick={()=>open('history','nr-open-history')}><Cross size={20}/><span>Mis aportes al rosario<small>24 registros ficticios</small></span><ChevronRight size={18}/></button><a className="nr-list-row" href="?scenario=litany"><span>Letanías · diseño aprobado</span><ChevronRight size={18}/></a></>}
   {view==='home'&&space==='personal'&&section==='settings'&&<><h1>Mi espacio</h1><p className="nr-muted">Ejemplo de navegación compacta</p><button id="nr-settings-edit" className="nr-list-row" onClick={()=>edit(items[1],'nr-settings-edit')}><Pencil size={20}/><span>Editar compromiso</span><ChevronRight size={18}/></button><a className="nr-list-row" href="?scenario=rosary"><span>Abrir la prueba anterior completa</span><ChevronRight size={18}/></a></>}
   {view==='home'&&space!=='personal'&&<><h1>{space==='couple'?'En pareja':'Cursos y grupos'}</h1><p className="nr-muted">Vista de ejemplo para evaluar el cambio de espacio. No conecta con tu pareja ni con cursos reales.</p><section className="nr-purpose">{space==='couple'?<Heart size={24}/>:<Users size={24}/>}<h2>{space==='couple'?'Nuestro espacio':'Curso de alianza'}</h2><p>{space==='couple'?'Compartir y acompañarnos.':'Un espacio para caminar juntos.'}</p></section></>}
   {view==='history'&&<><h1 ref={screenHeading} tabIndex={-1}>Mis aportes al rosario</h1><p className="nr-muted">24 registros ficticios · Más recientes primero</p><div className="nr-history-list">{historyRows}</div></>}
   {view==='record'&&<><h1 ref={screenHeading} tabIndex={-1}>{mysteries[selected%4]}</h1><p className="nr-record-state"><Check size={18}/>Rosario concluido · {dayLabel(selected+1)}</p><section className="nr-purpose"><small>REGISTRO DE PRUEBA</small><p>Este registro ficticio permite revisar cómo entrás al detalle y volvés al mismo punto del historial.</p></section><h2>Mi participación</h2>{Array.from({length:5},(_,i)=><div className="nr-decades" key={i}><span>Decena {i+1}</span><span><Check size={17}/>Rezada</span></div>)}</>}
  </main>
  <nav className="nr-bottom" aria-label="Navegación principal">{([['today','Hoy',Sun],['prayer','Oración',Cross],['settings','Mi espacio',UserRound]] as const).map(([id,label,Icon])=><button key={id} aria-pressed={view==='home'?section===id:id==='prayer'} onClick={()=>{setSpace('personal');root(id);}}><Icon size={23}/><span>{label}</span></button>)}</nav>
 </div>;
}
