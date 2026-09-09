import React, {useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient,type SupabaseClient,type Session} from '@supabase/supabase-js';
import {Eye,EyeOff,LockKeyhole,LoaderCircle} from 'lucide-react';
import Journal from '../app/journal';
import '../app/globals.css';
import './password.css';

// Keep an unfinished password setup open after a page refresh, per browser tab.
function pendingSetup(userId?:string|null){try{if(userId===null)sessionStorage.removeItem('alianza-password-setup');else if(userId)sessionStorage.setItem('alianza-password-setup',userId);return sessionStorage.getItem('alianza-password-setup');}catch{return null;}}

function Login({client,setupPassword=false,emailRecoveryEnabled=false}:{client:SupabaseClient;setupPassword?:boolean;emailRecoveryEnabled?:boolean}){
  const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false);
  const [mode,setMode]=useState<'login'|'recover'|'password'>(setupPassword?'password':'login');
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[repeat,setRepeat]=useState('');
  const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  useEffect(()=>{
    // Subscribe before the client finishes processing invitation/recovery links.
    const {data:{subscription}}=client.auth.onAuthStateChange((event,next)=>{
      setSession(next);setReady(true);
      if(next&&(event==='PASSWORD_RECOVERY'||(setupPassword&&event==='INITIAL_SESSION')||pendingSetup()===next.user.id)){pendingSetup(next.user.id);setMode('password');}
      if(event==='SIGNED_OUT'){pendingSetup(null);setPassword('');setRepeat('');setMode('login');}
    });
    return()=>subscription.unsubscribe();
  },[client]);
  const request=useMemo(()=>(async(init?:RequestInit)=>{
    const payload=init?.method==='POST'?JSON.parse(String(init.body)):null;
    const {data,error}=await client.rpc('alianza_data',{payload});
    if(error){const status=error.code==='PT409'?409:error.code==='42501'?403:error.code==='22023'?400:503;
      return Response.json({error:status===409?'Este registro cambió en otro celular. Tu texto sigue aquí; actualizá antes de guardar.':status===403?'Tu sesión terminó o esta cuenta no tiene acceso.':status===400?'Revisá los campos y las fechas.':'No se pudo guardar o cargar. Revisá la conexión y volvé a intentar.'},{status});}
    return Response.json(data);
  }),[client]);
  async function signOut(){setError('');const {error}=await client.auth.signOut({scope:'local'});if(error)setError('No se pudo cerrar la sesión. Volvé a intentarlo.');}
  async function submit(e:React.FormEvent){e.preventDefault();if(busy)return;setBusy(true);setError('');setMessage('');
    try{
      if(mode==='password'&&!session)throw new Error('Abrí tu enlace privado para elegir la contraseña. Si venció, solicitá uno nuevo.');
      if(mode==='login'){
        const {error}=await client.auth.signInWithPassword({email:email.trim(),password});
        if(error)throw new Error('No pudimos entrar. Revisá tu correo y contraseña, o recuperá el acceso.');setPassword('');
      }else if(mode==='recover'){
        const {error}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo:new URL('./',location.href).href});
        if(error)throw new Error('No pudimos solicitar el enlace. Esperá unos minutos e intentá de nuevo.');
        setMessage('Si el correo está habilitado, recibirás un enlace para elegir una contraseña. Revisá también el correo no deseado.');
      }else{
        if(password.length<6)throw new Error('Elegí una contraseña de al menos 6 caracteres. No necesitás símbolos ni mayúsculas.');
        if(password!==repeat)throw new Error('Las contraseñas no coinciden.');
        const {error}=await client.auth.updateUser({password});if(error)throw new Error(error.code==='same_password'?'Esa ya es tu contraseña actual. Elegí otra o tocá Volver.':'No pudimos guardar la contraseña. Revisá la conexión e intentá otra vez. Si el enlace venció, solicitá uno nuevo.');
        pendingSetup(null);setPassword('');setRepeat('');setMode('login');setMessage('Contraseña guardada.');history.replaceState(null,'',new URL('./',location.href));
      }
    }catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  if(!ready)return <main className="gate"><LoaderCircle className="spin"/><p>Abriendo tu espacio…</p></main>;
  if(session&&mode!=='password')return <><Journal key={session.user.id} dataRequest={request} onSignOut={signOut} assetBase="./"/>{error&&<p className="auth-alert" role="alert">{error}</p>}<button className="change-password" onClick={()=>{setMode('password');setError('');setMessage('');}}>Cambiar mi contraseña</button></>;
  if(mode==='recover'&&!emailRecoveryEnabled)return <main className="auth-page"><section className="auth-card"><LockKeyhole size={32}/><h1>Recuperar mi acceso</h1><p>La recuperación automática por correo todavía no está activada.</p><p>Si todavía podés entrar, usá «Cambiar mi contraseña» dentro de tu espacio.</p><p>Si no podés entrar, pedí a quien administra Alianza un nuevo enlace privado para tu correo. Nunca compartás tu contraseña.</p><button className="primary" onClick={()=>setMode('login')}>Volver a entrar</button></section></main>;
  return <main className="auth-page"><section className="auth-card"><img className="auth-emblem" src="./emblem.png" alt="Árbol y rosario entrelazados"/><div className="brand-word">Alianza<span>FE Y AMOR</span></div><p className="auth-intro">Un camino compartido.<br/>Una entrega personal.</p><h1>{mode==='login'?'Tu espacio de fe y amor':mode==='recover'?'Recuperar mi acceso':'Elegir mi contraseña'}</h1>{mode==='password'&&session&&<><p className="auth-step">PASO 2 DE 2 · ELEGÍ Y GUARDÁ</p><div className="auth-account"><span>Tu usuario es tu correo electrónico</span><strong>{session.user.email}</strong><p>Usá este correo y tu contraseña para entrar la próxima vez.</p></div></>}<form onSubmit={submit}>
    {mode!=='password'&&<label>Correo electrónico (tu usuario)<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required autoCapitalize="none" spellCheck={false}/></label>}
    {mode!=='recover'&&<><label>Tu contraseña<div className="password-field"><input aria-describedby={mode==='password'?'password-help':undefined} type={visible?'text':'password'} autoComplete={mode==='password'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={mode==='password'?6:undefined}/><button type="button" aria-label={visible?'Ocultar contraseña':'Mostrar contraseña'} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={20}/>:<Eye size={20}/>}</button></div></label>{mode==='password'&&<><p id="password-help" className="muted">Usá al menos 6 caracteres. No necesitás símbolos ni mayúsculas.</p><label>Repetí tu contraseña<input type={visible?'text':'password'} autoComplete="new-password" value={repeat} onChange={e=>setRepeat(e.target.value)} required minLength={6}/></label></>}</>}
    {error&&<p className="notice" role="alert">{error}</p>}{message&&<p className="auth-success" role="status">{message}</p>}
    <button className="primary" type="submit" disabled={busy}>{busy?<><LoaderCircle className="spin" size={18}/>Un momento…</>:mode==='login'?'Entrar':mode==='recover'?'Recibir enlace':'Guardar y entrar'}</button>
  </form>{mode==='login'&&<details className="auth-help"><summary>¿Es mi primera vez?</summary><p>Abrí tu enlace privado, elegí una contraseña de al menos 6 caracteres y tocá «Guardar y entrar». Después usá aquí tu correo y esa contraseña.</p><p>Si el enlace venció, pedí uno nuevo. Cada persona usa su propio enlace.</p></details>}<button className="text-button" disabled={busy} onClick={()=>{if(mode==='password'&&session){setMode('login');}else setMode(mode==='recover'?'login':'recover');setError('');setMessage('');setPassword('');setRepeat('');}}>{mode==='login'?'Olvidé mi contraseña':'Volver'}</button><p className="auth-private"><LockKeyhole size={14}/>Solo las cuentas habilitadas pueden entrar.</p></section></main>;
}
function Invitation({client,token,type,emailRecoveryEnabled}:{client:SupabaseClient;token:string;type:'invite'|'recovery';emailRecoveryEnabled:boolean}){
 const [busy,setBusy]=useState(false),[activated,setActivated]=useState(false),[error,setError]=useState('');
 async function activate(){if(busy)return;setBusy(true);setError('');try{const {data,error}=await client.auth.verifyOtp({token_hash:token,type});if(error)throw error;pendingSetup(data.user?.id);history.replaceState(null,'',new URL('./',location.href));setActivated(true);}catch{setError('Este enlace venció o ya se utilizó. Si ya elegiste tu contraseña, entrá normalmente; si no, solicitá un enlace nuevo.');}finally{setBusy(false);}}
 if(activated)return <Login client={client} setupPassword emailRecoveryEnabled={emailRecoveryEnabled}/>;
 return <main className="auth-page"><section className="auth-card"><img className="auth-emblem" src="./emblem.png" alt="Árbol y rosario"/><div className="brand-word">Alianza<span>FE Y AMOR</span></div><p className="auth-step">PASO 1 DE 2</p><h1>Tu acceso personal</h1><p>Este enlace te permite elegir tu contraseña. Después entrás con tu correo electrónico.</p><p>No necesitás completar un horario ahora: podés empezar con un solo compromiso o explorar.</p>{error&&<p role="alert" className="notice">{error}</p>}<button className="primary" disabled={busy} onClick={activate}>{busy?'Un momento…':'Continuar y elegir contraseña'}</button><p className="muted">El enlace es privado, vence y se usa una sola vez.</p><a className="text-button" href="./">Ya tengo contraseña</a></section></main>;
}
async function start(){const root=createRoot(document.getElementById('root')!);try{
  const r=await fetch('./config.json',{cache:'no-store'});const c:any=await r.json();
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(c.url)||!c.publishableKey?.startsWith('sb_publishable_'))throw new Error('Esta versión todavía está en preparación. El acceso se habilitará al completar la publicación.');
  // Only authentication tokens persist on this device; records stay in Postgres.
  const setupPassword=['invite','recovery'].includes(new URLSearchParams(location.hash.slice(1)).get('type')||'');
  const client=createClient(c.url,c.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'alianza-auth'}});
  const hash=new URLSearchParams(location.hash.slice(1));const token=hash.get('token_hash');const type=hash.get('type');
  if(token&&(type==='invite'||type==='recovery'))root.render(<Invitation client={client} token={token} type={type} emailRecoveryEnabled={!!c.emailRecoveryEnabled}/>);
  else root.render(<Login client={client} setupPassword={setupPassword} emailRecoveryEnabled={!!c.emailRecoveryEnabled}/>);
}catch(e){root.render(<main className="gate"><LockKeyhole size={36}/><h1>Alianza · Fe y Amor</h1><p>{(e as Error).message}</p><button className="primary" onClick={()=>location.reload()}>Volver a intentar</button></main>);}}
void start();
