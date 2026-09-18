// Only the intended single-use activation URL is returned to a verified administrator.
export type InvitationConfig = {
  supabaseUrl: string; serviceKey: string; appUrl: string;
};
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function createInvitationHandler(config: InvitationConfig, transport: typeof fetch = fetch) {
  const app = new URL(config.appUrl);
  if (app.protocol !== 'https:' || app.search || app.hash || app.username || app.password) throw Error('Invalid app origin');
  return async (req: Request): Promise<Response> => {
    const headers = {'Content-Type':'application/json','Cache-Control':'no-store',
      'Access-Control-Allow-Origin': app.origin,'Vary':'Origin',
      'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info',
      'Access-Control-Allow-Methods':'POST, OPTIONS'};
    const reply = (status: number, body: unknown) => new Response(JSON.stringify(body),{status,headers});
    if (req.headers.get('origin') && req.headers.get('origin') !== app.origin) return reply(403,{error:'access_denied'});
    if (req.method === 'OPTIONS') return new Response(null,{status:204,headers});
    if (req.method !== 'POST') return reply(405,{error:'method_not_allowed'});
    const authorization = req.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ') || authorization.length > 8192) return reply(401,{error:'sign_in_required'});
    const call = async (path: string, body?: unknown, bearer = `Bearer ${config.serviceKey}`) => {
      const response = await transport(`${config.supabaseUrl}${path}`,{method:body === undefined?'GET':'POST',
        headers:{apikey:config.serviceKey,Authorization:bearer,'Content-Type':'application/json'},
        body:body === undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
      let value: any = null;
      try { value = await response.json(); } catch { /* Never expose provider errors. */ }
      return {response,value};
    };
    try {
      const identity = await call('/auth/v1/user',undefined,authorization);
      if (!identity.response.ok || !uuid.test(identity.value?.id ?? '')) return reply(401,{error:'sign_in_required'});
      const check = await call('/rest/v1/rpc/alianza_is_admin',{},authorization);
      if (!check.response.ok || check.value !== true) return reply(403,{error:'access_denied'});
      const raw = await req.text();
      if (raw.length > 2000) return reply(400,{error:'invalid_request'});
      let input: any;
      try { input=JSON.parse(raw); } catch { return reply(400,{error:'invalid_request'}); }
      if (!input || typeof input !== 'object' || Array.isArray(input)) return reply(400,{error:'invalid_request'});
      if (input.action === 'status' && Object.keys(input).length===1) return reply(200,{manualLinks:true});
      if (!['invite','renew','cancel'].includes(input.action)
        || Object.keys(input).some(key=>!['action','email','label','version','requestId'].includes(key))
        || typeof input.email!=='string' || input.email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
        || !uuid.test(input.requestId ?? '') || !Number.isSafeInteger(input.version) || input.version<0
        || (input.label!==undefined && (typeof input.label!=='string' || input.label.length>80))) return reply(400,{error:'invalid_request'});
      const proof = Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
      const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(proof));
      const proofHash = Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
      const actor=identity.value.id;
      const prepared=await call('/rest/v1/rpc/alianza_invitation_operator',{p:{...input,actor,proofHash}});
      if (!prepared.response.ok) {
        const code=prepared.value?.code;
        const status=code==='PT409'?409:code==='PT429'?429:code==='42501'?403:code==='PT503'?503:400;
        return reply(status,{error:status===409?'changed':status===429?'rate_limited':status===403?'access_denied':status===503?'maintenance':'invalid_request'});
      }
      if (prepared.value.replay || input.action==='cancel') return reply(200,{result:prepared.value.result,replay:!!prepared.value.replay});
      const redirect=new URL(config.appUrl);
      redirect.hash=new URLSearchParams({pilot_invite:prepared.value.id,invite_proof:proof}).toString();
      const type=prepared.value.confirmed?'recovery':'invite';
      let result='unknown';
      let activationToken='';
      try {
        const generated=await call('/auth/v1/admin/generate_link',{type,email:prepared.value.email,redirect_to:config.appUrl});
        if(generated.response.ok&&typeof generated.value?.hashed_token==='string'&&generated.value.hashed_token.length>20){
          activationToken=generated.value.hashed_token;result='requested';
        }else result=generated.response.status>=500?'unknown':'error';
      } catch { /* Never retry generation implicitly after an ambiguous timeout. */ }
      let current=false;
      try { const finished=await call('/rest/v1/rpc/alianza_invitation_operator',{p:{actor,action:'finish',requestId:input.requestId,result}}); current=finished.response.ok&&finished.value?.current===true; if (!finished.response.ok) result='unknown'; }
      catch { result='unknown'; }
      // A cancellation, newer generation or acceptance may have won the race.
      if(result!=='requested'||!current||!activationToken)return reply(200,{result:result==='requested'?'unknown':result});
      redirect.hash=new URLSearchParams({pilot_invite:prepared.value.id,invite_proof:proof,token_hash:activationToken,type}).toString();
      return reply(200,{result:'generated',link:redirect.href,email:prepared.value.email});
    } catch { return reply(503,{error:'temporarily_unavailable'}); }
  };
}
