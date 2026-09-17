import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');
const {render,screen,fireEvent,waitFor,cleanup}=await import('@testing-library/react');
const {default:Journal}=await import('../app/journal.tsx');
const {localDate}=await import('../lib/domain.ts');
const {monthBefore}=await import('../lib/schedule.ts');
const today=localDate(),month=today.slice(0,7),previous=monthBefore(month);
const row=(kind,key,data)=>({owner:'test',kind,key,data,version:1,updated:new Date().toISOString()});
const fixture={user:{id:'test',role:'member',email:'a@example.test'},own:[row('profile','me',{name:'Persona',ideal:'',shareNotes:false,shareSchedule:false})],shared:[],partner:null,today};
let fail=false;const writes=[];
async function request(init){if(init?.method!=='POST')return Response.json(fixture);const p=JSON.parse(init.body);if(fail)return Response.json({error:'No se pudo guardar.'},{status:503});writes.push(p);const record={...row(p.kind,p.key,p.data),version:p.version+1};fixture.own=[...fixture.own.filter(r=>r.kind!==p.kind||r.key!==p.key),record];return Response.json({record});}
const mount=()=>render(React.createElement(Journal,{dataRequest:request,onSignOut(){}}));
try{
 mount();await screen.findByRole('dialog',{name:'¿Cómo querés usar Alianza?'});assert.equal(writes.length,0);
 fail=true;fireEvent.click(screen.getByRole('button',{name:'Guardar mis espacios'}));await screen.findByText('No se guardó tu elección. Volvé a intentar.');assert.equal(writes.length,0);assert(screen.getByRole('dialog'));
 fail=false;fireEvent.click(screen.getByRole('button',{name:'Guardar mis espacios'}));await screen.findByRole('heading',{name:'Tu primer compromiso'});
 assert.equal(writes.length,1);assert.equal(writes[0].kind,'spaces');
 fireEvent.click(screen.getByRole('button',{name:'Crear mi primer compromiso'}));await screen.findByRole('dialog');
 fireEvent.change(screen.getByLabelText('¿Qué quiero cultivar?'),{target:{value:'Ejercicio elegido'}});
 fireEvent.click(screen.getByRole('button',{name:'Continuar',exact:true}));fireEvent.click(screen.getByRole('button',{name:'Por semana',exact:true}));
 assert.equal(screen.getByLabelText('Cantidad de días').value,'3');
 fireEvent.click(screen.getByRole('button',{name:'Guardar',exact:true}));await screen.findByRole('checkbox',{name:'Ejercicio elegido'});
 assert.deepEqual(writes[1].data.frequency,{period:'week',target:3,unit:'days'});
 cleanup();mount();await screen.findByRole('heading',{name:'Mis compromisos'});await screen.findByRole('checkbox',{name:'Ejercicio elegido'});assert.equal(writes.length,2);
 console.log('PASS Chosen start and weekly commitment persist; failed choice does not advance');
 cleanup();fixture.own.push(row('purpose',previous,{text:'Propósito anterior',review:''}),row('purpose',month,{text:'Propósito actual',review:'Nota actual'}));
 mount();await screen.findByRole('heading',{name:'Mis compromisos'});fireEvent.mouseDown(screen.getByRole('tab',{name:'Hoy',exact:true}),{button:0,ctrlKey:false});fireEvent.click(screen.getByRole('button',{name:'Mi mes',exact:true}));
 assert(screen.getByText('Propósito actual'));fireEvent.change(screen.getByLabelText('Mi mes'),{target:{value:previous}});assert(screen.getByText('Propósito anterior'));
 fireEvent.click(screen.getByRole('button',{name:'Editar mi propósito'}));await screen.findByRole('dialog');
 fireEvent.change(screen.getByRole('textbox',{name:'Mi revisión: qué ayudó, qué costó y un próximo paso'}),{target:{value:'Lo que aprendí'}});
 fireEvent.click(screen.getByRole('button',{name:'Guardar',exact:true}));await screen.findByText('Lo que aprendí');
 assert.equal(writes.at(-1).key,previous);assert.equal(fixture.own.find(r=>r.kind==='purpose'&&r.key===month).data.text,'Propósito actual');
 console.log('PASS Reviewing the previous month preserves the current purpose and its review');
 // Continuing is an editable draft, not an automatic copy or a replacement of an existing text.
 cleanup();fixture.own=fixture.own.map(r=>r.kind==='purpose'&&r.key===month?{...r,data:{text:'',review:'Conservar mi revisión'}}:r);
 mount();await screen.findByRole('heading',{name:'Mis compromisos'});fireEvent.mouseDown(screen.getByRole('tab',{name:'Hoy',exact:true}),{button:0,ctrlKey:false});fireEvent.click(screen.getByRole('button',{name:'Mi mes',exact:true}));
 const count=writes.length;fireEvent.click(screen.getByRole('button',{name:'Retomar el propósito anterior'}));await screen.findByRole('dialog');assert.equal(writes.length,count);
 assert.equal(screen.getByRole('textbox',{name:'Mi propósito particular',exact:true}).value,'Propósito anterior');
 assert.equal(screen.getByRole('textbox',{name:'Mi revisión: qué ayudó, qué costó y un próximo paso'}).value,'Conservar mi revisión');
 fireEvent.click(screen.getByRole('button',{name:'Cerrar',exact:true}));await screen.findByRole('alertdialog');fireEvent.click(screen.getByRole('button',{name:'Descartar cambios'}));await waitFor(()=>assert.equal(screen.queryByRole('dialog'),null));
 assert.equal(writes.length,count);assert.equal(fixture.own.find(r=>r.kind==='purpose'&&r.key===month).data.text,'');
 console.log('PASS Continuing a purpose only prepares a draft; cancellation preserves current-month records');
}finally{cleanup();dom.window.close();}
