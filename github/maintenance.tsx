import React,{useEffect,useRef,useState,type ReactNode} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {APP_VERSION} from '../app/version';
export function MaintenanceBoundary({client,initialActive,children}:{client:SupabaseClient;initialActive:boolean;children:ReactNode}){
 const [status,setStatus]=useState<'checking'|'active'|'ready'|'update'|'offline'>(initialActive?'active':'checking');
 const mounted=useRef(false),panel=useRef<HTMLElement>(null);
 useEffect(()=>{
  let stopped=false,running=false;
  const check=async()=>{if(running)return;running=true;try{
   const response=await fetch('./config.json',{cache:'no-store'});if(!response.ok)throw Error();const config=await response.json();
   if(config.maintenance){if(!stopped)setStatus('active');return;}
   const {data,error}=await client.from('alianza_service_status').select('active,required_version').eq('id',true).single();
   if(error||!data)throw Error();
   if(!stopped)setStatus(data.active?'active':data.required_version&&data.required_version!==APP_VERSION?'update':'ready');
  }catch{if(!stopped)setStatus(s=>s==='active'||s==='update'?s:'offline');}finally{running=false;}};
  void check();const timer=window.setInterval(check,15000);window.addEventListener('focus',check);
  return()=>{stopped=true;clearInterval(timer);window.removeEventListener('focus',check);};
 },[client]);
 const blocked=status!=='ready';if(!blocked)mounted.current=true;
 useEffect(()=>{if(blocked){document.body.setAttribute('data-service-paused','');panel.current?.focus();}else document.body.removeAttribute('data-service-paused');return()=>document.body.removeAttribute('data-service-paused');},[blocked]);
 return <><style>{'[data-service-paused] [data-slot="dialog-content"],[data-service-paused] [data-slot="dialog-overlay"]{visibility:hidden!important}.service-pause{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:28px;background:#f5f7fa;color:#183447;text-align:center;overflow:auto}.service-pause h1{font:28px/1.3 Georgia;max-width:420px}.service-pause p{max-width:420px;font-size:16px;line-height:1.5}.service-pause img{width:110px;height:130px;object-fit:contain}'} </style>
  <div hidden={blocked} inert={blocked}>{mounted.current&&children}</div>
  {blocked&&<main className="service-pause" ref={panel} tabIndex={-1} role="alert" aria-live="polite"><img src="./emblem.svg" alt="Alianza"/><h1>{status==='active'?'Estamos actualizando Alianza':status==='update'?'Hay una nueva versión':status==='checking'?'Abriendo Alianza…':'No pudimos comprobar el servicio'}</h1><p>{status==='active'?'Volvé en unos minutos. Este aviso se quitará cuando terminemos.':status==='update'?'Actualizá la página antes de continuar.':status==='offline'?'Revisá la conexión. Volveremos a intentarlo automáticamente.':''}</p>{mounted.current&&<p>Si tenías texto sin guardar, no cierres esta pestaña.</p>}{status==='update'&&<button className="primary" onClick={()=>location.reload()}>Actualizar Alianza</button>}<small>{APP_VERSION}</small></main>}
 </>;
}
