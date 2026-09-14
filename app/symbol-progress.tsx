import {PersonalSymbol} from './personal-symbol';
export function SymbolProgress({value,total,symbol='tree',image,label='Mi avance'}:{value:number;total:number;symbol?:string;image?:string;label?:string}){
 const maximum=Math.max(1,total), count=Math.max(0,Math.min(value,maximum)), percent=total>0?100*count/maximum:0;
 return <div className="symbol-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={maximum} aria-valuenow={count} aria-valuetext={total>0?`${value} de ${total}`:`${value} registros; meta no disponible`}>
  <span className="symbol-progress-base"><PersonalSymbol symbol={symbol||'tree'} image={image} size={76}/></span>
  <span className="symbol-progress-color" style={{clipPath:`inset(${100-percent}% 0 0 0)`}}><PersonalSymbol symbol={symbol||'tree'} image={image} size={76}/></span>
 </div>;
}
