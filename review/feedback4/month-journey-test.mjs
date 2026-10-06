import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM(fs.readFileSync(new URL('./month-journey.html',import.meta.url),'utf8'),{runScripts:'dangerously'});
const d=dom.window.document,$=s=>d.querySelector(s),click=(a)=>$(`[data-act="${a}"]`).click();
function input(s,v){$(s).value=v;$(s).dispatchEvent(new dom.window.Event('input',{bubbles:true}));}
function period(p){$('#demo-period').value=p;$('#demo-period').dispatchEvent(new dom.window.Event('change',{bubbles:true}));}
click('sep');input('[data-note=help]','Nota de prueba');
click('review');input('[name=note]','Reflexión de prueba');click('exit-editor');assert.equal($('#demo-confirm').hidden,false);click('keep');assert.equal($('[name=note]').value,'Reflexión de prueba');
$('#demo-fail').checked=true;click('save-editor');assert.ok($('#editor-error').textContent.includes('Tu texto sigue aquí'));assert.equal($('[name=note]').value,'Reflexión de prueba');click('save-editor');assert.equal($('#demo-editor').hidden,true);
click('close-month');assert.ok($('#demo-screen').textContent.includes('Nota de prueba'));click('oct');
input('[data-purpose]','Cuidar mi constancia');click('edit');input('[name=qty]','0');click('save-editor');assert.ok($('#editor-error').textContent.includes('cantidad entera'));input('[name=qty]','6');click('save-editor');
click('new');input('[name=name]','Lectura');click('save-editor');assert.ok($('#demo-screen').textContent.includes('Lectura'));click('save-plan');assert.ok($('#demo-screen').textContent.includes('6 veces por mes'));assert.ok($('#demo-screen').textContent.includes('Cuidar mi constancia'));
period('sep');click('edit-close');assert.ok(!$('#demo-screen').textContent.includes('Lectura'));assert.ok($('#demo-screen').textContent.includes('1/3 revisados'));
period('nov');assert.ok($('#demo-screen').textContent.includes('4 veces por mes'));period('oct');assert.ok($('#demo-screen').textContent.includes('6 veces por mes'));
click('reset');assert.ok($('#demo-screen').textContent.includes('Septiembre quedó sin cerrar'));assert.ok(!$('#demo-screen').textContent.includes('Lectura'));
console.log('PASS: close/prepare journey, review draft, failed save/retry, validation, month isolation, add/select commitments, reset');dom.window.close();
