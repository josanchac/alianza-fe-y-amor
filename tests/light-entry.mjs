import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');const {render,screen,fireEvent,waitFor,cleanup}=await import('@testing-library/react');
const {default:Journal}=await import('../app/journal.tsx');
const {prepareSymbol}=await import('../app/symbol-picker.tsx');
const fixture={user:{id:'test',role:'neca',symbol:'rosary',email:'test@example.test',relationshipVersion:2,dataEpoch:3,coupleId:null},own:[{owner:'test',kind:'spaces',key:'experience',version:1,data:{enabled:['personal'],start:'personal'}},{owner:'test',kind:'profile',key:'me',version:1,data:{name:'Neca',ideal:'',shareNotes:false,shareSchedule:false}}],shared:[],partner:null,today:'2026-09-12'};
const writes=[];let fail=false;
async function request(init){if(init?.method!=='POST')return Response.json(fixture);const p=JSON.parse(init.body);if(fail)return Response.json({error:'Error de prueba'},{status:503});writes.push(p);const record={...p,owner:'test',version:p.version+1};fixture.own=[...fixture.own.filter(r=>r.kind!==p.kind||r.key!==p.key),record];return Response.json({record});}
try{
 render(React.createElement(Journal,{dataRequest:request,onSignOut(){}}));await screen.findByRole('heading',{name:'Mis compromisos'});
 assert.equal(writes.length,0);assert(!document.body.textContent.includes('Neca'));assert.equal(screen.queryByRole('tab',{name:'En pareja'}),null);assert.equal(screen.queryByText('Ahora es más fácil empezar'),null);assert.equal(screen.queryByRole('button',{name:/Vivir las 4 Rs/}),null);
 assert(document.querySelector('img[src$="emblem.svg"]'));assert.equal(document.querySelector('.account-pill svg[viewBox="0 0 24 28"]'),null);
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Mi espacio'}),{button:0,ctrlKey:false});fireEvent.click(screen.getByRole('button',{name:'Mi camino y mi ideal'}));await screen.findByRole('heading',{name:'Mi camino'});fireEvent.click(screen.getByRole('button',{name:'Ya tengo un ideal'}));fireEvent.click(screen.getByRole('button',{name:'Escribir o revisar mi ideal'}));await screen.findByRole('dialog');assert.equal(screen.getByLabelText('Cómo quiero que me llamen').value,'');assert(!screen.getByLabelText('Cómo quiero que me llamen').required);
 fireEvent.click(screen.getByRole('button',{name:'Cerrar',exact:true}));
 fireEvent.click(screen.getByRole('button',{name:'Cambiar mi punto de partida'}));
 fireEvent.click(screen.getByRole('button',{name:'Estoy descubriéndolo'}));
 fireEvent.change(screen.getByLabelText('Mi borrador privado'),{target:{value:'Borrador que debe sobrevivir la navegación'}});
 const leaving=new dom.window.Event('beforeunload',{cancelable:true});window.dispatchEvent(leaving);assert(leaving.defaultPrevented);
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Mi espacio'}),{button:0,ctrlKey:false});
 fireEvent.click(screen.getByRole('button',{name:'Mi camino y mi ideal'}));
 assert.equal(screen.getByLabelText('Mi borrador privado').value,'Borrador que debe sobrevivir la navegación');
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Mi espacio'}),{button:0,ctrlKey:false});
 assert.equal(screen.queryByText('Usar Alianza en pareja'),null);
 fireEvent.click(screen.getByRole('button',{name:'Elegir mi símbolo'}));await screen.findByRole('dialog');
 assert.equal(screen.getByRole('button',{name:'Sin símbolo',exact:true}).getAttribute('aria-pressed'),'true');
 fireEvent.click(screen.getByRole('button',{name:'Árbol',exact:true}));fail=true;fireEvent.click(screen.getByRole('button',{name:'Guardar',exact:true}));await screen.findByRole('alert');assert(screen.getByRole('dialog'));
 await waitFor(()=>assert(!screen.getByRole('button',{name:'Guardar',exact:true}).disabled));fail=false;fireEvent.click(screen.getByRole('button',{name:'Guardar',exact:true}));await waitFor(()=>assert(!screen.queryByRole('dialog')));assert.equal(writes.at(-1).kind,'appearance');assert.equal(writes.at(-1).data.symbol,'tree');assert.equal(writes.at(-1).dataEpoch,3);
 cleanup();render(React.createElement(Journal,{dataRequest:request,onSignOut(){}}));await screen.findByRole('heading',{name:'Mis compromisos'});assert(document.querySelector('.account-pill .lucide-tree-deciduous'));
 await assert.rejects(()=>prepareSymbol(new File(['<svg/>'],'image.svg',{type:'image/svg+xml'})));
 await assert.rejects(()=>prepareSymbol({type:'image/png',size:6*1024*1024}));
 console.log('PASS Light entry: no inherited identity or marital tab, optional name, explicit symbol persistence, failure handling and unsafe file rejection');
}finally{cleanup();dom.window.close();}
