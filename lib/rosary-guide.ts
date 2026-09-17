export const PRAYERS={
 contrition:{name:'Acto de contrición',text:'Dios mío, me arrepiento de todo corazón de todos mis pecados y los aborrezco, porque al pecar, no sólo merezco las penas establecidas por ti justamente, sino principalmente porque te ofendí, a ti sumo Bien y digno de amor por encima de todas las cosas. Por eso propongo firmemente, con ayuda de tu gracia, no pecar más en adelante y huir de toda ocasión de pecado. Amén.'},
 cross:{name:'Señal de la cruz',text:'En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.'},
 creed:{name:'Credo',text:'Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, nació de santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, descendió a los infiernos, al tercer día resucitó de entre los muertos, subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos. Creo en el Espíritu Santo, la santa Iglesia católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.'},
 father:{name:'Padre nuestro',text:'Padre nuestro, que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.'},
 mary:{name:'Avemaría',text:'Dios te salve, María, llena eres de gracia; el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.'},
 glory:{name:'Gloria',text:'Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.'},
 hail:{name:'Salve',text:'Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra; Dios te salve. A ti llamamos los desterrados hijos de Eva; a ti suspiramos, gimiendo y llorando en este valle de lágrimas. Ea, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos; y después de este destierro muéstranos a Jesús, fruto bendito de tu vientre. ¡Oh clemente, oh piadosa, oh dulce Virgen María! Ruega por nosotros, santa Madre de Dios, para que seamos dignos de alcanzar las promesas de nuestro Señor Jesucristo. Amén.'},
};
export type PrayerStep={prayer:keyof typeof PRAYERS;decade:number;bead?:number;total?:number};
export type RosaryOpening={include:boolean;mary:'standard'|'trinitarian';position?:'start'|'end'};
export const DEFAULT_OPENING:RosaryOpening={include:true,mary:'standard'};
export const THREE_MARY_SOURCE='https://www.hrparish.org/rosario';
// Traditional prayer; short invocations also documented in the Opus Dei devocionario.
export const MARY_INVOCATIONS=['Hija de Dios Padre','Madre de Dios Hijo','Esposa de Dios Espíritu Santo'];
export function prayerFor(step:PrayerStep,opening:RosaryOpening=DEFAULT_OPENING){
 const prayer=PRAYERS[step.prayer];
 if(step.total===3&&step.prayer==='mary'&&opening.mary==='trinitarian'){
  const invocation=MARY_INVOCATIONS[(step.bead??1)-1];
  return {name:'Avemaría · '+invocation,text:prayer.text.replace('María, llena','María, '+invocation+', llena')};
 }
 return prayer;
}
export function nextPrayerStep(step:number,direction:1|-1,opening:RosaryOpening){
 if(opening.position){const order=rosaryStepOrder(opening);return order[order.indexOf(step)+direction]??step;}
 return !opening.include&&step===1&&direction===1?6:!opening.include&&step===6&&direction===-1?1:step+direction;
}
// IDs 0–68 and completion 69 stay stable for already-started rosaries.
// New prayers use new IDs; their order is saved per rosary.
export const CONTRITION_SOURCE='https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_sp.html';
export function rosaryStepOrder(opening:RosaryOpening):number[]{
 const mysteries=Array.from({length:60},(_,i)=>i+7);
 if(opening.position==='end')return [0,1,71,70,...mysteries,2,3,4,5,6,67,68,69];
 if(opening.position==='start')return [0,1,70,2,3,4,5,6,...mysteries,67,68,69];
 return Array.from({length:70},(_,i)=>i).filter(i=>opening.include||i<2||i>5);
}
export function rosaryStep(step:number,opening:RosaryOpening):PrayerStep{
 if(step===70)return {prayer:'contrition',decade:0};
 if(step===71)return {prayer:'father',decade:0};
 const current=ROSARY_STEPS[step===69?68:step]??ROSARY_STEPS[0];
 return opening.position==='end'&&step>=2&&step<=6?{...current,decade:6}:current;
}
export const ROSARY_STEPS:PrayerStep[]=[{prayer:'cross',decade:0},{prayer:'creed',decade:0},{prayer:'father',decade:0},...Array.from({length:3},(_,i)=>({prayer:'mary' as const,decade:0,bead:i+1,total:3})),{prayer:'glory',decade:0},...Array.from({length:5},(_,i):PrayerStep[]=>[{prayer:'father',decade:i+1},...Array.from({length:10},(_,b)=>({prayer:'mary' as const,decade:i+1,bead:b+1,total:10})),{prayer:'glory',decade:i+1}]).flat(),{prayer:'hail',decade:6},{prayer:'cross',decade:6}];
