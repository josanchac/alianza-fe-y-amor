import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');
const {render,screen,fireEvent,cleanup,waitFor,act}=await import('@testing-library/react');
const {SupportForm,PilotSupportContext}=await import('../app/pilot-support.tsx');
const {PilotPulse}=await import('../github/pilot-pulse.tsx');
const {InvitationAdmin}=await import('../github/invitations.tsx');
try{
 let fail=true;const calls=[];const api=async p=>{if(p.action==='mine')return {requests:[]};calls.push(p);if(fail)throw Error('temporary');return {id:p.id,state:'pending'};};
 render(React.createElement(PilotSupportContext.Provider,{value:api},React.createElement(SupportForm)));
 fireEvent.change(screen.getByLabelText('¿Qué símbolo te gustaría?'),{target:{value:'Rayo'}});fireEvent.click(screen.getByRole('button',{name:'Enviar solicitud'}));await screen.findByRole('alert');assert.equal(screen.getByLabelText('¿Qué símbolo te gustaría?').value,'Rayo');fail=false;fireEvent.click(screen.getByRole('button',{name:'Enviar solicitud'}));await screen.findByRole('status');assert.equal(calls[0].id,calls[1].id);assert(screen.getByText('Mis solicitudes (1)'));cleanup();
 let release;let requests=0;const people=[{id:'test',email:'test@example.test',label:'Persona sintética',version:1,state:'pending'}];const client={rpc:async()=>{requests++;return requests===1?new Promise(resolve=>{release=resolve}):{data:null,error:{code:'42501'}};},functions:{invoke:async()=>({data:{manualLinks:true},error:null})}};
 render(React.createElement(InvitationAdmin,{client}));fireEvent.click(screen.getByRole('button',{name:'Actualizar invitaciones'}));await screen.findByRole('alert');await act(async()=>release({data:{people},error:null}));assert(!screen.queryByText('Persona sintética'),'Discard stale response after permission failure');cleanup();
 const weeks=Array.from({length:8},(_,i)=>({start:`2026-0${i+1}-01`,end:`2026-0${i+1}-07`,active:i}));
 let pulse={asOf:'2026-09-19',population:8,coverageStart:'2026-08-02',weeks,features:[],returning:3,errors:0};
 const pc={rpc:async()=>({data:pulse,error:null})};render(React.createElement(PilotPulse,{client:pc}));await screen.findByText('Personas que aportan métricas');assert(screen.getByText('Aún no hay cobertura de dos semanas completas para comparar.'));assert(screen.getByRole('img',{name:/Personas activas por semana/}));fireEvent.change(screen.getByLabelText('Período de tendencias'),{target:{value:'4'}});assert.equal(document.querySelectorAll('.pulse-column').length,4);cleanup();
 console.log('PASS support retries preserve request identity and draft; stale permissions response suppressed; incomplete coverage never presented as a trend; selectable graphic period');
}finally{cleanup();dom.window.close();}
