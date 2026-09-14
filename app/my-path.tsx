import { useEffect, useRef, useState } from "react";
import {AppPanel} from "./app-panel";
import { PersonalIdealGuide, FormationSource } from "./formation-guide";
export function MyPath({
  draft,
  initialVersion,
  onSave,
  onEditIdeal,
  ideal,
  busy,
}: {
  draft?: { stage: string; notes: string };
  initialVersion: number;
  onSave: (
    d: { stage: string; notes: string },
    version: number,
  ) => Promise<boolean>;
  onEditIdeal: () => void;
  ideal: string;
  busy: boolean;
}) {
  const [choosing,setChoosing]=useState(!draft&&!ideal);
  const [version, setVersion] = useState(initialVersion);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(
    JSON.stringify({
      stage: draft?.stage || "learn",
      notes: draft?.notes || "",
    }),
  );
  const [stage, setStage] = useState(draft?.stage || "learn"),
    [notes, setNotes] = useState(draft?.notes || ""),
    [message, setMessage] = useState("");
  const dirty = saved !== JSON.stringify({ stage, notes });
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  return (
    <section className="card task-card ideal-workspace">
      <p className="eyebrow">MI CAMINO</p>
      <h2>Mi ideal personal</h2>
      {ideal && <p className="ideal-line">{ideal}</p>}
      {!choosing&&<button className="text-button" onClick={()=>setChoosing(true)}>Cambiar mi punto de partida</button>}
      {choosing&&<div
        className="choice-row"
        role="group"
        aria-label="Mi camino con el ideal"
      >
        {[
          ["ready", "Ya tengo un ideal"],
          ["discover", "Estoy descubriéndolo"],
          ["learn", "Quiero entender qué es"],
        ].map(([id, label]) => (
          <button
            key={id}
            className="soft-button"
            aria-pressed={stage === id}
            disabled={saving}
            onClick={() => {
              setStage(id);setChoosing(false);
              setMessage("");
            }}
          >
            {label}
          </button>
        ))}
      </div>}
      {!choosing&&<>{stage === "ready" ? (
        <button className="primary" disabled={saving} onClick={onEditIdeal}>
          Escribir o revisar mi ideal
        </button>
      ) : (
        <>
          <p>
            Tu ideal expresa quién estás llamado a ser. Podés ir descubriéndolo con acompañamiento.
          </p>
          <AppPanel title="Orientación para mi ideal" hint="Fuentes y acompañamiento del Movimiento" icon="book"><FormationSource topic="schedule"/><PersonalIdealGuide/></AppPanel>
          {stage === "discover" && (
            <>
              <p>¿Qué querés retomar con tu asesor?</p>
              <label>
                Mi borrador privado
                <textarea
                  rows={5}
                  maxLength={4000}
                  value={notes}
                  disabled={saving}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setMessage("");
                  }}
                  placeholder="Mis notas para retomar el discernimiento…"
                />
              </label>
            </>
          )}
        </>
      )}
      <button
        className="soft-button"
        disabled={busy || saving}
        onClick={async () => {
          if (savingRef.current) return;
          savingRef.current = true;
          setSaving(true);
          setMessage("");
          try {
            if (await onSave({ stage, notes }, version)) {
              setVersion((v) => v + 1);
              setSaved(JSON.stringify({ stage, notes }));
              setMessage("Guardado para retomarlo cuando quieras.");
            } else
              setMessage(
                "No se guardó. Tu borrador sigue aquí para reintentarlo.",
              );
          } catch {
            setMessage(
              "No se guardó. Tu borrador sigue aquí para reintentarlo.",
            );
          } finally {
            savingRef.current = false;
            setSaving(false);
          }
        }}
      >
        Guardar y continuar otro día
      </button>
      </>}
      {message && <p role="status">{message}</p>}
      <p className="form-hint">
        Estas notas permanecen privadas, incluso si compartís tu ideal o tu
        horario.
      </p>
    </section>
  );
}
