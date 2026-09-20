import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Layout contract only: real viewport/text-zoom QA is still required.
const css=readFileSync(new URL('../app/journey-experience.css',import.meta.url),'utf8');
const rule=selector=>{
  const matches=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([,selectors])=>selectors.trim().endsWith(selector));
  assert(matches.length,`Missing ${selector}`);
  return matches.at(-1)[2];
};
const chip=rule('.workspace .frequency-chip');
assert.match(chip,/white-space:nowrap/);
assert.match(chip,/overflow-wrap:normal/);
assert.match(chip,/word-break:normal/);
assert.match(chip,/flex:0 0 auto/);
assert.match(chip,/font-size:\.875rem/);
assert.match(rule('.workspace .habit-title-line'),/flex-wrap:wrap/);
assert.match(rule('.workspace .habit-title-line>label'),/flex:1 1 12ch/);
console.log('PASS cadence chip CSS contract: no word splitting or shrinking; title row can wrap');
