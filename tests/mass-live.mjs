// Explicit, opt-in provider smoke test. No user sessions or database writes.
// This does not validate the deployed authenticated relay or a physical device.
import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
import {loadEvangelizo} from '../lib/evangelizo.ts';
import {massToday,shiftMassDate} from '../lib/mass.ts';

if(process.env.ALIANZA_LIVE_READINGS!=='1')throw Error('Opt in with ALIANZA_LIVE_READINGS=1');
try {
 const today=massToday();
 for(const date of [shiftMassDate(today,-1),today,shiftMassDate(today,1)]){
  const result=await loadEvangelizo(date,today,AbortSignal.timeout(20000));
  assert.equal(result.date,date);
  assert(result.title.length>0);
  for(const id of ['reading_text1','reading_text2','reading_gospel']){
   const reading=result.readings.find(r=>r.id===id);
   assert(reading?.text?.trim()&&reading?.reference?.trim(),`${date}: missing ${id}`);
   assert.equal(reading.complete,true);
  }
  console.log(`PASS provider ${date}: ${result.readings.length} readings, matching date and nonempty references/text`);
 }
 console.log('Provider and application parser only; authenticated deployment and browser journey remain separate gates.');
} finally {dom.window.close();}
