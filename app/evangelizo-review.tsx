import {useEffect,useState,useId} from 'react';
import {loadEvangelizo,type EvangelizoDay} from '../lib/evangelizo';
/** Review-only provider output. Never represents an approved Costa Rican lectionary. */
export function EvangelizoReview({date,today,kind,activeReading,onToggle}:{date:string;today:string;kind:string;activeReading?:string|null;onToggle?:(id:string)=>void}){
  const uid=useId();
  const [result,setResult]=useState<EvangelizoDay|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0),[open,setOpen]=useState<string|null>(null);
  const expanded=activeReading===undefined?open:activeReading;
  useEffect(()=>{
    setResult(null);setError('');setOpen(null);
    if(kind!=='general')return;
    const controller=new AbortController();let active=true;
    const timer=setTimeout(()=>controller.abort(),15000);
    loadEvangelizo(date,today,controller.signal).then(data=>{if(active)setResult(data);}).catch(reason=>{if(active)setError(controller.signal.aborted?'La carga tardó demasiado. Podés reintentar o abrir las lecturas en Evangelizo.':reason instanceof TypeError?'No pudimos conectar con Evangelizo. Podés reintentar o abrir su página.':reason instanceof Error?reason.message:'No pudimos cargar las lecturas para esta fecha.');}).finally(()=>clearTimeout(timer));
    return()=>{active=false;clearTimeout(timer);controller.abort();};
  },[date,today,kind,retry]);
  if(kind!=='general')return <p className="mass-pending">Todavía no tenemos lecturas verificadas para esta celebración especial.</p>;
  return <div>

    {error?<div role="status"><p>{error}</p><button className="mass-button" onClick={()=>setRetry(n=>n+1)}>Reintentar</button><a className="mass-button" href={'https://evangeliodeldia.org/SP/gospel/'+date} target="_blank" rel="noreferrer">Abrir en Evangelizo</a></div>:!result||result.date!==date?<p role="status">Cargando lecturas…</p>:<>
      <p>{result.title}</p>
      <div className="mass-reading-set">{result.readings.map(r=><div className="mass-moment mass-reading" key={r.id}><button type="button" aria-expanded={expanded===r.id} aria-controls={uid+r.id} data-mass-anchor={'evangelizo-'+r.id} onClick={()=>{if(onToggle)onToggle(r.id);else setOpen(expanded===r.id?null:r.id);}}>{r.title}</button>{expanded===r.id&&<div id={uid+r.id}><p className="mass-reference">{r.reference}</p><p className="mass-text">{r.text}</p></div>}</div>)}</div>
      <details className="compact-reading-source"><summary>Fuente de estas lecturas</summary><p className="mass-attribution">Evangelizo · Biblia: El Libro del Pueblo de Dios.</p>
      <a className="mass-button" href={result.source} target="_blank" rel="noreferrer">Ver fuente en Evangelizo</a><p className="mass-meta">Calendario romano general.</p></details>
    </>}
  </div>;
}
