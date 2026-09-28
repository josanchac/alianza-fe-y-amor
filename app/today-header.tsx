import {useEffect,useRef,useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {SymbolProgress} from './symbol-progress';
import {rhythmProgress,frequencyAt} from '@/lib/rhythm';
import type {RecordItem} from '@/lib/domain';

export function TodayHeader({rows,date,today,symbol,image,progressStyle}:{rows:RecordItem[];date:string;today:string;symbol:string;image?:string;progressStyle?:'fill'|'ring'}){
 const [open,setOpen]=useState(false),[compact,setCompact]=useState(false);
 const sentinel=useRef<HTMLDivElement>(null),header=useRef<HTMLElement>(null);
 const dailyRows=rows.filter(r=>r.kind!=='habit'||!frequencyAt(rows,r,date)?.course);
 const day=rhythmProgress(dailyRows,date,today,'day');
 useEffect(()=>{
  let frame=0;
  const update=()=>{frame=0;if(!sentinel.current||!header.current)return;const top=sentinel.current.getBoundingClientRect().top;const inset=parseFloat(getComputedStyle(header.current).top)||0;const progress=Math.max(0,Math.min(1,(inset-top)/96));header.current.style.setProperty('--header-collapse',String(progress));setCompact(progress>0);};
  const queue=()=>{if(!frame)frame=requestAnimationFrame(update);};
  window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);update();
  return()=>{window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);cancelAnimationFrame(frame);};
 },[]);
 return <><div ref={sentinel} className="today-sentinel" aria-hidden="true"/><header ref={header} className={'today-heading serene-heading'+(compact?' is-compact':'')}><div><h1>{date===today?'Hoy':'Mi día'}</h1><span className="today-date">{new Date(date+'T12:00:00').toLocaleDateString('es-CR',{day:'numeric',month:'long'})}</span></div><button className="today-progress-button" aria-label="Ver mi avance" onClick={()=>setOpen(true)}><SymbolProgress value={day.value} total={day.total} symbol={symbol} image={image} progressStyle={progressStyle} label="Compromisos diarios"/><span>Mi avance</span></button></header><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogTitle>Mi avance</DialogTitle><DialogDescription>El símbolo principal refleja tus compromisos diarios. Cada período conserva su propio avance.</DialogDescription>{([['day','Hoy'],['week','Esta semana'],['month','Este mes']] as const).map(([period,label])=>{const p=rhythmProgress(period==='day'?dailyRows:rows,date,today,period);return <div className="today-progress-detail" key={period}><strong>{label}</strong><p>{p.total?`${p.done} de ${p.total} compromisos completados`:'Sin compromisos programados'}{p.skipped>0?` · ${p.skipped} no aplicaban`:''}</p></div>;})}</DialogContent></Dialog></>;
}
