import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');const {render,screen,fireEvent,waitFor,cleanup,act:flush}=await import('@testing-library/react');
const {PairingInbox,PairInvitation,PendingPairRequest,PairingRecognition,invitationLink}=await import('../app/pairing-requests.tsx');
const {default:Journal}=await import('../app/journal.tsx');const {localDate}=await import('../lib/domain.ts');
const request={id:'request-id',name:'Persona invitante',email:'spouse@example.test',expiresAt:'2026-09-22T00:00:00Z'};
try{
 const calls=[];let accepted=false;const act=async p=>{calls.push(p);return {};};
 render(React.createElement(PairingInbox,{requests:[request],act,busy:false,onAccepted(){accepted=true;}}));
 assert.equal(screen.queryByRole('dialog'),null);assert.equal(calls.length,0);fireEvent.click(screen.getByRole('button',{name:/Tenés una solicitud/}));
 assert(screen.getByText('Persona invitante quiere vincularse con vos'));const accept=screen.getByRole('button',{name:'Aceptar vinculación'});assert(accept.disabled);
 fireEvent.click(screen.getByRole('checkbox'));fireEvent.click(accept);await screen.findByText('Ya están vinculados');assert.equal(calls[0].action,'accept_request');assert.equal(calls[0].id,request.id);assert.equal(accepted,false);
 fireEvent.click(screen.getByRole('button',{name:'Ir a nuestro espacio'}));assert(accepted);
 cleanup();calls.length=0;render(React.createElement(PendingPairRequest,{request,act,busy:false}));
 fireEvent.click(screen.getByRole('button',{name:'Copiar enlace'}));await screen.findByLabelText('Enlace para compartir');const link=screen.getByLabelText('Enlace para compartir').value;
 assert.equal(link,invitationLink(request.id));assert(!link.includes(request.email));assert.equal(calls.length,0);
 cleanup();render(React.createElement(PendingPairRequest,{request,act,busy:false}));assert(screen.getByText('Esperando su respuesta'));fireEvent.click(screen.getByRole('button',{name:'Cancelar solicitud'}));assert.equal(calls.length,0);fireEvent.click(screen.getByRole('button',{name:'Sí, cancelar solicitud'}));await waitFor(()=>assert.equal(calls[0].action,'cancel'));
 console.log('PASS quiet notice, explicit consent, deliberate navigation, persistent invitation link, copy fallback and confirmed cancellation');
 cleanup();let finish;render(React.createElement(PairInvitation,{act:()=>new Promise(resolve=>{finish=resolve;}),busy:false,onSent(){}}));
 fireEvent.change(screen.getByLabelText('Correo de tu cónyuge'),{target:{value:'old@example.test'}});fireEvent.click(screen.getByRole('button',{name:'Continuar',exact:true}));
 fireEvent.change(screen.getByLabelText('Correo de tu cónyuge'),{target:{value:'new@example.test'}});await flush(async()=>finish({candidate:{name:'Stale name'}}));assert.equal(screen.queryByText('Stale name'),null);assert.equal(screen.queryByRole('button',{name:'Enviar solicitud'}),null);
 cleanup();calls.length=0;render(React.createElement(PairingRecognition,{act,busy:false}));fireEvent.click(screen.getByRole('button',{name:'Cómo me reconoce mi pareja'}));assert.equal(screen.getByRole('checkbox').checked,false);fireEvent.change(screen.getByLabelText('Nombre para reconocerte'),{target:{value:'Nombre elegido'}});fireEvent.click(screen.getByRole('checkbox'));fireEvent.click(screen.getByRole('button',{name:'Guardar preferencia'}));await waitFor(()=>assert.equal(calls[0].enabled,true));assert.equal(calls[0].name,'Nombre elegido');
 console.log('PASS changed email invalidates stale lookup; recognition is off until expressly enabled');
 cleanup();const fixture={user:{id:'one',role:'member',email:'one@example.test',relationshipVersion:1,dataEpoch:1,coupleId:null},own:[{owner:'one',kind:'spaces',key:'experience',version:1,data:{enabled:['personal'],start:'personal'}},{owner:'one',kind:'profile',key:'me',data:{name:'Persona',ideal:'',shareSchedule:false,shareNotes:false},version:1,updated:''}],shared:[],partner:null,archives:[],invitations:[],receivedInvitations:[request],marriageIdeal:null,today:localDate()};
 render(React.createElement(Journal,{dataRequest:async()=>Response.json(fixture),onSignOut(){}}));await screen.findByRole('heading',{name:'Mis compromisos'});assert(screen.getByRole('button',{name:/Tenés una solicitud/}));assert.equal(screen.queryByRole('dialog'),null);assert.equal(screen.queryByRole('button',{name:'Pareja',exact:true}),null);
 console.log('PASS incoming request is reachable from a personal-only account without enabling couple space or opening an interrupting modal');
}finally{cleanup();dom.window.close();}
