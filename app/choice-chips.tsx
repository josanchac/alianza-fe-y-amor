export function ChoiceChips<T extends string>({label,value,options,onChange,disabled=false}:{label:string;value:T;options:readonly (readonly [T,string])[];onChange:(v:T)=>void;disabled?:boolean}){
 return <div className="choice-field"><span className="field-title">{label}</span><div className="choice-chips" role="group" aria-label={label}>{options.map(([id,text])=><button key={id} type="button" aria-pressed={value===id} disabled={disabled} onClick={()=>onChange(id)}>{text}</button>)}</div></div>;
}
