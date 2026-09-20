// Mechanical application of the reviewed inventory, not a regex over all links.
// Existing handlers, confirmation flows, disabled states and anchor destinations
// are preserved. Run once against the reviewed baseline; fail on drift.
import fs from 'node:fs';
import ts from 'typescript';
const audit=JSON.parse(fs.readFileSync('docs/ACTIONS_CLASSIFIED_20260919.json','utf8'));
const rows=audit.controls.filter(x=>x.className.includes('text-button'));
const applied=[];
for(const file of [...new Set(rows.map(x=>x.file))]){
 const source=fs.readFileSync(file,'utf8'),sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),found=[];
 function walk(n){if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n)){
  const cls=n.attributes.properties.find(a=>ts.isJsxAttribute(a)&&a.name.getText(sf)==='className');
  if(cls?.initializer&&ts.isStringLiteral(cls.initializer)&&cls.initializer.text.split(' ').includes('text-button'))found.push({node:n,cls});
 }ts.forEachChild(n,walk)}walk(sf);
 const expected=rows.filter(x=>x.file===file);
 if(found.length!==expected.length)throw Error('Inventory drift: '+file);
 const edits=[];
 found.forEach(({node,cls},index)=>{
  const entry=expected[index];
  if(node.tagName.getText(sf)!==entry.tag)throw Error('Tag drift: '+entry.id);
  // Institutional external sources stay links. Internal app navigation remains
  // an anchor, but gets the lightweight navigation appearance.
  if(entry.tag==='a'&&file!=='github/main.tsx'){applied.push({...entry,implementation:'external-link-preserved'});return;}
  const intent=entry.label==='Cerrar sesión'?'navigation':entry.type;
  const className=cls.initializer.text.replace(/\btext-button\b/,'action-button');
  edits.push({start:cls.getStart(sf),end:cls.end,text:`className=${JSON.stringify(className)} data-action=${JSON.stringify(intent)}`});
  applied.push({...entry,implementation:'classified-action',intent});
 });
 let output=source;for(const e of edits.sort((a,b)=>b.start-a.start))output=output.slice(0,e.start)+e.text+output.slice(e.end);
 fs.writeFileSync(file,output);
}
fs.writeFileSync('docs/ACTIONS_IMPLEMENTED_20260920.json',JSON.stringify({scope:'Reviewed text-style actions only; visual validation pending',applied},null,2)+'\n');
console.log(applied.reduce((a,x)=>(a[x.implementation]=(a[x.implementation]||0)+1,a),{}));
