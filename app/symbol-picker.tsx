import {useRef,useState} from 'react';
import {PersonalSymbol,PERSONAL_SYMBOLS} from './personal-symbol';
export type Appearance={symbol:string;image:string};
export const emptyAppearance:Appearance={symbol:'',image:''};
// Only a re-encoded thumbnail is stored, not the original file or metadata.
export async function prepareSymbol(file:File):Promise<string>{
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('Elegí un JPG, PNG o WebP de hasta 5 MB.');
 const url=URL.createObjectURL(file);
 try{const img=new Image();img.src=url;await img.decode();if(!img.naturalWidth||img.naturalWidth*img.naturalHeight>24000000)throw new Error('Esta imagen es demasiado grande. Elegí una más pequeña.');
 const c=document.createElement('canvas');c.width=c.height=192;const ctx=c.getContext('2d');if(!ctx)throw new Error('No pudimos preparar la imagen.');ctx.fillStyle='#fff';ctx.fillRect(0,0,192,192);const ratio=Math.min(192/img.naturalWidth,192/img.naturalHeight);const w=img.naturalWidth*ratio,h=img.naturalHeight*ratio;ctx.drawImage(img,(192-w)/2,(192-h)/2,w,h);
 const image=c.toDataURL('image/jpeg',.7);if(image.length>30000||!image.startsWith('data:image/jpeg;base64,/9j/'))throw new Error('Probá con una imagen más sencilla.');return image;
 }finally{URL.revokeObjectURL(url);}
}
export function SymbolPicker({value,onChange,onBusy}:{value:Appearance;onChange:(v:Appearance)=>void;onBusy:(b:boolean)=>void}){
 const [error,setError]=useState(''),[processing,setProcessing]=useState(false),[request,setRequest]=useState(''),[copied,setCopied]=useState(false);const generation=useRef(0);
 function choose(v:Appearance){generation.current++;setError('');onChange(v);}
 return <><div className="symbol-grid" role="group" aria-label="Elegir mi símbolo"><button type="button" aria-pressed={!value.symbol&&!value.image} onClick={()=>choose(emptyAppearance)}>Sin símbolo</button>{PERSONAL_SYMBOLS.map(([id,label])=><button type="button" key={id} aria-pressed={value.symbol===id&&!value.image} onClick={()=>choose({symbol:id,image:''})}><PersonalSymbol symbol={id}/><span>{label}</span></button>)}</div>
 <details className="optional-details"><summary>No encuentro mi símbolo</summary><label>Subir una imagen propia<input type="file" accept="image/png,image/jpeg,image/webp" disabled={processing} onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;const token=++generation.current;setError('');setProcessing(true);onBusy(true);try{const image=await prepareSymbol(file);if(token===generation.current)onChange({symbol:'',image});}catch(err){if(token===generation.current)setError((err as Error).message);}finally{setProcessing(false);onBusy(false);}}}/></label><small>JPG, PNG o WebP · hasta 5 MB. Solo se guarda una miniatura privada al tocar Guardar.</small>
 <details><summary>Solicitar un símbolo</summary><label>¿Qué símbolo te gustaría?<input maxLength={180} value={request} onChange={e=>{setRequest(e.target.value);setCopied(false);}}/></label><button className="soft-button" type="button" disabled={!request.trim()} onClick={async()=>{try{await navigator.clipboard.writeText('Me gustaría solicitar este símbolo para Alianza: '+request.trim());setCopied(true);}catch{setError('Copiá el texto y compartilo con quien te invitó al piloto.');}}}>Copiar solicitud</button><p>{copied?'Texto copiado. Compartilo con quien te invitó.':'Copiá el mensaje y compartilo con quien te invitó al piloto. No se envía automáticamente.'}</p></details></details>
 {value.image&&<div className="symbol-preview"><img src={value.image} alt="Vista previa de mi símbolo"/><button type="button" className="text-button" onClick={()=>choose(emptyAppearance)}>Quitar imagen</button></div>}{processing&&<p role="status">Preparando imagen…</p>}{error&&<p role="alert">{error}</p>}</>;
}
