import type {PersonalSymbolId} from './personal-symbols';
export type Habit = {title:string; moment:'Mañana'|'Durante el día'|'Noche'; active:boolean; anchor:string; minimum:string; frequency?:{period:'day'|'week'|'month';target:number}};
export type Profile = {name:string; ideal:string; shareSchedule:boolean; shareNotes:boolean;shareIdeal?:boolean; symbol?:PersonalSymbolId};
export type RecordItem = {owner:string;kind:string;key:string;data:any;version:number;updated:string};
export const R_TYPES = [
 {id:'rezar', title:'Rezar', rhythm:'Cada día', description:'Orar juntos y abrir nuestra vida a Dios.', prompts:['¿Qué agradecemos y qué necesitamos confiarle a Dios?'], suggestion:'Elegir juntos un momento y lugar para orar.'},
 {id:'reencantar', title:'Reencantar', rhythm:'Cada semana', description:'Dedicar tiempo a disfrutar como pareja.', prompts:['¿Qué nos gustaría hacer juntos?'], suggestion:'Reservar un encuentro a solas, como un paseo o un café.'},
 {id:'revisar', title:'Revisar', rhythm:'Cada mes', description:'Revisar nuestra vida matrimonial y familiar.', prompts:['¿Qué nos ayudó y qué nos costó?','¿Qué propósito acordamos para el próximo mes?'], suggestion:'Orar, reflexionar individualmente, compartir lo que cada uno elija y mirar el mes siguiente.'},
 {id:'renovar', title:'Renovar', rhythm:'Cada año', description:'Renovar nuestro proyecto de vida matrimonial y familiar.', prompts:['¿Qué dones y desafíos reconocemos?','¿Qué valores, medios y responsabilidades elegimos?'], suggestion:'Dedicar tiempo a revisar y proyectar nuestra vida juntos.'}
];
export function localDate(d=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
export function period(type:string,date:string){if(type==='rezar')return date;if(type==='revisar')return date.slice(0,7);if(type==='renovar')return date.slice(0,4); const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10);}
export function rKey(type:string,date:string){return type+':'+period(type,date);}
export function prettyDate(date:string){return new Intl.DateTimeFormat('es-CR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));}
export function suggestedHabits(_role:string):Habit[]{return [
 {title:'Ofrecer mi día a la Mater',moment:'Mañana',active:true,anchor:'',minimum:''},
 {title:'Escuchar sin interrumpir una conversación',moment:'Durante el día',active:true,anchor:'',minimum:''},
 {title:'Caminar durante diez minutos',moment:'Durante el día',active:true,anchor:'',minimum:''},
 {title:'Revisar y anotar mi horario al terminar el día',moment:'Noche',active:true,anchor:'',minimum:''}
];}
