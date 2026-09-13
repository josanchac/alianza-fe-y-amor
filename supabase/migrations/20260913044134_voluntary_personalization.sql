begin;
-- Extend the exact DTO without rewriting any existing user record.
alter function alianza_private.valid_record(text,text,jsonb) rename to valid_record_before_personalization;
revoke all on function alianza_private.valid_record_before_personalization(text,text,jsonb) from public,anon,authenticated,alianza_metrics;
create function alianza_private.valid_record(k text, ky text, d jsonb) returns boolean
language plpgsql stable set search_path='' as $$
declare img text; bytes bytea;
begin
 if k is null or ky is null or d is null or jsonb_typeof(d)<>'object' then return false; end if;
 if k='appearance' then
  if ky<>'me' or not(d ?& array['symbol','image']) or d-array['symbol','image']<>'{}'::jsonb or octet_length(d::text)>32000 or jsonb_typeof(d->'symbol')<>'string' or jsonb_typeof(d->'image')<>'string' then return false; end if;
  if d->>'symbol' not in ('','heart','tree','rosary','cross','flame','anchor','mountain','sun','star','flower','sprout','bird','church','compass','waves','book') then return false; end if;
  img:=d->>'image';
  if img='' then return true; end if;
  if d->>'symbol'<>'' or length(img)>30000 or img!~'^data:image/jpeg;base64,/9j/[A-Za-z0-9+/]*={0,2}$' then return false; end if;
  begin bytes:=decode(substring(img from 24),'base64'); exception when others then return false; end;
  return length(bytes)>4 and substring(bytes from 1 for 3)=decode('ffd8ff','hex') and substring(bytes from length(bytes)-1)=decode('ffd9','hex');
 end if;
 -- Allow an intentionally omitted display name; validation substitute only.
 if k='profile' and d->>'name'='' then d:=jsonb_set(d,'{name}','"Sin nombre"'::jsonb); end if;
 if k='preferences' and d->>'lastSeenRelease'='simple-2026-09' then d:=jsonb_set(d,'{lastSeenRelease}','"journey-2026-09"'::jsonb); end if;
 return alianza_private.valid_record_before_personalization(k,ky,d);
end $$;
revoke all on function alianza_private.valid_record(text,text,jsonb) from public,anon,authenticated,alianza_metrics;
-- Appearance uses the existing owner-only record write path and reset epoch.
-- Partner visibility uses an explicit kind allowlist; appearance is never shared.
commit;
