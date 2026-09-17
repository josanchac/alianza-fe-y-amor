import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {PersonalRosary} from '../app/personal-rosary';
import {useDialogViewport} from '../app/dialog-viewport';
import {localDate} from '../lib/domain';
import '../app/globals.css';
import '../github/password.css';
function Preview(){
 useDialogViewport();
 const [r,setR]=useState<any>({id:'visual-only',ownerId:'synthetic',groupId:null,coupleId:null,mystery:'joyful',mode:'free',intention:'',cancelled:false,slots:[],mine:[],personalStep:0,progressVersion:0});
 const [checks,setChecks]=useState({});
 return <main className="app-shell"><p>Prueba visual · datos ficticios</p><PersonalRosary r={r} busy={false} checks={checks} habits={[{key:'rosary',data:{title:'Rezar el rosario',active:true}}]} act={async p=>{
  if(p.action==='rosary_step')setR({...r,personalStep:p.step,progressVersion:r.progressVersion+1,...(p.step===69?{mine:Array.from({length:5},(_,i)=>({decade:i+1,day:localDate()}))}:{})});
  if(p.action==='rosary_opening')setR({...r,opening:{include:p.include,mary:p.mary,position:p.position},progressVersion:r.progressVersion+1});
  if(p.action==='rosary_discard')setR({...r,cancelled:true});
  if(p.action==='rosary_today')setChecks({rosary:'done'});
  return {};
 }}/></main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
