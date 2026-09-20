import fs from 'node:fs';
const dir='tests/preview-dist/integral/assets';
const entries=fs.readdirSync(dir),scripts=entries.filter(x=>x.endsWith('.js')),styles=entries.filter(x=>x.endsWith('.css'));
if(scripts.length!==1)throw new Error('La revisión requiere un solo bundle autocontenido.');
const fragment=['<div id="integral-review-mount"></div>','<style>',...styles.map(x=>fs.readFileSync(dir+'/'+x,'utf8')),'</style>','<script type="module">',fs.readFileSync(dir+'/'+scripts[0],'utf8').replaceAll('</script','<\\/script'),'</script>',''].join('\n');
if(Buffer.byteLength(fragment)>1_000_000)throw new Error('La vista excede el límite de revisión.');
const destination=process.argv[2]||'/workspace/alianza-revision-integral.html';
fs.writeFileSync(destination,fragment);
console.log('Vista de conversación exportada: '+Buffer.byteLength(fragment)+' bytes.');
