import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
import React from 'react';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {MonthReview} from '../app/month-review.tsx';
const row=(kind,key,data)=>({owner:'synthetic',kind,key,data,version:1});
const own=[row('journal','2026-09-20',{gratitude:'Synthetic'}),row('habit','walk',{title:'Caminar',active:true,moment:'Mañana',frequency:{period:'week',target:3}})];
let month,edited,requests=[];
const props={own,month:'2026-10',today:'2026-10-05',onMonth:m=>{month=m},edit:(...args)=>{edited=args},explore(){},onSave:async()=>true,onPrepare:async p=>{requests.push(p);return requests.length===1?false:true}};
try{
 render(React.createElement(MonthReview,props));
 assert(screen.getByRole('heading',{name:'Preparar octubre de 2026'}));
 assert.equal(screen.queryByRole('textbox',{name:'¿Qué me ayudó?'}),null);
 fireEvent.click(screen.getAllByRole('button',{name:'Revisar septiembre de 2026'})[0]);assert.equal(month,'2026-09');
 fireEvent.click(screen.getByRole('button',{name:'Elegir y ajustar compromisos'}));assert(screen.getByRole('checkbox',{name:'Caminar'}));
 fireEvent.click(screen.getByRole('button',{name:'Agregar compromiso'}));assert(screen.getByRole('heading',{name:'Nuevo compromiso'}));fireEvent.click(screen.getByRole('button',{name:'Cancelar'}));fireEvent.click(screen.getByRole('button',{name:'Volver a mi mes'}));
 fireEvent.click(screen.getByRole('button',{name:'Reflexionar sobre este mes'}));assert(screen.getByRole('textbox',{name:'¿Qué me ayudó?'}));
 fireEvent.click(screen.getByRole('button',{name:'Volver a preparar mi mes'}));
 fireEvent.click(screen.getByRole('button',{name:'Preparar el siguiente mes'}));
 fireEvent.click(screen.getByRole('button',{name:'Guardar noviembre de 2026'}));await waitFor(()=>assert.equal(requests.length,1));await waitFor(()=>assert.equal(screen.getByRole('button',{name:'Guardar noviembre de 2026'}).disabled,false));
 fireEvent.click(screen.getByRole('button',{name:'Guardar noviembre de 2026'}));await waitFor(()=>assert.equal(requests.length,2));assert.equal(requests[1].version,0);assert.equal(requests[1].month,'2026-11');
 cleanup();render(React.createElement(MonthReview,{...props,own:[]}));assert.equal(screen.queryByText('septiembre de 2026 quedó sin revisar'),null);
 cleanup();render(React.createElement(MonthReview,{...props,month:'2026-08'}));fireEvent.click(screen.getByRole('button',{name:'Ahora no'}));assert.equal(month,'2026-10');
 console.log('PASS month entry: current preparation, pending prior month, editors, optional reflection, next-month target, failed version retry, no invented new-user pending task, historical return');
}finally{cleanup();dom.window.close()}
