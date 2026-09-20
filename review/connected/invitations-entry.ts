import {createInvitationHandler} from '../../supabase/functions/pilot-invitations/handler.ts';
declare const Deno:{env:{get(name:string):string|undefined};serve(handler:(req:Request)=>Promise<Response>):void};
const url=Deno.env.get('SUPABASE_URL');
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(url!=='https://xhfqcrmekfjclgazrvrm.supabase.co'||!key)throw Error('Only the isolated backend is permitted');
Deno.serve(createInvitationHandler({supabaseUrl:url,serviceKey:key,appUrl:'https://alianza-revision-integral.josanchac.chatgpt.site/connected/'}));
