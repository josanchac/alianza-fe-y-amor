import type {ReactNode} from 'react';
import {X} from 'lucide-react';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';
export function LogoViewer({children,className='',src='./emblem.svg'}:{children:ReactNode;className?:string;src?:string}){
 return <Dialog><DialogTrigger asChild><button type="button" className={'logo-viewer-trigger '+className} aria-label="Ver logo de Alianza en grande">{children}</button></DialogTrigger><DialogContent className="logo-viewer" showCloseButton={false}><DialogClose asChild><button className="icon-button logo-viewer-close" aria-label="Cerrar logo"><X size={24}/></button></DialogClose><DialogTitle className="sr-only">Alianza · Fe y Amor</DialogTitle><DialogDescription className="sr-only">Árbol y rosario entrelazados, emblema de Alianza.</DialogDescription><img className="logo-viewer-image" src={src} alt="Árbol y rosario entrelazados"/><div className="brand-word" aria-hidden="true">Alianza<span>FE Y AMOR</span></div></DialogContent></Dialog>;
}
