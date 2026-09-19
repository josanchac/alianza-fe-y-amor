import React, { useEffect, useState, useCallback } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {PilotPanel} from './pilot';
import {PilotEvents,type PilotEvent} from '../app/pilot-events';
import {InvitationAdmin} from './invitations';
import {SupportAdmin} from './support-admin';
import {PilotSupportContext} from '../app/pilot-support';
import {PilotPulse} from './pilot-pulse';
export type Activity = {
  asOf: string;
  suppressed: boolean;
  minimum: number;
  windowDays: number;
  consenting?: number;
  totals30?: Record<string, { count: number; people: number }>;
  cohorts?: { month: string; size: number; returnedWeek4: number }[];
};
export function AdminPanel({
  client,
  onBack,
  invitationsEnabled=false,
}: {
  client: SupabaseClient;
  onBack: () => void;
  invitationsEnabled?: boolean;
}) {
  const [section,setSection]=useState<'activity'|'invitations'|'support'>('activity');
  const [data, setData] = useState<Activity | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState("");
  async function refresh() {
    setBusy(true);
    setError("");
    setData(null);
    try {
      const { data, error } = await client.rpc("alianza_admin_activity");
      if (error) throw error;
      setData(data);
    } catch {
      setError("No se pudo cargar el resumen o ya no tenés acceso.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, [client]);
  const labels: Record<string, string> = {
    open: "Aperturas · días de uso",
    load_ok: "Cargas correctas",
    load_error: "Errores de carga",
    save_ok: "Guardados correctos",
    save_error: "Errores de guardado",
    slow_load: "Cargas mayores a 3 segundos",
    useful_yes: "Respuestas: me ayudó",
    useful_no: "Respuestas: no me ayudó",
  };
  return (
    <main className="admin-page">
      <button className="text-button" onClick={onBack}>
        ← Volver a mi espacio
      </button>
      <h1>Uso y mejora de Alianza</h1>
      {invitationsEnabled&&<nav className="admin-tabs" aria-label="Administración"><button aria-pressed={section==='activity'} onClick={()=>setSection('activity')}>Uso del piloto</button><button aria-pressed={section==='invitations'} onClick={()=>setSection('invitations')}>Personas e invitaciones</button><button aria-pressed={section==='support'} onClick={()=>setSection('support')}>Solicitudes y mejoras</button></nav>}
      {section==='invitations'?<InvitationAdmin client={client}/>:section==='support'?<SupportAdmin client={client}/>:<>
      <PilotPulse client={client}/><details className="admin-detail"><summary>Detalle de uso de los últimos 30 días</summary><PilotPanel client={client}/></details><details className="admin-detail"><summary>Medición general voluntaria</summary><h2>Medición general</h2>
      <section className="admin-privacy">
        <strong>Sin actividad individual ni contenido espiritual.</strong>
        <p>
          No se consultan propósitos, ideales, intenciones, reflexiones,
          confesiones ni registros personales. Los grupos pequeños y sus
          desgloses permanecen reservados.
        </p>
      </section>
      <button className="primary" onClick={refresh} disabled={busy}>
        {busy ? "Cargando…" : "Actualizar resumen"}
      </button>
      {error && <p role="alert">{error}</p>}
      {data &&
        (data.suppressed ? (
          <p className="card">
            Todavía no hay suficientes participantes que hayan aceptado la
            medición. Se necesitan al menos {data.minimum}; las métricas
            continúan reservadas.
          </p>
        ) : (
          <>
            <h2>Últimos 30 días</h2>
            <p>
              {data.consenting} cuentas aceptan la medición. Es una muestra
              voluntaria, no representa a todos los usuarios.
            </p>
            <div className="admin-stats">
              {Object.entries(data.totals30 || {}).map(([event, v]) => (
                <div key={event}>
                  <strong>{v.count}</strong>
                  <span>{labels[event]}</span>
                  <small>{v.people} participantes</small>
                </div>
              ))}
            </div>
            <p>
              Los indicadores ausentes están reservados por tamaño de muestra;
              no significan cero errores. Las respuestas de utilidad son
              voluntarias y pueden repetirse en días diferentes.
            </p>
            <h2>Continuidad en la cuarta semana</h2>
            {data.cohorts?.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Mes de incorporación a medición</th>
                    <th>Participantes observables</th>
                    <th>Regresaron en semana 4</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cohorts.map((c) => (
                    <tr key={c.month}>
                      <td>{c.month}</td>
                      <td>{c.size}</td>
                      <td>
                        {c.returnedWeek4} (
                        {Math.round((100 * c.returnedWeek4) / c.size)} %)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>
                Aún no hay cohortes maduras con tamaño suficiente para mostrar
                resultados.
              </p>
            )}
            <details>
              <summary>Cómo interpretar estos indicadores</summary>
              <p>
                HEART: utilidad declarada, continuidad y éxito de tareas. Cada
                apertura cuenta una vez por persona y día. Retención: al menos
                una apertura entre los días 21 y 27 desde aceptar la medición;
                solo cohortes con 28 días observables. No se infiere crecimiento
                espiritual.
              </p>
              <p>
                Se conservan hasta 90 días de eventos técnicos, sin rutas,
                textos ni horas exactas. Umbral mínimo de cinco personas; las
                cohortes requieren también cinco en cada resultado. No hay
                filtros por curso ni fichas personales. No calcular tasas con
                categorías ocultas.
              </p>
              <p>
                Un cambio entre versiones es descriptivo y no prueba causalidad.
                Registrar hipótesis y complementar con pruebas e entrevistas.
              </p>
            </details>
          </>
        ))}
      </details></>}
    </main>
  );
}
export function UserEnvironment({
  client,
  userId,
  children,
  onConsentChange,
  onPilotChange,
  invitationsEnabled=false,
}: {
  client: SupabaseClient;
  userId: string;
  children: React.ReactNode;
  onConsentChange?: (enabled: boolean) => void;
  onPilotChange?: (enabled: boolean) => void;
  invitationsEnabled?: boolean;
}) {
  const [admin, setAdmin] = useState(false),
    [show, setShow] = useState(false),
    [enabled, setEnabled] = useState(false),
    [error, setError] = useState(""),
    [answer, setAnswer] = useState("");
  const [pilot,setPilot]=useState(false);
  const [pilotOptional,setPilotOptional]=useState(false);
  const recordPilot=useCallback((event:PilotEvent)=>{if(pilot)void client.rpc('alianza_pilot_metrics',{payload:{action:'event',event}}).then(()=>{});},[client,pilot]);
  useEffect(()=>{let active=true;setPilot(false);client.rpc('alianza_pilot_metrics',{payload:{action:'status'}}).then(({data,error})=>{if(active&&!error){setPilot(!!data?.enabled);setPilotOptional(!!data?.optional);}});return()=>{active=false;};},[client,userId]);
  useEffect(()=>{onPilotChange?.(pilot);if(!pilot)return;const record=()=>{if(document.visibilityState==='visible')void client.rpc('alianza_pilot_metrics',{payload:{action:'event',event:'open'}}).then(()=>{});};record();document.addEventListener('visibilitychange',record);return()=>document.removeEventListener('visibilitychange',record);},[client,pilot,onPilotChange]);
  useEffect(() => {
    let active = true;
    client.rpc("alianza_is_admin").then(({ data, error }) => {
      if (active) setAdmin(!error && data === true);
    });
    client
      .rpc("alianza_product_metrics", { payload: { action: "status" } })
      .then(({ data, error }) => {
        if (active && !error) setEnabled(!!data?.enabled);
      });
    return () => {
      active = false;
    };
  }, [client, userId]);
  useEffect(() => {
    onConsentChange?.(enabled);
  }, [enabled, onConsentChange]);
  useEffect(() => {
    if (!enabled) return;
    const record = () => {
      if (document.visibilityState === "visible")
        void client
          .rpc("alianza_product_metrics", {
            payload: { action: "event", event: "open" },
          })
          .then(() => {});
    };
    record();
    document.addEventListener("visibilitychange", record);
    return () => document.removeEventListener("visibilitychange", record);
  }, [client, enabled]);
  const supportAPI=useCallback(async(p:Record<string,unknown>)=>{const r=await client.rpc('alianza_pilot_support',{p});if(r.error)throw r.error;return r.data;},[client]);
  return (
    <>
      {show && <AdminPanel client={client} invitationsEnabled={invitationsEnabled} onBack={() => setShow(false)} />}
      <div className="user-environment" hidden={show}>
        {admin && (
          <div className="admin-entry">
            <button onClick={() => setShow(true)}>Uso y mejora</button>
          </div>
        )}
        <PilotSupportContext.Provider value={supportAPI}><PilotEvents.Provider value={recordPilot}>{children}</PilotEvents.Provider></PilotSupportContext.Provider>
        <details className="activity-disclosure">
          <summary>Ayudar a mejorar Alianza</summary>
          {pilotOptional&&<><h3>Métricas del piloto</h3><p>Funciones utilizadas y errores, sin tus textos. El administrador ve agregados; en un grupo pequeño pueden permitir deducciones.</p><label><input type="checkbox" checked={pilot} onChange={async e=>{const value=e.target.checked;const r=await client.rpc('alianza_pilot_metrics',{payload:{action:'consent',enabled:value}});if(r.error)setError('No pudimos guardar tu elección.');else{setPilot(!!r.data?.enabled);setError('');}}}/>Aportar métricas de uso al piloto</label><p>Al desactivar se eliminan tus eventos del piloto. Conservás el acceso a Alianza.</p></>}
          <h3>Medición general</h3>
          <p>
            Podés compartir señales técnicas de uso, guardados y errores. No se
            envían textos, nombres de compromisos, pantallas visitadas ni
            respuestas del examen de conciencia. Los datos se vinculan
            internamente con tu cuenta para medir retornos; no son anónimos. El
            panel solo muestra agregados protegidos.
          </p>
          <label className="consent-label">
            <input
              type="checkbox"
              checked={enabled}
              onChange={async (e) => {
                const value = e.target.checked;
                const { error } = await client.rpc("alianza_product_metrics", {
                  payload: { action: "consent", enabled: value },
                });
                if (error) setError("No pudimos guardar esta preferencia.");
                else {
                  setEnabled(value);
                  setError("");
                }
              }}
            />
            Acepto participar en la medición de mejora
          </label>
          <p>
            Al desactivar se eliminan tus eventos de esta medición. Podés usar
            todas las funciones sin participar.
          </p>
          {enabled && (
            <>
              <p>¿Alianza te ayudó con lo que querías hacer hoy?</p>
              {["Sí", "No"].map((v, i) => (
                <button
                  className="soft-button"
                  key={v}
                  onClick={async () => {
                    const { error } = await client.rpc(
                      "alianza_product_metrics",
                      {
                        payload: {
                          action: "event",
                          event: i ? "useful_no" : "useful_yes",
                        },
                      },
                    );
                    setAnswer(
                      error
                        ? "No se pudo enviar."
                        : "Gracias por ayudarnos a mejorar.",
                    );
                  }}
                >
                  {v}
                </button>
              ))}
              <p role="status">{answer}</p>
            </>
          )}
          {error && <p role="alert">{error}</p>}
        </details>
      </div>
    </>
  );
}
