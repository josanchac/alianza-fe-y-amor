import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { readFileSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';

export default defineConfig({
  root: path.resolve('github'), base: './', publicDir: false,
  resolve: { alias: { '@': path.resolve('.') }, dedupe: ['react','react-dom'] },
  plugins: [react(), { name:'public-assets', closeBundle(){
    const dir=path.resolve('github-dist'); mkdirSync(dir,{recursive:true});
    for(const f of ['emblem.png','icon.png'])copyFileSync('public/'+f,dir+'/'+f);
    let config={url:'',publishableKey:'',emailRecoveryEnabled:false};
    try{config=JSON.parse(readFileSync('github/config.public.json','utf8'));}catch{}
    try{config=JSON.parse(readFileSync('github/config.local.json','utf8'));}catch{}
    if(config.publishableKey && !config.publishableKey.startsWith('sb_publishable_'))throw new Error('Use only a Supabase publishable key. Secret and legacy keys are rejected.');
    if(config.url && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.url))throw new Error('Invalid Supabase project URL');
    writeFileSync(dir+'/config.json',JSON.stringify(config));
    writeFileSync(dir+'/.nojekyll','');
    writeFileSync(dir+'/manifest.webmanifest',JSON.stringify({name:'Alianza · Fe y Amor',short_name:'Alianza',start_url:'./',display:'standalone',theme_color:'#142c46',background_color:'#f5f7fa',icons:[{src:'./icon.png',sizes:'1254x1254',type:'image/png'}]}));
  }}],
  build: {outDir:path.resolve('github-dist'),emptyOutDir:true,sourcemap:false},
});
