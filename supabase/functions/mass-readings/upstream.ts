// Bounded upstream relay. No credentials, user data or arbitrary URL forwarded.
export async function readings(request:Request, fetchUpstream:typeof fetch=fetch, now=new Date()) {
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  const fail=(status:number,message:string)=>new Response(message,{status,headers});
  if(request.method!=='GET')return fail(405,'Método no permitido');
  const url=new URL(request.url),date=url.searchParams.get('date');
  if([...url.searchParams.keys()].some(key=>key!=='date')||url.searchParams.getAll('date').length!==1||!/^\d{4}-\d{2}-\d{2}$/.test(date??''))return fail(400,'Fecha inválida');
  if(!date)return fail(400,'Fecha inválida');
  const stamp=Date.parse(date+'T00:00:00Z');
  if(!Number.isFinite(stamp)||new Date(stamp).toISOString().slice(0,10)!==date)return fail(400,'Fecha inválida');
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  if(Math.abs(stamp-Date.parse(today+'T00:00:00Z'))>30*86400000)return fail(400,'Fecha fuera del rango disponible');
  const upstream=new URL('https://feed.evangelizo.org/v2/reader.php');
  upstream.search=new URLSearchParams({date:date.replaceAll('-',''),lang:'SP',type:'xml'}).toString();
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try {
    // Workers supports manual/follow only. Reject 3xx via !ok without following.
    const response=await fetchUpstream(upstream,{signal:controller.signal,redirect:'manual',headers:{Accept:'application/xml,text/xml,text/html'}});
    if(!response.ok||!response.body){console.error('mass_readings_upstream_status',response.status);return fail(502,'El proveedor no respondió');}
    const reader=response.body.getReader(),chunks=[];let size=0;
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>500000){await reader.cancel();return fail(502,'Respuesta demasiado grande');}chunks.push(value);}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
    const xml=new TextDecoder().decode(bytes);
    if(/<!DOCTYPE|<!ENTITY/i.test(xml)||!xml.includes('<evangelizo')||!new RegExp('<date>\\s*(?:<!\\[CDATA\\[)?'+date.replaceAll('-','')+'(?:\\]\\]>)?\\s*</date>').test(xml))return fail(502,'Respuesta inválida del proveedor');
    // Send as inert XML text; the client validates every field before rendering.
    return new Response(xml,{headers:{...headers,'Content-Type':'application/xml; charset=utf-8'}});
  } catch(error) {console.error('mass_readings_fetch_failed',error instanceof Error?error.name+': '+error.message.slice(0,240):'unknown');return fail(controller.signal.aborted?504:502,'No se pudieron obtener las lecturas');}
  finally {clearTimeout(timer);}
}
