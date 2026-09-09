create policy deny_direct_access on alianza_private.members for all to anon,authenticated using (false) with check (false);
create policy deny_direct_access on alianza_private.records for all to anon,authenticated using (false) with check (false);
