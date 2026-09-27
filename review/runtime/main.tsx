import './preview-crypto';
import React from 'react';
import {createRoot} from 'react-dom/client';
import Journal from '../../app/journal';
import type {CommunityState} from '../../lib/community';
import {localDate,type RecordItem} from '../../lib/domain';
import '../../app/globals.css';
const today=localDate();
const row=(kind:string,key:string,data:any):RecordItem=>({kind,key,data,owner:'synthetic',version:1,updated:new Date().toISOString()} as RecordItem);
const habit=(key:string,title:string,period:string,target:number,unit='days')=>[row('habit',key,{title,moment:'Durante el día',active:true,anchor:'',minimum:'',frequency:{period,target,unit}}),row('habit_plan',key,{versions:[{from:today.slice(0,7)+'-01',period,target,unit,active:true}]})];
const fixture:any={user:{id:'synthetic',email:'prueba@example.test',role:'member',relationshipVersion:1,dataEpoch:1,coupleId:'synthetic-couple'},today,shared:[],partner:{name:'Alex',ideal:'',symbol:'heart',appearance:{symbol:'heart',image:''},shareSchedule:false,shareNotes:false,records:[]},own:[row('spaces','experience',{enabled:['personal','couple','group'],start:'personal'}),row('profile','me',{name:'Persona de prueba',ideal:'Líder de amor',symbol:'tree',shareNotes:false,shareSchedule:false}),...habit('morning','Oración de la mañana','day',1),...habit('exercise','Ejercicio','week',3,'times'),...habit('rosary','Rezar el rosario','month',2,'times'),...habit('novena','Novena a la Virgen','day',1),row('checks',today,{morning:'done',exercise:1,rosary:2})]};
for(const r of fixture.own.filter((r:RecordItem)=>r.key==='novena')){const course={start:today,days:9};if(r.kind==='habit'){r.data.moment='Noche';r.data.frequency.course=course;}else if(r.kind==='habit_plan')r.data.versions=[{from:today,period:'day',target:1,unit:'days',active:true,course}];}
for(let day=1;day<=20;day++){const entry=row('journal',today.slice(0,7)+'-'+String(day).padStart(2,'0'),{gratitude:'Agradezco el tiempo para escuchar con calma y compartir con quienes quiero.',offering:'Ofrezco mi trabajo de este día y la paciencia en los momentos difíciles.',meditation:'Quiero hacer espacio para lo importante, aunque sea con un gesto pequeño.'});fixture.own.push(entry);fixture.partner.records.push({...entry,data:{gratitude:entry.data.gratitude}});}
const community:CommunityState={groups:[],rosaries:[],invitations:[{id:'synthetic-invite',groupId:'synthetic-course',name:'Curso de alianza',senderName:'Andrea',status:'pending',version:1,expiresAt:new Date(Date.now()+7*86400000).toISOString()}]};
async function communityRequest(p:Record<string,any>){
 const invitation=community.invitations?.find(i=>i.id===p.id);
 if(invitation&&p.action==='course_decline'){invitation.status='declined';invitation.version++;}
 if(invitation&&p.action==='course_restore'){invitation.status='pending';invitation.version++;}
 if(invitation&&p.action==='course_accept'){community.groups.push({id:invitation.groupId,name:invitation.name,ideal:'',motto:'',ownerId:'synthetic',version:1,members:[{id:'synthetic',name:'Persona de prueba'}],purposes:[],meeting:null});community.invitations=[];}
 if(p.action==='rosary_create')community.rosaries.push({id:p.id,ownerId:'synthetic',groupId:null,coupleId:null,mystery:p.mystery,mode:'free',intention:p.intention,cancelled:false,slots:[],mine:[],personalStep:0,progressVersion:1,opening:fixture.own.find((r:RecordItem)=>r.kind==='rosary_preferences')?.data});
 const rosary=community.rosaries.find(r=>r.id===p.id);
 if(rosary&&p.action==='rosary_step'){rosary.personalStep=p.step;rosary.progressVersion=(rosary.progressVersion??0)+1;}
 if(rosary&&p.action==='rosary_discard')rosary.cancelled=true;
 return Response.json(community);
}
async function request(init?:RequestInit){
 if(init?.method!=='POST')return Response.json(fixture);
 const p=JSON.parse(String(init.body));
 if(p.action==='prepare_month'){fixture.own=fixture.own.filter((r:RecordItem)=>r.kind!=='month_plan'||r.key!==p.month).concat({...row('month_plan',p.month,{purpose:p.purpose,items:p.items}),version:p.version+1});return Response.json({state:fixture});}
 if(!p.kind)return Response.json({error:'Esta operación no está habilitada en la prueba local.'},{status:400});
 const record={...row(p.kind,p.key,p.data),version:(p.version??0)+1},related:RecordItem[]=[];
 fixture.own=fixture.own.filter((r:RecordItem)=>r.kind!==p.kind||r.key!==p.key).concat(record);
 if(p.kind==='habit'){
  const old=fixture.own.find((r:RecordItem)=>r.kind==='habit_plan'&&r.key===p.key);
  const plan=row('habit_plan',p.key,{versions:[...(old?.data.versions??[]).filter((v:any)=>v.from<today),{...p.data.frequency,from:today,active:p.data.active}]});
  fixture.own=fixture.own.filter((r:RecordItem)=>r!==old).concat(plan);related.push(plan);
 }
 return Response.json({record,related});
}
createRoot(document.getElementById('root')!).render(<><p style={{padding:12,background:'#fff',color:'#193649'}}>VERSIÓN DE PRUEBA · Datos ficticios · Se reinicia al recargar</p><Journal dataRequest={request} communityTransport={communityRequest} onSignOut={()=>{}}/></>);
