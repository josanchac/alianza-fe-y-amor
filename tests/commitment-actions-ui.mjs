import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');
const {render,screen,fireEvent,waitFor,cleanup,within,act}=await import('@testing-library/react');
const {default:Journal}=await import('../app/journal.tsx');
const {ShareApp,APP_ADDRESS}=await import('../app/install-guide.tsx');
const {localDate}=await import('../lib/domain.ts');
const today=localDate(),row=(kind,key,data)=>({owner:'synthetic',kind,key,data,version:1,updated:''});
const habit=key=>[row('habit',key,{title:key,active:true,moment:'Mañana',anchor:'',minimum:'',frequency:{period:'week',target:3}}),row('habit_plan',key,{versions:[{from:today,period:'week',target:3,active:true}]})];
const fixture={user:{id:'synthetic',role:'member',email:'x@example.test',relationshipVersion:1,dataEpoch:1,coupleId:null},own:[row('profile','me',{name:'Test',ideal:'',shareSchedule:false,shareNotes:false}),...habit('Nuevo'),...habit('Caminar'),row('checks',today,{Caminar:'done'})],shared:[],partner:null,today};
for(const r of fixture.own.filter(r=>r.key==='Caminar')){if(r.kind==='habit')r.data.frequency.unit='times';else r.data.versions[0].unit='times';}
const writes=[];let fail=false;
async function request(init){if(init?.method!=='POST')return Response.json(fixture);const p=JSON.parse(init.body);writes.push(p);if(fail)return Response.json({error:'Error de prueba'},{status:503});if(p.action==='delete_habit'){fixture.own=fixture.own.filter(r=>r.key!==p.key);return Response.json({state:fixture});}const record={...row(p.kind,p.key,p.data),version:p.version+1};fixture.own=[...fixture.own.filter(r=>r.kind!==p.kind||r.key!==p.key),record];return Response.json({record});}
async function menu(name){fireEvent.click(screen.getByRole('button',{name:'Editar: '+name}),{button:0,ctrlKey:false,pointerType:'mouse'});await screen.findByRole('menu');}
try{
 render(React.createElement(Journal,{dataRequest:request,onSignOut(){}}));
 await screen.findByRole('heading',{name:/^(Hoy|Mi día)$/});
 const progress=screen.getByRole('progressbar',{name:'Caminar'});assert.equal(progress.getAttribute('aria-valuenow'),'1');assert.equal(progress.getAttribute('aria-valuemax'),'3');assert(progress.querySelector('.symbol-progress-color').style.maskImage.includes('linear-gradient'));assert.equal(progress.querySelector('.symbol-progress-color').style.clipPath,'');
 const count=()=>fixture.own.find(r=>r.kind==='checks').data.Caminar;
 assert.equal(screen.queryByRole('button',{name:/Ajustar registros/}),null);
 await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Agregar otro'})));assert.equal(count(),2);
 const addedVersion=fixture.own.find(r=>r.kind==='checks').version;
 fail=true;await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Deshacer',exact:true})));assert.equal(count(),2);
 fail=false;await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Deshacer',exact:true})));assert.equal(count(),'done');assert.equal(writes.at(-1).version,addedVersion);
 await menu('Caminar');await act(async()=>fireEvent.click(screen.getByRole('menuitem',{name:'Deshacer último'})));assert.equal(count(),undefined);
 await act(async()=>fireEvent.click(screen.getByRole('checkbox',{name:'Caminar'})));assert.equal(count(),1);
 await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Deshacer',exact:true})));assert.equal(count(),undefined);
 await act(async()=>fireEvent.click(screen.getByRole('checkbox',{name:'Caminar'})));assert.equal(count(),1);writes.length=0;
 await menu('Nuevo');fireEvent.click(screen.getByRole('menuitem',{name:'Eliminar compromiso'}));
 await screen.findByRole('alertdialog');fireEvent.click(screen.getByRole('button',{name:'Cancelar'}));assert.equal(writes.length,0);
 await menu('Nuevo');fireEvent.click(screen.getByRole('menuitem',{name:'Eliminar compromiso'}));fireEvent.click(await screen.findByRole('button',{name:'Sí, eliminar'}));
 await waitFor(()=>assert.equal(screen.queryByRole('button',{name:'Editar: Nuevo'}),null));assert.equal(writes.at(-1).action,'delete_habit');assert.equal(writes.at(-1).version,1);
 await menu('Caminar');fireEvent.click(screen.getByRole('menuitem',{name:'Pausar compromiso'}));fireEvent.click(await screen.findByRole('button',{name:'Sí, pausar'}));
 await waitFor(()=>assert.equal(screen.queryByRole('button',{name:'Editar: Caminar'}),null));assert.equal(writes.at(-1).data.active,false);assert.equal(fixture.own.find(r=>r.kind==='checks').data.Caminar,1);
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Mi espacio'}),{button:0,ctrlKey:false});fireEvent.click(screen.getByRole('button',{name:'Editar y retomar'}));
 await screen.findByRole('dialog',{name:'Retomar mi compromiso'});assert.equal(screen.queryByRole('switch',{name:'Incluir en mi horario'}),null);
 fireEvent.click(screen.getByRole('button',{name:'Guardar',exact:true}));await waitFor(()=>assert.equal(fixture.own.find(r=>r.kind==='habit'&&r.key==='Caminar').data.active,true));assert.equal(fixture.own.find(r=>r.kind==='checks').data.Caminar,1);
 cleanup();let shared;Object.defineProperty(navigator,'share',{configurable:true,value:async payload=>{shared=payload;}});
 render(React.createElement(ShareApp));fireEvent.click(screen.getByRole('button',{name:'Compartir enlace de Alianza'}));await waitFor(()=>assert.equal(shared.url,APP_ADDRESS));
 console.log('PASS original increment control, undo with expected version, failed undo preserves count and retries, first check undo restores zero, pause/resume preserves history, proportional symbol, visible edit/remove, cancel without writes, confirmed delete, archive with history, and token-free sharing');
}finally{cleanup();dom.window.close();}
