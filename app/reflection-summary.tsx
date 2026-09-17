import {useState} from 'react';
import type {RecordItem} from '@/lib/domain';
import {prettyDate} from '@/lib/domain';
import {reflectionGroups} from '@/lib/reflections';
export function ReflectionSummary({rows,start,end}:{rows:RecordItem[];start:string;end:string}){
 const [expanded,setExpanded]=useState(false);const groups=reflectionGroups(rows,start,end);
 if(!groups.length)return null;
 return <section className="reflection-summary"><h2>Mis reflexiones</h2>{groups.map(g=><section className="card" key={g.key}><h3>{g.title}</h3>{g.entries.slice(0,expanded?undefined:3).map(e=><article key={e.date}><time dateTime={e.date}>{prettyDate(e.date)}</time><p className="preserve">{e.text}</p></article>)}</section>)}{groups.some(g=>g.entries.length>3)&&<button className="text-button" onClick={()=>setExpanded(!expanded)}>{expanded?'Ver menos':'Ver todas las reflexiones'}</button>}</section>;
}
