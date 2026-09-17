import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');
const {render,screen,fireEvent,waitFor,cleanup}=await import('@testing-library/react');
const {default:Journal}=await import('../app/journal.tsx');
const {ReflectionSummary}=await import('../app/reflection-summary.tsx');
const {localDate}=await import('../lib/domain.ts');
const today=localDate(),month=today.slice(0,7);
const row=(kind,key,data)=>({owner:'fixture',kind,key,data,version:1,updated:new Date().toISOString()});
const habit=(key,title,period,target,unit='days')=>[row('habit',key,{title,moment:'Mañana',active:true,frequency:{period,target,unit}}),row('habit_plan',key,{versions:[{from:month+'-01',active:true,period,target,unit}]})];
const fixture={user:{id:'fixture',role:'member',email:'fixture@example.test',relationshipVersion:1,coupleId:null},own:[row('profile','me',{name:'Persona',ideal:'',shareSchedule:false,shareNotes:false}),...habit('offer','Ofrecer mi día','day',1),...habit('rosary','Dos rosarios al mes','month',2,'times'),row('checks',today,{offer:'done'})],shared:[],partner:null,today};
const writes=[];
async function request(init){if(init?.method!=='POST')return Response.json(fixture);const p=JSON.parse(init.body);writes.push(p);const record={...row(p.kind,p.key,p.data),version:p.version+1};fixture.own=[...fixture.own.filter(r=>r.kind!==p.kind||r.key!==p.key),record];return Response.json({record});}
try{
 render(React.createElement(Journal,{dataRequest:request,onSignOut(){}}));
 await screen.findByRole('heading',{name:'Mi día'});
 assert(screen.getByLabelText('1 de 1 compromisos registrados'));
 assert(!screen.queryByText('Dos rosarios al mes'));
 fireEvent.click(screen.getByRole('button',{name:/Mes/}));
 await screen.findByText('Dos rosarios al mes');
 fireEvent.click(screen.getByRole('button',{name:'Registrar una ocasión'}));
 await waitFor(()=>assert.equal(fixture.own.find(r=>r.kind==='checks').data.rosary,1));
 fireEvent.click(await screen.findByRole('button',{name:'Registrar otra ocasión'}));
 await waitFor(()=>assert.equal(fixture.own.find(r=>r.kind==='checks').data.rosary,2));
 await waitFor(()=>assert(screen.getByRole('button',{name:/Mes/}).textContent.includes('1 de 1 completos')));
 fireEvent.click(screen.getByRole('button',{name:'Deshacer una ocasión'}));
 await waitFor(()=>assert.equal(fixture.own.find(r=>r.kind==='checks').data.rosary,1));
 assert(screen.getByLabelText('1 de 1 compromisos registrados'));
 cleanup();
 render(React.createElement(ReflectionSummary,{rows:[row('journal',today,{gratitude:'Por la familia',offering:'Mi esfuerzo'})],start:month+'-01',end:today}));
 assert(screen.getByRole('heading',{name:'Mis agradecimientos'}).parentElement.textContent.includes('Por la familia'));
 assert(screen.getByRole('heading',{name:'Mis ofrecimientos a la Mater'}).parentElement.textContent.includes('Mi esfuerzo'));
 assert.equal(document.querySelectorAll('time[datetime="'+today+'"]').length,2);
 console.log('PASS daily completion excludes monthly goals, compact period navigation, repeated occasions and undo, dated gratitude and offering groups');
}finally{cleanup();dom.window.close();}
