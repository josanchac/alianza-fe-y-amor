import {useEffect} from 'react';

// Radix portals live under body: use the visible viewport, including mobile keyboards.
export function useDialogViewport(){
 useEffect(()=>{
  const viewport=window.visualViewport;
  const root=document.documentElement;
  const update=()=>{
   root.style.setProperty('--dialog-view-height',`${viewport?.height??window.innerHeight}px`);
   root.style.setProperty('--dialog-view-width',`${viewport?.width??window.innerWidth}px`);
   root.style.setProperty('--dialog-view-top',`${viewport?.offsetTop??0}px`);
   root.style.setProperty('--dialog-view-left',`${viewport?.offsetLeft??0}px`);
  };
  update();
  viewport?.addEventListener('resize',update);
  viewport?.addEventListener('scroll',update);
  window.addEventListener('resize',update);
  return ()=>{
   viewport?.removeEventListener('resize',update);
   viewport?.removeEventListener('scroll',update);
   window.removeEventListener('resize',update);
   ['height','width','top','left'].forEach(key=>root.style.removeProperty('--dialog-view-'+key));
  };
 },[]);
}
