import {useState} from 'react';
import {useScrollChrome} from './navigation-scroll';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {SymbolProgress} from './symbol-progress';
import {rhythmProgress,frequencyAt} from '@/lib/rhythm';
import type {RecordItem} from '@/lib/domain';

export function TodayHeader({rows,date,today,symbol,image,progressStyle}:{rows:RecordItem[];date:string;today:string;symbol:string;image?:string;progressStyle?:'fill'|'ring'}){
 const [open,setOpen]=useState(false);
 const {marker,surface,raised}=useScrollChrome();
 const dailyRows=rows.filter(r=>r.kind!=='habit'||!frequencyAt(rows,r,date)?.course);
 const day=rhythmProgress(dailyRows,date,today,'day');
 return <><span ref={marker} className="app-chrome-marker" aria-hidden="true"/><header ref={surface} data-raised={raised} className="today-heading serene-heading"><div><h1>{date===today?'Hoy':'Mi día'}</h1><span className="today-date">{new Date(date+'T12:00:00').toLocaleDateString('es-CR',{day:'numeric',month:'long'})}</span></div><button className="today-progress-button" aria-label="Ver mi avance" onClick={()=>setOpen(true)}><SymbolProgress value={day.value} total={day.total} symbol={symbol} image={image} progressStyle={progressStyle} label="Compromisos diarios"/><span>Mi avance</span></button></header><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogTitle>Mi avance</DialogTitle><DialogDescription>El símbolo principal refleja tus compromisos diarios. Cada período conserva su propio avance.</DialogDescription>{([['day','Hoy'],['week','Esta semana'],['month','Este mes']] as const).map(([period,label])=>{const p=rhythmProgress(period==='day'?dailyRows:rows,date,today,period);return <div className="today-progress-detail" key={period}><strong>{label}</strong><p>{p.total?`${p.done} de ${p.total} compromisos completados`:'Sin compromisos programados'}{p.skipped>0?` · ${p.skipped} no aplicaban`:''}</p></div>;})}</DialogContent></Dialog></>;
}
