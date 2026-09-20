import {createMassReadingsHandler} from './handler.ts';
declare const Deno:{env:{get(name:string):string|undefined};serve(handler:(req:Request)=>Promise<Response>):void};
const required=(name:string)=>{const value=Deno.env.get(name);if(!value)throw Error(`Missing ${name}`);return value;};
Deno.serve(createMassReadingsHandler({
 supabaseUrl:required('SUPABASE_URL'),anonKey:required('SUPABASE_ANON_KEY'),
 allowedOrigins:['https://josanchac.github.io','https://alianza-revision-integral.josanchac.chatgpt.site'],
}));
