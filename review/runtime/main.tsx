import './preview-crypto';
import React from 'react';
import {createRoot} from 'react-dom/client';
import Journal from '../../app/journal';
import {localDate,type RecordItem} from '../../lib/domain';
import '../../app/globals.css';
const today=localDate();
const row=(kind:string,key:string,data:any):RecordItem=>({kind,key,data,owner:'synthetic',version:1,updated:''} as RecordItem);
const habit=(key:string,title:string,period:string,target:number,unit='days')=>[row('habit',key,{title,moment:'Durante el día',active:true,anchor:'',minimum:'',frequency:{period,target,unit}}),row('habit_plan',key,{versions:[{from:today.slice(0,7)+'-01',period,target,unit,active:true}]})];
const fixture={user:{id:'synthetic',email:'prueba@example.test',role:'member',relationshipVersion:1,dataEpoch:1,coupleId:null},today,shared:[],partner:null,own:[row('profile','me',{name:'Persona de prueba',ideal:'Líder de amor',symbol:'tree',shareNotes:false,shareSchedule:false}),...habit('morning','Oración de la mañana','day',1),...habit('exercise','Ejercicio','week',3,'times'),...habit('rosary','Rezar el rosario','month',2,'times'),...habit('novena','Novena a la Virgen','day',1),row('checks',today,{morning:'done',exercise:1,rosary:2})]};
for(const r of fixture.own.filter(r=>r.key==='novena')){const course={start:today,days:9};if(r.kind==='habit'){r.data.moment='Noche';r.data.frequency.course=course;}else if(r.kind==='habit_plan')r.data.versions=[{from:today,period:'day',target:1,unit:'days',active:true,course}];}
async function request(init?:RequestInit){
 if(init?.method!=='POST')return Response.json(fixture);
 const p=JSON.parse(String(init.body));
 if(!p.kind)return Response.json({error:'Esta operación no está habilitada en la prueba local.'},{status:400});
 const record={...row(p.kind,p.key,p.data),version:(p.version??0)+1},related:RecordItem[]=[];
 fixture.own=fixture.own.filter(r=>r.kind!==p.kind||r.key!==p.key).concat(record);
 if(p.kind==='habit'){
  const old=fixture.own.find(r=>r.kind==='habit_plan'&&r.key===p.key);
  const plan=row('habit_plan',p.key,{versions:[...(old?.data.versions??[]).filter((v:any)=>v.from<today),{...p.data.frequency,from:today,active:p.data.active}]});
  fixture.own=fixture.own.filter(r=>r!==old).concat(plan);related.push(plan);
 }
 return Response.json({record,related});
}
createRoot(document.getElementById('root')!).render(<><p style={{padding:12,background:'#fff',color:'#193649'}}>VERSIÓN DE PRUEBA · Datos ficticios · Se reinicia al recargar</p><Journal dataRequest={request} communityTransport={async()=>Response.json({groups:[],rosaries:[]})} onSignOut={()=>{}}/></>);
