import {Check,Leaf} from 'lucide-react';
export function QuietProgress({value,total,label}:{value:number;total:number;label:string}){
 const count=Math.min(Math.max(value,0),total),complete=count>=total;
 return <div className={'quiet-progress '+(complete?'is-complete':'')}>
  <div className="quiet-progress-ring" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={count} aria-valuetext={`${count} de ${total} ocasiones registradas`}>
   <svg viewBox="0 0 100 100" aria-hidden="true"><circle className="ring-track" cx="50" cy="50" r="43"/><circle className="ring-fill" cx="50" cy="50" r="43" pathLength="100" strokeDasharray={`${100*count/total} 100`}/></svg>
   <span aria-hidden="true">{complete?<Check size={26}/>:<Leaf size={25}/>}</span>
  </div>
  <div><p className="progress-count" role="status"><strong>{count}</strong><span>de {total} ocasiones</span></p><p className="progress-caption">{complete?'Meta registrada':count?'Paso a paso, a tu ritmo':'Cada ocasión cuenta'}</p>
   {total<=7&&<div className="quiet-steps" aria-hidden="true">{Array.from({length:total},(_,i)=><span key={i} className={i<count?'done':''}>{i<count?<Check size={12}/>:i+1}</span>)}</div>}
  </div>
 </div>;
}
