import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
// JSDOM has no PointerEvent: retain the fields Radix reads for this regression.
class PointerEvent extends window.MouseEvent {
 constructor(type,init={}){super(type,init);this.pointerType=init.pointerType??'touch';this.pointerId=init.pointerId??1;}
}
window.PointerEvent=globalThis.PointerEvent=PointerEvent;
const React=await import('react');
const {render,screen,fireEvent,cleanup,waitFor}=await import('@testing-library/react');
const {default:Journal}=await import('../app/journal.tsx');
const {localDate}=await import('../lib/domain.ts');
const today=localDate(),row=(kind,key,data)=>({owner:'synthetic',kind,key,data,version:1,updated:''});
const fixture={user:{id:'synthetic',role:'member',email:'test@example.test',relationshipVersion:1,dataEpoch:1,coupleId:null},own:[row('profile','me',{name:'Test',ideal:'',shareSchedule:false,shareNotes:false}),...Array.from({length:50},(_,i)=>row('habit','habit-'+i,{title:'Compromiso '+i,active:true,moment:'Mañana',frequency:{period:'day',target:1}}))],shared:[],partner:null,today};
const writes=[];
async function request(init){if(init?.method!=='POST')return Response.json(fixture);const p=JSON.parse(init.body);writes.push(p);return Response.json({record:{...row(p.kind,p.key,p.data),version:p.version+1}});}
try{
 render(React.createElement(Journal,{dataRequest:request,onSignOut(){}}));
 const trigger=await screen.findByRole('button',{name:'Editar: Compromiso 25'});
 // A scrolling gesture begins on the title. It must not open or write on contact.
 fireEvent.pointerDown(trigger,{button:0,ctrlKey:false,clientY:300,pointerType:'touch'});
 assert.equal(screen.queryByRole('menu')===null,true,'touch contact must not open the menu');
 fireEvent.pointerMove(trigger,{clientY:200,pointerType:'touch'});
 fireEvent.pointerCancel(trigger,{pointerType:'touch'});
 assert.equal(screen.queryByRole('menu')===null,true);
 assert.equal(writes.length,0);
 // Browsers dispatch click for a completed tap, but suppress it during native scroll.
 fireEvent.pointerDown(trigger,{button:0,ctrlKey:false,pointerType:'touch'});
 fireEvent.pointerUp(trigger,{button:0,pointerType:'touch'});
 assert.equal(screen.queryByRole('menu')===null,true);
 fireEvent.click(trigger);
 await screen.findByRole('menu');
 assert.equal(writes.length,0,'opening options must not write a status');
 fireEvent.click(screen.getByRole('menuitem',{name:'Me costó'}));
 await waitFor(()=>assert.equal(writes.length,1));
 assert.equal(writes[0].data['habit-25'],'missed');
 await waitFor(()=>assert.equal(screen.queryByRole('menu')===null,true));
 // Radix retains keyboard handling; its prevented keydown suppresses native click.
 for(const key of ['Enter',' ','ArrowDown']){
  trigger.focus();fireEvent.keyDown(trigger,{key});
  const menu=await screen.findByRole('menu');
  fireEvent.keyDown(menu,{key:'Escape'});
  await waitFor(()=>assert.equal(screen.queryByRole('menu')===null,true));
 }
 // Mouse and assistive-technology click both remain supported.
 fireEvent.pointerDown(trigger,{button:0,ctrlKey:false,pointerType:'mouse'});
 assert.equal(screen.queryByRole('menu')===null,true);
 fireEvent.click(trigger,{detail:1});
 fireEvent.keyDown(await screen.findByRole('menu'),{key:'Escape'});
 await waitFor(()=>assert.equal(screen.queryByRole('menu')===null,true));
 fireEvent.click(trigger,{detail:0});await screen.findByRole('menu');
 assert.equal(writes.length,1);
 console.log('PASS 50 commitments: touch contact/cancel do not open or write; deliberate tap, mouse, keyboard and assistive click work');
}finally{cleanup();dom.window.close();}
