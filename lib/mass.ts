/** Local navigation only. Calendar candidates are not an approved Costa Rican Ordo. */
export const MASS_ZONE = 'America/Costa_Rica';
export function massToday(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone:MASS_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function validMassDate(value:string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value>='1900-01-01' && value<='2100-12-31' && !Number.isNaN(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
}
export function shiftMassDate(value:string, days:number) {const d=new Date(value+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export function formatMassDate(value:string) {return new Intl.DateTimeFormat('es-CR',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(value+'T12:00:00Z'));}
// Gregorian computus; used for navigation to fixed Roman Holy Week structures only.
export function easterDate(y:number) {
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;
  return `${y}-${String(Math.floor(n/31)).padStart(2,'0')}-${String(n%31+1).padStart(2,'0')}`;
}
export type MassKind='general'|'palm'|'thursday'|'friday'|'vigil'|'christmas'|'holy-saturday';
export type MassChoice=''|'civil'|'sunday'|'before'|'vigil'|'night'|'dawn'|'day';
export function massSpecialDates(year:number) {const easter=easterDate(year);return [
  {title:'Domingo de Ramos',date:shiftMassDate(easter,-7)}, {title:'Jueves Santo',date:shiftMassDate(easter,-3)},
  {title:'Viernes Santo',date:shiftMassDate(easter,-2)}, {title:'Vigilia Pascual',date:shiftMassDate(easter,-1)},
  {title:'Navidad · Vigilia',date:`${year}-12-24`}, {title:'Navidad',date:`${year}-12-25`}
];}
export function massContext(date:string,choice:MassChoice) {
  const specials=massSpecialDates(Number(date.slice(0,4))), holy=date===specials[3].date, christmas=/12-(24|25)$/.test(date);
  const saturday=new Date(date+'T12:00:00Z').getUTCDay()===6;
  const choices: {value:MassChoice;label:string}[]=christmas?(date.endsWith('24')?[{value:'vigil',label:'Vigilia'},{value:'night',label:'Noche'}]:[{value:'night',label:'Noche'},{value:'dawn',label:'Aurora'},{value:'day',label:'Día'}]):holy?[{value:'before',label:'Antes de la Vigilia'},{value:'vigil',label:'Vigilia Pascual'}]:saturday?[{value:'civil',label:'Misa del sábado'},{value:'sunday',label:'Misa del domingo'}]:[];
  const awaiting=choices.length>0&&!choices.some(c=>c.value===choice);
  const effectiveDate=saturday&&!holy&&!christmas&&choice==='sunday'?shiftMassDate(date,1):date;
  let kind:MassKind=christmas?'christmas':holy?(choice==='vigil'?'vigil':'holy-saturday'):'general';
  if(!holy&&!christmas)kind=effectiveDate===specials[0].date?'palm':effectiveDate===specials[1].date?'thursday':effectiveDate===specials[2].date?'friday':'general';
  const names:Record<MassKind,string>={general:'Guía general de la misa',palm:'Domingo de Ramos',thursday:'Misa de la Cena del Señor',friday:'Celebración de la Pasión del Señor',vigil:'Vigilia Pascual',christmas:'Navidad', 'holy-saturday':'Sábado Santo'};
  return {effectiveDate,kind,awaiting,choices,title:names[kind],celebrationId:kind+(christmas?'-'+choice:'')};
}
export type MassSection={id:string;title:string;moments:string[]};
export function massSections(kind:MassKind,palm='procession',washing=true,baptisms=false):MassSection[] {
  const section=(id:string,title:string,moments:string[])=>({id,title,moments});
  const word=section('word','Liturgia de la Palabra',['Lecturas y salmo','Aclamación y Evangelio','Homilía','Credo, cuando corresponde','Oración universal']);
  const eucharist=section('eucharist','Liturgia eucarística',['Presentación de los dones','Oración sobre las ofrendas','Prefacio y Santo','Plegaria eucarística y aclamaciones']);
  const communion=section('communion','Comunión',['Padre Nuestro','Rito de la paz','Fracción del pan y Cordero de Dios','Comunión','Oración después de la comunión']);
  const end=section('final','Ritos finales',['Bendición','Despedida']);
  const start=section('start','Ritos iniciales',['Entrada y saludo','Acto penitencial','Señor, ten piedad','Gloria, cuando corresponde','Oración colecta']);
  if(kind==='holy-saturday')return [];
  if(kind==='friday')return [section('start','Inicio en silencio',['Entrada y postración','Oración']),section('word','Liturgia de la Palabra',['Lecturas y salmo','Pasión del Señor','Homilía','Oración universal solemne']),section('cross','Adoración de la cruz',['Presentación de la cruz','Veneración']),section('communion','Sagrada comunión',['Padre Nuestro','Comunión']),section('final','Conclusión',['Oración sobre el pueblo','Salida en silencio'])];
  if(kind==='vigil')return [section('light','Lucernario',['Bendición del fuego','Cirio y procesión','Pregón pascual']),section('word','Liturgia de la Palabra',['Lecturas del Antiguo Testamento, salmos y oraciones','Gloria y colecta','Epístola','Salmo y Aleluya','Evangelio y homilía']),section('baptism','Liturgia bautismal',[...(baptisms?['Letanías','Bendición del agua bautismal','Bautismos y confirmación, cuando corresponde']:['Bendición del agua según el rito que corresponda']), 'Renovación de las promesas bautismales','Aspersión','Oración universal']),eucharist,communion,section('final','Despedida pascual',['Bendición','Despedida con Aleluya'])];
  if(kind==='palm')return [section('entry','Entrada en Jerusalén',palm==='simple'?['Entrada sencilla','Oración colecta']:['Bendición de los ramos','Evangelio de la entrada en Jerusalén',palm==='procession'?'Procesión':'Entrada solemne','Oración colecta']),{...word,moments:['Lecturas y salmo','Pasión del Señor','Homilía','Credo','Oración universal']},eucharist,communion,end];
  if(kind==='thursday')return [start,{...word,moments:['Lecturas y salmo','Evangelio','Homilía',...(washing?['Lavatorio de los pies']:[]),'Oración universal']},eucharist,communion,section('transfer','Traslado del Santísimo',['Procesión al lugar de la reserva, cuando corresponde','Adoración'])];
  return [start,word,eucharist,communion,end];
}
export type MassReading={id:string;title:string;reference:string;text:string;complete:boolean};
export type MassReadingSet={date:string;celebrationId:string;territory:string;calendar:{status:'pending'|'verified';source:string;reviewedBy:string};rights:{status:'pending'|'authorized';holder:string;permissionReference:string;attribution:string;allowsInApp:boolean;validThrough:string};source:string;readings:MassReading[]};
const https=(value:string)=>{try{return new URL(value).protocol==='https:';}catch{return false;}};
/** Fail closed. Human documentary review remains necessary; metadata alone is not proof. */
export function availableMassReadings(sets:readonly MassReadingSet[], date:string,celebrationId:string,now=massToday()):MassReadingSet|undefined {
  return sets.find(s=>s.date===date&&s.celebrationId===celebrationId&&s.territory==='CR'&&s.calendar.status==='verified'&&https(s.calendar.source)&&s.calendar.reviewedBy.trim()&&s.rights.status==='authorized'&&s.rights.allowsInApp&&s.rights.holder.trim()&&s.rights.permissionReference.trim()&&s.rights.attribution.trim()&&validMassDate(s.rights.validThrough)&&s.rights.validThrough>=now&&https(s.source)&&s.readings.length>0&&new Set(s.readings.map(r=>r.id)).size===s.readings.length&&s.readings.every(r=>r.complete&&r.id.trim()&&r.title.trim()&&r.reference.trim()&&r.text.trim()));
}
// Intentionally empty: no licensed, territorially verified full lectionary is supplied yet.
export const MASS_READINGS:readonly MassReadingSet[]=[];
