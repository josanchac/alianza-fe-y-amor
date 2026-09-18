import {createInvitationHandler} from './handler.ts';
declare const Deno: {env:{get(name:string):string|undefined};serve(handler:(req:Request)=>Promise<Response>):void};
const required=(name:string)=>{const value=Deno.env.get(name);if(!value)throw Error(`Missing ${name}`);return value;};
Deno.serve(createInvitationHandler({
  supabaseUrl:required('SUPABASE_URL'),serviceKey:required('SUPABASE_SERVICE_ROLE_KEY'),
  appUrl:'https://josanchac.github.io/alianza-fe-y-amor/',
}));
