import {useLayoutEffect,useRef,useState} from 'react';

/** Component-local navigation; never persists private content or changes filters. */
export function useNavigationReturn(){
 const stack=useRef<{y:number;focus:HTMLElement|null}[]>([]);
 const [destination,setDestination]=useState<{y:number;focus:HTMLElement|null}|null>(null);
 useLayoutEffect(()=>{if(!destination)return;destination.focus?.isConnected&&destination.focus.focus({preventScroll:true});window.scrollTo({top:destination.y,behavior:'instant'});},[destination]);
 return {
  enter(){stack.current.push({y:window.scrollY,focus:document.activeElement instanceof HTMLElement?document.activeElement:null});setDestination({y:0,focus:null});},
  back(){setDestination(stack.current.pop()??{y:0,focus:null});}
 };
}
