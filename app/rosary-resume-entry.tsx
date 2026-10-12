import {ChevronRight,Heart,UserRound} from 'lucide-react';
import {MYSTERIES,type Rosary,completedDecades} from '@/lib/community';
import {rosaryStep,DEFAULT_OPENING} from '@/lib/rosary-guide';
export const isPendingRosary=(r:Rosary)=>!r.cancelled&&(r.coupleId||r.personalStep===undefined?completedDecades(r)<5:r.personalStep!==69);
export function RosaryResumeEntry({r,onOpen,disabled=false}:{r:Rosary;onOpen:()=>void;disabled?:boolean}){
 const couple=!!r.coupleId;
 const step=rosaryStep(r.personalStep??0,r.opening??DEFAULT_OPENING);
 const progress=couple?`${completedDecades(r)} de 5 misterios completados`:!r.personalStep?'Listo para empezar':step.decade===0?'Oraciones iniciales':step.decade===6?'Oraciones finales':`Misterio ${step.decade} de 5${step.bead?` · Avemaría ${step.bead} de 10`:''}`;
 return <button type="button" className={'rosary-resume-entry '+(couple?'is-couple':'is-personal')} disabled={disabled} onClick={onOpen} aria-label={`Continuar rosario ${couple?'en pareja':'personal'} · Misterios ${MYSTERIES[r.mystery].name.toLowerCase()}`}>
  <span className="rosary-resume-icon" aria-hidden="true">{couple?<Heart size={21}/>:<UserRound size={21}/>}</span>
  <span className="rosary-resume-copy"><small>{couple?'En pareja':'Personal'}</small><strong>Misterios {MYSTERIES[r.mystery].name.toLowerCase()}</strong><span>{progress}</span></span><ChevronRight size={20} aria-hidden="true"/>
 </button>;
}
