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
  <details><summary>Nuestra historia</summary><p>Conocé los orígenes del Movimiento y su camino en Costa Rica a través de sus publicaciones.</p><SourceLink href={portal+'schoenstatt-2/'}>¿Qué es Schoenstatt?</SourceLink><SourceLink href={portal}>Explorar el sitio de Costa Rica</SourceLink></details>
  <details><summary>Ramas y comunidades</summary><p>Consultá la sección «Comunidades» del sitio nacional para conocer los distintos espacios de pertenencia y sus canales de contacto.</p><SourceLink href={portal}>Conocer las comunidades</SourceLink><SourceLink href={portal+'rama-femenina/'}>Rama Femenina</SourceLink></details>
  <details><summary>Noticias recientes</summary><p>Consultá las publicaciones del Movimiento y la fecha de cada noticia en su página de origen.</p><SourceLink href={portal+'noticias/'}>Ver noticias de Costa Rica</SourceLink></details>
  <details><summary>Proyectos y planes de desarrollo</summary><p>Todavía no hay un plan de desarrollo verificado disponible en esta sección. Podés consultar los anuncios del Movimiento en su sitio nacional.</p><SourceLink href={portal}>Consultar anuncios del Movimiento</SourceLink></details>
  <p className="muted">Los enlaces abren el sitio de Schoenstatt Costa Rica. Si no está disponible, podés volver a intentarlo más tarde.</p>
  <button className="primary" onClick={()=>onOpenChange(false)}>Volver a mi espacio</button>
 </DialogContent></Dialog>;
}
