import {JSDOM} from 'jsdom';
export const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/',pretendToBeVisual:true});
for(const name of ['window','document','navigator','HTMLElement','Element','Node','NodeFilter','HTMLInputElement','HTMLFormElement','HTMLButtonElement','HTMLSelectElement','MutationObserver','CustomEvent','Event','getComputedStyle','requestAnimationFrame','cancelAnimationFrame']){
 Object.defineProperty(globalThis,name,{value:typeof dom.window[name]==='function'&&['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(name)?dom.window[name].bind(dom.window):dom.window[name],configurable:true,writable:true});
}
for(const name of Object.getOwnPropertyNames(dom.window)){if(!(name in globalThis))Object.defineProperty(globalThis,name,Object.getOwnPropertyDescriptor(dom.window,name));}
window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
globalThis.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
HTMLElement.prototype.scrollIntoView=()=>{};
