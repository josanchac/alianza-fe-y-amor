import {readFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

// This checks evidence recorded by a human reviewer. It cannot establish
// doctrinal fidelity or confer approval on behalf of Schoenstatt.
export async function contentSnapshot(root) {
  const files = [];
  async function scan(dir) {
    for (const entry of await readdir(resolve(root, dir), {withFileTypes:true})) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await scan(path);
      else if (/\.(tsx?|jsx?|mjs|html|json)$/.test(entry.name) && !entry.name.endsWith('.local.json')) files.push(path);
    }
  }
  for (const dir of ['app','lib','components','github']) await scan(dir);
  // The prototype is included so it cannot be represented as approved after
  // its questions or behavioral rules change.
  files.push('prototype/journey.tsx');
  const snapshot = {};
  for (const path of files.sort()) snapshot[path] = createHash('sha256').update(await readFile(resolve(root,path))).digest('hex');
  return snapshot;
}

export async function verifyMethodology(root, review) {
  const errors = [];
  if (review.status !== 'approved') errors.push('Revisión metodológica pendiente. Ver docs/METHODOLOGY_REVIEW.md.');
  if (!review.approval?.reviewer?.trim() || !review.approval?.capacity?.trim() || !review.approval?.evidence?.trim() || !review.approval?.date?.match(/^\d{4}-\d{2}-\d{2}$/)) errors.push('Falta registrar quién revisó, en qué calidad, cuándo y la evidencia de su aprobación.');
  const expectedIds = Array.from({length:12},(_,i)=>'M'+String(i+1).padStart(2,'0'));
  if (!Array.isArray(review.items) || review.items.length !== expectedIds.length || expectedIds.some(id=>review.items.filter(x=>x.id===id).length!==1)) errors.push('La matriz debe resolver las doce áreas de revisión.');
  else for (const item of review.items) {
    if (!['verified','excluded'].includes(item.status) || !item.resolution?.trim()) errors.push(`${item.id}: falta resolución documentada.`);
    if (item.status === 'verified' && (!item.references?.length || item.references.some(r=>!r.institution?.trim() || !r.title?.trim() || !r.edition?.trim() || !r.locator?.trim() || !r.location?.trim()))) errors.push(`${item.id}: falta referencia institucional, documento, edición y ubicación exacta.`);
  }
  const current = await contentSnapshot(root);
  const approved = review.approvedContent || {};
  if (Object.keys(current).length !== Object.keys(approved).length || Object.entries(current).some(([path,hash])=>approved[path]!==hash)) errors.push('El contenido actual no coincide con una versión aprobada. Volver a revisar los cambios.');
  return errors;
}

const root = resolve(fileURLToPath(new URL('..',import.meta.url)));
if (process.argv[1] && relative(root,resolve(process.argv[1])) === 'scripts/check-methodology.mjs') {
  try {
    const review = JSON.parse(await readFile(resolve(root,'docs/methodology-review.json'),'utf8'));
    const errors = await verifyMethodology(root,review);
    if (errors.length) {console.error(errors.join('\n')); process.exitCode=1;}
    else console.log('Evidencia de revisión registrada; contenido sin cambios desde esa revisión.');
  } catch (error) {console.error('No se pudo verificar la revisión metodológica:',error.message);process.exitCode=1;}
}
