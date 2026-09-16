import type {RecordItem} from '@/lib/domain';
import {rhythmProgress} from '@/lib/rhythm';
import {SymbolProgress} from './symbol-progress';
export function RhythmProgress({rows,date,today,selected,onSelect,symbol,image}:{rows:RecordItem[];date:string;today:string;selected:string;onSelect:(p:'day'|'week'|'month')=>void;symbol?:string;image?:string}){
 return <div className="rhythm-progress" aria-label="Avance por frecuencia">{([['day','Día'],['week','Semana'],['month','Mes']] as const).map(([period,label])=>{const p=rhythmProgress(rows,date,today,period);if(period!=='day'&&!p.habits.length)return null;return <button key={period} className={'rhythm-'+period} aria-pressed={selected===period} onClick={()=>onSelect(period)}><span className="rhythm-mini"><SymbolProgress symbol={symbol} image={image} value={p.percent??0} total={p.percent===null?0:100} label={'Avance del '+label.toLowerCase()}/></span><span><strong>{label}{p.percent===100?' ✓':''}</strong><small>{!p.total?(p.skipped?'No aplicaba':'Sin compromisos'):p.percent===null?'Período parcial':`${p.done} de ${p.total} completos`}</small></span></button>;})}</div>;
}
