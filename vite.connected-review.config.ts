import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
const buildId=randomBytes(16).toString('hex');
const out=path.resolve('tests/preview-dist/connected');
export default defineConfig({
 root:path.resolve('review/connected'),base:'./',publicDir:false,
 define:{__EVANGELIZO_REVIEW__:true,__EVANGELIZO_SAME_ORIGIN__:true,__ALIANZA_BUILD_ID__:JSON.stringify(buildId)},
 resolve:{alias:{'@':path.resolve('.')},dedupe:['react','react-dom']},
 plugins:[react(),{name:'isolated-review-config',closeBundle(){
  const config=JSON.parse(readFileSync('review/connected/config.json','utf8'));
  if(config.url!=='https://xhfqcrmekfjclgazrvrm.supabase.co'||!config.publishableKey.startsWith('sb_publishable_'))throw Error('Only the isolated backend is permitted');
  writeFileSync(out+'/config.json',JSON.stringify({...config,buildId}));
  for(const f of ['emblem.svg','icon.png'])copyFileSync('public/'+f,out+'/'+f);
 }}],build:{outDir:out,emptyOutDir:true,sourcemap:false},
});
