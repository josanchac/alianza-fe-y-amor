import {ExternalLink, MapPin} from 'lucide-react';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from '@/components/ui/dialog';

const portal='https://schoenstattcostarica.org/';
function SourceLink({href,children}:{href:string;children:React.ReactNode}) {
 return <a className="soft-button" href={href} target="_blank" rel="noopener noreferrer">{children}<ExternalLink size={16}/><span className="sr-only"> (abre otra pestaña)</span></a>;
}

// No unverified chronology, directory or project announcements are shipped.
// The source site was unavailable during the September 2026 content review.
// Curated material must include the publisher, publication date, review date
// and original link before it is added; never label an old event as upcoming.
export function MovementCostaRica({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}) {
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="editor-dialog movement-dialog" showCloseButton={false}>
  <MapPin className="gold-icon" size={28}/>
  <DialogTitle className="dialog-title">Schoenstatt en Costa Rica</DialogTitle>
  <DialogDescription>Un espacio para conocer el Movimiento, sus comunidades y su vida en nuestro país.</DialogDescription>
  <div className="movement-links"><SourceLink href="https://schoenstatt.com/es/acerca-de-nosotros/santuario/">El Santuario</SourceLink><SourceLink href="https://schoenstatt.com/es/acerca-de-nosotros/devocion-mariana/">La Mater</SourceLink><SourceLink href="https://schoenstatt.com/es/acerca-de-nosotros/fundador/">Padre Kentenich</SourceLink><SourceLink href={portal}>Comunidades en Costa Rica</SourceLink><SourceLink href={portal+'noticias/'}>Noticias de Costa Rica</SourceLink></div>
  <button className="primary" onClick={()=>onOpenChange(false)}>Volver a mi espacio</button>
 </DialogContent></Dialog>;
}
