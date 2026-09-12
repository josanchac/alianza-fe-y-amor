import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');const {render,screen,fireEvent,waitFor,cleanup}=await import('@testing-library/react');
const {PairingPanel,MaritalIdeal}=await import('../app/pairing.tsx');const {default:Journal}=await import('../app/journal.tsx');
const {localDate}=await import('../lib/domain.ts');
const calls=[];let fail=false;const act=async payload=>{if(fail)throw new Error('Sin conexión; intentá otra vez.');calls.push(payload);return payload.action==='preview'?{invitation:{name:'Persona invitante',email:'inviter@example.test'}}:payload.action==='create'?{token:'a'.repeat(64)}:{};};
const state={user:{id:'one',relationshipVersion:1,coupleId:null},partner:null,invitations:[]};
try{
 let continued=false;render(React.createElement(PairingPanel,{state,act,busy:false,onContinue(){continued=true;}}));
 fireEvent.click(screen.getByRole('button',{name:'Continuar individualmente'}));assert(continued);assert.equal(calls.length,0);
 fireEvent.click(screen.getByRole('button',{name:'Quiero usarla en pareja'}));
 fireEvent.change(screen.getByLabelText('Correo de tu cónyuge'),{target:{value:'spouse@example.test'}});const create=screen.getByRole('button',{name:'Crear código de vinculación'});assert(create.disabled);
 fireEvent.click(screen.getByRole('checkbox'));assert(!create.disabled);fireEvent.click(create);await screen.findByLabelText('Código para compartir');assert.equal(calls[0].email,'spouse@example.test');
 fireEvent.change(screen.getByLabelText('Correo de tu cónyuge'),{target:{value:'other@example.test'}});assert(screen.getByText(/Compartí este código con spouse@example.test/));assert(create.disabled);
 console.log('PASS Individual continuation is free of writes; invitation creation requires explicit consent to the exact recipient');
 cleanup();calls.length=0;render(React.createElement(PairingPanel,{state,act,busy:false}));fireEvent.click(screen.getByRole('button',{name:'Tengo un código de vinculación'}));
 fireEvent.change(screen.getByLabelText('Código que recibiste'),{target:{value:'b'.repeat(64)}});fireEvent.click(screen.getByRole('button',{name:'Revisar invitación'}));await screen.findByRole('heading',{name:'Vincularme con Persona invitante'});
 assert.equal(calls.length,1);assert.equal(calls[0].action,'preview');let accept=screen.getByRole('button',{name:'Aceptar vinculación'});assert(accept.disabled);
 fireEvent.click(screen.getByRole('checkbox'));fail=true;fireEvent.click(accept);await screen.findByRole('alert');assert.equal(calls.length,1);assert(screen.getByRole('heading',{name:'Vincularme con Persona invitante'}));
 fail=false;fireEvent.click(accept);await waitFor(()=>assert.equal(calls.at(-1).action,'accept'));
 console.log('PASS Recipient sees the identity before acceptance; failure preserves the form without claiming a link');
 cleanup();let finishPreview;let requestNumber=0;
 const delayed=payload=>{requestNumber++;return new Promise(resolve=>{finishPreview=resolve;});};
 render(React.createElement(PairingPanel,{state,act:delayed,busy:false}));fireEvent.click(screen.getByRole('button',{name:'Tengo un código de vinculación'}));
 fireEvent.change(screen.getByLabelText('Código que recibiste'),{target:{value:'a'.repeat(64)}});fireEvent.click(screen.getByRole('button',{name:'Revisar invitación'}));
 fireEvent.change(screen.getByLabelText('Código que recibiste'),{target:{value:'b'.repeat(64)}});finishPreview({invitation:{name:'Respuesta antigua',email:'old@example.test'}});
 await new Promise(resolve=>setTimeout(resolve,0));assert.equal(screen.queryByRole('heading',{name:'Vincularme con Respuesta antigua'}),null);assert.equal(requestNumber,1);
 console.log('PASS A late preview response cannot attach consent to a different invitation code');
 cleanup();calls.length=0;const props={ideal:{text:'',version:0,confirmations:0,confirmedByMe:false},coupleId:'pair',act,busy:false};const view=render(React.createElement(MaritalIdeal,props));
 fireEvent.click(screen.getByText('Nuestro ideal matrimonial · opcional'));assert(screen.getByText('Todavía no tenemos ideal matrimonial'));assert.equal(calls.length,0);
 fireEvent.click(screen.getByRole('button',{name:'Anotar una frase cuando lo deseemos'}));fireEvent.change(screen.getByLabelText('Nuestra frase'),{target:{value:'Borrador propio'}});
 view.rerender(React.createElement(MaritalIdeal,{...props,ideal:{...props.ideal,text:'Actualizado en otro celular',version:1}}));
 fireEvent.click(screen.getByRole('button',{name:'Guardar borrador matrimonial'}));await waitFor(()=>assert.equal(calls[0].version,0)); // stale original version, never rebase silently
 console.log('PASS Marital ideal can stay empty; a draft keeps its original revision after remote changes');
 cleanup();calls.length=0;
 const today=localDate();let fixture={user:{id:'one',role:'member',email:'one@example.test',relationshipVersion:1,coupleId:null},own:[{owner:'one',kind:'profile',key:'me',data:{name:'Persona',ideal:'',shareSchedule:false,shareNotes:false},version:1,updated:''}],shared:[],partner:null,archives:[],invitations:[],marriageIdeal:null,today};
 const requests=[];async function request(init){if(init?.method==='POST'){const p=JSON.parse(init.body);requests.push(p);return Response.json({error:'No permitido en esta prueba'},{status:409});}return Response.json(fixture);}
 render(React.createElement(Journal,{dataRequest:request,onSignOut(){}}));await screen.findByRole('heading',{name:'¿Qué te ayudaría hoy?'});
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Las 4 Rs'}),{button:0,ctrlKey:false});await screen.findByRole('heading',{name:'Podés empezar por vos'});assert.equal(screen.queryByRole('button',{name:'Preparar este momento'}),null);
 // Receive a linked state from the server, then hold a shared draft through an unlink.
 fixture={...fixture,user:{...fixture.user,coupleId:'pair',relationshipVersion:2},couple:{emblem:'neutral'},partner:{name:'Pareja',ideal:'',shareSchedule:false,shareNotes:false,records:[]},marriageIdeal:{text:'',version:0,confirmations:0,confirmedByMe:false}};
 fireEvent(window,new Event('focus'));await screen.findByText(/Este espacio es compartido con Pareja/);
 fireEvent.click(screen.getAllByRole('button',{name:'Preparar este momento'})[0]);await screen.findByRole('dialog');
 fixture={...fixture,user:{...fixture.user,coupleId:null,relationshipVersion:3},partner:null,couple:null,marriageIdeal:null};fireEvent(window,new Event('focus'));
 await screen.findByText(/La vinculación cambió. Tu borrador sigue aquí/);fireEvent.click(screen.getByRole('button',{name:'Guardar',exact:true}));await screen.findByText(/Cerrá este formulario y revisá tu espacio actualizado/);assert.equal(requests.length,0);
 console.log('PASS Individual UI hides shared editors; a draft from an old relationship cannot be saved into the next context');
}finally{cleanup();dom.window.close();}
