import {useRef,useState} from 'react';
import {Pencil,Settings,X} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {type CommunityAction,type Mystery,MYSTERIES,mysteriesFor} from '@/lib/community';
import {type RosaryOpening} from '@/lib/rosary-guide';
import {localDate} from '@/lib/domain';
import {RosaryMap} from './personal-rosary';
import {BackButton} from './back-button';
export function RosaryPreparation({act,busy,ownerId,preferences,onSavePreferences,onCreated,onBack}:{act:CommunityAction;busy:boolean;ownerId?:string;preferences?:RosaryOpening;onSavePreferences?:(value:RosaryOpening)=>Promise<boolean>;onCreated?:()=>void;onBack?:()=>void}){
 const suggested=mysteriesFor(localDate());
 const [mystery,setMystery]=useState<Mystery>(suggested),[intention,setIntention]=useState('');
 const [panel,setPanel]=useState<'preferences'|'mysteries'|null>(!preferences&&onSavePreferences?'preferences':null);
 const initial=preferences??{include:true,mary:'trinitarian' as const,position:'end' as const};
 const [opening,setOpening]=useState<RosaryOpening>(initial),[draft,setDraft]=useState<RosaryOpening>(initial);
 const [savedOpening,setSavedOpening]=useState(preferences),[error,setError]=useState(''),[saving,setSaving]=useState(false);
 const sending=useRef(false),id=useRef(crypto.randomUUID());
 const disabled=busy||saving;
 async function savePreferences(){if(sending.current)return;sending.current=true;setSaving(true);setError('');try{if(onSavePreferences&&!await onSavePreferences(draft))throw Error('No se pudieron guardar tus preferencias.');setOpening(draft);setSavedOpening(draft);setPanel(null);}catch(e){setError((e as Error).message);}finally{sending.current=false;setSaving(false);}}
 async function start(e:React.FormEvent){e.preventDefault();if(disabled||sending.current)return;sending.current=true;setSaving(true);setError('');try{
  if(onSavePreferences&&!savedOpening){if(!await onSavePreferences(opening))throw Error('No se pudieron guardar tus preferencias.');setSavedOpening(opening);}
  if(ownerId){try{sessionStorage.setItem('alianza-rosary-open:'+ownerId,id.current);}catch{}}
  try{await act({action:'rosary_create',id:id.current,scope:'personal',mystery,mode:'free',intention,startsWith:'me'});}catch(e){if(ownerId){try{sessionStorage.removeItem('alianza-rosary-open:'+ownerId);}catch{}}throw e;}
  onCreated?.();
 }catch(e){setError((e as Error).message);}finally{sending.current=false;setSaving(false);}}
 return <section className="rosary-preparation">
  <header className="rosary-preparation-header">{onBack?<BackButton label="Volver a Oración" onClick={onBack}/>:<span/>}<h2>Nuevo rosario</h2><button type="button" className="rosary-quiet-icon" aria-label="Preferencias del rosario" disabled={disabled} onClick={()=>{setDraft(opening);setError('');setPanel('preferences');}}><Settings size={22}/></button></header>
  <form onSubmit={start}>
   <div className="rosary-mystery-heading"><div><p>{mystery===suggested?'Misterios de hoy':'Misterios elegidos'}</p><h3>{MYSTERIES[mystery].name}</h3></div><button className="rosary-quiet-icon" type="button" aria-label="Cambiar misterios" disabled={disabled} onClick={()=>setPanel('mysteries')}><Pencil size={21}/></button></div>
   <RosaryMap step={0} opening={opening}/>
   <label className="rosary-intention">Tu intención · opcional<input name="intention" maxLength={500} value={intention} onChange={e=>setIntention(e.target.value)} placeholder="¿Por quién querés rezar?" disabled={disabled}/></label>
   {error&&!panel&&<p role="alert">{error}</p>}
   <footer><button className="primary" type="submit" disabled={disabled}>{saving?'Preparando…':'Comenzar el rosario'}</button></footer>
  </form>
  <Dialog open={panel!==null} onOpenChange={open=>{if(!open&&!saving){setPanel(null);setError('');}}}>
   <DialogContent className="rosary-preparation-sheet" showCloseButton={false}>
    <header><DialogTitle>{panel==='mysteries'?'Misterios':'Tu manera de rezar'}</DialogTitle><button type="button" className="rosary-quiet-icon" aria-label="Cerrar" disabled={saving} onClick={()=>{setPanel(null);setError('');}}><X size={22}/></button></header>
    <DialogDescription className="sr-only">{panel==='mysteries'?'Elegí los misterios para este rosario.':'Estas preferencias quedan guardadas para tus próximos rosarios.'}</DialogDescription>
    {panel==='mysteries'?<><fieldset><legend className="sr-only">Misterios</legend>{Object.entries(MYSTERIES).map(([key,m])=><label key={key}><input type="radio" name="mystery" checked={mystery===key} onChange={()=>setMystery(key as Mystery)}/><span>{m.name}{key===suggested?' · Hoy':''}</span></label>)}</fieldset><button className="primary" onClick={()=>setPanel(null)}>Listo</button></>:<>
     <fieldset><legend>Padre nuestro y tres Avemarías</legend>{(['start','end'] as const).map((position,i)=><label key={position}><input type="radio" name="opening-position" checked={draft.position===position} disabled={disabled} onChange={()=>setDraft({...draft,include:true,position})}/><span>{['Al inicio','Después de los misterios'][i]}</span></label>)}</fieldset>
     <fieldset><legend>Tres Avemarías</legend>{(['standard','trinitarian'] as const).map((mary,i)=><label key={mary}><input type="radio" name="opening-mary" checked={draft.mary===mary} disabled={disabled} onChange={()=>setDraft({...draft,mary})}/><span>{['Habituales','Hija, Madre y Esposa'][i]}</span></label>)}</fieldset>
     {error&&<p role="alert">{error}</p>}<button className="primary" disabled={disabled} onClick={savePreferences}>{saving?'Guardando…':'Guardar preferencias'}</button>
    </>}
   </DialogContent>
  </Dialog>
 </section>;
}
