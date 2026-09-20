import {EvangelizoReview} from './evangelizo-review';
declare const __EVANGELIZO_REVIEW__: boolean;
import {useId,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {ChevronDown,ChevronLeft,ChevronRight} from 'lucide-react';
import {MASS_READINGS,massMomentNote,availableMassReadings,formatMassDate,massContext,massSections,massSpecialDates,massToday,shiftMassDate,validMassDate,type MassChoice,type MassReadingSet} from '../lib/mass';

/** Read-only guide; optional provider requests contain only the selected date. */
export function Mass({onBack,readingSets=MASS_READINGS,now=()=>new Date()}:{onBack?:()=>void;readingSets?:readonly MassReadingSet[];now?:()=>Date}) {
  const uid=useId(),[date,setDate]=useState(()=>massToday(now())),[choice,setChoice]=useState<MassChoice>(''),[screen,setScreen]=useState<'guide'|'readings'>('guide');
  const [open,setOpen]=useState<string|null>(null),[inner,setInner]=useState<string|null>(null),[specialOpen,setSpecialOpen]=useState(false),[size,setSize]=useState(22);
  const [palm,setPalm]=useState('procession'),[washing,setWashing]=useState(true),[baptisms,setBaptisms]=useState(false),[error,setError]=useState('');
  const spacer=useRef<HTMLDivElement>(null);
  const root=useRef<HTMLElement>(null),anchor=useRef<string|null>(null),generation=useRef(0);
  const today=massToday(now()),context=massContext(date,choice),sections=massSections(context.kind,palm,washing,baptisms);
  const readings=context.awaiting?undefined:availableMassReadings(readingSets,context.effectiveDate,context.celebrationId,today);
  // Commit the collapsed layout first; cancel stale anchors on every new action and unmount.
  useLayoutEffect(()=>{
    const token=++generation.current;let second=0;
    const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>{
      if(token!==generation.current||!anchor.current)return;
      const el=Array.from(root.current?.querySelectorAll<HTMLElement>('[data-mass-anchor]')??[]).find(node=>node.dataset.massAnchor===anchor.current);
      if(el&&spacer.current){
        spacer.current.style.height='0px';
        const desired=el.getBoundingClientRect().top+window.scrollY-24;
        const maximum=document.documentElement.scrollHeight-window.innerHeight;
        spacer.current.style.height=Math.max(0,desired-maximum)+'px';
        el.scrollIntoView({block:'start',behavior:'instant'});
      }anchor.current=null;
    });});
    return()=>{generation.current++;cancelAnimationFrame(first);cancelAnimationFrame(second);};
  },[date,choice,screen,open,inner,specialOpen,palm,washing,baptisms]);
  function selectDate(next:string,nextChoice:MassChoice='') {
    if(!validMassDate(next)){setError('Elegí una fecha válida entre 1900 y 2100.');return;}
    generation.current++;anchor.current='date';setDate(next);setChoice(nextChoice);setOpen(null);setInner(null);setSpecialOpen(false);setError('');setPalm('procession');setWashing(true);setBaptisms(false);
    // Today also works when the date has not changed.
    root.current?.querySelector<HTMLInputElement>('input[type="date"]')?.focus({preventScroll:true});
    if(next===date&&nextChoice===choice)root.current?.querySelector<HTMLElement>('[data-mass-anchor="date"]')?.scrollIntoView({block:'start',behavior:'instant'});
  }
  function toggle(id:string,nested=false){generation.current++;const current=nested?inner:open;anchor.current=current===id?null:id;if(nested)setInner(current===id?null:id);else{setOpen(current===id?null:id);setInner(null);}}
  const pending=<p className="mass-pending" role="status">Las lecturas de esta celebración todavía no están disponibles: falta verificar los textos completos, su permiso de uso y el calendario de Costa Rica.</p>;
  function readingCards(){if(!readings&&typeof __EVANGELIZO_REVIEW__!=='undefined'&&__EVANGELIZO_REVIEW__)return <EvangelizoReview key={context.effectiveDate+context.kind} date={context.effectiveDate} today={today} kind={context.kind} activeReading={inner?.startsWith('evangelizo-')?inner.slice(11):null} onToggle={id=>toggle('evangelizo-'+id,true)}/>;return readings?<>{readings.readings.map(r=>{const readingId='reading-'+r.id;return <div className="mass-moment mass-reading" key={r.id}><button type="button" aria-expanded={inner===readingId} aria-controls={uid+'-'+readingId} data-mass-anchor={readingId} onClick={()=>toggle(readingId,true)}>{r.title}<ChevronDown size={18}/></button>{inner===readingId&&<div id={uid+'-'+readingId}><p className="mass-reference">{r.reference}</p><p className="mass-text">{r.text}</p><p className="mass-attribution">{readings.rights.attribution}</p><a href={readings.source} target="_blank" rel="noreferrer">Fuente del texto</a></div>}</div>;})}</>:pending;}
  return <section ref={root} className="mass-view" aria-label="Misa" style={{'--mass-reading-size':size+'px'} as CSSProperties}>
    {onBack&&<button type="button" className="mass-button" onClick={onBack}><ChevronLeft size={18}/>Volver a Oración</button>}
    <h2>Misa</h2>
    <div className="mass-date" data-mass-anchor="date"><div className="mass-row"><label htmlFor={uid+'-date'}>Fecha que querés consultar</label><button type="button" className="mass-button" onClick={()=>selectDate(today)}>Hoy</button></div>
      <div className="mass-date-row"><button type="button" className="mass-button" aria-label="Día anterior" disabled={date==='1900-01-01'} onClick={()=>selectDate(shiftMassDate(date,-1))}><ChevronLeft size={18}/></button><input id={uid+'-date'} type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={e=>selectDate(e.target.value)}/><button type="button" className="mass-button" aria-label="Día siguiente" disabled={date==='2100-12-31'} onClick={()=>selectDate(shiftMassDate(date,1))}><ChevronRight size={18}/></button></div>
      <p className="mass-meta">{date===today?'Hoy · ':''}{formatMassDate(date)} · Hora de Costa Rica</p>{error&&<p role="alert">{error}</p>}
    </div>
    {context.choices.length>0&&<fieldset className="mass-choices"><legend>{context.kind==='christmas'?'¿Qué misa de Navidad estás consultando?':'¿Qué celebración estás consultando?'}</legend><div className="mass-row">{context.choices.map(c=><button type="button" className="mass-button" aria-pressed={choice===c.value} key={c.value} onClick={()=>{generation.current++;anchor.current='celebration';setChoice(c.value);setOpen(null);setInner(null);}}>{c.label}</button>)}</div></fieldset>}
    {!context.awaiting&&<><h3 data-mass-anchor="celebration">{context.title}</h3>{context.effectiveDate!==date&&<p>Celebración del {formatMassDate(context.effectiveDate)}</p>}
      {context.kind==='holy-saturday'?<p>Antes de la Vigilia Pascual no se celebra misa.</p>:<>
      <p className="mass-meta">{context.kind==='general'?'Guía para seguir la celebración. Algunas oraciones todavía no están disponibles.':'Orientación en revisión para esta celebración especial. Seguí las indicaciones del celebrante; los textos completos aún no están disponibles.'}</p>
      {context.kind==='friday'&&<p>Este día no se celebra misa.</p>}
      <div className="mass-toolbar"><div className="mass-row" role="group" aria-label="Vista de Misa">{(['guide','readings'] as const).map(s=><button type="button" className="mass-button" key={s} aria-pressed={screen===s} onClick={()=>{generation.current++;anchor.current='celebration';setScreen(s);setOpen(null);setInner(null);}}>{s==='guide'?'Guía':'Lecturas'}</button>)}</div><div className="mass-row"><button type="button" className="mass-button" disabled={size===20} aria-label="Reducir letra" onClick={()=>setSize(Math.max(20,size-2))}>A−</button><button type="button" className="mass-button" disabled={size===32} aria-label="Ampliar letra" onClick={()=>setSize(Math.min(32,size+2))}>A+</button></div></div>
      {screen==='readings'?readingCards():sections.map((s,i)=><section className="mass-section" key={s.id}><h4><button type="button" data-mass-anchor={s.id} aria-expanded={open===s.id} aria-controls={uid+'-'+s.id} onClick={()=>toggle(s.id)}><span className="mass-number">{i+1}</span><span>{s.title}</span><ChevronDown size={18}/></button></h4>{open===s.id&&<div id={uid+'-'+s.id} className="mass-content">
        {context.kind==='palm'&&s.id==='entry'&&<fieldset className="mass-choices"><legend>Forma de entrada</legend><div className="mass-row">{[['procession','Con procesión'],['solemn','Entrada solemne'],['simple','Entrada sencilla']].map(([v,label])=><button type="button" className="mass-button" key={v} aria-pressed={palm===v} onClick={()=>{setPalm(v);setInner(null);}}>{label}</button>)}</div></fieldset>}
        {context.kind==='thursday'&&s.id==='word'&&<button type="button" className="mass-button" aria-pressed={washing} onClick={()=>{setWashing(!washing);setInner(null);}}>{washing?'Lavatorio incluido':'Sin lavatorio'}</button>}
        {context.kind==='vigil'&&s.id==='baptism'&&<div className="mass-row">{[false,true].map(v=><button type="button" className="mass-button" key={String(v)} aria-pressed={baptisms===v} onClick={()=>{setBaptisms(v);setInner(null);}}>{v?'Con bautismos':'Sin bautismos'}</button>)}</div>}
        {s.id==='word'&&readingCards()}
        {s.moments.map((m,j)=>{const id=s.id+'-moment-'+j;return <div className="mass-moment" key={id}><button type="button" data-mass-anchor={id} aria-expanded={inner===id} aria-controls={uid+'-'+id} onClick={()=>toggle(id,true)}>{m}<ChevronDown size={18}/></button>{inner===id&&<div id={uid+'-'+id}><p className="mass-text">{massMomentNote(m,context.kind)}</p><p className="mass-meta">Texto litúrgico pendiente de cotejo y autorización. Esta indicación es orientación de Alianza, no una oración litúrgica.</p></div>}</div>;})}
      </div>}</section>)}
      </>}
    </>}
    <div className="mass-special"><button type="button" className="mass-disclosure" aria-expanded={specialOpen} aria-controls={uid+'-special'} data-mass-anchor="special" onClick={()=>{generation.current++;anchor.current=specialOpen?null:'special';setSpecialOpen(!specialOpen);}}>Celebraciones especiales<ChevronDown size={18}/></button>{specialOpen&&<div id={uid+'-special'}><p className="mass-meta">Fechas de {date.slice(0,4)} · navegación del calendario romano general</p><div className="mass-row">{massSpecialDates(Number(date.slice(0,4))).map(s=><button type="button" className="mass-button" key={s.date} onClick={()=>selectDate(s.date,s.title==='Vigilia Pascual'?'vigil':'')}>{s.title}</button>)}</div></div>}</div>
    <details className="mass-sources"><summary>Fuentes y estado de los textos</summary><p>Las estructuras son resúmenes de orientación; todavía no constituyen un misal completo.</p><p><a href="https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_sp.html" target="_blank" rel="noreferrer">Instrucción General del Misal Romano</a></p><p><a href="https://www.usccb.org/prayer-and-worship/liturgical-year-and-calendar/triduum/questions-and-answers" target="_blank" rel="noreferrer">Orientación sobre el Triduo</a></p><p>Usamos el calendario romano general. Las celebraciones propias de Costa Rica o de tu parroquia pueden tener otras lecturas.</p><p>Cuando están disponibles, las lecturas se consultan en Evangelizo y muestran su fuente. Las variantes especiales y las oraciones aún no verificadas permanecen pendientes.</p></details>
    <div ref={spacer} aria-hidden="true"/>
  </section>;
}
