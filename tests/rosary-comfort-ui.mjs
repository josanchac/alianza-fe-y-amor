import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');
const {render,screen,fireEvent,waitFor,cleanup,act}=await import('@testing-library/react');
const {PersonalRosary}=await import('../app/personal-rosary.tsx');
const {usePrayerScreen}=await import('../app/use-prayer-screen.ts');
const {localDate}=await import('../lib/domain.ts');
const {prayerFor,ROSARY_STEPS,nextPrayerStep}=await import('../lib/rosary-guide.ts');
const base={id:'comfort-test',ownerId:'owner',groupId:null,coupleId:null,mystery:'joyful',mode:'free',intention:'',cancelled:false,slots:[],mine:[],personalStep:0,progressVersion:0};
const calls=[];let fail=false;
const habits=[{key:'h',data:{title:'Rezar el rosario',active:true}}];
function Harness({initial=base,checked={}}){const [r,setR]=React.useState(initial);const [checks,setChecks]=React.useState(checked);return React.createElement(PersonalRosary,{r,habits,checks,busy:false,act:async p=>{calls.push(p);if(fail)throw Error('Sin conexión');if(p.action==='rosary_step')setR({...r,personalStep:p.step,progressVersion:r.progressVersion+1,...(p.step===69?{mine:Array.from({length:5},(_,i)=>({decade:i+1,day:localDate()}))}:{})});if(p.action==='rosary_opening')setR({...r,progressVersion:r.progressVersion+1,opening:{include:p.include,mary:p.mary,position:p.position}});if(p.action==='rosary_today')setChecks({h:'done'});if(p.action==='rosary_discard')setR({...r,cancelled:true});return {};}});}
async function clear(){cleanup();sessionStorage.clear();localStorage.clear();calls.length=0;await act(()=>new Promise(r=>setTimeout(r,20)));}
try{
 render(React.createElement(Harness));
 fireEvent.click(screen.getByRole('button',{name:'Hija, Madre y Esposa'}));
 fireEvent.click(screen.getByRole('button',{name:'Empezar a rezar'}));
 await screen.findByRole('dialog');assert.equal(calls[0].action,'rosary_opening');assert.equal(calls[0].mary,'trinitarian');
 fireEvent.pointerDown(document.body);assert(screen.getByRole('dialog'));
 fireEvent.keyDown(screen.getByRole('dialog'),{key:'Escape'});assert(screen.getByText('¿Pausar el rosario?'));
 fireEvent.click(screen.getByRole('button',{name:'Seguir rezando'}));assert(screen.getByRole('heading',{name:'Señal de la cruz'}));
 fireEvent.click(screen.getByRole('button',{name:'Opciones del rezo'}));fireEvent.click(screen.getByRole('button',{name:'Aumentar letra'}));assert.equal(localStorage.getItem('alianza-prayer-font'),'26');
 fireEvent.click(screen.getByRole('button',{name:'Descartar este rosario'}));fail=true;
 fireEvent.click(screen.getByRole('button',{name:'Sí, descartar'}));await screen.findByRole('alert');assert(screen.getByText('¿Descartar este rosario?'));
 fail=false;fireEvent.click(screen.getByRole('button',{name:'Sí, descartar'}));await waitFor(()=>assert.equal(screen.queryByRole('dialog'),null));
 assert.equal(calls.filter(p=>p.action==='rosary_step'||p.action==='rosary_today').length,0);await clear();
 assert(prayerFor(ROSARY_STEPS[3],{include:true,mary:'trinitarian'}).text.startsWith('Dios te salve, María, Hija de Dios Padre,'));
 assert(prayerFor(ROSARY_STEPS[4],{include:true,mary:'trinitarian'}).text.includes('Madre de Dios Hijo'));
 assert(prayerFor(ROSARY_STEPS[5],{include:true,mary:'trinitarian'}).text.includes('Esposa de Dios Espíritu Santo'));
 assert.equal(prayerFor(ROSARY_STEPS[8],{include:true,mary:'trinitarian'}).name,'Avemaría');
 assert.equal(nextPrayerStep(1,1,{include:false,mary:'standard'}),6);
 // Completion prompts; re-render and repeat clicks cannot duplicate an acknowledged mark.
 render(React.createElement(Harness,{initial:{...base,personalStep:68,progressVersion:68}}));
 fireEvent.click(screen.getByRole('button',{name:'Continuar rezando'}));fireEvent.click(screen.getByRole('button',{name:'Terminé el rosario'}));await screen.findByRole('heading',{name:'Rosario concluido'});
 assert.equal(calls.filter(p=>p.action==='rosary_today').length,0);
 const mark=screen.getByRole('button',{name:'Marcar mi compromiso'});await waitFor(()=>assert(!mark.disabled));fireEvent.click(mark);await screen.findByRole('button',{name:'Ya está marcado'});
 assert.equal(calls.filter(p=>p.action==='rosary_today').length,1);
 fireEvent.click(screen.getByRole('button',{name:'Rezar las letanías'}));assert(screen.getByRole('heading',{name:'Señor, ten piedad.'}));fireEvent.click(screen.getByRole('button',{name:'Avanzar'}));assert(screen.getByRole('heading',{name:'Cristo, ten piedad.'}));assert.equal(calls.filter(p=>p.action==='rosary_step').length,1);await clear();
 // Auto marking requires a remembered opt-in AND a completion transition in this session.
 localStorage.setItem('alianza-rosary-auto:owner','h');
 const finished={...base,personalStep:69,mine:Array.from({length:5},(_,i)=>({decade:i+1,day:localDate()}))};
 render(React.createElement(Harness,{initial:finished}));assert.equal(calls.length,0);cleanup();
 render(React.createElement(Harness,{initial:{...base,personalStep:68,progressVersion:68}}));fireEvent.click(screen.getByRole('button',{name:'Continuar rezando'}));fireEvent.click(screen.getByRole('button',{name:'Terminé el rosario'}));await screen.findByRole('button',{name:'Ya está marcado'});assert.equal(calls.filter(p=>p.action==='rosary_today').length,1);await clear();
 // Wake lock is released when disabled; a late grant after unmount is also released.
 let requests=0,releases=0,grant;let delayed=false;
 Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{requests++;if(delayed)return new Promise(r=>grant=r);return{released:false,addEventListener(){},release:async()=>{releases++;}};}}});
 function Wake({active}){const value=usePrayerScreen(active,true);return React.createElement('p',null,value);}
 const w=render(React.createElement(Wake,{active:true}));await screen.findByText('on');assert.equal(requests,1);w.rerender(React.createElement(Wake,{active:false}));await waitFor(()=>assert.equal(releases,1));cleanup();
 delayed=true;render(React.createElement(Wake,{active:true}));await waitFor(()=>assert.equal(requests,2));cleanup();await act(async()=>{grant({released:false,addEventListener(){},release:async()=>{releases++;}});});assert.equal(releases,2);
 console.log('PASS rosary comfort: protected exit, confirmed discard, readable preferences, prayer variant, optional opening, litany, explicit/opt-in linking and wake-lock lifetime');
}finally{cleanup();dom.window.close();}
