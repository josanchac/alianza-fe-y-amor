import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');
const {render,screen,fireEvent,waitFor,cleanup}=await import('@testing-library/react');
const {default:Journal}=await import('../app/journal.tsx');
let epoch=1;const writes=[];
const fixture=()=>({user:{id:'fixture',role:'member',email:'fixture@example.test',relationshipVersion:1,dataEpoch:epoch,coupleId:null},own:[{kind:'profile',key:'me',data:{name:'Persona',ideal:'',shareSchedule:false,shareNotes:false},version:1}],shared:[],partner:null,today:'2026-09-12'});
async function request(init){if(init?.method==='POST'){writes.push(JSON.parse(init.body));return Response.json({error:'Unexpected write'},{status:409});}return Response.json(fixture());}
try{
 render(React.createElement(Journal,{dataRequest:request,onSignOut(){}}));
 await screen.findByRole('heading',{name:'¿Qué te ayudaría hoy?'});
 epoch=2;fireEvent(window,new Event('focus'));
 await screen.findByRole('heading',{name:'Tu espacio está listo para comenzar de nuevo'});
 assert(!screen.queryByRole('heading',{name:'¿Qué te ayudaría hoy?'}));
 assert.equal(writes.length,0);
 cleanup();render(React.createElement(Journal,{dataRequest:request,onSignOut(){}}));
 await screen.findByRole('heading',{name:'¿Qué te ayudaría hoy?'});
 assert(!screen.queryByRole('heading',{name:'Tu espacio está listo para comenzar de nuevo'}));
 console.log('PASS Reset epoch removes stale controls without writes; new mount can begin the experience');
}finally{cleanup();dom.window.close();}
