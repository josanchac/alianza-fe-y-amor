import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({define:{__EVANGELIZO_REVIEW__:true},root:path.resolve('review/misa'),publicDir:false,plugins:[react()],resolve:{alias:{'@':path.resolve('.')},dedupe:['react','react-dom']},server:{host:'127.0.0.1',port:4176,strictPort:true},build:{outDir:path.resolve('tests/preview-dist/misa'),emptyOutDir:true}});
