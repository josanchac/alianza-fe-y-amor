import {R_TYPES} from '@/lib/domain';

export const formationSources = {
 rs: 'https://ramadefamilias.cl/web2025/wp-content/uploads/2025/08/Las-4R.pdf',
 schedule: 'https://ramadefamilias.cl/web2025/wp-content/uploads/2025/10/R9.-Vivir-segun-Nuestro-Ideal.pdf',
 marriage: 'https://ramadefamilias.cl/web2025/wp-content/uploads/2025/10/R8.-Descubriendo-Nuestro-Nombre-nuestro-Ideal-Matrimonial.pdf',
};

export function FormationSource({topic}:{topic:keyof typeof formationSources}){
 const label={rs:'Las cuatro R · pp. 1–5',schedule:'Vivir según nuestro Ideal · pp. 3–5',marriage:'Descubriendo nuestro Ideal Matrimonial · pp. 1–4'}[topic];
 return <p className="form-hint"><a href={formationSources[topic]} target="_blank" rel="noreferrer">{label} (PDF)</a><br/>Rama de Familias de Schoenstatt, Chile.</p>;
}

export function ScheduleGuide(){return <details className="optional-details"><summary>Repasar el sentido del horario espiritual</summary><p>El horario espiritual ayuda a llevar el ideal a la vida mediante actos concretos y su revisión personal. Se prepara según la originalidad de cada persona, también cuando se trabaja un ideal matrimonial.</p><p>En la alianza con María, este esfuerzo se ofrece como contribución al Capital de Gracias. Abarca la relación con Dios, con los demás, con el trabajo y con uno mismo.</p><p>Podés repasar la fuente y conversar tus puntos con quien te acompaña espiritualmente.</p><FormationSource topic="schedule"/><p className="form-hint"><a href="https://schoenstatt.org.br/faca-um-planejamento-espiritual/" target="_blank" rel="noreferrer">Horario espiritual · Schoenstatt Brasil (portugués)</a></p></details>;}

export function PurposeGuide(){return <details className="optional-details"><summary>Una ayuda para formular mi propósito</summary>
 <p>La pauta de la Rama de Familias propone reconocer la actitud que querés cultivar, lo que buscás con ella y una acción concreta para llevarla a la vida. La concreción es personal.</p>
 <p>Escribí aquí lo que estás trabajando. Podés conservarlo de un mes al siguiente; organizar tus notas por mes no limita su práctica cotidiana.</p>
 <FormationSource topic="schedule"/>
 </details>;}

export function PersonalIdealGuide(){return <details className="optional-details"><summary>¿Y si todavía no tengo ideal personal?</summary><p>Podés dejar este campo vacío y continuar con tu horario. Cuando quieras, volvé para escribir tu frase.</p><p>Para trabajar su discernimiento, buscá los materiales y el acompañamiento de tu rama del Movimiento. Esta versión permite registrar tu ideal; todavía no incluye un curso para descubrirlo.</p></details>;}

export function RsGuide(){return <><p>{R_TYPES.map(r=>`${r.title} (${r.rhythm.toLowerCase()}): ${r.description}`).join(' ')}</p><FormationSource topic="rs"/></>;}

export function MarriageIdealGuide(){return <details className="optional-details"><summary>¿Y si todavía no tenemos ideal matrimonial?</summary><p>No necesitan inventar una frase para poder comenzar a usar la app. Pueden dejar su ideal pendiente y buscar acompañamiento en el Movimiento.</p><p>El material de la Rama de Familias sitúa su formulación dentro de un proceso previo: reconocer la historia del matrimonio y escuchar las voces del tiempo, del ser y del alma. Propone recoger ese trabajo con el apoyo del asesor.</p><p>Esta explicación orienta la consulta; no reemplaza ese proceso formativo.</p><FormationSource topic="marriage"/></details>;}
