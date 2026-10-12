import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dom} from './dom.mjs';
const React=await import('react');
const {render,screen,fireEvent,cleanup}=await import('@testing-library/react');
const {RosaryHistory}=await import('../app/rosary-history.tsx');
const {default:Journal}=await import('../app/journal.tsx');
const calls=[];window.scrollTo=p=>calls.push(p);
const rosaries=Array.from({length:50},(_,i)=>({id:'r'+i,ownerId:'synthetic',groupId:null,coupleId:null,mystery:'joyful',mode:'free',intention:'',cancelled:false,slots:[1,2,3,4,5].map(decade=>({decade,userId:'synthetic',done:true})),mine:[{decade:1,day:'2026-10-11'}]}));
try{
 let exits=0;render(React.createElement(RosaryHistory,{rosaries,title:'Mis aportes al rosario',backLabel:'Volver a Oración',onBack:()=>exits++,renderRecord:r=>React.createElement('p',null,'Registro '+r.id)}));
 assert.equal(document.querySelectorAll('.app-history-row').length,50);
 Object.defineProperty(window,'scrollY',{value:920,configurable:true});
 const trigger=document.getElementById('rosary-history-r30');trigger.focus();fireEvent.click(trigger);assert(screen.getByText('Registro r30'));assert.equal(calls.at(-1).top,0);
 assert.equal(document.querySelectorAll('.app-back-header').length,1);
 fireEvent.click(screen.getByRole('button',{name:'Volver al historial'}));assert.equal(calls.at(-1).top,920);assert.equal(document.activeElement.id,'rosary-history-r30');
 fireEvent.click(screen.getByRole('button',{name:'Volver a Oración'}));assert.equal(exits,1);cleanup();
 const row=(kind,key,data)=>({owner:'synthetic',kind,key,data,version:1,updated:''});
 const fixture={user:{id:'synthetic',role:'member',email:'test@example.test',relationshipVersion:1,dataEpoch:1},today:'2026-10-11',shared:[],own:[row('spaces','experience',{enabled:['personal'],start:'personal'}),row('profile','me',{name:'Prueba',ideal:'',shareSchedule:false,shareNotes:false})]};
 let writes=0;render(React.createElement(Journal,{dataRequest:async init=>{if(init?.method==='POST')writes++;return Response.json(fixture);},communityTransport:async()=>Response.json({groups:[],rosaries:[]}),onSignOut(){}}));
 fireEvent.click(await screen.findByRole('button',{name:/Mis reflexiones/}));fireEvent.click(screen.getByRole('button',{name:'Meditación',exact:true}));fireEvent.click(screen.getByRole('button',{name:'Escribir meditación'}));
 const dialog=await screen.findByRole('dialog',{name:'Mi meditación'}),save=screen.getByRole('button',{name:'Guardar',exact:true});
 assert(dialog.classList.contains('app-task-dialog'));assert(save.closest('.app-task-footer'));assert.equal(save.form.id,'app-record-editor');assert.equal(document.activeElement,screen.getByRole('heading',{name:'Mi meditación'}));
 fireEvent.change(screen.getByRole('textbox'),{target:{value:'Borrador de prueba'}});fireEvent.click(screen.getByRole('button',{name:'Cerrar formulario'}));assert(screen.getByRole('alertdialog',{name:'¿Cerrar sin guardar?'}));fireEvent.click(screen.getByRole('button',{name:'Seguir escribiendo'}));assert.equal(screen.getByRole('textbox').value,'Borrador de prueba');assert.equal(writes,0);
 const css=readFileSync('app/task-layout.css','utf8');assert(css.includes('grid-template-rows:auto minmax(0,1fr) auto'));assert(css.includes('var(--dialog-view-height,100dvh)'));assert(css.includes('white-space:nowrap'));assert(readFileSync('app/back-button.css','utf8').includes('.app-back-header:not([hidden] *)'));
 console.log('PASS integrated navigation: 50 actual history rows, detail without duplicate return, restored scroll/focus, actual editor footer/form association, no autofocus keyboard, dirty exit guard, no writes. Geometry requires device review.');
}finally{cleanup();dom.window.close();}
