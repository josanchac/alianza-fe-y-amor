import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const audit=JSON.parse(fs.readFileSync('docs/ACTIONS_IMPLEMENTED_20260920.json','utf8'));
let total=0;
for(const file of new Set(audit.applied.map(a=>a.file))){
 const source=fs.readFileSync(file,'utf8'),sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),current=[];
 function walk(n){if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n)){
  const attrs=Object.fromEntries(n.attributes.properties.filter(ts.isJsxAttribute).map(a=>[a.name.getText(sf),a.initializer?.getText(sf)]));
  if(attrs['data-action'])current.push({tag:n.tagName.getText(sf),handler:attrs.onClick??'',intent:JSON.parse(attrs['data-action']),className:attrs.className});
 }ts.forEachChild(n,walk)}walk(sf);
 const expected=audit.applied.filter(a=>a.file===file&&a.implementation==='classified-action');
 assert.equal(current.length,expected.length,file);
 for(let i=0;i<current.length;i++){
  assert.equal(current[i].tag,expected[i].tag,expected[i].id);
  assert.equal(current[i].handler,expected[i].handler,expected[i].id+' preserves handler');
  assert.equal(current[i].intent,expected[i].intent);
  assert(current[i].className.includes('action-button'));assert(!current[i].className.includes('text-button'));
 }
 total+=current.length;
}
assert.equal(total,67);
assert.equal(audit.applied.filter(a=>a.implementation==='external-link-preserved').length,1);
console.log('PASS 67 retained classified actions, original tags and handlers preserved; institutional external source remains a link');
