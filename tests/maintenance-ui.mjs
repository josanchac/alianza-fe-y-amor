import {dom} from './dom.mjs';
import React from 'react';import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';import assert from 'node:assert/strict';
import {MaintenanceBoundary} from '../github/maintenance.tsx';
let active=true,available=true;
globalThis.fetch=async()=>Response.json({maintenance:false});
const client={from:()=>({select:()=>({eq:()=>({single:async()=>available?{data:{active,required_version:null},error:null}:{data:null,error:Error('offline')}})})})};
try{
 render(React.createElement(MaintenanceBoundary,{client,initialActive:true},React.createElement('textarea',{'aria-label':'Borrador',defaultValue:'Mi reflexión'})));
 await screen.findByText('Estamos actualizando Alianza');assert.equal(screen.queryByRole('textbox'),null);
 active=false;fireEvent(window,new Event('focus'));await screen.findByRole('textbox',{name:'Borrador'});fireEvent.change(screen.getByRole('textbox'),{target:{value:'No perder este texto'}});
 active=true;fireEvent(window,new Event('focus'));await screen.findByText('Estamos actualizando Alianza');assert.equal(screen.queryByRole('textbox'),null);
 active=false;fireEvent(window,new Event('focus'));await waitFor(()=>assert.equal(screen.getByRole('textbox').value,'No perder este texto'));
 available=false;fireEvent(window,new Event('focus'));await screen.findByText('No pudimos comprobar el servicio');
 console.log('PASS maintenance: initial gate, pause/resume preserves draft, network failure blocks conservatively');
}finally{cleanup();dom.window.close();}
