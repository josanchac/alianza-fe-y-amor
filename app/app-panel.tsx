import {useState, type ReactNode} from 'react';
import {Bell,BookOpen,ChevronRight,Download,Heart,Info,MapPin,ShieldCheck,Smartphone,Sparkles,X} from 'lucide-react';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';

const icons={bell:Bell,book:BookOpen,download:Download,heart:Heart,info:Info,map:MapPin,privacy:ShieldCheck,phone:Smartphone,sparkles:Sparkles};
export function AppPanel({title,hint,icon='info',children,onActivate}:{title:string;hint?:string;icon?:keyof typeof icons;children?:ReactNode;onActivate?:()=>void}){
 const [open,setOpen]=useState(false);const Icon=icons[icon];
 const trigger=<button className="app-menu-row" onClick={onActivate}><span className="app-menu-icon"><Icon size={20}/></span><span className="app-menu-copy"><strong>{title}</strong>{hint&&<small>{hint}</small>}</span><ChevronRight size={18}/></button>;
 if(onActivate)return trigger;
 return <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>{trigger}</DialogTrigger>
  <DialogContent className="app-focus-panel" showCloseButton={false}>
   <header className="focus-panel-header"><span className="app-menu-icon"><Icon size={22}/></span><div><DialogTitle>{title}</DialogTitle><DialogDescription>{hint||'A tu ritmo, cuando lo necesités.'}</DialogDescription></div><DialogClose asChild><button className="icon-button" aria-label="Cerrar panel"><X size={22}/></button></DialogClose></header>
   <div className="focus-panel-body">{children}</div>
  </DialogContent>
 </Dialog>;
}
