import {useState} from 'react';
import type {RecordItem} from '@/lib/domain';
import {prettyDate} from '@/lib/domain';
import {reflectionGroups} from '@/lib/reflections';
export function ReflectionSummary({rows,start,end}:{rows:RecordItem[];start:string;end:string}){
 const [category,setCategory]=useState(''),[page,setPage]=useState(0);const groups=reflectionGroups(rows,start,end);
 const group=groups.find(g=>g.key===category)??groups[0];
 if(!group)return <p className="muted">Todavía no hay reflexiones en este período.</p>;
 const currentPage=Math.min(page,Math.max(0,Math.ceil(group.entries.length/3)-1));
 return <section className="reflection-summary s3-reflections"><h3>Mis reflexiones</h3><div className="s3-segments" role="group" aria-label="Categorías de reflexiones">{groups.map(g=><button type="button" key={g.key} aria-label={g.title} aria-pressed={g.key===group.key} onClick={()=>{setCategory(g.key);setPage(0);}}>{g.title.replace(/^Mis /,'').replace(' a la Mater','')}</button>)}</div>{group.entries.slice(currentPage*3,currentPage*3+3).map(e=><article key={e.date}><p className="preserve">{e.text}</p><time dateTime={e.date}>{prettyDate(e.date)}</time></article>)}{group.entries.length>3&&<div className="s3-pager"><button type="button" disabled={!currentPage} onClick={()=>setPage(currentPage-1)}>Anterior</button><span>{currentPage*3+1}–{Math.min(currentPage*3+3,group.entries.length)} de {group.entries.length}</span><button type="button" disabled={(currentPage+1)*3>=group.entries.length} onClick={()=>setPage(currentPage+1)}>Siguiente</button></div>}</section>;
}
