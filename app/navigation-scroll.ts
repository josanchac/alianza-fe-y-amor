import {useEffect,useRef,useState} from 'react';

/** Shared measurement; scrolling changes appearance, never layout geometry. */
export function useScrollChrome(){
 const marker=useRef<HTMLSpanElement>(null),surface=useRef<HTMLElement>(null),[raised,setRaised]=useState(false);
 useEffect(()=>{let frame=0;
  const measure=()=>{frame=0;if(!marker.current||!surface.current)return;const inset=parseFloat(getComputedStyle(surface.current).top)||0;const distance=inset-marker.current.getBoundingClientRect().top;surface.current.style.setProperty('--chrome-progress',String(Math.max(0,Math.min(1,distance/64))));setRaised(distance>4);};
  const queue=()=>{if(!frame)frame=requestAnimationFrame(measure);};
  measure();window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);window.visualViewport?.addEventListener('resize',queue);
  return()=>{window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);window.visualViewport?.removeEventListener('resize',queue);cancelAnimationFrame(frame);};
 },[]);return {marker,surface,raised};
}
