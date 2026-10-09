import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
const source=fs.readFileSync(new URL('./daily-month-clarity.html',import.meta.url),'utf8');
const dom=new JSDOM(source,{runScripts:'dangerously',virtualConsole:vc}),d=dom.window.document,$=s=>d.querySelector(s);
const click=(a)=>$(`[data-action="${a}"]`).click();
function input(selector,value,event='input'){const t=$(selector);t.value=value;t.dispatchEvent(new dom.window.Event(event,{bubbles:true}));}
const text=()=> $('[data-screen]').textContent;
try{
 assert(text().includes('Ofrezco este día'));
 click('edit-note');input('[data-note]','Nota nueva de prueba');click('exit');
 assert(text().includes('¿Descartar los cambios?'));click('keep-editing');assert.equal($('[data-note]').value,'Nota nueva de prueba');
 $('[data-fail]').checked=true;click('save-note');assert(text().includes('Tu texto sigue aquí'));assert.equal($('[data-note]').value,'Nota nueva de prueba');
 click('save-note');assert.equal($('[data-saved-note]').textContent,'Nota nueva de prueba');assert.equal($('textarea'),null);
 click('date');assert(text().includes('Ofrezco mi trabajo'));click('date');assert(text().includes('Nota nueva de prueba'));
 $('[data-key="meditation"]').click();assert(text().includes('Todavía no escribiste'));click('edit-note');input('[data-note]','   ');click('save-note');assert(text().includes('Todavía no escribiste'));
 input('[data-scenario]','long','change');const short=$('[data-saved-note]').textContent;assert(short.length<200);click('expand');assert($('[data-saved-note]').textContent.length>4500);click('expand');assert.equal($('[data-saved-note]').textContent,short);
 $('[data-nav="month"]').click();assert.equal(d.querySelectorAll('[data-select]').length,5);click('show-all');assert.equal(d.querySelectorAll('[data-select]').length,50);
 $('[data-all]').click();assert.equal($('[data-count]').textContent,'50 elegidos');$('[data-all]').click();assert.equal($('[data-count]').textContent,'0 elegidos');
 input('[data-scenario]','partial','change');$('[data-nav="month"]').click();input('[data-purpose]','Propósito de prueba');
 click('adjust');input('[data-habit-qty]','0');click('apply-habit');assert(text().includes('cantidad entera'));input('[data-habit-qty]','6');click('apply-habit');
 click('new-habit');input('[data-habit-name]','Compromiso nuevo');click('apply-habit');assert(text().includes('Compromiso nuevo'));
 click('review-plan');assert(text().includes('hoy, 8 de octubre'));assert(text().includes('3 compromisos'));assert(text().includes('1 quedan en pausa'));
 $('[data-fail]').checked=true;click('save-plan');assert(text().includes('Conservamos tu selección'));click('save-plan');assert(text().includes('Propósito de prueba'));assert(text().includes('6 veces por mes'));
 // Future month inherits the saved current plan without overwriting it.
 input('[data-month]','2026-11','change');assert(text().includes('el 1 de noviembre'));assert(text().includes('6 veces por mes'));assert.equal($('[data-purpose]').value,'Propósito de prueba');
 input('[data-purpose]','Plan futuro');click('review-plan');click('save-plan');input('[data-month]','2026-10','change');assert(text().includes('Propósito de prueba'));assert(!text().includes('Plan futuro'));
 // A draft survives switching months without being falsely shown as a saved plan.
 click('edit-plan');input('[data-purpose]','Borrador sin guardar');input('[data-month]','2026-11','change');input('[data-month]','2026-10','change');assert.equal($('[data-purpose]').value,'Borrador sin guardar');assert(!text().includes('Guardado en esta prueba'));
 input('[data-scenario]','empty','change');assert(text().includes('Todavía no escribiste'));$('[data-nav="month"]').click();assert(text().includes('Todavía no tenés compromisos'));click('review-plan');click('save-plan');assert(text().includes('0 compromisos elegidos'));
 assert.equal(errors.length,0);assert(!/fetch\(|XMLHttpRequest|localStorage|https?:\/\//.test(source));
 console.log('PASS preview: visible saved notes, date/category isolation, empty/long text, discard/retry, 50 commitments, select all, quantity validation, current/future dates, plan carryover, draft preservation, no network');
}finally{dom.window.close();}
