import {createContext,useContext,useRef,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction} from '@/components/ui/alert-dialog';
import {BackButton} from './back-button';

const TaskContext=createContext<{footer:HTMLElement|null;setDirty:(dirty:boolean)=>void;setPending:(pending:boolean)=>void}|null>(null);
export const useTaskDialog=()=>useContext(TaskContext);

/** Keeps actions outside the scrolling body without changing the form's submit handler. */
export function TaskActions({children}:{children:ReactNode}){
 const task=useTaskDialog();
 return task?.footer?createPortal(children,task.footer):<>{children}</>;
}

export function TaskDialog({open,onClose,title,description,children,busy=false,guardChanges=false,actions,descriptionHidden=false}:{open:boolean;onClose:()=>void;title:string;description:string;children:ReactNode;busy?:boolean;guardChanges?:boolean;actions?:ReactNode;descriptionHidden?:boolean}){
 const [footer,setFooter]=useState<HTMLElement|null>(null),[dirty,setDirty]=useState(false),[pending,setPending]=useState(false),[discard,setDiscard]=useState(false);
 const titleRef=useRef<HTMLHeadingElement>(null),origin=useRef<HTMLElement|null>(null);
 const locked=busy||pending;
 function close(){if(locked)return;if(guardChanges&&dirty)setDiscard(true);else onClose();}
 return <TaskContext.Provider value={{footer,setDirty,setPending}}>
  <Dialog open={open} onOpenChange={v=>{if(!v)close();}}>
   <DialogContent className="app-task-dialog" showCloseButton={false} onOpenAutoFocus={e=>{e.preventDefault();origin.current=document.activeElement as HTMLElement;titleRef.current?.focus({preventScroll:true});}} onCloseAutoFocus={e=>{e.preventDefault();if(origin.current?.isConnected)origin.current.focus({preventScroll:true});}}>
    <header className="app-task-header"><BackButton label="Cerrar formulario" disabled={locked} onClick={close}/></header>
    <div className="app-task-body editor-form" onChangeCapture={()=>{if(guardChanges)setDirty(true);}}>
     <DialogTitle ref={titleRef} tabIndex={-1} className="dialog-title">{title}</DialogTitle>
     <DialogDescription className={descriptionHidden?'sr-only':undefined}>{description}</DialogDescription>
     {children}
    </div>
    <footer className="app-task-footer app-task-portal-footer" ref={setFooter}>{actions}</footer>
   </DialogContent>
  </Dialog>
  <AlertDialog open={discard} onOpenChange={setDiscard}><AlertDialogContent><AlertDialogTitle>¿Cerrar sin guardar?</AlertDialogTitle><AlertDialogDescription>Los cambios de este formulario se perderán. Tus registros guardados se conservan.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Seguir escribiendo</AlertDialogCancel><AlertDialogAction disabled={locked} onClick={()=>{setDiscard(false);setDirty(false);onClose();}}>Descartar cambios</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
 </TaskContext.Provider>;
}
