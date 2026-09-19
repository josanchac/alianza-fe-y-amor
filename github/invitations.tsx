import {useEffect,useRef,useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
type Person={id:string|null;email:string;label:string;version:number;state:string;delivery:string|null;expiresAt?:string};
const states:Record<string,string>={pending:'Pendiente de activación',expired:'Invitación vencida',cancelled:'Cancelada',accepted:'Cuenta activada',active:'Cuenta activada',legacy_pending:'Acceso anterior sin activar'};
const delivery:Record<string,string>={unknown:'Generación sin confirmar',requested:'Enlace generado',error:'No se pudo generar el enlace'};
const errors:Record<string,string>={changed:'La invitación cambió. Actualizá la lista antes de intentar de nuevo.',rate_limited:'Esperá antes de generar otro enlace. Máximo tres por persona en una hora.',access_denied:'Ya no tenés permiso para administrar invitaciones.',sign_in_required:'Tu sesión terminó. Volvé a entrar.',maintenance:'Estamos actualizando Alianza. Intentá más tarde.'};
type Operation={action:'invite'|'renew'|'cancel';email:string;label:string;version:number;requestId:string};
export function InvitationAdmin({client}:{client:SupabaseClient}) {
 const [people,setPeople]=useState<Person[]>([]),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[manualLinks,setManualLinks]=useState(false);
 const [email,setEmail]=useState(''),[label,setLabel]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState('');
 const [proposal,setProposal]=useState<Operation|null>(null),[retry,setRetry]=useState<Operation|null>(null);
 const [link,setLink]=useState(''),[recipient,setRecipient]=useState('');
 const lock=useRef(false),alive=useRef(true),refreshVersion=useRef(0);
 const [search,setSearch]=useState(''),[filter,setFilter]=useState('all');
 async function invoke(body:object){
  const r=await client.functions.invoke('pilot-invitations',{body});
  if(r.error){let code='';try{code=(await r.error.context?.json())?.error;}catch{}throw Error(errors[code]||'No pudimos confirmar la operación. Actualizá la lista o reintentá la misma solicitud.');}
  return r.data;
 }
 async function refresh(){
  const version=++refreshVersion.current;setPeople([]);setReady(false);setError('');
  try{
   const [r,capabilities]=await Promise.all([client.rpc('alianza_invitation_list'),invoke({action:'status'})]);
   if(r.error||!Array.isArray(r.data?.people))throw Error('No se pudo cargar la lista o ya no tenés acceso.');
   if(alive.current&&version===refreshVersion.current){setPeople(r.data.people);setManualLinks(capabilities.manualLinks===true);setReady(true);}
  }catch(e){if(alive.current&&version===refreshVersion.current){setLink('');setRecipient('');setManualLinks(false);setError((e as Error).message);}}
 }
 useEffect(()=>{alive.current=true;void refresh();return()=>{alive.current=false;refreshVersion.current++;};},[client]);
 async function execute(op:Operation){
  if(lock.current)return;lock.current=true;setBusy(true);setError('');setMessage('');setLink('');setRecipient('');setProposal(null);
  try{
   const r=await invoke(op);if(!alive.current)return;
   setRetry(null);setEmail('');setLabel('');
   if(r.result==='generated'&&r.link){setLink(r.link);setRecipient(r.email);}
   setMessage(r.result==='cancelled'?'Invitación cancelada. Ese acceso ya no permite entrar a Alianza.':r.result==='generated'?'Enlace listo para compartir con la persona indicada.':r.result==='error'?'No se pudo generar el enlace. La cuenta se conserva.':'No se pudo recuperar el enlace. Actualizá la lista y renová la invitación para crear otro.');
   await refresh();
  }catch(e){if(alive.current){setLink('');setRecipient('');setPeople([]);setReady(false);setRetry(op);setError((e as Error).message);}}
  finally{lock.current=false;if(alive.current)setBusy(false);}
 }
 function propose(action:Operation['action'],target=email,version=0){setProposal({action,email:target.trim().toLowerCase(),label,version,requestId:crypto.randomUUID()});setMessage('');}
 const visiblePeople=people.filter(p=>(!search||`${p.label} ${p.email}`.toLowerCase().includes(search.toLowerCase().trim()))&&(filter==='all'||p.state===filter||(filter==='accepted'&&p.state==='active')||(filter==='pending'&&p.state==='legacy_pending')));
 return <section className="invitation-admin" aria-label="Personas e invitaciones">
  <h2>Personas e invitaciones</h2><p>Cada persona empieza con su propio espacio. Vincularse como pareja es opcional y requiere aceptación de ambos.</p>
  <p className="muted">Solo correo y estado de acceso. Sin contenido espiritual ni contraseñas. Los enlaces de activación son privados.</p>
  <button className="soft-button" disabled={busy} onClick={()=>void refresh()}>Actualizar invitaciones</button>
  {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
  {link&&<section className="invitation-confirm" aria-label="Enlace de invitación"><strong>{recipient}</strong><p>Compartilo únicamente con esta persona. Quien tenga el enlace puede activar su cuenta. Se usa una sola vez; si vence, generá uno nuevo.</p><label>Enlace privado<input readOnly value={link} onFocus={e=>e.target.select()}/></label><button onClick={async()=>{try{await navigator.clipboard.writeText(link);setMessage('Enlace copiado.');}catch{setMessage('Seleccioná y copiá el enlace del campo.');}}}>Copiar enlace</button><button onClick={()=>{setLink('');setRecipient('');}}>Ocultar enlace</button><small>El enlace de acceso puede vencer antes del límite de la invitación; en ese caso, renovalo. Solo se muestra aquí al generarlo. No se envía ningún correo automático.</small></section>}
  {retry&&<button disabled={busy} onClick={()=>void execute(retry)}>Reintentar la misma solicitud</button>}
  {ready&&!manualLinks&&<p role="status">La generación de enlaces todavía no está disponible. Intentá actualizar la lista.</p>}
  <form onSubmit={e=>{e.preventDefault();propose('invite');}}>
   <label>Correo de la persona<input type="email" autoCapitalize="none" autoCorrect="off" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></label>
   <label>Nombre de referencia (opcional)<input maxLength={80} value={label} onChange={e=>setLabel(e.target.value)}/></label>
   <small>Solo para esta lista. La persona elige su nombre dentro de Alianza.</small>
   <button className="primary" disabled={busy||!ready||!manualLinks}>Crear invitación</button>
  </form>
  {proposal&&<section className="invitation-confirm" aria-label="Confirmar invitación">
   <h3>{proposal.action==='cancel'?'¿Cancelar esta invitación?':'Confirmá el destinatario'}</h3><strong>{proposal.email}</strong>
   <p>{proposal.action==='cancel'?'Se bloqueará esta invitación, sin borrar la cuenta ni sus datos.':proposal.action==='renew'?'Se generará un enlace nuevo. El anterior dejará de permitir la activación en Alianza.':'Vas a copiar y compartir su invitación individual al piloto. No se le asignará una pareja.'}</p>
   <button disabled={busy} onClick={()=>void execute(proposal)}>{proposal.action==='cancel'?'Sí, cancelar invitación':'Confirmar y crear enlace'}</button>
   <button disabled={busy} onClick={()=>setProposal(null)}>Volver sin cambios</button>
  </section>}
  {ready&&<div className="invitation-filters"><label>Buscar participante<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nombre o correo"/></label><label>Estado<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todos</option><option value="pending">Pendientes</option><option value="expired">Vencidas</option><option value="accepted">Activadas</option><option value="cancelled">Canceladas</option></select></label></div>}
  {ready&&<p aria-live="polite">{visiblePeople.length} de {people.length} participantes</p>}{ready&&!visiblePeople.length&&<p>No hay participantes con esta búsqueda y estado.</p>}
  {ready&&<ul className="invitation-list">{visiblePeople.map(p=><li key={p.email}>
   <strong>{p.label||p.email}</strong>{p.label&&<span>{p.email}</span>}<span>{states[p.state]||'Estado desconocido'}</span>
   {p.delivery&&p.state!=='accepted'&&p.state!=='cancelled'&&<small>{delivery[p.delivery]}</small>}
   {p.expiresAt&&p.state==='pending'&&<small>Límite de activación: {new Date(p.expiresAt).toLocaleString('es-CR')}</small>}
   {!['active','accepted'].includes(p.state)&&<div>
    <button className="soft-button" disabled={busy||!manualLinks} onClick={()=>propose(p.id?'renew':'invite',p.email,p.version)}>{p.state==='pending'?'Generar enlace nuevo':'Renovar invitación'}</button>
    {p.id&&['pending','expired'].includes(p.state)&&<button className="text-button" disabled={busy} onClick={()=>propose('cancel',p.email,p.version)}>Cancelar invitación</button>}
   </div>}
  </li>)}</ul>}
  <p>Las cuentas activadas conservan su acceso. Este módulo no genera enlaces para ellas.</p>
 </section>;
}

export type InvitationProof={id:string;proof:string};
export function readInvitationProof(hash:string):InvitationProof|null {
 const params=new URLSearchParams(hash.replace(/^#/,'')),id=params.get('pilot_invite'),proof=params.get('invite_proof');
 return id&&/^[a-f0-9-]{36}$/i.test(id)&&proof&&/^[a-f0-9]{64}$/.test(proof)?{id,proof}:null;
}
// A per-tab activation capability, never a telemetry field.
export function savedInvitation(value?:InvitationProof|null):InvitationProof|null{
 try{if(value===null)sessionStorage.removeItem('alianza-invitation-proof');else if(value)sessionStorage.setItem('alianza-invitation-proof',JSON.stringify(value));
 const item=JSON.parse(sessionStorage.getItem('alianza-invitation-proof')||'null');
 return item?readInvitationProof(new URLSearchParams({pilot_invite:item.id,invite_proof:item.proof}).toString()):null;
 }catch{return null;}
}
export function InvitationEntryGate({client,onSignOut,children}:{client:SupabaseClient;onSignOut:()=>void;children:React.ReactNode}){
 const [state,setState]=useState('loading'),[metrics,setMetrics]=useState(false),[legacy,setLegacy]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let live=true;client.rpc('alianza_invitation_entry',{p:{action:'status'}}).then(({data,error})=>{if(live){setState(error?'error':data?.state||'error');setLegacy(!!data?.legacyMetrics);if(data?.state==='accepted')savedInvitation(null);}});return()=>{live=false;};},[client]);
 if(state==='existing'||state==='accepted')return <>{children}</>;
 async function accept(){if(busy)return;const proof=savedInvitation();if(!proof)return;setBusy(true);setError('');
 const r=await client.rpc('alianza_invitation_entry',{p:{action:'accept',...proof,metrics}});setBusy(false);
 if(r.error)setError('No se pudo completar el acceso. La invitación puede haber vencido o sido cancelada; pedí un enlace nuevo.');
 else{savedInvitation(null);setState('accepted');}}
 return <main className="auth-page"><section className="auth-card"><h1>{state==='loading'?'Verificando tu acceso…':'Tu invitación al piloto'}</h1>
 {state==='pending'&&savedInvitation()?<><p>Podés empezar individualmente. La vinculación como pareja es voluntaria y requiere aceptación de ambos.</p>
 <p>El administrador ve tu correo y el estado de acceso, no tus oraciones, ideales, compromisos ni reflexiones privadas.</p>
 {legacy?<p>Conservamos el acuerdo de medición del piloto cercano al que ya pertenecés.</p>:<><p>Opcionalmente podés aportar señales de uso y errores para mejorar Alianza. El panel muestra cantidades agregadas; en un piloto pequeño pueden permitir deducciones y no se consideran anónimas. No incluyen el contenido que escribís.</p>
 <label><input type="checkbox" checked={metrics} onChange={e=>setMetrics(e.target.checked)}/>Quiero aportar métricas de uso al piloto</label><p>Podés cambiar esta elección en Mi espacio. No es necesario aceptar para usar Alianza.</p></>}
 <button className="primary" disabled={busy} onClick={()=>void accept()}>{busy?'Preparando tu espacio…':'Entrar a mi espacio individual'}</button></>:
 state!=='loading'&&<p>{state==='error'?'No pudimos verificar el acceso. Recargá para intentar de nuevo.':'Esta invitación venció, fue cancelada o falta abrir el enlace completo. Pedí a quien administra Alianza que renueve tu invitación y usá el enlace más reciente.'}</p>}
 {error&&<p role="alert">{error}</p>}<button className="text-button" onClick={onSignOut}>Cerrar sesión</button></section></main>;
}
