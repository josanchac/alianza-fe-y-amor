import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';

const svg=readFileSync('github-dist/emblem.svg','utf8');
assert.match(svg, /<svg\b/);
assert.doesNotMatch(svg, /<image\b/i, 'The emblem must remain vector artwork.');
assert.equal(svg,readFileSync('public/emblem.svg','utf8'));
assert(readFileSync('github-dist/icon.png').length>0);
const bundle=readdirSync('github-dist/assets').filter(f=>f.endsWith('.js'))
  .map(f=>readFileSync('github-dist/assets/'+f,'utf8')).join('\n');
assert(bundle.includes('emblem.svg'),'The application must use the packaged vector emblem.');
console.log('Published vector emblem and app icon verified.');
