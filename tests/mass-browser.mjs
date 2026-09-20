// Optional real layout check. Supply paths to an existing Playwright installation and Chromium.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--config','vite.misa-review.config.ts'],{stdio:'ignore'});
for(let i=0;i<50;i++){try{const r=await fetch('http://127.0.0.1:4176/');if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu']});
const results=[];
try {
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[],outside=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4176/'))outside.push(r.url())});
 await page.goto('http://127.0.0.1:4176/');
 await page.getByLabel('Fecha que querés consultar').fill('2026-09-20');
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:844});
  await page.getByRole('button',{name:'Celebraciones especiales',exact:true}).click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);
  const small=await page.locator('.mass-view button:visible').evaluateAll(els=>els.filter(el=>{const r=el.getBoundingClientRect();return r.width<43.5||r.height<43.5}).map(el=>el.textContent));
  assert.deepEqual(small,[],`touch targets at ${width}`);
  await page.getByRole('button',{name:'Celebraciones especiales',exact:true}).click();results.push(`PASS no horizontal overflow and >=44px targets at ${width}px`);
 }
 await page.setViewportSize({width:390,height:844});
 // Test-only long content added to DOM, not a liturgical text or production data.
 await page.getByRole('button',{name:/Liturgia de la Palabra/}).click();
 await page.locator('.mass-content').evaluate(el=>{const synthetic=document.createElement('p');synthetic.textContent='Contenido sintético de geometría. '.repeat(600);synthetic.style.fontSize='24px';el.append(synthetic)});
 await page.getByRole('button',{name:/Ritos finales/}).click();await page.waitForTimeout(120);
 let box=await page.getByRole('button',{name:/Ritos finales/}).boundingBox();assert(Math.abs(box.y-24)<3,`long to short anchor ${box.y}`);
 await page.getByRole('button',{name:/Ritos iniciales/}).click();await page.getByRole('button',{name:/Liturgia eucarística/}).click();await page.waitForTimeout(120);
 box=await page.getByRole('button',{name:/Liturgia eucarística/}).boundingBox();assert(Math.abs(box.y-24)<3,`latest anchor ${box.y}`);
 results.push('PASS long-to-short collapse and latest section align at 24px');
 await page.getByRole('button',{name:'Celebraciones especiales',exact:true}).click();await page.getByRole('button',{name:'Navidad',exact:true}).click();
 assert.equal(await page.getByLabel('Fecha que querés consultar').inputValue(),'2026-12-25');
 assert.equal(await page.getByRole('button',{name:'Celebraciones especiales',exact:true}).getAttribute('aria-expanded'),'false');
 await page.getByRole('button',{name:'Día',exact:true}).click();
 const section=page.getByRole('button',{name:/Ritos iniciales/});await section.focus();await page.keyboard.press('Enter');assert.equal(await section.getAttribute('aria-expanded'),'true');await page.keyboard.press('Space');assert.equal(await section.getAttribute('aria-expanded'),'false');
 results.push('PASS calendar shortcut, closed quick browse and keyboard Enter/Space');
 await page.addStyleTag({content:'.mass-view {font-size: 200%}'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 results.push('PASS 200% container text at 390px (not equivalent to device text scaling)');
 assert.deepEqual(errors,[]);assert.deepEqual(outside,[]);results.push('PASS no page errors or external requests');
 await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/misa-mobile.png',fullPage:true});
 await writeFile('test-results/misa-browser.json',JSON.stringify({browser:await browser.version(),results},null,2));console.log(results.join('\n'));
} finally {await browser.close();server.kill();}
