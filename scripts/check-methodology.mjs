import {readFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

// Documentary traceability, as requested by the owner. This checks evidence
// completeness and content integrity; it cannot confer institutional approval.
export async function contentSnapshot(root) {
  const files = [];
  async function scan(dir) {
    for (const entry of await readdir(resolve(root, dir), {withFileTypes:true})) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await scan(path);
      else if (/\.(tsx?|jsx?|mjs|html|json)$/.test(entry.name) && !entry.name.endsWith('.local.json')) files.push(path);
    }
  }
  for (const dir of ['app','lib','components','github','supabase/migrations']) await scan(dir);
  // Keep the excluded prototype and the production boundary visible to review.
  files.push('prototype/journey.tsx','vite.github.config.ts','supabase/schema.sql');
  for (const entry of await readdir(resolve(root,'supabase/migrations'))) if(entry.endsWith('.sql')) files.push('supabase/migrations/'+entry);
  const snapshot = {};
  for (const path of files.sort()) snapshot[path] = createHash('sha256').update(await readFile(resolve(root,path))).digest('hex');
  return snapshot;
}

export async function verifyMethodology(root, review) {
  const errors = [];
  if (review.status !== 'documented' || review.kind !== 'documentary') errors.push('Revisión documental pendiente. Ver docs/METHODOLOGY_REVIEW.md.');
  if (!review.verification?.performedBy?.trim() || !review.verification?.criteria?.trim() || !review.verification?.evidence?.trim() || !review.verification?.date?.match(/^\d{4}-\d{2}-\d{2}$/)) errors.push('Falta registrar responsable del cotejo documental, criterio, fecha y evidencia.');
  if (!review.scope?.trim()) errors.push('Falta delimitar el alcance documental.');
  const expectedIds = Array.from({length:13},(_,i)=>'M'+String(i+1).padStart(2,'0'));
  if (!Array.isArray(review.items) || review.items.length !== expectedIds.length || expectedIds.some(id=>review.items.filter(x=>x.id===id).length!==1)) errors.push('La matriz debe resolver las trece áreas de revisión.');
  else for (const item of review.items) {
    if (!['verified','product-rule','excluded'].includes(item.status) || !item.resolution?.trim() || !item.evidence?.trim()) errors.push(`${item.id}: falta resolución documentada y evidencia del comportamiento.`);
    if (item.status === 'verified' && (!item.references?.length || item.references.some(r=>!r.institution?.trim() || !r.title?.trim() || !r.edition?.trim() || !r.locator?.trim() || !/^https:\/\//.test(r.location||'') || !r.provenance?.trim() || !r.correspondence?.trim()))) errors.push(`${item.id}: falta referencia institucional, documento, edición, ubicación exacta, procedencia y correspondencia.`);
    if (item.status === 'product-rule' && !item.boundary?.trim()) errors.push(`${item.id}: explicar por qué es una regla de producto y no una enseñanza espiritual.`);
    if (item.status === 'excluded' && !item.exclusion?.trim()) errors.push(`${item.id}: falta documentar cómo se excluye del producto.`);
  }
  const current = await contentSnapshot(root);
  const checked = review.reviewedContent || {};
  if (Object.keys(current).length !== Object.keys(checked).length || Object.entries(current).some(([path,hash])=>checked[path]!==hash)) errors.push('El contenido actual no coincide con la versión cotejada documentalmente. Volver a revisar los cambios.');
  return errors;
}

const root = resolve(fileURLToPath(new URL('..',import.meta.url)));
if (process.argv[1] && relative(root,resolve(process.argv[1])) === 'scripts/check-methodology.mjs') {
  try {
    const review = JSON.parse(await readFile(resolve(root,'docs/methodology-review.json'),'utf8'));
    const errors = await verifyMethodology(root,review);
    if (errors.length) {console.error(errors.join('\n')); process.exitCode=1;}
    else console.log('Cotejo documental registrado y contenido íntegro. No implica aval institucional o pastoral.');
  } catch (error) {console.error('No se pudo verificar la revisión metodológica:',error.message);process.exitCode=1;}
}
