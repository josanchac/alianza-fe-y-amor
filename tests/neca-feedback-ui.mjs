import assert from 'node:assert/strict';
import {dom} from './dom.mjs';

const React=await import('react');
const {render,screen,fireEvent,cleanup,waitFor}=await import('@testing-library/react');
const {default:Journal}=await import('../app/journal.tsx');
const {localDate}=await import('../lib/domain.ts');

const today=localDate();
const row=(kind,key,data)=>({owner:'person',kind,key,data,version:1,updated:new Date().toISOString()});
const fixture={
 user:{id:'person',role:'member',email:'person@example.test',relationshipVersion:1,coupleId:null},
 own:[
  row('profile','me',{name:'Persona',ideal:'',shareSchedule:false,shareNotes:false}),
  row('spaces','experience',{enabled:['personal','couple'],start:'personal'}),
  row('prayers','me',{personalIdeal:'Señor, ayudame a vivir mi ideal.',marriageIdeal:'',homeShrine:'María, habitá nuestro hogar.',alliance:''})
 ],
 shared:[],partner:null,today
};

try{
 const writes=[];
 render(React.createElement(Journal,{dataRequest:async init=>{if(init?.method!=='POST')return Response.json(fixture);const p=JSON.parse(init.body);writes.push(p);const record={...row(p.kind,p.key,p.data),version:p.version+1};fixture.own=[...fixture.own.filter(r=>r.kind!==p.kind||r.key!==p.key),record];return Response.json({record});},onSignOut(){}}));
 await screen.findByRole('heading',{name:'Mis compromisos'});
 assert(screen.getByRole('button',{name:/Ofrecimiento/}));
 assert(screen.getByRole('button',{name:/Meditación/}));
 assert(screen.getByRole('button',{name:/Agradecimiento/}));

 fireEvent.click(screen.getByRole('button',{name:/Meditación/}));
 await screen.findByRole('dialog',{name:'Mi meditación'});
 assert(screen.getByRole('textbox',{name:'Mi meditación…'}));
 assert.equal(screen.queryByRole('textbox',{name:'Ofrezco a la Mater…'}),null);
 assert.equal(screen.queryByRole('textbox',{name:'Hoy agradezco…'}),null);
 fireEvent.change(screen.getByRole('textbox',{name:'Mi meditación…'}),{target:{value:'Una palabra que quiero guardar'}});
 fireEvent.click(screen.getByRole('button',{name:'Guardar',exact:true}));
 await waitFor(()=>assert(!screen.queryByRole('dialog')));
 assert.equal(writes.at(-1).kind,'journal');assert.equal(writes.at(-1).data.meditation,'Una palabra que quiero guardar');

 fireEvent.mouseDown(screen.getByRole('tab',{name:'Oración'}),{button:0,ctrlKey:false});
 await screen.findByRole('heading',{name:'Oración'});
 assert(screen.getByRole('heading',{name:'Mis oraciones'}));
 assert(screen.getByRole('button',{name:/Oración de mi ideal personal/}));
 assert(screen.getByRole('button',{name:/Oración de nuestro Santuario Hogar/}));
 assert.equal(screen.queryByRole('button',{name:/Oración de nuestro ideal matrimonial/}),null);
 assert.equal(screen.queryByRole('button',{name:/Oración de la Alianza/}),null);
 console.log('PASS optional offering, meditation and gratitude entries; only entered personal prayers are shown');
}finally{cleanup();dom.window.close();}
