import {MASS_PRAYERS,MassPrayers} from './mass-prayers';
import {BackButton} from './back-button';
import {EvangelizoReview} from './evangelizo-review';
declare const __EVANGELIZO_REVIEW__: boolean;
import {useId,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {CalendarDays,BookOpen,ChevronDown,ChevronLeft,ChevronRight} from 'lucide-react';
import {MASS_READINGS,availableMassReadings,formatMassDate,massContext,massSpecialDates,massToday,shiftMassDate,validMassDate,type MassChoice,type MassReadingSet} from '../lib/mass';

/** Read-only guide; optional provider requests contain only the selected date. */
export function Mass({onBack,readingSets=MASS_READINGS,now=()=>new Date()}:{onBack?:()=>void;readingSets?:readonly MassReadingSet[];now?:()=>Date}) {
  const uid=useId(),[date,setDate]=useState(()=>massToday(now())),[choice,setChoice]=useState<MassChoice>(''),[screen,setScreen]=useState<'guide'|'readings'>('readings');
  const [fontOpen,setFontOpen]=useState(false),[prayerId,setPrayerId]=useState<string|null>(null), prayer=MASS_PRAYERS.find(p=>p.id===prayerId);
  const [open,setOpen]=useState<string|null>(null),[inner,setInner]=useState<string|null>(null),[specialOpen,setSpecialOpen]=useState(false),[size,setSize]=useState(22);
  const [palm,setPalm]=useState('procession'),[washing,setWashing]=useState(true),[baptisms,setBaptisms]=useState(false),[error,setError]=useState('');
  const spacer=useRef<HTMLDivElement>(null);
  const root=useRef<HTMLElement>(null),anchor=useRef<string|null>(null),generation=useRef(0);
  const today=massToday(now()),context=massContext(date,choice);
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
    const calendar=root.current?.querySelector<HTMLDetailsElement>('.compact-mass-calendar');if(calendar)calendar.open=false;generation.current++;anchor.current='date';setDate(next);setChoice(nextChoice);setOpen(null);setInner(null);setSpecialOpen(false);setError('');setPalm('procession');setWashing(true);setBaptisms(false);
    // Today also works when the date has not changed.
    root.current?.querySelector<HTMLInputElement>('input[type="date"]')?.focus({preventScroll:true});
    if(next===date&&nextChoice===choice)root.current?.querySelector<HTMLElement>('[data-mass-anchor="date"]')?.scrollIntoView({block:'start',behavior:'instant'});
  }
  function toggle(id:string,nested=false){generation.current++;const current=nested?inner:open;anchor.current=current===id?null:'reading-start';if(nested)setInner(current===id?null:id);else{setOpen(current===id?null:id);setInner(null);}}
  const pending=<p className="mass-pending" role="status">Las lecturas de esta celebración todavía no están disponibles: falta verificar los textos completos, su permiso de uso y el calendario de Costa Rica.</p>;
  function readingCards(){if(!readings&&typeof __EVANGELIZO_REVIEW__!=='undefined'&&__EVANGELIZO_REVIEW__)return <EvangelizoReview key={context.effectiveDate+context.kind} date={context.effectiveDate} today={today} kind={context.kind} activeReading={inner?.startsWith('evangelizo-')?inner.slice(11):null} onToggle={id=>toggle('evangelizo-'+id,true)}/>;return readings?<div className="mass-reading-set">{readings.readings.map(r=>{const readingId='reading-'+r.id;return <div className="mass-moment mass-reading" key={r.id}><button type="button" aria-expanded={inner===readingId} aria-controls={uid+'-'+readingId} data-mass-anchor={readingId} onClick={()=>toggle(readingId,true)}>{r.title}<ChevronDown size={18}/></button>{inner===readingId&&<div id={uid+'-'+readingId}><p className="mass-reference">{r.reference}</p><p className="mass-text">{r.text}</p><p className="mass-attribution">{readings.rights.attribution}</p><a href={readings.source} target="_blank" rel="noreferrer">Fuente del texto</a></div>}</div>;})}</div>:pending;}
  if(prayer)return <section className="mass-view s3-prayer-reader" style={{'--mass-reading-size':size+'px'} as CSSProperties}><div className="s3-row"><BackButton label="Volver a oraciones y respuestas" onClick={()=>{setPrayerId(null);requestAnimationFrame(()=>root.current?.querySelector<HTMLElement>('[data-prayer-id="'+prayer.id+'"]')?.focus());}}/><div className="mass-row"><button className="mass-button" disabled={size===20} aria-label="Reducir letra" onClick={()=>setSize(Math.max(20,size-2))}>A−</button><button className="mass-button" disabled={size===32} aria-label="Ampliar letra" onClick={()=>setSize(Math.min(32,size+2))}>A+</button></div></div><h2>{prayer.title}</h2><p className="mass-text" style={{whiteSpace:'pre-line'}}>{prayer.text}</p>{'attribution' in prayer&&<p className="mass-meta">{prayer.attribution}</p>}<a className="quiet-source" href={prayer.source} target="_blank" rel="noreferrer">Consultar fuente</a></section>;
  return <section ref={root} className="mass-view" aria-label="Misa" style={{'--mass-reading-size':size+'px'} as CSSProperties}>
    <header className="compact-mass-header">{screen==='guide'?<BackButton label="Volver a Lecturas" onClick={()=>setScreen('readings')}/>:onBack&&<BackButton label="Volver a Oración" onClick={onBack}/>}<h2>{screen==='guide'?'Oraciones':'Misa'}</h2><button className="mass-button" aria-label="Tamaño de letra" aria-expanded={fontOpen} onClick={()=>setFontOpen(!fontOpen)}>Aa</button></header>
    {fontOpen&&<div className="mass-row compact-font-controls"><button className="mass-button" disabled={size===20} aria-label="Reducir letra" onClick={()=>setSize(Math.max(20,size-2))}>A−</button><span>{size} px</span><button className="mass-button" disabled={size===32} aria-label="Ampliar letra" onClick={()=>setSize(Math.min(32,size+2))}>A+</button></div>}
    <details className="compact-mass-calendar" hidden={screen==='guide'}><summary><CalendarDays size={18}/>{date===today?'Hoy · ':''}{formatMassDate(date)}</summary>
    <div className="mass-date" data-mass-anchor="date"><div className="mass-row"><label htmlFor={uid+'-date'}>Fecha que querés consultar</label><button type="button" className="mass-button" onClick={()=>selectDate(today)}>Hoy</button></div>
      <div className="mass-date-row"><button type="button" className="mass-button" aria-label="Día anterior" disabled={date==='1900-01-01'} onClick={()=>selectDate(shiftMassDate(date,-1))}><ChevronLeft size={18}/></button><input id={uid+'-date'} type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={e=>selectDate(e.target.value)}/><button type="button" className="mass-button" aria-label="Día siguiente" disabled={date==='2100-12-31'} onClick={()=>selectDate(shiftMassDate(date,1))}><ChevronRight size={18}/></button></div>
      <p className="mass-meta">{date===today?'Hoy · ':''}{formatMassDate(date)} · Hora de Costa Rica</p>{error&&<p role="alert">{error}</p>}
    </div>
    </details>
    {context.choices.length>0&&<fieldset className="mass-choices"><legend>{context.kind==='christmas'?'¿Qué misa de Navidad estás consultando?':'¿Qué celebración estás consultando?'}</legend><div className="mass-row">{context.choices.map(c=><button type="button" className="mass-button" aria-pressed={choice===c.value} key={c.value} onClick={()=>{generation.current++;anchor.current='celebration';setChoice(c.value);setOpen(null);setInner(null);}}>{c.label}</button>)}</div></fieldset>}
    {!context.awaiting&&<>{context.kind!=='general'&&<h3 data-mass-anchor="celebration">{context.title}</h3>}{context.effectiveDate!==date&&<p>Celebración del {formatMassDate(context.effectiveDate)}</p>}
      {context.kind==='holy-saturday'?<p>Antes de la Vigilia Pascual no se celebra misa.</p>:<>

      {context.kind==='friday'&&<p>Este día no se celebra misa.</p>}
      {screen==='readings'?<div className="compact-mass-readings" data-mass-anchor="reading-start">{readingCards()}</div>:<MassPrayers onSelect={id=>{setPrayerId(id);window.scrollTo({top:0,behavior:'instant'});}}/>}
      </>}
    </>}
    {screen==='readings'?<button className="compact-mass-prayers" aria-label="Oraciones" onClick={()=>{setScreen('guide');setInner(null);}}><BookOpen size={20}/><span>Oraciones de la misa</span><ChevronRight size={18}/></button>:<button className="mass-button" onClick={()=>setScreen('readings')}>Lecturas</button>}
    <div className="mass-special" hidden={screen==='guide'}><button type="button" className="mass-disclosure" aria-expanded={specialOpen} aria-controls={uid+'-special'} data-mass-anchor="special" onClick={()=>{generation.current++;anchor.current=specialOpen?null:'special';setSpecialOpen(!specialOpen);}}>Celebraciones especiales<ChevronDown size={18}/></button>{specialOpen&&<div id={uid+'-special'}><p className="mass-meta">Fechas de {date.slice(0,4)} · navegación del calendario romano general</p><div className="mass-row">{massSpecialDates(Number(date.slice(0,4))).map(s=><button type="button" className="mass-button" key={s.date} onClick={()=>selectDate(s.date,s.title==='Vigilia Pascual'?'vigil':'')}>{s.title}</button>)}</div></div>}</div>
    <details className="mass-sources"><summary>Fuentes y estado de los textos</summary><p>La selección de oraciones es parcial y no constituye un misal completo. Las variantes y textos adicionales se incorporarán después de cotejar la edición aplicable y su reproducción.</p><p><a href="https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_sp.html" target="_blank" rel="noreferrer">Instrucción General del Misal Romano</a></p><p><a href="https://www.usccb.org/prayer-and-worship/liturgical-year-and-calendar/triduum/questions-and-answers" target="_blank" rel="noreferrer">Orientación sobre el Triduo</a></p><p>Usamos el calendario romano general. Las celebraciones propias de Costa Rica o de tu parroquia pueden tener otras lecturas.</p><p>Cuando están disponibles, las lecturas se consultan en Evangelizo y muestran su fuente. Las variantes especiales y las oraciones aún no verificadas permanecen pendientes.</p></details>
    <div ref={spacer} aria-hidden="true"/>
  </section>;
}
