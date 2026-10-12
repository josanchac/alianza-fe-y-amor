import {useState,type ReactNode} from 'react';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent} from '@/components/ui/dropdown-menu';

/** Wait for a completed activation so touching a title can start native scrolling. */
export function HabitActionsMenu({title,disabled,children}:{title:string;disabled:boolean;children:ReactNode}){
 const [open,setOpen]=useState(false);
 return <DropdownMenu open={open} onOpenChange={setOpen}>
  <DropdownMenuTrigger
   className="habit-title-button"
   disabled={disabled}
   aria-label={'Editar: '+title}
   title={'Editar compromiso: '+title}
   // Cancel Radix's pointer-down activation, not native touch scrolling.
   // No touch-action:none, pointer capture, pressure or long-press requirement.
   onPointerDown={event=>event.preventDefault()}
   onClick={event=>{
    if(!disabled&&event.button===0&&!event.ctrlKey)setOpen(value=>!value);
   }}
  >{title}</DropdownMenuTrigger>
  <DropdownMenuContent align="start">{children}</DropdownMenuContent>
 </DropdownMenu>;
}
