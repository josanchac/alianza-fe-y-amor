import {ChevronRight} from 'lucide-react';
import {PRAYERS} from '@/lib/rosary-guide';
import {ADDITIONAL_MASS_PRAYERS} from '@/lib/mass-prayers-additional';
export const MASS_PRAYERS=[
 ADDITIONAL_MASS_PRAYERS[0],
 {id:'mercy',title:'Señor, ten piedad',text:'Señor, ten piedad.\nCristo, ten piedad.\nSeñor, ten piedad.',source:'https://www.usccb.org/es/committees/divine-worship/policies/textos-del-ordinario-de-la-misa'},
 ADDITIONAL_MASS_PRAYERS[1],
 ADDITIONAL_MASS_PRAYERS[2],
 {id:'creed',title:'Credo de los Apóstoles',text:PRAYERS.creed.text,source:'https://www.vaticannews.va/es/oraciones/simbolo-de-los-apostoles.html'},
 ADDITIONAL_MASS_PRAYERS[3],
 ADDITIONAL_MASS_PRAYERS[4],
 {id:'father',title:'Padre nuestro',text:PRAYERS.father.text.replace(/ Amén\.$/,''),source:'https://www.vaticannews.va/es/oraciones/padre-nuestro.html'},
 {id:'lamb',title:'Cordero de Dios',text:'Cordero de Dios, que quitas el pecado del mundo, ten piedad de nosotros.\n\nCordero de Dios, que quitas el pecado del mundo, ten piedad de nosotros.\n\nCordero de Dios, que quitas el pecado del mundo, danos la paz.',source:'https://www.usccb.org/es/committees/divine-worship/policies/textos-del-ordinario-de-la-misa'},
] as const;
export function MassPrayers({onSelect}:{onSelect:(id:string)=>void}){return <><h3>Oraciones y respuestas</h3><div className="s3-prayer-list">{MASS_PRAYERS.map(p=><button key={p.id} data-prayer-id={p.id} onClick={()=>onSelect(p.id)}><span>{p.title}</span><ChevronRight size={20}/></button>)}</div><p className="mass-meta s3-mass-coverage">Selección de oraciones. Todavía no incluye todos los textos de la misa.</p></>;}
