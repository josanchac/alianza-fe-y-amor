import {Check} from 'lucide-react';
import {SymbolProgress} from './symbol-progress';
export function QuietProgress({value,total,label,symbol,image}:{value:number;total:number;label:string;symbol?:string;image?:string}){
 const count=Math.min(Math.max(value,0),total),complete=count>=total;
 return <div className={'quiet-progress '+(complete?'is-complete':'')}>
  <SymbolProgress value={value} total={total} label={label} symbol={symbol} image={image}/>
  <div><p className="progress-count" role="status"><strong>{count}</strong><span>de {total} ocasiones</span></p><p className="progress-caption">{complete?'Meta registrada':count?'Paso a paso, a tu ritmo':'Cada ocasión cuenta'}</p>
   {total<=7&&<div className="quiet-steps" aria-hidden="true">{Array.from({length:total},(_,i)=><span key={i} className={i<count?'done':''}>{i<count?<Check size={12}/>:i+1}</span>)}</div>}
  </div>
 </div>;
}
