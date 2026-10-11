import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');
const {render,screen,fireEvent,cleanup}=await import('@testing-library/react');
const {default:Journal}=await import('../app/journal.tsx');
const {localDate}=await import('../lib/domain.ts');
const row=(kind,key,data)=>({owner:'synthetic',kind,key,data,version:1,updated:''});
const fixture={user:{id:'synthetic',role:'member',email:'x@example.test',relationshipVersion:1,dataEpoch:1,coupleId:'couple'},own:[row('profile','me',{name:'Prueba',ideal:'',shareSchedule:false,shareNotes:false}),row('spaces','experience',{enabled:['personal','couple'],start:'personal'})],shared:[],partner:{name:'Pareja de prueba',ideal:'',shareSchedule:false,shareNotes:false,records:[]},today:localDate()};
const shared={id:'active',ownerId:'other',groupId:null,coupleId:'couple',mystery:'joyful',mode:'free',intention:'',cancelled:false,slots:[],mine:[]};
const community={groups:[],rosaries:[shared,{...shared,id:'finished',mystery:'glorious',slots:Array.from({length:5},(_,i)=>({decade:i+1,userId:'other',done:true}))}]};
let writes=0;
try{
 render(React.createElement(Journal,{dataRequest:async init=>{if(init?.method==='POST')writes++;return Response.json(fixture);},communityTransport:async p=>{if(p.action!=='snapshot')writes++;return Response.json(community);},onSignOut(){}}));
 await screen.findByRole('button',{name:/Mis reflexiones/});
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Oración'}),{button:0,ctrlKey:false});
 fireEvent.click(await screen.findByRole('button',{name:/Continuar el rosario en pareja/}));
 assert(screen.getByRole('heading',{name:'Misterios gozosos'}));
 assert.equal(screen.queryByRole('heading',{name:'Misterios gloriosos'}),null);
 fireEvent.click(screen.getByRole('button',{name:/Rosarios concluidos en pareja/}));
 assert(screen.getByRole('heading',{name:'Misterios gloriosos'}));
 assert.equal(screen.queryByRole('heading',{name:'Misterios gozosos'}),null);
 fireEvent.click(screen.getByRole('button',{name:'Volver a Rosario juntos'}));
 assert(screen.getByRole('heading',{name:'Misterios gozosos'}));assert.equal(writes,0);
 console.log('PASS prayer entry discovers the same partner rosary, separates completed history and navigates without writes');
}finally{cleanup();dom.window.close();}
