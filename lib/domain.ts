export type Habit = {title:string; moment:'Mañana'|'Durante el día'|'Noche'; active:boolean; anchor:string; minimum:string};
export type Profile = {name:string; ideal:string; shareSchedule:boolean; shareNotes:boolean; symbol?:'heart'|'tree'|'rosary'|'cross'};
export type RecordItem = {owner:string;kind:string;key:string;data:any;version:number;updated:string};
export const R_TYPES = [
 {id:'rezar', title:'Rezar', rhythm:'Cada día', description:'Un momento juntos ante Dios.', prompts:['¿Por qué queremos dar gracias?','¿Qué ponemos hoy en manos de la Mater?'], suggestion:'Después de cenar, rezar juntos un avemaría.'},
 {id:'reencantar', title:'Reencantar', rhythm:'Cada semana', description:'Elegirnos de nuevo, sin distracciones.', prompts:['¿Qué nos gustaría disfrutar juntos?','¿Qué gesto me hizo sentir amado/a?'], suggestion:'Después de revisar la semana, reservar una cita sin celular.'},
 {id:'revisar', title:'Revisar', rhythm:'Cada mes', description:'Mirar nuestra vida con amor y verdad.', prompts:['¿Dónde vimos a Dios en nuestra vida este mes?','¿Qué nos acercó y qué nos costó?','¿Qué paso concreto acordamos para el próximo mes?'], suggestion:'El último domingo del mes, escucharnos y acordar un solo paso.'},
 {id:'renovar', title:'Renovar', rhythm:'Cada año', description:'Renovar nuestra alianza y nuestro camino.', prompts:['¿Qué agradecemos del año vivido?','¿Qué queremos renovar en nuestro matrimonio?','¿Qué propósito y encuentro con Dios queremos cuidar?'], suggestion:'Elegir una jornada, retiro o visita al Santuario para renovar nuestra entrega.'}
];
export function localDate(d=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
export function period(type:string,date:string){if(type==='rezar')return date;if(type==='revisar')return date.slice(0,7);if(type==='renovar')return date.slice(0,4); const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10);}
export function rKey(type:string,date:string){return type+':'+period(type,date);}
export function prettyDate(date:string){return new Intl.DateTimeFormat('es-CR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));}
export function suggestedHabits(role:string):Habit[]{return [
 {title:'Ofrecer mi día a la Mater',moment:'Mañana',active:true,anchor:'Después de despertarme',minimum:'Una frase de ofrecimiento'},
 {title:role==='jose'?'Liderar con un gesto concreto de amor':role==='neca'?'Vivir un gesto concreto de fe y confianza':'Vivir mi ideal con un gesto pequeño',moment:'Durante el día',active:true,anchor:'Al comenzar mi actividad principal',minimum:'Un gesto pequeño y consciente'},
 {title:'Cuidar mi descanso y mi cuerpo',moment:'Durante el día',active:true,anchor:'Después de almorzar',minimum:'Dos minutos de pausa'},
 {title:'Agradecer y revisar mi propósito particular',moment:'Noche',active:true,anchor:'Antes de acostarme',minimum:'Agradecer una cosa y mirar mi propósito'}
];}
