import { useState } from "react";
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
  const [version, setVersion] = useState(initialVersion);
  const [stage, setStage] = useState(draft?.stage || "learn"),
    [notes, setNotes] = useState(draft?.notes || ""),
    [message, setMessage] = useState("");
  return (
    <section className="card">
      <p className="eyebrow">MI CAMINO</p>
      <h2>Mi ideal personal</h2>
      {ideal && <p className="ideal-line">{ideal}</p>}
      <div
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
            onClick={() => setStage(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {stage === "ready" ? (
        <button className="primary" onClick={onEditIdeal}>
          Escribir o revisar mi ideal
        </button>
      ) : (
        <>
          <p>
            El ideal orienta tu vida y los actos concretos de tu horario. Podés
            continuar usando Alianza mientras lo discernís, sin apurar una
            frase.
          </p>
          <FormationSource topic="schedule" />
          <PersonalIdealGuide />
          {stage === "discover" && (
            <>
              <p>
                Consultá los materiales de tu rama y anotá lo que quieras llevar
                a una conversación con quien te acompaña. Este cuaderno no
                asigna ni certifica un ideal.
              </p>
              <label>
                Mi borrador privado
                <textarea
                  rows={5}
                  maxLength={4000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mis notas para retomar el discernimiento…"
                />
              </label>
            </>
          )}
        </>
      )}
      <button
        className="soft-button"
        disabled={busy}
        onClick={async () => {
          if (await onSave({ stage, notes }, version)) {
            setVersion((v) => v + 1);
            setMessage("Guardado para retomarlo cuando quieras.");
          }
        }}
      >
        Guardar y continuar otro día
      </button>
      {message && <p role="status">{message}</p>}
      <p className="form-hint">
        Estas notas permanecen privadas, incluso si compartís tu ideal o tu
        horario.
      </p>
    </section>
  );
}
