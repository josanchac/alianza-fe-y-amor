import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');
const {render,screen,fireEvent,cleanup,waitFor}=await import('@testing-library/react');
const {default:Journal}=await import('../app/journal.tsx');
const {localDate}=await import('../lib/domain.ts');
const today=localDate(),d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-1);const yesterday=d.toISOString().slice(0,10);
const row=(kind,key,data,version=1)=>({owner:'synthetic',kind,key,data,version,updated:''});
const long='Una nota ficticia extensa. '.repeat(200);
const policy={relationshipVersion:1,categories:{offering:{mode:'choose',keys:[today],future:false},gratitude:{mode:'private',keys:[],future:false},meditation:{mode:'all',keys:[],future:true}}};
const fixture={user:{id:'synthetic',role:'member',email:'x@example.test',relationshipVersion:1,dataEpoch:1,coupleId:'couple'},own:[row('profile','me',{name:'Test',ideal:'',shareSchedule:false,shareNotes:false}),row('journal',today,{offering:long,gratitude:'Nota de agradecimiento ficticia',meditation:'   '}),row('journal',yesterday,{offering:'Nota del día anterior',gratitude:'Ayer',meditation:''}),row('sharing','me',policy)],shared:[],partner:{name:'Pareja de prueba',ideal:'',shareSchedule:false,shareNotes:false,records:[]},today};
let fail=true;const writes=[];
async function request(init){if(init?.method!=='POST')return Response.json(fixture);const p=JSON.parse(init.body);writes.push(p);if(fail)return Response.json({error:'Error simulado'},{status:503});const record=row(p.kind,p.key,p.data,p.version+1);fixture.own=[...fixture.own.filter(r=>r.kind!==p.kind||r.key!==p.key),record];return Response.json({record});}
const mount=()=>render(React.createElement(Journal,{dataRequest:request,onSignOut(){}}));
const openNotes=async()=>fireEvent.click(await screen.findByRole('button',{name:/Mis reflexiones/}));
const scrollCalls=[];window.scrollTo=options=>scrollCalls.push(options);Object.defineProperty(window,'scrollY',{value:420,configurable:true});
const region=name=>screen.getByRole('region',{name:name+' del día'});
try{
 mount();await screen.findByRole('button',{name:/Mis reflexiones/});assert.equal(document.querySelector('.moment-saved-text'),null);assert.match(screen.getByRole('button',{name:/Mis reflexiones/}).textContent,/2 guardadas/);await openNotes();
 assert(region('Ofrecimiento').textContent.includes('visible para Pareja de prueba'));
 assert(document.querySelector('.day-overview').hidden);
 assert.equal(document.activeElement,screen.getByRole('button',{name:'Volver a Hoy'}));
assert.equal(document.querySelector('.moment-saved-text').textContent,long);
 fireEvent.click(screen.getByRole('button',{name:'Agradecimiento',exact:true}));assert(region('Agradecimiento').textContent.includes('Solo vos'));assert(screen.getByText('Nota de agradecimiento ficticia'));
 assert.equal(writes.length,0);
 fireEvent.click(screen.getByRole('button',{name:'Meditación',exact:true}));assert(region('Meditación').textContent.includes('Todavía no escribiste'));assert(region('Meditación').textContent.includes('visible para Pareja de prueba'));
 fireEvent.click(screen.getByRole('button',{name:'Escribir meditación'}));await screen.findByRole('dialog',{name:'Mi meditación'});assert.equal(document.activeElement,screen.getByRole('heading',{name:'Mi meditación'}));assert(screen.getByRole('button',{name:'Cerrar formulario'}));
 fireEvent.change(screen.getByRole('textbox',{name:'Mi meditación…'}),{target:{value:'Meditación editada'}});
 fireEvent.click(screen.getByRole('button',{name:'Guardar',exact:true}));await waitFor(()=>assert.equal(writes.length,1));await waitFor(()=>assert.equal(screen.getByRole('button',{name:'Guardar',exact:true}).disabled,false));
 assert.equal(screen.getByRole('textbox',{name:'Mi meditación…'}).value,'Meditación editada');assert(!document.querySelector('.moment-reading').textContent.includes('Meditación editada'));
 fail=false;fireEvent.click(screen.getByRole('button',{name:'Guardar',exact:true}));await waitFor(()=>assert.equal(screen.queryByRole('dialog')===null,true));
 assert(region('Meditación').textContent.includes('Meditación editada'));assert.equal(writes.at(-1).data.offering,long);assert.equal(writes.at(-1).data.gratitude,'Nota de agradecimiento ficticia');assert.equal(writes.at(-1).version,1);
 fireEvent.click(screen.getByRole('button',{name:'Ofrecimiento',exact:true}));assert.equal(document.querySelector('.moment-saved-text').textContent,long);
 fireEvent.click(screen.getByRole('button',{name:'Volver a Hoy'}));
 assert.equal(document.querySelector('.moment-saved-text'),null);assert.equal(document.querySelector('.day-overview').hidden,false);assert.equal(document.activeElement,screen.getByRole('button',{name:/Mis reflexiones/}));assert.equal(scrollCalls.at(-1).top,420);assert.match(screen.getByRole('button',{name:/Mis reflexiones/}).textContent,/3 guardadas/);
 fireEvent.click(screen.getByRole('button',{name:'Día anterior'}));await openNotes();assert(screen.getByText('Nota del día anterior'));assert(region('Ofrecimiento').textContent.includes('Solo vos'));assert.equal(screen.queryByText('Meditación editada'),null);
 // A stale sharing policy cannot label a new relationship's note as shared.
 cleanup();fixture.user.relationshipVersion=2;mount();await openNotes();assert(region('Ofrecimiento').textContent.includes('Solo vos'));
 // Legacy policy uses the same label as the existing editor, but never when unlinked.
 cleanup();fixture.own=fixture.own.filter(r=>r.kind!=='sharing');fixture.own.find(r=>r.kind==='profile').data.shareNotes=true;mount();await openNotes();assert(region('Ofrecimiento').textContent.includes('Visible para Pareja de prueba'));
 cleanup();fixture.user.coupleId=null;mount();await openNotes();assert(region('Ofrecimiento').textContent.includes('Solo vos'));
 assert.equal(writes.length,2);
 console.log('PASS Journal notes: visible saved text, exact long text, empty state, read without writes, failed save/retry, preserved other fields, date/category isolation, selective/legacy/stale/unlinked privacy labels');
}finally{cleanup();dom.window.close();}
