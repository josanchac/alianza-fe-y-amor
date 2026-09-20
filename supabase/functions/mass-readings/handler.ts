import {readings} from './upstream.ts';
type Options={supabaseUrl:string;anonKey:string;allowedOrigins:string[];fetcher?:typeof fetch;now?:()=>Date};
export function createMassReadingsHandler(options:Options){
 const fetcher=options.fetcher??fetch;
 return async(request:Request):Promise<Response>=>{
  const origin=request.headers.get('origin');
  const headers=new Headers({'Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'});
  const fail=(status:number,text:string)=>new Response(text,{status,headers});
  if(origin&&!options.allowedOrigins.includes(origin))return fail(403,'Origen no permitido');
  if(origin)headers.set('Access-Control-Allow-Origin',origin);
  headers.set('Access-Control-Allow-Methods','GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers','authorization, apikey, content-type, x-client-info');
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='GET')return fail(405,'Método no permitido');
  const authorization=request.headers.get('authorization');
  if(!authorization?.startsWith('Bearer '))return fail(401,'Iniciá sesión para consultar las lecturas');
  try{
   // Resolve the user at Auth; never trust a decoded or user-editable claim.
   const auth=await fetcher(options.supabaseUrl+'/auth/v1/user',{headers:{Authorization:authorization,apikey:options.anonKey},signal:AbortSignal.timeout(5000),redirect:'manual'});
   if(!auth.ok)return fail(401,'Sesión no válida');
   const user=await auth.json();if(!user.id||user.is_anonymous)return fail(401,'Sesión no válida');
   const result=await readings(request,fetcher,options.now?.());
   result.headers.forEach((value,key)=>headers.set(key,value));
   return new Response(result.body,{status:result.status,headers});
  }catch{return fail(503,'No se pudo verificar la sesión. Intentá nuevamente.');}
 };
}
