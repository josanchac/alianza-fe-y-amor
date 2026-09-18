import {useEffect,useState} from 'react';
declare const __ALIANZA_BUILD_ID__:string;
export const BUILD_ID=typeof __ALIANZA_BUILD_ID__==='undefined'?'development':__ALIANZA_BUILD_ID__;
export function updateAddress(href:string,buildId:string){
 const url=new URL(href);
 url.searchParams.set('actualizar',buildId);
 return url.href;
}
export function AppUpdateNotice({currentBuild=BUILD_ID,navigate=(url:string)=>window.location.replace(url)}:{currentBuild?:string;navigate?:(url:string)=>void}){
 const [nextBuild,setNextBuild]=useState('');
 useEffect(()=>{
  let stopped=false,running=false;
  const check=async()=>{
   if(running||document.visibilityState==='hidden')return;
   running=true;
   try{
    const url=new URL('./config.json',window.location.href);
    url.searchParams.set('check',String(Date.now()));
    const response=await fetch(url.href,{cache:'no-store'});
    if(!response.ok)return;
    const {buildId}=await response.json();
    if(!stopped&&typeof buildId==='string'&&/^[a-f0-9]{32}$/.test(buildId))setNextBuild(buildId===currentBuild?'':buildId);
   }catch{/* A failed update check must not interrupt the workspace. */}
   finally{running=false;}
  };
  void check();
  const interval=window.setInterval(check,60000);
  window.addEventListener('focus',check);window.addEventListener('pageshow',check);document.addEventListener('visibilitychange',check);
  return()=>{stopped=true;clearInterval(interval);window.removeEventListener('focus',check);window.removeEventListener('pageshow',check);document.removeEventListener('visibilitychange',check);};
 },[currentBuild]);
 return nextBuild?<aside className="app-update-notice" role="status"><strong>Hay una actualización de Alianza</strong><p>Guardá lo que estés escribiendo antes de actualizar.</p><button className="soft-button" onClick={()=>navigate(updateAddress(window.location.href,nextBuild))}>Actualizar Alianza</button></aside>:null;
}
