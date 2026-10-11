import {useState} from 'react';
import {ChevronDown,Minus,Plus} from 'lucide-react';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel} from '@/components/ui/dropdown-menu';

/** One quiet entry in the list; corrections stay together in its action menu. */
export function HabitCountMenu({title,count,today,disabled,onChange}:{title:string;count:number;today:boolean;disabled:boolean;onChange:(count:number|undefined)=>void}){
 const [open,setOpen]=useState(false);
 return <DropdownMenu open={open} onOpenChange={setOpen}>
  <DropdownMenuTrigger className="habit-count-trigger" disabled={disabled} aria-label={`${title}: ${count} ${today?'hoy':'en esta fecha'}. Ajustar registros`} onPointerDown={e=>e.preventDefault()} onClick={e=>{if(!disabled&&e.button===0&&!e.ctrlKey)setOpen(v=>!v);}}>
   <span>{count}<small>{today?'hoy':'ese día'}</small></span><ChevronDown size={12} aria-hidden="true"/>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="habit-count-menu">
   <DropdownMenuLabel>{title}</DropdownMenuLabel>
   <DropdownMenuItem disabled={disabled||count>=99} onClick={()=>onChange(count+1)}><Plus size={18} aria-hidden="true"/>Agregar uno</DropdownMenuItem>
   <DropdownMenuItem disabled={disabled} onClick={()=>onChange(count>1?count-1:undefined)}><Minus size={18} aria-hidden="true"/>Restar uno</DropdownMenuItem>
  </DropdownMenuContent>
 </DropdownMenu>;
}
