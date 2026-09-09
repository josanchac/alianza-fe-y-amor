import {useState} from 'react';
import {Smartphone, Share, MoreVertical, PlusSquare, Check, ChevronLeft, ChevronRight, Copy, Heart, Compass} from 'lucide-react';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from '@/components/ui/dialog';

export const APP_ADDRESS='https://josanchac.github.io/alianza-fe-y-amor/';
const instructions={
 iphone:[
  {title:'Abrí Alianza en Safari',text:'Copiá la dirección de abajo, abrí Safari y pegala en su barra de direcciones. Usá la dirección normal de Alianza, después de haber elegido tu contraseña.',label:'Safari',icon:Compass},
  {title:'Tocá Compartir',text:'Buscá el cuadrado con una flecha hacia arriba. En algunas versiones primero hay que tocar los tres puntos y luego Compartir.',label:'Compartir',icon:Share},
  {title:'Elegí Agregar a Inicio',text:'Deslizá hacia abajo dentro del menú Compartir hasta encontrar «Agregar a Inicio» o «Añadir a pantalla de inicio».',label:'Agregar a Inicio',icon:PlusSquare},
  {title:'Confirmá y buscá el ícono',text:'Dejá el nombre Alianza. Si aparece «Abrir como app web», activalo y tocá Agregar. Buscá el ícono en la pantalla de inicio y abrilo.',label:'Agregar',icon:Check},
 ],
 android:[
  {title:'Abrí Alianza en Chrome',text:'Copiá la dirección de abajo, abrí Chrome y pegala en su barra de direcciones. Usá la dirección normal de Alianza, después de haber elegido tu contraseña.',label:'Chrome',icon:Compass},
  {title:'Abrí el menú de Chrome',text:'Tocá los tres puntos que están junto a la barra de direcciones.',label:'Menú',icon:MoreVertical},
  {title:'Elegí instalar o agregar',text:'Buscá «Instalar y crear acceso directo», «Instalar aplicación» o «Agregar a la pantalla principal». El nombre depende de tu versión de Chrome.',label:'Agregar a pantalla principal',icon:PlusSquare},
  {title:'Confirmá y buscá el ícono',text:'Dejá el nombre Alianza y tocá Instalar o Agregar. Si el celular pide otra confirmación para poner el ícono en la pantalla principal, aceptala.',label:'Agregar',icon:Check},
 ],
};

export function InstallSteps(){
 const [phone,setPhone]=useState<'iphone'|'android'>(()=>/Android/i.test(navigator.userAgent)?'android':'iphone');
 const [step,setStep]=useState(0),[copied,setCopied]=useState(false),[copyError,setCopyError]=useState(false);
 const current=instructions[phone][step],Icon=current.icon;
 async function copy(){try{await navigator.clipboard.writeText(APP_ADDRESS);setCopied(true);setCopyError(false);}catch{setCopyError(true);}}
 return <div className="install-guide">
  <div className="phone-choice" aria-label="Tipo de teléfono"><button aria-pressed={phone==='iphone'} onClick={()=>{setPhone('iphone');setStep(0);}}>iPhone · Apple</button><button aria-pressed={phone==='android'} onClick={()=>{setPhone('android');setStep(0);}}>Android</button></div>
  <p className="install-count" aria-live="polite">Paso {step+1} de 4</p>
  <div className="phone-sketch" aria-hidden="true">
   <div className="phone-notch"/><div className="sketch-address">josanchac.github.io</div>
   <div className="sketch-brand"><Heart size={30}/><strong>Alianza</strong><small>FE Y AMOR</small></div>
   <div className={'sketch-action step-'+step}><Icon size={26}/><span>{current.label}</span></div>
   <div className="phone-home-line"/>
  </div>
  <small className="sketch-caption">Ilustración de referencia; los menús pueden verse distintos.</small>
  <div className="install-instruction" aria-live="polite"><h3>{current.title}</h3><p>{current.text}</p></div>
  {step===0&&<div className="install-address"><label>Dirección de Alianza<input readOnly value={APP_ADDRESS} onFocus={e=>e.currentTarget.select()}/></label><button className="soft-button" onClick={copy}><Copy size={17}/>{copied?'Dirección copiada':'Copiar dirección'}</button>{copyError&&<p role="status">Mantené presionada la dirección para copiarla.</p>}</div>}
  <div className="install-navigation"><button className="soft-button" disabled={step===0} onClick={()=>setStep(n=>n-1)}><ChevronLeft size={18}/>Atrás</button><button className="primary" disabled={step===3} onClick={()=>setStep(n=>n+1)}>Siguiente<ChevronRight size={18}/></button></div>
  {step===3&&<p className="install-finish"><Check size={18}/>Al terminar, podés abrir Alianza desde ese ícono. Si te pide entrar, usá tu correo y contraseña de siempre. Tus registros siguen en tu cuenta.</p>}
  <details className="optional-details"><summary>No encuentro la opción</summary><p>Si abriste el enlace dentro de WhatsApp, un correo o ChatGPT, copiá la dirección y abrila en Safari (iPhone) o Chrome (Android).</p>{phone==='iphone'?<p>En el menú Compartir, buscá «Editar acciones» y agregá «Agregar a Inicio». En Safari con menú compacto, primero tocá los tres puntos.</p>:<p>Puede aparecer «Crear acceso directo» en lugar de «Instalar». Ambas opciones permiten abrir Alianza desde un ícono.</p>}<p>La app necesita conexión para guardar. Agregar el ícono no activa recordatorios automáticamente.</p><a className="text-button" href={phone==='iphone'?'https://support.apple.com/es-us/guide/iphone/iphea86e5236/ios':'https://support.google.com/chrome/answer/9658361?hl=es&co=GENIE.Platform%3DAndroid'} target="_blank" rel="noreferrer">Ver la ayuda de {phone==='iphone'?'Apple':'Google'}</a></details>
 </div>;
}

export function InstallGuide({open,onOpenChange}:{open:boolean;onOpenChange:(v:boolean)=>void}){
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="editor-dialog install-dialog" showCloseButton={false}><DialogTitle className="dialog-title">Alianza en tu pantalla de inicio</DialogTitle><DialogDescription>Una guía paso a paso. Podés avanzar y volver a tu ritmo.</DialogDescription><InstallSteps/><button className="text-button" onClick={()=>onOpenChange(false)}>Cerrar la guía</button></DialogContent></Dialog>;
}

export function InstallPage(){return <main className="install-page"><section className="card install-page-card"><Smartphone size={28}/><h1>Alianza en tu pantalla de inicio</h1><p>Elegí tu teléfono y seguí los pasos a tu ritmo.</p><InstallSteps/><a className="primary" href={APP_ADDRESS}>Volver a Alianza</a></section></main>;}
