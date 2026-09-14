import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite(),
  ids = Array.from(
    { length: 12 },
    (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  );
try {
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`,
  );
  const files = (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const f of files.filter((f) => f < "20260909143538"))
    await db.exec(await readFile("supabase/migrations/" + f, "utf8"));
  for (const [i, id] of ids.entries())
    await db.query("insert into auth.users values($1,$2,now())", [
      id,
      `user${i}@example.test`,
    ]);
  await db.query(
    "insert into alianza_private.members values($1,'jose','A',''),($2,'neca','B','')",
    ids.slice(0, 2),
  );
  for (const f of files.filter((f) => f >= "20260909143538"))
    await db.exec(await readFile("supabase/migrations/" + f, "utf8"));
  for (const id of ids.slice(2))
    await db.query(
      "insert into alianza_private.members(id,role,name) values($1,'member','Synthetic')",
      [id],
    );
  await db.query("insert into alianza_private.admin_members values($1)", [
    ids[0],
  ]);
  async function as(id) {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec("set role authenticated");
  }
  async function act(payload = {}) {
    return (
      await db.query("select public.alianza_community($1::jsonb) v", [
        JSON.stringify({ dataEpoch: 1, ...payload }),
      ])
    ).rows[0].v;
  }
  async function data(payload = null) {
    return (
      await db.query("select public.alianza_data($1::jsonb) v", [
        payload && JSON.stringify(payload),
      ])
    ).rows[0].v;
  }
  async function metrics(p = {}) {
    return (
      await db.query("select public.alianza_product_metrics($1::jsonb) v", [
        JSON.stringify(p),
      ])
    ).rows[0].v;
  }
  const today = (
    await db.query(
      "select (now() at time zone 'America/Costa_Rica')::date::text as day",
    )
  ).rows[0].day;
  await as(ids[0]);
  const group = (
    await act({
      action: "group_create",
      name: "Curso sintético",
      displayName: "A",
    })
  ).groups[0];
  const token = (await act({ action: "invite_create", groupId: group.id }))
    .token;
  await as(ids[2]);
  assert.equal((await act()).groups.length, 0);
  await assert.rejects(() =>
    act({ action: "purpose_create", groupId: group.id, title: "Unauthorized" }),
  );
  assert.equal(
    (await act({ action: "invite_preview", token })).invitation.name,
    "Curso sintético",
  );
  for (const id of ids.slice(1, 6)) {
    await as(id);
    await act({ action: "invite_join", token, displayName: "Participante" });
  }
  await as(ids[0]);
  let state = await act({
    action: "purpose_create",
    groupId: group.id,
    title: "Escuchar",
    reason: "Concretar lo conversado",
    start: today,
    end: today,
    target: 3,
    unit: "person",
  });
  const purpose = state.groups[0].purposes[0];
  for (const id of ids.slice(0, 5)) {
    await as(id);
    await act({
      action: "purpose_join",
      groupId: group.id,
      id: purpose.id,
      share: true,
    });
    await act({
      action: "purpose_log",
      groupId: group.id,
      id: purpose.id,
      day: today,
      amount: 1,
      version: 0,
    });
  }
  await as(ids[0]);
  state = await act();
  assert.equal(state.groups[0].purposes[0].summary, null, "Live small-group totals remain private");
  assert.equal(state.groups[0].purposes[0].logs.length, 1);
  await assert.rejects(
    () =>
      act({
        action: "purpose_log",
        groupId: group.id,
        id: purpose.id,
        day: today,
        amount: 2,
        version: 0,
      }),
    (e) => e.code === "PT409",
  );
  await act({
    action: "purpose_log",
    groupId: group.id,
    id: purpose.id,
    day: today,
    amount: 0,
    version: 1,
  });
  assert.equal((await act()).groups[0].purposes[0].logs[0].amount, 0);
  await act({
    action: "purpose_join",
    groupId: group.id,
    id: purpose.id,
    share: false,
  });
  assert.equal((await act()).groups[0].purposes[0].summary, null);
  // Matrimonial purpose counts one shared unit, with bilateral sharing.
  state = await act({
    action: "purpose_create",
    groupId: group.id,
    title: "Escucha juntos",
    start: today,
    end: today,
    target: 3,
    unit: "couple",
  });
  const cp = state.groups[0].purposes.find((p) => p.unit === "couple");
  await act({
    action: "purpose_join",
    groupId: group.id,
    id: cp.id,
    share: true,
  });
  await act({
    action: "purpose_log",
    groupId: group.id,
    id: cp.id,
    day: today,
    amount: 1,
    version: 0,
  });
  await as(ids[1]);
  await act({
    action: "purpose_join",
    groupId: group.id,
    id: cp.id,
    share: false,
  });
  assert.equal(
    (await act()).groups[0].purposes.find((p) => p.id === cp.id).logs[0].amount,
    1,
  );
  await as(ids[2]);
  await assert.rejects(() =>
    act({ action: "purpose_join", groupId: group.id, id: cp.id, share: true }),
  );
  // Sequential prayer, reservations and idempotent confirmations.
  await as(ids[0]);
  for (const invalid of [null, {}, [], { date: today }]) {
    await assert.rejects(() =>
      act({
        action: "meeting_save",
        groupId: group.id,
        version: 0,
        data: invalid,
      }),
    );
  }
  assert.equal((await act()).groups[0].meeting, null);
  const rid = "10000000-0000-4000-8000-000000000001";
  await act({
    action: "rosary_create",
    groupId: group.id,
    id: rid,
    scope: "group",
    mystery: "joyful",
    mode: "sequential",
  });
  await assert.rejects(
    () =>
      act({
        action: "rosary_create",
        id: rid,
        scope: "couple",
        mode: "sequential",
        mystery: "joyful",
        startsWith: "partner",
      }),
    (e) => e.code === "PT409",
  );
  assert.equal(
    (await act()).rosaries[0].slots.length,
    0,
    "A conflicting replay cannot assign a different audience's slots",
  );
  await assert.rejects(() =>
    act({ action: "rosary_complete", id: rid, decade: 2 }),
  );
  await act({ action: "rosary_reserve", id: rid, decade: 1 });
  await as(ids[1]);
  await assert.rejects(
    () => act({ action: "rosary_complete", id: rid, decade: 1 }),
    (e) => e.code === "PT409",
  );
  await as(ids[0]);
  await act({ action: "rosary_complete", id: rid, decade: 1 });
  await act({ action: "rosary_complete", id: rid, decade: 1 });
  assert.equal((await act()).rosaries[0].mine.length, 1);
  await as(ids[1]);
  await act({ action: "rosary_complete", id: rid, decade: 1 });
  assert.equal((await act()).rosaries[0].slots.filter((s) => s.done).length, 1);
  for (let n = 2; n <= 5; n++)
    await act({ action: "rosary_complete", id: rid, decade: n });
  assert.equal((await act()).rosaries[0].slots.filter((s) => s.done).length, 5);
  // Atomic schedule linking only for an explicit compatible amount; no whole rosary for one decade.
  await as(ids[0]);
  const st = await data();
  await data({
    kind: "habit",
    key: "rosary-habit",
    version: 0,
    dataEpoch: 1,
    relationshipVersion: st.user.relationshipVersion,
    data: {
      title: "Rezar una decena",
      moment: "Noche",
      active: true,
      anchor: "",
      minimum: "",
      frequency: { period: "day", target: 1 },
    },
  });
  await assert.rejects(() =>
    act({
      action: "rosary_link",
      id: rid,
      kind: "full",
      habitKey: "rosary-habit",
    }),
  );
  await act({
    action: "rosary_link",
    id: rid,
    kind: "decade",
    habitKey: "rosary-habit",
  });
  await act({
    action: "rosary_link",
    id: rid,
    kind: "decade",
    habitKey: "rosary-habit",
  });
  assert.equal(
    (await data()).own.find((r) => r.kind === "checks").data["rosary-habit"],
    "done",
  );
  await data({
    kind: "ideal_draft",
    key: "me",
    version: 0,
    dataEpoch: 1,
    data: { stage: "discover", notes: "PRIVATE DRAFT" },
  });
  await as(ids[1]);
  assert(!JSON.stringify(await act()).includes("PRIVATE DRAFT"));
  assert(!(await data()).partner.records.some((r) => r.kind === "ideal_draft"));
  await act({ action: "group_leave", groupId: group.id });
  assert.equal((await act()).rosaries.length, 0);
  await assert.rejects(() =>
    act({ action: "rosary_complete", id: rid, decade: 2 }),
  );
  await as(ids[0]);
  await act({ action: "invite_revoke", groupId: group.id });
  await as(ids[6]);
  await assert.rejects(() =>
    act({ action: "invite_join", token, displayName: "C" }),
  );
  // No individual data in admin output; consent off prevents collection and deletes it.
  await metrics({ action: "event", event: "open" });
  await as(ids[0]);
  let admin = (await db.query("select public.alianza_admin_activity() v"))
    .rows[0].v;
  assert(admin.suppressed);
  assert(!("members" in admin));
  for (const id of ids.slice(0, 5)) {
    await as(id);
    await metrics({ action: "consent", enabled: true });
    await metrics({ action: "event", event: "open" });
    await metrics({ action: "event", event: "open" });
  }
  await as(ids[0]);
  admin = (await db.query("select public.alianza_admin_activity() v")).rows[0]
    .v;
  assert.equal(admin.totals30.open.count, 5);
  assert(!JSON.stringify(admin).includes("example.test"));
  await assert.rejects(() => metrics({ action: "event", event: "confession" }));
  await assert.rejects(() =>
    metrics({ action: "event", event: "open", notes: "private" }),
  );
  await metrics({ action: "consent", enabled: false });
  assert(
    (await db.query("select public.alianza_admin_activity() v")).rows[0].v
      .suppressed,
  );
  await as(ids[6]);
  await assert.rejects(() =>
    db.query("select public.alianza_admin_activity()"),
  );
  for (const table of [
    "groups",
    "group_members",
    "group_invites",
    "purpose_logs",
    "rosary_contributions",
    "product_days",
  ])
    await assert.rejects(() =>
      db.query("select * from alianza_private." + table),
    );
  await db.exec("reset role;set role alianza_metrics");
  await assert.rejects(() => db.query("select * from alianza_private.records"));
  await assert.rejects(() =>
    db.query("select * from alianza_private.rosary_contributions"),
  );
  await db.exec("reset role;set role anon");
  await assert.rejects(() => act());
  await as(ids[0]);
  const coupleRosaryId = "20000000-0000-4000-8000-000000000001";
  const coupleCreation = {
    action: "rosary_create",
    id: coupleRosaryId,
    scope: "couple",
    mystery: "joyful",
    mode: "sequential",
    startsWith: "me",
  };
  await act(coupleCreation);
  await act({ action: "rosary_release", id: coupleRosaryId, decade: 1 });
  await act(coupleCreation);
  assert.equal(
    (await act()).rosaries.find((r) => r.id === coupleRosaryId).slots.length,
    4,
    "An exact replay does not restore released reservations",
  );
  await assert.rejects(() =>
    act({
      action: "rosary_create",
      id: "20000000-0000-4000-8000-000000000002",
      mode: "free",
      mystery: "joyful",
    }),
  );
  await assert.rejects(() =>
    act({ action: "rosary_link", id: rid, habitKey: "rosary-habit" }),
  );
  await assert.rejects(
    () =>
      act({
        action: "group_create",
        name: "stale",
        displayName: "A",
        dataEpoch: 0,
      }),
    (e) => e.code === "PT409",
  );
  console.log(
    "PASS community: invitations, isolation, opt-in totals, couples, idempotence, order, linking, revocation, private drafts and aggregate consent metrics",
  );
} finally {
  await db.close();
}
