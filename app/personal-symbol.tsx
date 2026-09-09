import {TreeDeciduous,Heart,Cross} from 'lucide-react';
export function PersonalSymbol({symbol,size=20}:{symbol?:string;size?:number}){
 if(symbol==='tree')return <TreeDeciduous size={size}/>;
 if(symbol==='cross')return <Cross size={size}/>;
 if(symbol==='rosary')return <svg width={size} height={size} viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><ellipse cx="12" cy="9" rx="7" ry="7" strokeDasharray="1 4" strokeLinecap="round"/><path d="M12 16v10m-3-4h6"/></svg>;
 return <Heart size={size}/>;
}
