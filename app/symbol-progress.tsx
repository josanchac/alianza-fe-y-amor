import type {CSSProperties} from 'react';
import {PersonalSymbol} from './personal-symbol';
export function SymbolProgress({value,total,extra=0,symbol='tree',image,label='Mi avance',progressStyle='fill'}:{value:number;total:number;extra?:number;symbol?:string;image?:string;label?:string;progressStyle?:'fill'|'ring'}){
 const maximum=Math.max(1,total),count=Math.max(0,Math.min(value,maximum)),percent=total>0?100*count/maximum:0;
 const mask='linear-gradient(to top,#000 calc(var(--symbol-percent) * 1.12 - 12%),transparent calc(var(--symbol-percent) * 1.12))';
 return <div className={'symbol-progress'+(progressStyle==='ring'?' is-ring':'')+(percent===100?' is-full':'')+(total>0&&extra>0?' has-additional':'')} style={{'--symbol-percent':percent+'%'} as CSSProperties} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={maximum} aria-valuenow={count} aria-valuetext={total>0?`${count} de ${total}${extra>0?`; ${extra} adicionales`:''}`:`${value} registros; meta no disponible`}>
  {progressStyle==='ring'?<span className="symbol-ring-picture"><PersonalSymbol symbol={symbol||'tree'} image={image} size={66}/></span>:<><span className="symbol-progress-base"><PersonalSymbol symbol={symbol||'tree'} image={image} size={76}/></span><span className="symbol-progress-color" style={{maskImage:mask,WebkitMaskImage:mask}}><PersonalSymbol symbol={symbol||'tree'} image={image} size={76}/></span></>}
 </div>;
}
