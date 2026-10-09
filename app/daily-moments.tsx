import {useState} from 'react';
import {Sun,Heart,BookOpen} from 'lucide-react';

export type JournalField='offering'|'gratitude'|'meditation';
const categories=[['offering','Ofrecimiento',Sun],['gratitude','Agradecimiento',Heart],['meditation','Meditación',BookOpen]] as const;

function SavedMoment({text,title,visibility,disabled,onEdit}:{text:string;title:string;visibility:string;disabled:boolean;onEdit:()=>void}){
 const [expanded,setExpanded]=useState(false);
 const hasText=!!text.trim(),characters=Array.from(text),long=characters.length>180;
 return <section className="moment-reading" aria-label={title+' del día'}>
  <div className="moment-reading-heading"><h3>{title}</h3><small>{visibility}</small></div>
  {hasText?<>
   <p className="moment-saved-text">{long&&!expanded?characters.slice(0,180).join('')+'…':text}</p>
   <div className="moment-actions">
    {long&&<button type="button" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}>{expanded?'Ver menos':'Leer completo'}</button>}
    <button type="button" disabled={disabled} aria-label={'Editar '+title.toLowerCase()} onClick={onEdit}>Editar</button>
   </div>
  </>:<><p>Todavía no escribiste aquí.</p><button type="button" disabled={disabled} onClick={onEdit}>Escribir {title.toLowerCase()}</button></>}
 </section>;
}

/** A read-only view of the selected day's own record; writes remain in Journal. */
export function DailyMoments({date,version,notes,disabled,visibility,onEdit}:{date:string;version:number;notes:Partial<Record<JournalField,string>>;disabled:boolean;visibility:(field:JournalField)=>string;onEdit:(field:JournalField)=>void}){
 const [selected,setSelected]=useState<JournalField>('offering');
 const title=categories.find(([field])=>field===selected)![1];
 return <section className="today-moment" aria-labelledby="moment-heading">
  <h2 id="moment-heading">Momento para vos</h2>
  <div className="moment-categories" role="group" aria-label="Reflexión del día">
   {categories.map(([field,label,Icon])=><button type="button" key={field} aria-pressed={selected===field} onClick={()=>setSelected(field)}><Icon size={20} aria-hidden="true"/><span>{label}</span></button>)}
  </div>
  <SavedMoment key={date+':'+selected+':'+version} text={notes[selected]??''} title={title} visibility={visibility(selected)} disabled={disabled} onEdit={()=>onEdit(selected)}/>
 </section>;
}
