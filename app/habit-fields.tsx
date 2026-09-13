import {ChoiceChips} from './choice-chips';
import {ScheduleGuide} from './formation-guide';
import {Switch} from '@/components/ui/switch';
import type {Habit} from '@/lib/domain';
export function HabitFields({data,field,first,step}:{data:Habit;field:(k:string,v:any)=>void;first:boolean;step:number}){
 const frequency=data.frequency??{period:'day',target:1};
 return <>{(!first||step===0)&&<><label>¿Qué quiero cultivar?<input required maxLength={180} value={data.title} onChange={e=>field('title',e.target.value)} placeholder="Ej. Caminar diez minutos" autoFocus/></label><ScheduleGuide/></>}
 {(!first||step===1)&&<><ChoiceChips label="¿Con qué frecuencia?" value={frequency.period} options={[["day","Cada día"],["week","Por semana"],["month","Por mes"]]} onChange={period=>field('frequency',{period,target:period==='day'?1:3})}/>{frequency.period!=='day'&&<label>Cantidad de días<input type="number" min={1} max={frequency.period==='week'?7:28} required value={frequency.target} onChange={e=>field('frequency',{...frequency,target:Number(e.target.value)})}/></label>}
 <details className="optional-details"><summary>Más opciones (opcional)</summary><ChoiceChips label="Momento del día" value={data.moment} options={[["Mañana","Mañana"],["Durante el día","Durante el día"],["Noche","Noche"]]} onChange={v=>field('moment',v)}/><label>Mi recordatorio personal<input maxLength={240} value={data.anchor} onChange={e=>field('anchor',e.target.value)} placeholder="Ej. Después de llegar a casa"/></label><label>Mi anotación de apoyo<input maxLength={240} value={data.minimum} onChange={e=>field('minimum',e.target.value)}/></label><div className="switch-row"><label htmlFor="habit-active">Incluir en mi horario</label><Switch id="habit-active" checked={data.active} onCheckedChange={v=>field('active',v)}/></div><small>Al desactivarlo, conservás su historial.</small><p className="form-hint">Cada fecha cuenta una vez. Los cambios de frecuencia rigen desde hoy.</p></details></>}
 </>;
}
