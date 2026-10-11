import {useLayoutEffect,useRef,useState} from 'react';
import {Sun,Heart,BookOpen,ArrowLeft,ChevronRight} from 'lucide-react';
import {prettyDate} from '@/lib/domain';

export type JournalField='offering'|'gratitude'|'meditation';
const categories=[['offering','Ofrecimiento',Sun],['gratitude','Agradecimiento',Heart],['meditation','Meditación',BookOpen]] as const;

/** Reading is separate from Today; writes remain in Journal's existing editor. */
export function DailyMoments({date,open,onOpenChange,notes,disabled,visibility,onEdit}:{date:string;open:boolean;onOpenChange:(open:boolean)=>void;notes:Partial<Record<JournalField,string>>;disabled:boolean;visibility:(field:JournalField)=>string;onEdit:(field:JournalField)=>void}){
 const [selected,setSelected]=useState<JournalField>('offering');
 const entry=useRef<HTMLButtonElement>(null),back=useRef<HTMLButtonElement>(null);
 const returnY=useRef(0),wasOpen=useRef(false);
 useLayoutEffect(()=>{
  if(open){back.current?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  else if(wasOpen.current){entry.current?.focus({preventScroll:true});window.scrollTo({top:returnY.current,behavior:'instant'});}
  wasOpen.current=open;
 },[open]);
 const count=categories.filter(([key])=>!!notes[key]?.trim()).length;
 const title=categories.find(([field])=>field===selected)![1],text=notes[selected]??'',hasText=!!text.trim();
 if(!open)return <section className="today-moment">
  <button ref={entry} type="button" className="moment-entry" onClick={()=>{returnY.current=window.scrollY;setSelected('offering');onOpenChange(true);}}>
   <span>Mis reflexiones<small>{count?`${count} ${count===1?'guardada':'guardadas'} en esta fecha`:'Ofrecer, agradecer, meditar'}</small></span><ChevronRight size={20} aria-hidden="true"/>
  </button>
 </section>;
 return <section className="today-moment moment-reader" aria-labelledby="moment-heading">
  <button ref={back} type="button" className="moment-back" onClick={()=>onOpenChange(false)}><ArrowLeft size={20} aria-hidden="true"/>Volver a Hoy</button>
  <h1 id="moment-heading">Mis reflexiones</h1><p className="moment-date">{prettyDate(date)} · Personal</p>
  <div className="moment-categories" role="group" aria-label="Reflexión del día">
   {categories.map(([field,label,Icon])=><button type="button" key={field} aria-pressed={selected===field} onClick={()=>setSelected(field)}><Icon size={20} aria-hidden="true"/><span>{label}</span></button>)}
  </div>
  <section className="moment-reading" aria-label={title+' del día'}>
   <div className="moment-reading-heading"><h2>{title}</h2><small>{visibility(selected)}</small></div>
   <p className="moment-saved-text">{hasText?text:'Todavía no escribiste aquí.'}</p>
   <button type="button" disabled={disabled} aria-label={(hasText?'Editar ':'Escribir ')+title.toLowerCase()} onClick={()=>onEdit(selected)}>{hasText?'Editar':'Escribir '+title.toLowerCase()}</button>
  </section>
 </section>;
}
