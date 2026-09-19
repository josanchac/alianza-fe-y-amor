import {Zap,TreeDeciduous,Heart,Cross,Flame,Anchor,Mountain,Sun,Star,Flower2,Sprout,Bird,Church,Compass,Waves,BookOpen} from 'lucide-react';
export {PERSONAL_SYMBOLS} from '@/lib/personal-symbols';
const icons={lightning:Zap,heart:Heart,tree:TreeDeciduous,cross:Cross,flame:Flame,anchor:Anchor,mountain:Mountain,sun:Sun,star:Star,flower:Flower2,sprout:Sprout,bird:Bird,church:Church,compass:Compass,waves:Waves,book:BookOpen};
export function PersonalSymbol({symbol,image,size=20}:{symbol?:string;image?:string;size?:number}){
 if(image&&image.length<=30000&&/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(image))return <img src={image} alt="Mi símbolo" width={size} height={size} style={{objectFit:'contain',borderRadius:4}}/>;
 if(!symbol)return null;
 if(symbol==='church')return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d="M4 28h24M6 28V15l10-6 10 6v13M3 16l13-9 13 9M14 8V4l2-3 2 3v4M16 1V0M13 28v-8a3 3 0 0 1 6 0v8M8 17h3v4H8zM21 17h3v4h-3z"/></svg>;
 if(symbol==='rosary')return <svg width={size} height={size} viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><ellipse cx="12" cy="9" rx="7" ry="7" strokeDasharray="1 4" strokeLinecap="round"/><path d="M12 16v10m-3-4h6"/></svg>;
 const Icon=Object.hasOwn(icons,symbol??'')?icons[symbol as keyof typeof icons]:Heart;
 return <Icon size={size} aria-hidden="true"/>;
}
