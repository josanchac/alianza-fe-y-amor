import assert from 'node:assert/strict';
import {createMassReadingsHandler} from '../supabase/functions/mass-readings/handler.ts';
const origin='https://josanchac.github.io',now=()=>new Date('2026-09-20T12:00:00Z');
const xml='<evangelizo><date>20260920</date><reading_gospel>SYNTHETIC</reading_gospel></evangelizo>';
let upstreamCalls=0,authCalls=0,authOk=true,body=xml;
const handler=createMassReadingsHandler({supabaseUrl:'https://isolated.supabase.co',anonKey:'synthetic',allowedOrigins:[origin],now,fetcher:async(url,opts)=>{
 if(String(url).includes('/auth/v1/user')){authCalls++;return Response.json(authOk?{id:'synthetic'}:{},{status:authOk?200:401});}
 upstreamCalls++;assert.equal(url.hostname,'feed.evangelizo.org');assert.equal(opts.redirect,'manual');assert(!opts.headers.Authorization);assert(!opts.headers.apikey);assert(!opts.headers.Cookie);return new Response(body);
}});
const req=(query='date=2026-09-20',headers={},method='GET')=>new Request('https://isolated.supabase.co/functions/v1/mass-readings?'+query,{method,headers:{Origin:origin,Authorization:'Bearer synthetic',...headers}});
assert.equal((await handler(req('',{},'OPTIONS'))).status,204);assert.equal(authCalls,0);
assert.equal((await handler(req(undefined,{Origin:'https://evil.example'}))).status,403);
assert.equal((await handler(req(undefined,{Authorization:''}))).status,401);
authOk=false;assert.equal((await handler(req())).status,401);assert.equal(upstreamCalls,0);authOk=true;
for(const query of ['date=2026-02-30','date=2027-01-01','date=2026-09-20&url=https://evil.example','date=2026-09-20&date=2026-09-21'])assert.equal((await handler(req(query))).status,400);
assert.equal(upstreamCalls,0);
const good=await handler(req());assert.equal(good.status,200);assert.equal(await good.text(),xml);assert.equal(good.headers.get('access-control-allow-origin'),origin);assert.equal(good.headers.get('cache-control'),'no-store');
for(body of [xml.replace('20260920','20260921'),'<!DOCTYPE x>'+xml,'x'.repeat(500001)])assert.equal((await handler(req())).status,502);
console.log('PASS authenticated relay: preflight, origin, rejected sessions, range, fixed host, no credential forwarding, response date and size');
