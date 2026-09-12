import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {contentSnapshot,verifyMethodology} from '../scripts/check-methodology.mjs';

const root=await mkdtemp(join(tmpdir(),'alianza-review-'));
try {
  for(const dir of ['app','lib','components','github','prototype'])await mkdir(join(root,dir));
  await writeFile(join(root,'app/journal.tsx'),'Text A');
  await writeFile(join(root,'prototype/journey.tsx'),'Prototype A');
  const pending=JSON.parse(await readFile('docs/methodology-review.json','utf8'));
  assert((await verifyMethodology(root,pending)).length>0);
  // Synthetic approval only for the isolated fixture; never written to repo.
  const approved={...pending,status:'approved',approval:{reviewer:'Fixture',capacity:'Test only',evidence:'Synthetic test',date:'2026-01-01'},approvedContent:await contentSnapshot(root),items:pending.items.map(x=>({...x,status:'verified',resolution:'Fixture',references:[{institution:'Fixture',title:'Fixture',edition:'Fixture',locator:'Section 1',location:'fixture-only'}]}))};
  assert.deepEqual(await verifyMethodology(root,approved),[]);
  await writeFile(join(root,'app/journal.tsx'),'Changed teaching');
  assert((await verifyMethodology(root,approved)).some(x=>x.includes('contenido actual')));
  await writeFile(join(root,'app/journal.tsx'),'Text A');
  await writeFile(join(root,'lib/new-guide.ts'),'New unreviewed guide');
  assert((await verifyMethodology(root,approved)).some(x=>x.includes('contenido actual')));
  await rm(join(root,'lib/new-guide.ts'));
  const incomplete=structuredClone(approved);incomplete.items[0].references[0].locator='';
  assert((await verifyMethodology(root,incomplete)).some(x=>x.includes('M01')));
  const deleted=structuredClone(approved);deleted.items.pop();
  assert((await verifyMethodology(root,deleted)).some(x=>x.includes('trece')));
  console.log('PASS methodology release gate: pending, approval, changed/new content, incomplete evidence and missing scope.');
} finally {await rm(root,{recursive:true,force:true});}
