import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({root:path.resolve('tests'),publicDir:false,resolve:{alias:{'@':path.resolve('.')},dedupe:['react','react-dom']},plugins:[react()],build:{outDir:path.resolve('tests/preview-dist'),emptyOutDir:true,rollupOptions:{input:path.resolve('tests/preview.html')}},server:{host:'127.0.0.1',port:5174,strictPort:true}});
