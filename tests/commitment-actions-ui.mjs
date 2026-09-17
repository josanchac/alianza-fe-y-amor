import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');
const {render,screen,fireEvent,waitFor,cleanup}=await import('@testing-library/react');
const {default:Journal}=await import('../app/journal.tsx');
const {ShareApp,APP_ADDRESS}=await import('../app/install-guide.tsx');
const {localDate}=await import('../lib/domain.ts');
const today=localDate(),row=(kind,key,data)=>({owner:'synthetic',kind,key,data,version:1,updated:''});
const habit=key=>[row('habit',key,{title:key,active:true,moment:'Mañana',anchor:'',minimum:'',frequency:{period:'week',target:3}}),row('habit_plan',key,{versions:[{from:today,period:'week',target:3,active:true}]})];
const fixture={user:{id:'synthetic',role:'member',email:'x@example.test',relationshipVersion:1,dataEpoch:1,coupleId:null},own:[row('profile','me',{name:'Test',ideal:'',shareSchedule:false,shareNotes:false}),...habit('Nuevo'),...habit('Caminar'),row('checks',today,{Caminar:'done'})],shared:[],partner:null,today};
const writes=[];
async function request(init){if(init?.method!=='POST')return Response.json(fixture);const p=JSON.parse(init.body);writes.push(p);if(p.action==='delete_habit'){fixture.own=fixture.own.filter(r=>r.key!==p.key);return Response.json({state:fixture});}const record={...row(p.kind,p.key,p.data),version:p.version+1};fixture.own=[...fixture.own.filter(r=>r.kind!==p.kind||r.key!==p.key),record];return Response.json({record});}
async function menu(name){fireEvent.pointerDown(screen.getByRole('button',{name:'Editar: '+name}),{button:0,ctrlKey:false,pointerType:'mouse'});await screen.findByRole('menu');}
try{
 render(React.createElement(Journal,{dataRequest:request,onSignOut(){}}));
 await screen.findByRole('heading',{name:'Mis compromisos'});
 const progress=screen.getByRole('progressbar',{name:'Caminar'});assert.equal(progress.getAttribute('aria-valuenow'),'1');assert.equal(progress.getAttribute('aria-valuemax'),'3');assert(progress.querySelector('.symbol-progress-color').style.clipPath.includes('66.666'));
 await menu('Nuevo');fireEvent.click(screen.getByRole('menuitem',{name:'Eliminar compromiso'}));
 await screen.findByRole('alertdialog');fireEvent.click(screen.getByRole('button',{name:'Cancelar'}));assert.equal(writes.length,0);
 await menu('Nuevo');fireEvent.click(screen.getByRole('menuitem',{name:'Eliminar compromiso'}));fireEvent.click(await screen.findByRole('button',{name:'Sí, eliminar'}));
 await waitFor(()=>assert.equal(screen.queryByRole('button',{name:'Editar: Nuevo'}),null));assert.equal(writes.at(-1).action,'delete_habit');assert.equal(writes.at(-1).version,1);
 await menu('Caminar');fireEvent.click(screen.getByRole('menuitem',{name:'Dejar de seguir'}));fireEvent.click(await screen.findByRole('button',{name:'Sí, dejar de seguir'}));
 await waitFor(()=>assert.equal(screen.queryByRole('button',{name:'Editar: Caminar'}),null));assert.equal(writes.at(-1).data.active,false);assert.equal(fixture.own.find(r=>r.kind==='checks').data.Caminar,'done');
 cleanup();let shared;Object.defineProperty(navigator,'share',{configurable:true,value:async payload=>{shared=payload;}});
 render(React.createElement(ShareApp));fireEvent.click(screen.getByRole('button',{name:'Compartir enlace de Alianza'}));await waitFor(()=>assert.equal(shared.url,APP_ADDRESS));
 console.log('PASS proportional symbol, visible edit/remove, cancel without writes, confirmed delete, archive with history, and token-free sharing');
}finally{cleanup();dom.window.close();}
