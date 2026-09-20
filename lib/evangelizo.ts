import {validMassDate, type MassReading} from './mass';
declare const __EVANGELIZO_SAME_ORIGIN__:boolean;
type ReadingTransport=(date:string,signal:AbortSignal)=>Promise<Response>;
let authenticatedTransport:ReadingTransport|undefined;
/** Installed once by the authenticated app; fetches a fresh session for each call. */
export function configureReadingTransport(transport:ReadingTransport|undefined){authenticatedTransport=transport;}
export type EvangelizoDay={date:string;title:string;source:string;readings:MassReading[]};
export function parseEvangelizo(xml:string,date:string):EvangelizoDay {
  if(!validMassDate(date)||xml.length>500_000||/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('Respuesta inválida');
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  if(doc.querySelector('parsererror'))throw Error('Respuesta inválida');
  const nodes=doc.querySelectorAll('evangelizo');
  if(nodes.length!==1)throw Error('Respuesta inválida');
  const root=nodes[0];
  const field=(tag:string)=>{const elements=root.querySelectorAll(tag);if(elements.length>1)throw Error('Campo duplicado');return elements[0]?.textContent?.trim()??'';};
  if(field('date')!==date.replaceAll('-',''))throw Error('La fecha recibida no coincide');
  // Convert provider markup to inert text. Never render provider HTML or commentary.
  const plain=(value:string)=>{
    const html=new DOMParser().parseFromString(value.replace(/<br\s*\/?\s*>/gi,'\n'),'text/html');
    html.querySelectorAll('script,style,iframe,object').forEach(el=>el.remove());
    return html.body.textContent?.trim()??'';
  };
  const readings:MassReading[]=[];
  for(const [tag,title,required] of [['reading_text1','Primera lectura',true],['reading_text2','Salmo',true],['reading_text3','Segunda lectura',false],['reading_gospel','Evangelio',true]] as const){
    const text=plain(field(tag)),reference=plain(field(tag+'_st'));
    if(!text&&!reference&&!required)continue;
    if(!text||!reference)throw Error('Lecturas incompletas');
    readings.push({id:tag,title,reference,text,complete:true});
  }
  const title=plain(field('litugic_t'));if(!title)throw Error('Falta la celebración');
  return {date,title,readings,source:'https://evangeliodeldia.org/SP/gospel/'+date};
}
export async function loadEvangelizo(date:string,today:string,signal:AbortSignal):Promise<EvangelizoDay>{
  if(!validMassDate(date)||!validMassDate(today)||Math.abs(Date.parse(date)-Date.parse(today))>30*86400000)throw Error('Consultá una fecha dentro de los próximos o últimos 30 días.');
  const url=new URL('https://feed.evangelizo.org/v2/reader.php');
  url.search=new URLSearchParams({date:date.replaceAll('-',''),lang:'SP',type:'xml'}).toString();
  const relay=typeof __EVANGELIZO_SAME_ORIGIN__!=='undefined'&&__EVANGELIZO_SAME_ORIGIN__;
  const endpoint=relay?'/api/mass-readings?date='+encodeURIComponent(date):url;
  const response=authenticatedTransport?await authenticatedTransport(date,signal):await fetch(endpoint,{signal,credentials:relay?'same-origin':'omit',cache:'no-store',referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error('No se pudieron cargar las lecturas.');
  return parseEvangelizo(await response.text(),date);
}
