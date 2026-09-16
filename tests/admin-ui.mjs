import assert from 'node:assert/strict';import {dom} from './dom.mjs';
const React=await import('react');const {render,screen,fireEvent,cleanup,waitFor}=await import('@testing-library/react');const {AdminPanel,UserEnvironment}=await import('../github/admin.tsx');
const legacy={startedOn:'2026-09-11',asOf:'2026-09-11',accounts:4,couples:2,activated:3,active7:2,active30:2,members:[{email:'test@example.test',activated:true,lastDay:null,days7:0,days30:0}]};
const data={asOf:'2026-09-13',suppressed:false,minimum:5,windowDays:90,consenting:12,totals30:{open:{count:30,people:12}},cohorts:[]};
let fail=false;const calls=[];const client={rpc:async name=>{calls.push(name);return fail?{data:null,error:{code:'42501'}}:{data:name==='alianza_is_admin'?true:name==='alianza_admin_activity'?data:null,error:null};}};
try{
render(React.createElement(UserEnvironment,{client,userId:'test'},React.createElement('input',{'aria-label':'Borrador personal',defaultValue:'Sin guardar'})));
await screen.findByRole('button',{name:'Uso y mejora'});fireEvent.click(screen.getByRole('button',{name:'Uso y mejora'}));await screen.findByText('Últimos 30 días');assert.equal(screen.queryByText('test@example.test'),null);
assert(!calls.includes('alianza_data'));fireEvent.click(screen.getByRole('button',{name:'← Volver a mi espacio'}));assert.equal(screen.getByLabelText('Borrador personal').value,'Sin guardar');
fireEvent.click(screen.getByRole('button',{name:'Uso y mejora'}));await screen.findByText('Últimos 30 días');fail=true;fireEvent.click(screen.getByRole('button',{name:'Actualizar resumen'}));await screen.findAllByRole('alert');assert.equal(screen.queryByText('test@example.test'),null);cleanup();
render(React.createElement(UserEnvironment,{client,userId:'nonadmin'},'Mi espacio'));await waitFor(()=>assert.equal(screen.queryByRole('button',{name:'Uso y mejora'}),null));cleanup();
render(React.createElement(AdminPanel,{client,onBack(){}}));await screen.findAllByRole('alert');console.log('PASS admin UI aggregates only, denied access, clearing stale results, and preserving personal drafts');
}finally{cleanup();dom.window.close();}
