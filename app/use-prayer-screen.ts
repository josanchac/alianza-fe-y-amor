import {useEffect,useState} from 'react';
type Sentinel={release:()=>Promise<void>;addEventListener:(event:string,listener:()=>void)=>void;released:boolean};
export function usePrayerScreen(active:boolean,enabled:boolean){
 const [status,setStatus]=useState<'off'|'on'|'unavailable'>('off');
 useEffect(()=>{
  let disposed=false,lock:Sentinel|null=null,pending=false;
  const api=(navigator as Navigator&{wakeLock?:{request:(kind:'screen')=>Promise<Sentinel>}}).wakeLock;
  async function acquire(){
   if(disposed||!active||!enabled||document.visibilityState==='hidden'||pending||lock&&!lock.released)return;
   if(!api){setStatus('unavailable');return;}pending=true;
   try{const next=await api.request('screen');if(disposed){await next.release();return;}lock=next;setStatus('on');next.addEventListener('release',()=>{if(!disposed){lock=null;setStatus('unavailable');}});}
   catch{if(!disposed)setStatus('unavailable');}finally{pending=false;}
  }
  if(active&&enabled)void acquire();else setStatus('off');
  document.addEventListener('visibilitychange',acquire);
  return()=>{disposed=true;document.removeEventListener('visibilitychange',acquire);if(lock)void lock.release().catch(()=>{});};
 },[active,enabled]);
 return status;
}
