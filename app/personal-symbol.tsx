import {TreeDeciduous,Heart,Cross,Flame,Anchor,Mountain,Sun,Star,Flower2,Sprout,Bird,Church,Compass,Waves,BookOpen} from 'lucide-react';
export {PERSONAL_SYMBOLS} from '@/lib/personal-symbols';
const icons={heart:Heart,tree:TreeDeciduous,cross:Cross,flame:Flame,anchor:Anchor,mountain:Mountain,sun:Sun,star:Star,flower:Flower2,sprout:Sprout,bird:Bird,church:Church,compass:Compass,waves:Waves,book:BookOpen};
export function PersonalSymbol({symbol,size=20}:{symbol?:string;size?:number}){
 if(symbol==='rosary')return <svg width={size} height={size} viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><ellipse cx="12" cy="9" rx="7" ry="7" strokeDasharray="1 4" strokeLinecap="round"/><path d="M12 16v10m-3-4h6"/></svg>;
 const Icon=Object.hasOwn(icons,symbol??'')?icons[symbol as keyof typeof icons]:Heart;
 return <Icon size={size} aria-hidden="true"/>;
}
