import type {ReactNode,Ref} from 'react';
import {BackButton} from './back-button';
import {useScrollChrome} from './navigation-scroll';

/** Title stays in content; only one screen owns the return bar. */
export function BackHeader({title,label,onBack,actions,brand=true,assetBase='./',buttonRef,headingId,level=2}:{title?:string;label:string;onBack:()=>void;actions?:ReactNode;brand?:boolean;assetBase?:string;buttonRef?:Ref<HTMLButtonElement>;headingId?:string;level?:1|2}){
 const {marker,surface,raised}=useScrollChrome();const Heading=level===1?'h1':'h2';
 return <><span ref={marker} className="app-chrome-marker" aria-hidden="true"/>
  <header ref={surface} className="app-back-header" data-raised={raised}>
   <BackButton ref={buttonRef} label={label} onClick={onBack}/>
   <div className="app-back-tools">{actions}{brand&&!actions&&<img className="back-small-brand" src={assetBase+'emblem.svg'} alt="Alianza"/>}</div>
  </header>{title&&<Heading id={headingId} className="back-page-title">{title}</Heading>}</>;
}
