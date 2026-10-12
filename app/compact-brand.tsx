import {useScrollChrome} from './navigation-scroll';
/** Decorative root chrome; secondary screens own their return bar. */
export function CompactBrand({assetBase='./',context}:{assetBase?:string;context:string}){
 const {marker,surface,raised}=useScrollChrome();
 return <><span ref={marker} className="app-chrome-marker" aria-hidden="true"/><aside ref={surface} className="app-compact-brand" data-raised={raised} aria-hidden="true"><img src={assetBase+'emblem.svg'} alt=""/><span>{context}</span></aside></>;
}
