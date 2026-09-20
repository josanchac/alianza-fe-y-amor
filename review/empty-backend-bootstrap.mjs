// Only for the newly created synthetic backend; never apply to the pilot.
export const TEST_PROJECT = 'xhfqcrmekfjclgazrvrm';
export function emptyBackendMigration(source, projectId) {
  if (projectId !== TEST_PROJECT) throw Error('Only the isolated test project is permitted');
  const anchor = 'do $$ declare original_pair uuid; begin\n';
  if (source.split(anchor).length !== 2) throw Error('Historical migration changed; review before applying');
  return source.replace(anchor, () => anchor + ` -- Fresh installation only: there is no legacy couple or record to migrate.
 if not exists(select 1 from alianza_private.members) and
    not exists(select 1 from alianza_private.records) and
    not exists(select 1 from auth.users) then return; end if;
`);
}
