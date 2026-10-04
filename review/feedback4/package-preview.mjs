// Package the built, synthetic prototype as one offline file; no credentials.
import fs from 'node:fs';
import path from 'node:path';
const root='tests/preview-dist/feedback4';
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/,(_m,src)=>'<script type="module">'+fs.readFileSync(path.join(root,src),'utf8').replaceAll('</script','<\\/script')+'</script>');
html=html.replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/,(_m,src)=>'<style>'+fs.readFileSync(path.join(root,src),'utf8')+'</style>');
const out=process.argv[2];if(!out)throw Error('Provide output HTML path');
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html);console.log(out);
