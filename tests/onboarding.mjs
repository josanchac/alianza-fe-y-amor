import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/',pretendToBeVisual:true});
for(const name of ['window','document','navigator','HTMLElement','Element','Node','NodeFilter','HTMLInputElement','HTMLFormElement','HTMLButtonElement','HTMLSelectElement','MutationObserver','CustomEvent','Event','getComputedStyle','requestAnimationFrame','cancelAnimationFrame']){
 Object.defineProperty(globalThis,name,{value:typeof dom.window[name]==='function'&&['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(name)?dom.window[name].bind(dom.window):dom.window[name],configurable:true,writable:true});
}
for(const name of Object.getOwnPropertyNames(dom.window)){if(!(name in globalThis))Object.defineProperty(globalThis,name,Object.getOwnPropertyDescriptor(dom.window,name));}
window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
globalThis.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
HTMLElement.prototype.scrollIntoView=()=>{};
const React=await import('react');
const {render,screen,fireEvent,waitFor,cleanup}=await import('@testing-library/react');
const {default:Journal}=await import('../app/journal.tsx');
const {localDate}=await import('../lib/domain.ts');
const profile={owner:'test',kind:'profile',key:'me',data:{name:'Persona',ideal:'Líder de amor',shareNotes:false,shareSchedule:false},version:1,updated:new Date().toISOString()};
const fixture={user:{id:'test',role:'jose',email:'person@example.test'},own:[profile],shared:[],partner:{name:'Pareja',ideal:'Mujer de fe',shareNotes:false,shareSchedule:false,records:[]},today:localDate()};
const writes=[];
async function request(init){if(init?.method!=='POST')return Response.json(fixture);const p=JSON.parse(String(init.body));writes.push(p);const group=p.kind==='rs'?'shared':'own';const record={...p,owner:group==='shared'?'couple':'test',version:p.version+1,updated:new Date().toISOString()};fixture[group]=[...fixture[group].filter(r=>r.kind!==p.kind||r.key!==p.key),record];return Response.json({record});}
try{
 render(React.createElement(Journal,{dataRequest:request,onSignOut(){}}));
 await screen.findByRole('heading',{name:'Empezá con algo pequeño.'});
 assert.equal(screen.queryByRole('checkbox'),null);assert.equal(writes.length,0);
 assert.equal(screen.getByText('Necesito una idea para empezar').closest('details').open,false);
 assert.equal(screen.getByText('Mi propósito y mi reflexión').closest('details').open,false);
 console.log('PASS Empty first visit has no automatic commitments, checks, or writes');
 fireEvent.click(screen.getByText('Necesito una idea para empezar'));
 fireEvent.click(screen.getByRole('button',{name:'Ofrecer mi día a la Mater'}));
 const suggestion=await screen.findByRole('dialog');
 assert.equal(screen.getByLabelText('¿Qué quiero cultivar?').value,'Ofrecer mi día a la Mater');
 assert.equal(screen.getByText('Más opciones (opcional)').closest('details').open,false);
 fireEvent.click(screen.getByRole('button',{name:'Cerrar',exact:true}));
 await waitFor(()=>assert.equal(screen.queryByRole('dialog'),null));assert.equal(writes.length,0);
 console.log('PASS Opening and cancelling a suggested commitment does not add it');
 fireEvent.click(screen.getByRole('button',{name:'Crear mi primer compromiso'}));
 await screen.findByRole('dialog');assert.equal(screen.getByLabelText('¿Qué quiero cultivar?').value,'');
 fireEvent.change(screen.getByLabelText('¿Qué quiero cultivar?'),{target:{value:'Mi paso elegido'}});
 fireEvent.click(screen.getByRole('button',{name:'Guardar',exact:true}));
 await screen.findByRole('checkbox',{name:'Mi paso elegido'});
 assert.equal(writes.length,1);assert.equal(writes[0].data.anchor,'');assert.equal(writes[0].data.minimum,'');
 assert.equal(screen.queryByRole('heading',{name:'Empezá con algo pequeño.'}),null);
 fireEvent.click(screen.getByRole('checkbox',{name:'Mi paso elegido'}));
 await waitFor(()=>assert.equal(writes.length,2));assert.equal(writes[1].data[writes[0].key],'done');
 console.log('PASS A custom commitment saves with optional fields empty and can be marked');
 fireEvent.click(screen.getByRole('button',{name:'Ayuda'}));
 await screen.findByRole('dialog',{name:'Una guía a mano'});
 assert(screen.getByText('No hay que llenarlo todo. Usá lo que te ayude, a tu ritmo.'));
 fireEvent.click(screen.getByText('¿Cómo usamos las 4 Rs?'));
 fireEvent.click(screen.getByRole('button',{name:'Ir a las 4 Rs'}));
 await waitFor(()=>assert.equal(screen.getByRole('tab',{name:'Las 4 Rs'}).getAttribute('aria-selected'),'true'));
 assert.equal(writes.length,2);
 console.log('PASS Help opens from the app and navigates without writing records');
 fireEvent.click(screen.getAllByRole('button',{name:'Preparar este momento'})[0]);
 await screen.findByRole('dialog');assert.equal(screen.getByText('Ideas y preguntas para este encuentro').closest('details').open,false);
 assert.equal(screen.getByLabelText('Día del encuentro (opcional)').value,'');
 assert.equal(screen.getByLabelText('Nuestra reflexión y un acuerdo (opcional)').value,'');
 fireEvent.click(screen.getByRole('button',{name:'Cerrar',exact:true}));
 assert.equal(writes.length,2);assert.equal(fixture.shared.length,0);
 console.log('PASS Exploring a marital encounter leaves shared records empty until saved');
}finally{cleanup();dom.window.close();}
