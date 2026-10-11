import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
import React from 'react';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {MonthReview} from '../app/month-review.tsx';
const h={title:'Caminar',active:true,moment:'Mañana',anchor:'',minimum:'',frequency:{period:'week',target:3,unit:'times'}};
const row=(kind,key,data,version=1)=>({owner:'synthetic',kind,key,data,version,updated:''});
const own=[row('habit','walk',h),row('habit','course',{...h,title:'Novena',frequency:{period:'day',target:1,unit:'days',course:{start:'2026-10-01',days:9,weekdays:[0,1,2,3,4,5,6]}}}),row('purpose','2026-10',{text:'Mi propósito',review:'Reflexión previa'},4)];
const props={own,month:'2026-10',today:'2026-10-11',onMonth(){},edit(){},explore(){}};
const click=name=>fireEvent.click(screen.getByRole('button',{name,exact:true}));
const open=()=>click('Elegir y ajustar compromisos');
try{
 const requests=[],drafts=new Map();let reject=true,finish;
 const save=async p=>{requests.push(p);if(reject)throw Error('Conflicto simulado; tu borrador se conserva');return new Promise(resolve=>{finish=resolve});};
 let view=render(React.createElement(MonthReview,{...props,planDrafts:drafts,onPrepare:save}));open();
 assert(screen.getByText('Desde hoy, 11 de octubre'));assert(screen.getByRole('checkbox',{name:'Novena'}));
 click('Editar Caminar');fireEvent.change(screen.getByLabelText('Cantidad de veces'),{target:{value:'6'}});click('Aplicar cambios');assert(screen.getByText('3 veces por semana → 6 veces por semana'));
 fireEvent.click(screen.getByRole('checkbox',{name:'Caminar'}));assert(screen.getByText(/Queda en pausa/));
 fireEvent.change(screen.getByRole('textbox',{name:'Mi propósito (opcional)'}),{target:{value:'Propósito elegido'}});
 click('Agregar compromiso');fireEvent.change(screen.getByLabelText('¿Qué quiero cultivar?'),{target:{value:'Lectura'}});click('Aplicar cambios');assert(screen.getByText('Nuevo compromiso'));
 click('Guardar octubre de 2026');await screen.findByRole('alert');assert.equal(requests.length,1);assert.equal(requests[0].action,'save_current_month');assert.equal(requests[0].purposeVersion,4);assert.equal(requests[0].effectiveDate,'2026-10-11');assert.equal(requests[0].version,0);assert.equal(requests[0].items[0].keep,false);assert.equal(requests[0].items[0].data.frequency.target,6);assert.deepEqual(requests[0].items[1].data.frequency,own[1].data.frequency);
 assert.equal(drafts.size,1);view.unmount();
 view=render(React.createElement(MonthReview,{...props,month:'2026-09',planDrafts:drafts,onPrepare:save}));assert.equal(screen.queryByText('Lectura'),null);view.unmount();
 view=render(React.createElement(MonthReview,{...props,planDrafts:drafts,onPrepare:save}));open();assert.equal(screen.getByRole('textbox',{name:'Mi propósito (opcional)'}).value,'Propósito elegido');assert.equal(screen.getByRole('checkbox',{name:'Caminar'}).checked,false);assert(screen.getByRole('checkbox',{name:'Lectura'}));
 reject=false;click('Guardar octubre de 2026');await waitFor(()=>assert(finish));click('Guardando…');assert.equal(requests.length,2,'A double click cannot send a second write');
 assert.equal(document.querySelector('.month-plan-controls').disabled,true);
 const updated=[...own.filter(r=>r.kind!=='habit'&&r.kind!=='purpose'),...requests[1].items.map(i=>row('habit',i.key,{...i.data,active:i.keep},i.version+1)),row('purpose','2026-10',{text:'Propósito elegido',review:'Reflexión previa'},5),row('month_plan','2026-10',{purpose:'Propósito elegido',items:requests[1].items,applied:true},1)];
 finish({state:{own:updated}});await screen.findByText('Tu plan de octubre de 2026 quedó guardado.');assert(screen.getByRole('button',{name:'Guardado'}).disabled);assert.equal(drafts.size,0);assert.equal(screen.queryByText('Nuevo compromiso'),null);
 fireEvent.change(screen.getByRole('textbox',{name:'Mi propósito (opcional)'}),{target:{value:'Otro ajuste'}});click('Guardar octubre de 2026');await waitFor(()=>assert.equal(requests.length,3));assert.equal(requests[2].version,1);assert.equal(requests[2].purposeVersion,5);finish({state:{own:updated}});await waitFor(()=>assert.equal(document.querySelector('.month-plan-controls').disabled,false));
 cleanup();
 // Explicit recovery can retain the draft or reload a fresh server snapshot.
 let reloads=0;render(React.createElement(MonthReview,{...props,onPrepare:async()=>false,onReload:async()=>{reloads++;return updated;}}));open();fireEvent.change(screen.getByRole('textbox',{name:'Mi propósito (opcional)'}),{target:{value:'No perder'}});click('Guardar octubre de 2026');await screen.findByRole('alert');click('Revisar versión guardada');click('Conservar mi borrador');assert.equal(screen.getByRole('textbox',{name:'Mi propósito (opcional)'}).value,'No perder');assert.equal(reloads,0);click('Revisar versión guardada');click('Descartar borrador y actualizar');await screen.findByText('Se cargó la versión guardada.');assert.equal(reloads,1);assert.equal(screen.getByRole('textbox',{name:'Mi propósito (opcional)'}).value,'Propósito elegido');
 cleanup();
 // Future plan is staged, never routed through current-month mutation.
 let future;render(React.createElement(MonthReview,{...props,onPrepare:async p=>{future=p;return true;}}));click('Preparar el siguiente mes');click('Guardar noviembre de 2026');await waitFor(()=>assert(future));assert.equal(future.action,'prepare_month');assert.equal(future.month,'2026-11');assert.equal(future.effectiveDate,undefined);assert(!future.items.some(i=>i.key==='course'));
 cleanup();
 const many=Array.from({length:50},(_,i)=>row('habit','h'+i,{...h,title:'Compromiso '+i}));render(React.createElement(MonthReview,{...props,own:many,onPrepare:async()=>true}));open();assert.equal(screen.getAllByRole('checkbox').length,51);fireEvent.click(screen.getByRole('checkbox',{name:'Todos'}));assert(screen.getAllByRole('checkbox').every(c=>!c.checked));assert.equal(screen.queryByRole('button',{name:'Revisar cambios'}),null);
 console.log('PASS current-month UI: direct atomic payload, inline differences, recurrence preservation, failed retry, double click, per-month drafts, confirmed versions, explicit recovery, future isolation, 50 commitments');
}finally{cleanup();dom.window.close();}
