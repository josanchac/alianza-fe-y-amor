import {useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {Check,ChevronRight,Circle} from 'lucide-react';
import {completedDecades,MYSTERIES,type Rosary} from '@/lib/community';
import {prettyDate} from '@/lib/domain';
import {BackHeader} from './back-header';

/** Compact index only; the existing record owns all prayer and save behavior. */
export function RosaryHistory({rosaries,title,backLabel,onBack,renderRecord}:{rosaries:Rosary[];title:string;backLabel:string;onBack:()=>void;renderRecord:(r:Rosary)=>ReactNode}){
 const [selected,setSelected]=useState<string|null>(null);
 const origin=useRef<{y:number;id:string}|null>(null),restore=useRef(false),heading=useRef<HTMLDivElement>(null);
 const record=rosaries.find(r=>r.id===selected);
 useLayoutEffect(()=>{if(restore.current&&origin.current){restore.current=false;window.scrollTo({top:origin.current.y,behavior:'instant'});document.getElementById(origin.current.id)?.focus({preventScroll:true});}else if(selected){window.scrollTo({top:0,behavior:'instant'});heading.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});}},[selected]);
 return <div className="app-rosary-history" ref={heading}><BackHeader title={record?undefined:title} label={record?'Volver al historial':backLabel} onBack={record?()=>{restore.current=true;setSelected(null);}:onBack}/>
  {record?renderRecord(record):rosaries.map(r=>{const complete=completedDecades(r)===5,day=r.mine.map(m=>m.day).sort().at(-1),id='rosary-history-'+r.id;
   return <button key={r.id} id={id} className="app-history-row" onClick={()=>{origin.current={y:window.scrollY,id};setSelected(r.id);}}><span className="app-history-state">{complete?<Check size={18}/>:<Circle size={18}/>}</span><span><strong>Misterios {MYSTERIES[r.mystery].name.toLowerCase()}</strong><small>{complete?'Rosario concluido':'Rosario en curso'}{day?' · '+prettyDate(day):''}</small></span><ChevronRight size={18}/></button>;
  })}
 </div>;
}
