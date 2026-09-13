import assert from "node:assert/strict";
import { dom } from "./dom.mjs";
const React = await import("react");
const { render, screen, fireEvent, cleanup, waitFor } = await import(
  "@testing-library/react"
);
const { PurposeCard, RosaryCard, CommunityPanel } = await import(
  "../app/community.tsx"
);
const { MyPath } = await import("../app/my-path.tsx");
const { localDate } = await import("../lib/domain.ts");
const today = localDate(),
  calls = [];
const act = async (p) => {
  calls.push(p);
  return { groups: [], rosaries: [] };
};
const group = {
  id: "g",
  name: "Curso sintético",
  ownerId: "a",
  motto: "",
  ideal: "",
  version: 1,
  members: [{ id: "a", name: "A" }],
  purposes: [],
  meeting: null,
};
const purpose = {
  id: "p",
  title: "Escuchar",
  reason: "",
  start: today,
  end: today,
  target: 3,
  unit: "person",
  decision: "",
  version: 1,
  joined: true,
  share: false,
  logs: [],
  summary: null,
};
try {
  render(
    React.createElement(PurposeCard, {
      p: purpose,
      group,
      act,
      busy: false,
      userId: "a",
    }),
  );
  assert(screen.getByText("Sin registro este día.", { exact: false }));
  fireEvent.click(
    screen.getByRole("button", { name: "Registrar una ocasión" }),
  );
  await waitFor(() => assert.equal(calls.at(-1).amount, 1));
  assert.equal(calls.at(-1).version, 0);
  assert.equal(calls.at(-1).day, today);
  fireEvent.click(screen.getByRole("button", { name: /Compartir mi aporte al total/ }));
  assert.equal(screen.getByRole("checkbox").checked, false);
  fireEvent.click(screen.getByRole("button", { name: "Cerrar panel" }));
  cleanup();
  const r = {
    id: "r",
    ownerId: "a",
    groupId: "g",
    coupleId: null,
    mystery: "joyful",
    mode: "free",
    intention: "",
    cancelled: false,
    slots: [{ decade: 1, userId: "a", done: true }],
    mine: [{ decade: 1, day: today }],
  };
  render(
    React.createElement(RosaryCard, {
      r,
      act,
      busy: false,
      userId: "a",
      habits: [{ key: "h", data: { title: "Rezar", active: true } }],
    }),
  );
  assert.equal(
    screen.queryByRole("option", { name: "Rezar un rosario completo" }),
    null,
  );
  fireEvent.click(
    screen.getAllByRole("button", { name: "Rezar", exact: true })[0],
  );
  await screen.findByRole("dialog");
  const before = calls.length;
  fireEvent.click(screen.getByRole("button", { name: "Avemaría 10" }));
  assert.equal(calls.length, before, "Bead helpers never record completion");
  fireEvent.click(
    screen.getByRole("button", { name: "Terminé de rezar esta decena" }),
  );
  await waitFor(() => assert.equal(calls.at(-1).action, "rosary_complete"));
  assert.equal(calls.at(-1).decade, 2);
  cleanup();
  render(
    React.createElement(MyPath, {
      initialVersion: 2,
      draft: { stage: "discover", notes: "Mi borrador" },
      ideal: "",
      busy: false,
      onSave: async (d, v) => {
        calls.push({ d, v });
        return false;
      },
      onEditIdeal() {},
    }),
  );
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Sigue privado" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Guardar y continuar otro día" }),
  );
  await waitFor(() => assert.equal(calls.at(-1).v, 2));
  assert.equal(screen.getByRole("textbox").value, "Sigue privado");
  assert.equal(
    screen.queryByText("Guardado para retomarlo cuando quieras."),
    null,
  );
  cleanup();
  let finishSave;
  let saves = 0;
  render(
    React.createElement(MyPath, {
      initialVersion: 0,
      draft: { stage: "discover", notes: "" },
      ideal: "",
      busy: false,
      onSave: () => {
        saves++;
        return new Promise((resolve) => {
          finishSave = resolve;
        });
      },
      onEditIdeal() {},
    }),
  );
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Borrador pendiente" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Guardar y continuar otro día" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Guardar y continuar otro día" }),
  );
  assert.equal(saves, 1);
  assert(screen.getByRole("textbox").disabled);
  finishSave(true);
  await screen.findByText("Guardado para retomarlo cuando quieras.");
  const leaving = new dom.window.Event("beforeunload", { cancelable: true });
  window.dispatchEvent(leaving);
  assert.equal(
    leaving.defaultPrevented,
    false,
    "Saved drafts do not warn on exit",
  );
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Nueva edición sin guardar" },
  });
  assert.equal(
    screen.queryByText("Guardado para retomarlo cuando quieras."),
    null,
  );
  cleanup();
  render(
    React.createElement(CommunityPanel, {
      state: { groups: [group], rosaries: [] },
      act,
      userId: "a",
      name: "A",
      busy: false,
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: /Curso sintético/ }));
  assert.equal(screen.queryByText("PRIVATE DRAFT"), null);
  assert(screen.getByText("Identidad e integrantes"));
  cleanup();
  console.log(
    "PASS community UI: absent data, explicit logs, private consent, partial prayer linking, beads without writes, and failed-save draft preservation",
  );
} finally {
  cleanup();
  dom.window.close();
}
