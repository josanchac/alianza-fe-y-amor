import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');
const {render,screen,fireEvent,cleanup,act}=await import('@testing-library/react');
const {Mass}=await import('../app/mass.tsx');
const {massToday,easterDate,validMassDate,massContext,massSections,availableMassReadings,MASS_READINGS}=await import('../lib/mass.ts');
const now=()=>new Date('2026-09-20T02:00:00Z');
// Synthetic non-liturgical content: only imported by tests, never by the app or preview.
const fixture={date:'2026-09-20',celebrationId:'general',territory:'CR',calendar:{status:'verified',source:'https://calendar.example.test',reviewedBy:'Synthetic reviewer'},rights:{status:'authorized',holder:'Synthetic test author',permissionReference:'TEST-ONLY',attribution:'Texto sintético de prueba, no litúrgico',allowsInApp:true,validThrough:'2100-12-31'},source:'https://source.example.test',readings:[{id:'reading-one',title:'Texto de prueba uno',reference:'Referencia sintética',text:'INICIO SINTÉTICO\n'+('Contenido técnico de prueba.\n'.repeat(250))+'FIN SINTÉTICO',complete:true},{id:'reading-two',title:'Texto de prueba dos',reference:'Otra referencia sintética',text:'SEGUNDO TEXTO SINTÉTICO',complete:true}]};
const date=value=>fireEvent.change(screen.getByLabelText('Fecha que querés consultar'),{target:{value}});
const click=name=>fireEvent.click(screen.getByRole('button',{name}));
try {
 assert.equal(massToday(now()),'2026-09-19');assert.equal(massToday(new Date('2026-09-20T06:01:00Z')),'2026-09-20');
 assert.equal(easterDate(2024),'2024-03-31');assert.equal(easterDate(2026),'2026-04-05');assert.equal(easterDate(2027),'2027-03-28');
 assert(!validMassDate('2026-02-30'));assert(validMassDate('2024-02-29'));assert(!validMassDate('2101-01-01'));
 assert.equal(massContext('2026-09-19','').awaiting,true);assert.equal(massContext('2026-03-28','sunday').kind,'palm');
 assert.equal(massContext('2026-04-04','before').kind,'holy-saturday');assert.equal(massContext('2026-04-04','vigil').kind,'vigil');
 assert.equal(massContext('2026-12-25','night').celebrationId,'christmas-night');assert.equal(massContext('2026-12-25','vigil').awaiting,true);
 assert(!massSections('friday').some(s=>s.id==='eucharist'));assert(!massSections('thursday','procession',false).flatMap(s=>s.moments).includes('Lavatorio de los pies'));
 assert.equal(MASS_READINGS.length,0);assert(availableMassReadings([fixture],fixture.date,'general','2026-09-19'));
 for(const change of [s=>s.rights.status='pending',s=>s.rights.allowsInApp=false,s=>s.rights.validThrough='2026-01-01',s=>s.calendar.status='pending',s=>s.territory='MX',s=>s.date='2026-09-21',s=>s.celebrationId='christmas-night',s=>s.readings[0].complete=false,s=>s.readings[0].text='',s=>s.source='javascript:alert(1)',s=>s.rights.permissionReference='',s=>s.readings.push(s.readings[0])]){const bad=structuredClone(fixture);change(bad);assert.equal(availableMassReadings([bad],fixture.date,'general','2026-09-19'),undefined);}
 console.log('PASS dates, Costa Rica midnight, movable feasts, Saturday/Christmas choices, special structures and 12 content rejection cases');
 const scrolls=[];HTMLElement.prototype.scrollIntoView=function(){scrolls.push(this.dataset.massAnchor)};
 render(React.createElement(Mass,{now,readingSets:[fixture]}));
 assert.equal(screen.getByLabelText('Fecha que querés consultar').value,'2026-09-19');assert.equal(screen.getByRole('button',{name:'Celebraciones especiales'}).getAttribute('aria-expanded'),'false');
 click('Misa del domingo');assert.equal(screen.getByRole('button',{name:'Lecturas',exact:true}).getAttribute('aria-pressed'),'true');click('Texto de prueba uno');assert(document.body.textContent.includes('FIN SINTÉTICO'));assert(document.body.textContent.includes('INICIO SINTÉTICO'));
 click('Texto de prueba dos');assert(!document.body.textContent.includes('FIN SINTÉTICO'));assert(document.body.textContent.includes('SEGUNDO TEXTO SINTÉTICO'));
 click('Oraciones');assert(!document.body.textContent.includes('SEGUNDO TEXTO SINTÉTICO'));click('Padre nuestro');assert(screen.getByRole('heading',{name:'Padre nuestro'}));assert(screen.getByText(/Danos hoy/));assert.equal(screen.queryByLabelText('Fecha que querés consultar'),null);click('Volver a oraciones y respuestas');assert.equal(screen.getByLabelText('Fecha que querés consultar').value,'2026-09-19');click('Lecturas');click('Texto de prueba uno');await act(()=>new Promise(r=>setTimeout(r,60)));assert.equal(scrolls.at(-1),'reading-reading-one');
 date('2026-09-21');assert(!document.body.textContent.includes('FIN SINTÉTICO'));assert(screen.getByRole('status').textContent.includes('todavía no están disponibles'));
 click('Celebraciones especiales');click('Navidad');assert.equal(screen.getByLabelText('Fecha que querés consultar').value,'2026-12-25');assert.equal(screen.getByRole('button',{name:'Celebraciones especiales'}).getAttribute('aria-expanded'),'false');click('Noche');assert(!document.body.textContent.includes('FIN SINTÉTICO'));
 click('Hoy');assert.equal(screen.getByLabelText('Fecha que querés consultar').value,'2026-09-19');assert(screen.getByRole('button',{name:'Misa del domingo'}));assert.equal(screen.queryByRole('button',{name:'Noche'}),null);
 date('2026-04-03');click('Oraciones');assert.equal(screen.queryByRole('button',{name:/Liturgia eucarística/}),null);assert(screen.getByText('Este día no se celebra misa.'));
 date('2026-04-04');click('Antes de la Vigilia');assert(screen.getByText('Antes de la Vigilia Pascual no se celebra misa.'));click('Vigilia Pascual');assert(screen.getByRole('button',{name:'Oraciones'}));
 console.log('PASS full inline synthetic content, dedicated prayers, readings-first access, stale scroll cancellation, date reset, shortcuts, Christmas and Good Friday UI');
 cleanup();
 // Content identifiers must not collide with section or moment controls.
 const collision=structuredClone(fixture);collision.readings[0].id='word';collision.readings[1].id='start-moment-0';
 render(React.createElement(Mass,{now:()=>new Date('2026-09-20T12:00:00Z'),readingSets:[collision]}));
 click('Texto de prueba uno');
 const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);
 assert.equal(new Set(ids).size,ids.length,'Reading IDs must not duplicate section IDs');
 assert(screen.getByText('INICIO SINTÉTICO', {exact:false}));
 cleanup();
 const {default:Journal}=await import('../app/journal.tsx');
 const state={user:{id:'synthetic',role:'member',email:'synthetic@example.test',coupleId:null,relationshipVersion:1},own:[{owner:'synthetic',kind:'spaces',key:'experience',version:1,data:{enabled:['personal'],start:'personal'}},{owner:'synthetic',kind:'profile',key:'me',version:1,data:{name:'',ideal:'',shareSchedule:false,shareNotes:false}}],shared:[],partner:null,today:'2026-09-19'};
 const writes=[];
 render(React.createElement(Journal,{dataRequest:async init=>{if(init?.method==='POST')writes.push(init);return Response.json(state)},onSignOut(){}}));
 await screen.findByRole('heading',{name:/^(Hoy|Mi día)$/});
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Oración',exact:true}),{button:0,ctrlKey:false});
 click('Misa');assert(screen.getByRole('region',{name:'Misa'}));
 date('2026-09-20');click('Oraciones');click('Volver a Oración');assert(screen.getByRole('button',{name:'Misa'}));assert.equal(writes.length,0);
 console.log('PASS Journal → Oración → Misa → return without data writes');
} finally {cleanup();dom.window.close();}

const {massMomentNote}=await import('../lib/mass.ts');
assert.match(massMomentNote('Acto penitencial','general'),/aspersión/);
assert.doesNotMatch(massMomentNote('Acto penitencial','thursday'),/aspersión/);
assert.match(massMomentNote('Señor, ten piedad','general'),/no se repite/);
