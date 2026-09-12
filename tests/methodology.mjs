import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadConfigFromFile} from 'vite';
import {contentSnapshot,verifyMethodology} from '../scripts/check-methodology.mjs';
const root=await mkdtemp(join(tmpdir(),'alianza-review-'));
try {
  for(const dir of ['app','lib','components','github','prototype','supabase/migrations'])await mkdir(join(root,dir),{recursive:true});
  for(const file of ['app/journal.tsx','prototype/journey.tsx','vite.github.config.ts','supabase/schema.sql'])await writeFile(join(root,file),'Fixture');
  const actual=JSON.parse(await readFile('docs/methodology-review.json','utf8'));
  // Synthetic documentary evidence only in this disposable fixture.
  const documented={...actual,reviewedContent:await contentSnapshot(root)};
  assert.deepEqual(await verifyMethodology(root,documented),[]);
  const pending={...documented,status:'pending'};
  assert((await verifyMethodology(root,pending)).some(x=>x.includes('pendiente')));
  const noPastor=structuredClone(documented);delete noPastor.pastoralReview;
  assert.deepEqual(await verifyMethodology(root,noPastor),[],'Pastoral review is not a release condition for this stage');
  const noEvidence=structuredClone(documented);noEvidence.verification.evidence='';
  assert((await verifyMethodology(root,noEvidence)).some(x=>x.includes('evidencia')));
  for(const file of ['app/journal.tsx','supabase/schema.sql','prototype/journey.tsx']){
    await writeFile(join(root,file),'Changed content or behavior');
    assert((await verifyMethodology(root,documented)).some(x=>x.includes('contenido actual')));
    await writeFile(join(root,file),'Fixture');
  }
  for(const file of ['lib/new-guide.ts','supabase/migrations/new-rule.sql']){
    await writeFile(join(root,file),'New unreviewed behavior');
    assert((await verifyMethodology(root,documented)).some(x=>x.includes('contenido actual')));
    await rm(join(root,file));
  }
  for(const field of ['locator','provenance','correspondence']){
    const incomplete=structuredClone(documented);incomplete.items[0].references[0][field]='';
    assert((await verifyMethodology(root,incomplete)).some(x=>x.includes('M01')));
  }
  const excluded=structuredClone(documented);excluded.items.find(x=>x.id==='M10').exclusion='';
  assert((await verifyMethodology(root,excluded)).some(x=>x.includes('M10')));
  const product=structuredClone(documented);product.items.find(x=>x.id==='M07').boundary='';
  assert((await verifyMethodology(root,product)).some(x=>x.includes('M07')));
  const deleted=structuredClone(documented);deleted.items.pop();
  assert((await verifyMethodology(root,deleted)).some(x=>x.includes('trece')));
  const result=await loadConfigFromFile({command:'build',mode:'production'},'vite.github.config.ts');
  const boundary=result.config.plugins.find(p=>p.name==='exclude-unreviewed-prototype');
  const context={error(message){throw Error(message);}};
  assert.throws(()=>boundary.transform.call(context,'',join(process.cwd(),'prototype/journey.tsx')+'?v=1'),/prototipo/);
  assert.doesNotThrow(()=>boundary.transform.call(context,'',join(process.cwd(),'app/journal.tsx')));
  console.log('PASS documentary gate: no pastoral prerequisite; pending/evidence/SQL/content changes rejected; prototype excluded from production.');
} finally {await rm(root,{recursive:true,force:true});}
