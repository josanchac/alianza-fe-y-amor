import assert from 'node:assert/strict';import {dom} from './dom.mjs';
const React=await import('react');const {render,screen,fireEvent,cleanup,waitFor}=await import('@testing-library/react');const {AdminPanel,UserEnvironment}=await import('../github/admin.tsx');
const data={startedOn:'2026-09-11',asOf:'2026-09-11',accounts:4,couples:2,activated:3,active7:2,active30:2,members:[{email:'test@example.test',activated:true,lastDay:null,days7:0,days30:0}]};
let fail=false;const calls=[];const client={rpc:async name=>{calls.push(name);return fail?{data:null,error:{code:'42501'}}:{data:name==='alianza_is_admin'?true:name==='alianza_admin_activity'?data:null,error:null};}};
try{
render(React.createElement(UserEnvironment,{client,userId:'test'},React.createElement('input',{'aria-label':'Borrador personal',defaultValue:'Sin guardar'})));
await screen.findByRole('button',{name:'Administrar piloto'});fireEvent.click(screen.getByRole('button',{name:'Administrar piloto'}));await screen.findByText('test@example.test');assert(screen.getByText('Sin actividad registrada'));
assert(!calls.includes('alianza_data'));fireEvent.click(screen.getByRole('button',{name:'← Volver a mi espacio'}));assert.equal(screen.getByLabelText('Borrador personal').value,'Sin guardar');
fireEvent.click(screen.getByRole('button',{name:'Administrar piloto'}));await screen.findByText('test@example.test');fail=true;fireEvent.click(screen.getByRole('button',{name:'Actualizar actividad'}));await screen.findByRole('alert');assert.equal(screen.queryByText('test@example.test'),null);cleanup();
render(React.createElement(UserEnvironment,{client,userId:'nonadmin'},'Mi espacio'));await waitFor(()=>assert.equal(screen.queryByRole('button',{name:'Administrar piloto'}),null));cleanup();
render(React.createElement(AdminPanel,{client,onBack(){}}));await screen.findByText('Esta cuenta no tiene acceso de administrador.');console.log('PASS admin UI metadata only, denied access, clearing stale results, and preserving personal drafts');
}finally{cleanup();dom.window.close();}
