import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({define:{__EVANGELIZO_REVIEW__:true,__EVANGELIZO_SAME_ORIGIN__:process.env.MASS_READINGS_RELAY==='same-origin'},root:path.resolve('review/runtime'),publicDir:false,plugins:[react()],resolve:{alias:{'@':path.resolve('.')},dedupe:['react','react-dom']},server:{host:'127.0.0.1',port:4178,strictPort:true},build:{outDir:path.resolve('tests/preview-dist/runtime'),emptyOutDir:true}});
