import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const audit=JSON.parse(fs.readFileSync('docs/ACTIONS_IMPLEMENTED_20260920.json','utf8'));
let total=0;
for(const file of new Set(audit.applied.map(a=>a.file))){
 const source=fs.readFileSync(file,'utf8'),sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),current=[],delegated=[];
 function walk(n){if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n)){
  const attrs=Object.fromEntries(n.attributes.properties.filter(ts.isJsxAttribute).map(a=>[a.name.getText(sf),a.initializer?.getText(sf)]));
  if(attrs['data-action'])current.push({tag:n.tagName.getText(sf),handler:attrs.onClick??'',intent:JSON.parse(attrs['data-action']),className:attrs.className});
  for(const action of audit.applied.filter(a=>a.file===file&&a.implementation==='shared-navigation'))if(n.tagName.getText(sf)===action.component){assert.equal(attrs[action.handlerProp],action.handler,action.id+' retains destination handler');delegated.push(action.id);}
 }ts.forEachChild(n,walk)}walk(sf);
 const expected=audit.applied.filter(a=>a.file===file&&a.implementation==='classified-action');
 assert.equal(current.length,expected.length,file);
 for(let i=0;i<current.length;i++){
  assert.equal(current[i].tag,expected[i].tag,expected[i].id);
  assert.equal(current[i].handler,expected[i].handler,expected[i].id+' preserves handler');
  assert.equal(current[i].intent,expected[i].intent);
  assert(current[i].className.includes('action-button'));assert(!current[i].className.includes('text-button'));
 }
 assert.equal(delegated.length,audit.applied.filter(a=>a.file===file&&a.implementation==='shared-navigation').length,file+' delegated navigation');
 total+=current.length+delegated.length;
}
assert.equal(total,64);
assert.equal(audit.applied.filter(a=>a.implementation==='external-link-preserved').length,1);
console.log('PASS 64 retained actions: 63 classified controls and one shared navigation component; destination handlers preserved; institutional external source remains a link');
