import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
globalThis.FormData=dom.window.FormData;
const React=await import('react');const {render,screen,fireEvent,waitFor,cleanup}=await import('@testing-library/react');
const {PersonalRosary}=await import('../app/personal-rosary.tsx');
const {GroupsWorkspace}=await import('../app/groups-workspace.tsx');
const {ROSARY_STEPS}=await import('../lib/rosary-guide.ts');
const calls=[];let fail=false;
const base={id:'r',ownerId:'a',groupId:null,coupleId:null,mystery:'joyful',mode:'free',intention:'',cancelled:false,slots:[],mine:[],personalStep:0,progressVersion:0};
function RosaryHarness(){const [r,setR]=React.useState(base);return React.createElement(PersonalRosary,{r,busy:false,act:async p=>{calls.push(p);if(fail)throw Error('Sin conexión');setR({...r,personalStep:p.step,progressVersion:r.progressVersion+1});return{};}});}
try{
 render(React.createElement(RosaryHarness));assert.equal(screen.queryByText('Reservar'),null);assert.equal(screen.queryByText('Administrar este encuentro'),null);fireEvent.click(screen.getByRole('button',{name:'Empezar a rezar'}));assert(screen.getByRole('heading',{name:'Señal de la cruz'}));assert.equal(screen.queryByText(/En el nombre del Padre/),null);fireEvent.click(screen.getByRole('button',{name:'Ver oración'}));assert(screen.getByText(/En el nombre del Padre/));
 fail=true;fireEvent.click(screen.getByRole('button',{name:'Avanzar'}));await screen.findByRole('alert');assert(screen.getByRole('heading',{name:'Señal de la cruz'}));fail=false;
 for(let n=1;n<=ROSARY_STEPS.length;n++){const button=screen.getByRole('button',{name:n===ROSARY_STEPS.length?'Terminé el rosario':'Avanzar'});await waitFor(()=>assert.equal(button.disabled,false));fireEvent.click(button);await waitFor(()=>assert.equal(calls.at(-1).step,n));}
 assert(screen.getByRole('heading',{name:'Rosario concluido'}));assert.equal(calls.filter(p=>p.action==='rosary_complete').length,0);cleanup();
 const group={id:'g',name:'Curso',ownerId:'a',version:1,members:[{id:'a',name:'Ana'},{id:'b',name:'Beatriz'}],motto:'',ideal:'',purposes:[],meeting:null};
 const groupView=render(React.createElement(GroupsWorkspace,{state:{groups:[group],rosaries:[]},act:async p=>{calls.push(p);return{};},userId:'a',name:'Ana',busy:false}));
 fireEvent.click(screen.getByRole('button',{name:/Curso/}));fireEvent.click(screen.getByRole('button',{name:'Organizar',exact:true}));fireEvent.click(screen.getByRole('button',{name:'Permisos y responsabilidades'}));fireEvent.change(screen.getByRole('combobox',{name:'Permiso: Rosarios'}),{target:{value:'selected'}});fireEvent.click(screen.getAllByRole('checkbox',{name:'Beatriz'})[1]);fireEvent.change(screen.getByRole('combobox',{name:'Permiso: Avisos y materiales'}),{target:{value:'all'}});
 groupView.rerender(React.createElement(GroupsWorkspace,{state:{groups:[{...group,version:2,permissions:{rosary:{mode:'coordinators',users:[]}}}],rosaries:[]},act:async p=>{calls.push(p);return{};},userId:'a',name:'Ana',busy:false}));
 fireEvent.click(screen.getByRole('button',{name:'Guardar',exact:true}));await waitFor(()=>assert.equal(calls.at(-1).action,'group_permissions'));assert.equal(calls.at(-1).version,1,'Remote refresh preserves the draft revision for conflict rejection');assert.deepEqual(calls.at(-1).permissions.rosary,{mode:'selected',users:['b']});assert.equal(calls.at(-1).permissions.materials.mode,'all');assert.deepEqual(calls.at(-1).coordinators,[]);cleanup();
 console.log('PASS renewal UI: personal-only prayer, optional text, failed-step recovery, all 69 steps, explicit final completion, latest delegated permissions submitted');
}finally{cleanup();dom.window.close();}
