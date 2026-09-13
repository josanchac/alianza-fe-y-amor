import { useState, useRef } from "react";
import {QuietProgress} from "./quiet-progress";
import {AppPanel} from "./app-panel";
import {
  Heart,
  Plus,
  Users,
  ArrowRight,
  Check,
  Copy,
  CalendarDays,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  type CommunityState,
  type CommunityGroup,
  type CommunityAction,
  type GroupPurpose,
  type Rosary,
  type Mystery,
  MYSTERIES,
  mysteriesFor,
  completedDecades,
  personalProgress,
} from "@/lib/community";
import { PersonalSymbol } from "./personal-symbol";
import { localDate } from "@/lib/domain";

type Props = {
  state: CommunityState;
  act: CommunityAction;
  userId: string;
  name: string;
  coupleId?: string | null;
  busy: boolean;
  onReload?: () => void;
};
function Form({
  title,
  children,
  submit,
  busy,
  submitLabel="Guardar",
}: {
  submitLabel?:string;
  title: string;
  children: React.ReactNode;
  submit: (f: FormData) => Promise<unknown>;
  busy: boolean;
}) {
  const [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const editing = useRef<typeof submit | null>(null),
    sending = useRef(false);
  return (
    <form
      onChange={() => {
        if (!editing.current) editing.current = submit;
        setSaved(false);
      }}
      className="editor-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (sending.current || saved) return;
        sending.current = true;
        const data = new FormData(e.currentTarget);
        setError("");
        try {
          await (editing.current ?? submit)(data);
          editing.current = null;
          setSaved(true);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          sending.current = false;
        }
      }}
    >
      <h3>{title}</h3>
      {children}
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      <button className="primary" disabled={busy || saved} type="submit">
        {saved ? "Guardado" : submitLabel}
      </button>
      {saved && <p role="status">Guardado correctamente.</p>}
    </form>
  );
}
function Input({
  label,
  name,
  value = "",
  required = false,
  max = 240,
  type = "text",
}: {
  label: string;
  name: string;
  value?: string;
  required?: boolean;
  max?: number;
  type?: string;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        defaultValue={value}
        required={required}
        maxLength={max}
        type={type}
      />
    </label>
  );
}

export function PurposeCard({
  p,
  group,
  act,
  busy,
  coupleId,
  userId,
  compact = false,
}: {
  p: GroupPurpose;
  group: CommunityGroup;
  act: CommunityAction;
  busy: boolean;
  coupleId?: string | null;
  userId: string;
  compact?: boolean;
}) {
  const [day, setDay] = useState(localDate()),
    [error, setError] = useState(""), [feedback,setFeedback]=useState(""), [dateOpen,setDateOpen]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const sending=useRef(false);
  const log = p.logs.find((l) => l.day === day);
  const current = localDate() >= p.start && localDate() <= p.end;
  async function send(v: Record<string, unknown>) {
    if(sending.current)return; sending.current=true;setError("");setFeedback("");
    try {
      await act({ ...v, id: p.id, groupId: group.id });
      if(v.action==="purpose_log")setFeedback("Registro actualizado");
    } catch (e) {
      setError((e as Error).message);
    } finally {sending.current=false;}
  }
  if(compact&&!expanded){const todayLog=p.logs.find(l=>l.day===localDate());return <section className="card purpose-quick"><div><p className="eyebrow">{group.name}</p><h3>{p.title}</h3><p>{personalProgress(p)} de {p.target} ocasiones</p></div><button className="quick-mark" aria-label={'Registrar ocasión: '+p.title} disabled={busy||!p.joined||(todayLog?.amount??0)>=20||!current} onClick={()=>send({action:'purpose_log',day:localDate(),amount:(todayLog?.amount??0)+1,version:todayLog?.version??0})}><Plus size={22}/></button><button className="text-button purpose-detail" onClick={()=>setExpanded(true)}>Ver o corregir<ArrowRight size={16}/></button>{feedback&&<p className="quiet-feedback" role="status">{feedback}</p>}{error&&<p role="alert">{error}</p>}</section>;}
  return (
    <section className="card purpose-card">
      {compact&&<button className="text-button" onClick={()=>setExpanded(false)}>Cerrar detalle</button>}
      <p className="eyebrow">{compact ? group.name : "NUESTRO PROPÓSITO"}</p>
      <h3>{p.title}</h3>
      <div className="purpose-meta"><span><CalendarDays size={14}/>{new Date(p.start+'T12:00:00').toLocaleDateString('es-CR',{day:'numeric',month:'short'})}{p.start!==p.end?' – '+new Date(p.end+'T12:00:00').toLocaleDateString('es-CR',{day:'numeric',month:'short'}):''}</span><span>{p.unit==='couple'?'En matrimonio':'Personal'}</span></div>
      {p.reason && <p className="purpose-intention">{p.reason}</p>}
      {!p.joined ? (
        <>
          <button
            className="primary"
            disabled={
              busy || (!coupleId && p.unit === "couple") || localDate() > p.end
            }
            onClick={() => send({ action: "purpose_join", share: false })}
          >
            Incorporar a mi horario
          </button>
          {!coupleId && p.unit === "couple" && (
            <p>
              Este propósito se registra por matrimonio. Vinculá las cuentas
              para participar juntos.
            </p>
          )}
        </>
      ) : (
        <>
          <QuietProgress value={personalProgress(p)} total={p.target} label="Mi avance del propósito"/>
          <div className="purpose-register">
            <div className="purpose-day"><span>{day===localDate()?'Hoy':new Date(day+'T12:00:00').toLocaleDateString('es-CR',{day:'numeric',month:'long'})}</span><button className="text-button" onClick={()=>setDateOpen(!dateOpen)} aria-expanded={dateOpen}>Cambiar día</button></div>
            {dateOpen&&<label className="purpose-date-field">
              Elegir día
              <input
                aria-label={"Día para " + p.title}
                type="date"
                min={p.start}
                max={p.end < localDate() ? p.end : localDate()}
                value={day}
                onChange={(e) => {setDay(e.target.value);setFeedback("");}}
              />
            </label>}
            <button
              className="primary purpose-action"
              aria-label="Registrar una ocasión"
              disabled={
                busy ||
                day < p.start ||
                day > p.end ||
                day > localDate() ||
                (log?.amount ?? 0) >= 20
              }
              onClick={() =>
                send({
                  action: "purpose_log",
                  day,
                  amount: (log?.amount ?? 0) + 1,
                  version: log?.version ?? 0,
                })
              }
            >
              <Plus size={16} />
              Lo viví {day===localDate()?'hoy':'ese día'}
            </button>
            {log && (
              <button
                className="text-button"
                disabled={busy || log.amount === 0}
                onClick={() =>
                  send({
                    action: "purpose_log",
                    day,
                    amount: Math.max(0, log.amount - 1),
                    version: log.version,
                  })
                }
              >
                Corregir −1
              </button>
            )}
          </div>
          <p className="purpose-day-note">{log ? `${log.amount} ${log.amount===1?'ocasión registrada':'ocasiones registradas'} este día.` : "Sin registro este día."}</p>
          {feedback&&<p className="quiet-feedback" role="status"><Check size={16}/>{feedback}</p>}
          {p.unit === "couple" && (
            <p className="form-hint">
              El registro es común para ambos cónyuges que acepten este
              propósito.
            </p>
          )}
          <AppPanel title="Compartir mi aporte al total" hint={p.share?"Incluido en el resumen del grupo":"Solo para mí"} icon="privacy">
            {error&&<p role="alert" className="form-error">{error}</p>}
            <label className="consent-label">
              <input
                type="checkbox"
                checked={p.share}
                disabled={busy}
                onChange={(e) =>
                  send({ action: "purpose_join", share: e.target.checked })
                }
              />
              Acepto incluir mi avance en el resumen colectivo.
            </label>
            <p>
              Sin detalle individual. Para matrimonios deben aceptar ambos. Un
              grupo pequeño puede permitir deducciones; por eso algunos
              resultados se ocultan.
            </p>
          </AppPanel>
        </>
      )}
      {!compact && (
        <details className="optional-details">
          <summary>Revisión y avance del curso</summary>
          {p.summary ? (
            <p>
              {p.summary.amount} de {p.summary.target} ocasiones previstas
              registradas · {p.summary.recordedUnits} de {p.summary.units}{" "}
              unidades participantes con registro compartido.
            </p>
          ) : (
            <p>
              Resumen reservado hasta contar con suficientes aportes
              compartidos. No se muestra quién está pendiente.
            </p>
          )}
          <p>
            Para conversar: ¿qué ayudó a vivir el propósito? ¿Qué ajustaríamos?
            Cada persona comparte solo lo que elija; la app no guarda respuestas
            privadas aquí.
          </p>
          {p.decision && (
            <p className="preserve">
              <strong>Acuerdo del curso:</strong> {p.decision}
            </p>
          )}
          {group.ownerId === userId && (
            <Form
              title="Acuerdo de revisión"
              busy={busy}
              submit={(f) =>
                act({
                  action: "purpose_review",
                  id: p.id,
                  groupId: group.id,
                  version: p.version,
                  decision: f.get("decision"),
                })
              }
            >
              <label>
                Continuar, ajustar o elegir otro propósito
                <textarea
                  name="decision"
                  defaultValue={p.decision}
                  maxLength={500}
                />
              </label>
            </Form>
          )}
        </details>
      )}
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
    </section>
  );
}
export function CreateRosary({
  act,
  busy,
  coupleId,
  groupId,
  onCreated,
}: {
  act: CommunityAction;
  busy: boolean;
  coupleId?: string | null;
  groupId?: string;
  onCreated?: () => void;
}) {
  const [scope, setScope] = useState(groupId ? "group" : "personal");
  const [id, setId] = useState(() => crypto.randomUUID());
  return (
    <Form
      title="Preparar mi rosario"
      submitLabel="Comenzar el rosario"
      busy={busy}
      submit={async (f) => {
        await act({
          action: "rosary_create",
          id,
          scope,
          ...(groupId ? { groupId } : {}),
          mystery: f.get("mystery"),
          mode: f.get("mode"),
          intention: f.get("intention"),
          startsWith: f.get("startsWith") || "me",
        });
        setId(crypto.randomUUID());
        onCreated?.();
      }}
    >
      {!groupId && (
        <label>
          ¿Con quién?
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="personal">Personal</option>
            {coupleId && <option value="couple">Con mi pareja</option>}
          </select>
        </label>
      )}
      <label>
        Misterios
        <select name="mystery" defaultValue={mysteriesFor(localDate())}>
          {Object.entries(MYSTERIES).map(([id, m]) => (
            <option value={id} key={id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <div hidden={scope==='personal'}><label>
        Forma de rezarlo
        <select name="mode">
          <option value="free">Repartir las decenas libremente</option>
          <option value="sequential">
            En orden, una decena después de otra
          </option>
        </select>
      </label>
      {scope === "couple" && (
        <label>
          Si rezamos en orden, empieza
          <select name="startsWith">
            <option value="me">Yo</option>
            <option value="partner">Mi pareja</option>
          </select>
        </label>
      )}
      </div><Input label="Intención (opcional)" name="intention" max={500} />
      <p className="form-hint">
        {groupId
          ? "La intención y las reservas serán visibles en este grupo."
          : scope === "couple"
            ? "La intención y las reservas serán visibles para tu pareja."
            : "Este rosario queda en tu espacio personal."}{" "}
        Cinco decenas; permanece abierto hasta completarse o cancelarse.
      </p>
    </Form>
  );
}
export function RosaryCard({
  r,
  act,
  busy,
  userId,
  names = {},
  canManage = false,
  habits = [],
  onLinked,
}: {
  r: Rosary;
  act: CommunityAction;
  busy: boolean;
  userId: string;
  names?: Record<string, string>;
  canManage?: boolean;
  habits?: { key: string; data: { title: string; active: boolean } }[];
  onLinked?: () => void;
}) {
  const [focus,setFocus]=useState(()=>r.slots.find(s=>s.userId===userId&&!s.done)?.decade??[1,2,3,4,5].find(n=>!r.slots.some(s=>s.decade===n&&s.done))??1);
  const [selected, setSelected] = useState<number | null>(null),
    [bead, setBead] = useState(0),
    [error, setError] = useState(""),
    [linkKind, setLinkKind] = useState("decade");
  const count = completedDecades(r),
    mineToday = r.mine.filter((c) => c.day === localDate()).length;
  async function send(a: string, extra: Record<string, unknown> = {}) {
    setError("");
    try {
      await act({ action: a, id: r.id, ...extra });
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  }
  return (
    <section
      className={"card rosary-card " + (count === 5 ? "rosary-finished" : "")}
    >
      <p className="eyebrow">
        {r.groupId
          ? "ROSARIO DEL GRUPO"
          : r.coupleId
            ? "ROSARIO EN PAREJA"
            : "MI ROSARIO"}
      </p>
      <h3>Misterios {MYSTERIES[r.mystery].name.toLowerCase()}</h3>
      {r.intention && <p className="preserve">{r.intention}</p>}
      <p role="status">
        {r.cancelled
          ? "Encuentro cancelado"
          : count === 5
            ? "Completamos juntos este rosario"
            : `${count} de 5 decenas completadas`}
      </p>
      <div className="rosary-choices" role="group" aria-label="Elegir mi decena">
        {[1,2,3,4,5].map(n=>{const done=r.slots.some(s=>s.decade===n&&s.done);return <button key={n} aria-pressed={focus===n} aria-label={`Decena ${n}: ${MYSTERIES[r.mystery].items[n-1]}${done?', completada':''}`} onClick={()=>setFocus(n)} className={done?'decade-done':''}><span>{done?<Check size={18}/>:n}</span><small>{done?'Rezada':`${n}ª`}</small></button>;})}
      </div>
      <div className="rosary-focus">
        {MYSTERIES[r.mystery].items.map((title, i) => {
          if(i+1!==focus)return null;
          const n = i + 1,
            s = r.slots.find((s) => s.decade === n),
            mine = r.mine.some((c) => c.decade === n),
            blocked = !!s && !s.done && s.userId !== userId;
          return (
            <div className="decade-row" key={n}>
              <div>
                <strong>
                  {n}. {title}
                </strong>
                <p className="muted">
                  {s?.done
                    ? "Completada"
                    : s
                      ? `Reservada por ${s.userId === userId ? "vos" : names[s.userId] || "otra persona"}`
                      : "Disponible"}
                  {mine ? " · Aportaste esta decena" : ""}
                </p>
              </div>
              {!r.cancelled && !mine && !blocked && (
                <button
                  className="soft-button"
                  disabled={busy}
                  onClick={() => {
                    setSelected(n);
                    setBead(0);
                  }}
                >
                  {s?.done ? "Acompañar" : "Rezar"}
                </button>
              )}
              {!r.cancelled && !s && (
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() => send("rosary_reserve", { decade: n })}
                >
                  Reservar
                </button>
              )}
              {!r.cancelled &&
                s &&
                !s.done &&
                (s.userId === userId || canManage || r.ownerId === userId) && (
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() => send("rosary_release", { decade: n })}
                  >
                    Liberar
                  </button>
                )}
            </div>
          );
        })}
      </div>
      <AppPanel title="Cómo rezamos juntos" hint={r.mode==='sequential'?'Una decena después de otra':'Cada persona elige su aporte'} icon="heart"><p>Pueden participar más de cinco personas acompañando decenas completadas. El avance común cuenta cada decena una sola vez.</p>{r.mode==='sequential'&&<p>Las confirmaciones siguen el orden de los misterios.</p>}</AppPanel>
      {r.mine.length > 0 && (
        <p>
          Tu aporte: {r.mine.length}{" "}
          {r.mine.length === 1 ? "decena" : "decenas"}
          {count === 5 ? " a un rosario completado" : ""}.
        </p>
      )}
      {mineToday > 0 && habits.some((h) => h.data.active) && (
        <details className="optional-details">
          <summary>Marcar un compromiso de hoy</summary>
          <Form
            title="Relacionar mi aporte"
            busy={busy}
            submit={async (f) => {
              if (
                await send("rosary_link", {
                  kind: linkKind,
                  habitKey: f.get("habitKey"),
                })
              )
                onLinked?.();
            }}
          >
            <label>
              Mi compromiso pide
              <select
                value={linkKind}
                onChange={(e) => setLinkKind(e.target.value)}
              >
                <option value="decade">Rezar una decena</option>
                {(r.groupId || r.coupleId) && (
                  <option value="community">
                    Participar en un rosario compartido
                  </option>
                )}
                {mineToday === 5 && (
                  <option value="full">Rezar un rosario completo</option>
                )}
              </select>
            </label>
            <label>
              Compromiso que quiero marcar
              <select name="habitKey">
                {habits
                  .filter((h) => h.data.active)
                  .map((h) => (
                    <option key={h.key} value={h.key}>
                      {h.data.title}
                    </option>
                  ))}
              </select>
            </label>
            <p>
              Elegí un compromiso que corresponda a tu aporte. Una decena no
              completa un rosario personal entero. La marca diaria no se
              duplica.
            </p>
          </Form>
        </details>
      )}
      {(canManage || r.ownerId === userId) && !r.cancelled && count < 5 && (
        <details className="optional-details">
          <summary>Administrar este encuentro</summary>
          <button
            className="text-button"
            disabled={busy}
            onClick={() => send("rosary_cancel")}
          >
            Cancelar el encuentro
          </button>
        </details>
      )}
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      <Dialog
        open={selected !== null}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
      >
        <DialogContent className="editor-dialog">
          <DialogTitle>
            {selected !== null ? MYSTERIES[r.mystery].items[selected - 1] : ""}
          </DialogTitle>
          <DialogDescription>
            Una decena · Meditá este misterio a tu ritmo.
          </DialogDescription>
          <p>Rezá un Padre nuestro, diez Avemarías y un Gloria.</p>
          <div
            className="prayer-beads"
            role="group"
            aria-label="Ayuda para contar diez Avemarías"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <button
                key={i}
                aria-label={`Avemaría ${i + 1}`}
                aria-pressed={i < bead}
                onClick={() => setBead(i + 1)}
              >
                {i < bead ? <Check size={16} /> : i + 1}
              </button>
            ))}
          </div>
          <p className="form-hint">
            Las cuentas son una ayuda; no confirman el rezo automáticamente.
          </p>
          <details>
            <summary>Oraciones para consultar</summary>
            <p>
              Padre nuestro, que estás en el cielo, santificado sea tu Nombre;
              venga a nosotros tu reino; hágase tu voluntad en la tierra como en
              el cielo. Danos hoy nuestro pan de cada día; perdona nuestras
              ofensas, como también nosotros perdonamos a los que nos ofenden;
              no nos dejes caer en la tentación, y líbranos del mal. Amén.
            </p>
            <p>
              Dios te salve, María, llena eres de gracia; el Señor es contigo.
              Bendita tú eres entre todas las mujeres, y bendito es el fruto de
              tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros,
              pecadores, ahora y en la hora de nuestra muerte. Amén.
            </p>
            <p>
              Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el
              principio, ahora y siempre, por los siglos de los siglos. Amén.
            </p>
          </details>
          <a
            href="https://www.vatican.va/special/rosary/documents/misteri_sp.html"
            target="_blank"
            rel="noreferrer"
          >
            Consultar los misterios · Santa Sede
          </a>
          {error && <p role="alert">{error}</p>}
          <button
            className="primary"
            disabled={busy}
            onClick={async () => {
              if (await send("rosary_complete", { decade: selected }))
                setSelected(null);
            }}
          >
            Terminé de rezar esta decena
          </button>
          <button
            className="text-button"
            disabled={busy}
            onClick={async () => {
              if (await send("rosary_complete", { decade: selected }))
                setSelected(null);
            }}
          >
            Ya la recé por mi cuenta
          </button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
export function CommunityPanel({
  state,
  act,
  userId,
  name,
  coupleId,
  busy,
}: Props) {
  const [createGroupId, setCreateGroupId] = useState(() => crypto.randomUUID()),
    [createPurposeId, setCreatePurposeId] = useState(() => crypto.randomUUID());
  const [groupView,setGroupView]=useState("now");
  const [groupId, setGroupId] = useState(""),
    [create, setCreate] = useState(false),
    [joinToken, setJoinToken] = useState(
      () => new URLSearchParams(location.hash.slice(1)).get("grupo") || "",
    ),
    [preview, setPreview] = useState(""),
    [token, setToken] = useState(""),
    [error, setError] = useState(""),
    [copied, setCopied] = useState(false);
  const group = state.groups.find((g) => g.id === groupId);
  const owner = group?.ownerId === userId;
  async function send(p: Record<string, unknown>) {
    setError("");
    try {
      return await act(p);
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }
  const names = Object.fromEntries(
    group?.members.map((m) => [m.id, m.name]) ?? [],
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">EN COMUNIDAD</p>
          <h1>{group?.name || "Mis cursos y grupos"}</h1>
        </div>
        {group ? (
          <PersonalSymbol symbol={group.symbol || "heart"} size={30} />
        ) : (
          <Users size={30} />
        )}
      </div>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {!group ? (
        <>
          <p className="intro">
            Un propósito común. Un vínculo que crece entre encuentros.
          </p>
          {state.groups.map((g) => (
            <button
              key={g.id}
              className="card home-option"
              onClick={() => {setGroupId(g.id);setGroupView("now");}}
            >
              <strong>{g.name}</strong>
              <span>{g.motto || "Abrir nuestro espacio"}</span>
              <ArrowRight />
            </button>
          ))}
          <button className="soft-button" onClick={() => setCreate(!create)}>
            <Plus size={18} />
            Crear un grupo
          </button>
          {create && (
            <section className="card">
              <Form
                title="Nuevo curso o grupo"
                busy={busy}
                submit={async (f) => {
                  await act({
                    action: "group_create",
                    id: createGroupId,
                    name: f.get("name"),
                    displayName: f.get("displayName"),
                  });
                  setCreateGroupId(crypto.randomUUID());
                  setCreate(false);
                }}
              >
                <Input label="Nombre del grupo" name="name" required max={80} />
                <Input
                  label="Mi nombre visible en este grupo"
                  name="displayName"
                  value={name}
                  required
                  max={60}
                />
              </Form>
            </section>
          )}
          <details className="card optional-details" open={!!joinToken}>
            <summary>Tengo una invitación</summary>
            <label>
              Código de invitación
              <input
                value={joinToken}
                onChange={(e) => {
                  setJoinToken(e.target.value.trim());
                  setPreview("");
                }}
                maxLength={64}
              />
            </label>
            <button
              className="soft-button"
              disabled={busy || !joinToken}
              onClick={async () => {
                const v = await send({
                  action: "invite_preview",
                  token: joinToken,
                });
                if (v) setPreview(v.invitation.name);
              }}
            >
              Consultar invitación
            </button>
            {preview && (
              <Form
                title={"Unirme a " + preview}
                busy={busy}
                submit={async (f) => {
                  await act({
                    action: "invite_join",
                    token: joinToken,
                    displayName: f.get("displayName"),
                  });
                  setPreview("");
                  setJoinToken("");
                  history.replaceState(
                    null,
                    "",
                    location.pathname + location.search,
                  );
                }}
              >
                <Input
                  label="Mi nombre visible"
                  name="displayName"
                  required
                  max={60}
                  value={name}
                />
                <p>
                  El grupo verá tu nombre, reservas y aportes al rosario, y tus
                  confirmaciones de asistencia. Tu horario, ideales y
                  reflexiones siguen privados. El avance de propósitos solo se
                  comparte si lo elegís.
                </p>
              </Form>
            )}
          </details>
        </>
      ) : (
        <>
          <button
            className="text-button"
            onClick={() => {
              setGroupId("");
              setToken("");
            }}
          >
            ← Todos mis grupos
          </button>
          {group.motto && <p className="intro">{group.motto}</p>}
          <div className="view-switch group-views" role="group" aria-label="Secciones del grupo">{[['now','Propósito'],['prayer','Rosario'],['meeting','Encuentro'],['manage',owner?'Organizar':'Integrantes']].map(([v,label])=><button key={v} aria-pressed={groupView===v} onClick={()=>setGroupView(v)}>{label}</button>)}</div>
          <div className="group-active">
            <div hidden={groupView!=="now"}>{!group.purposes.some(p=>p.start<=localDate()&&p.end>=localDate())&&<p className="empty-text">Cuando acuerden un propósito aparecerá aquí.</p>}{group.purposes
              .filter((p) => p.start <= localDate() && p.end >= localDate())
              .slice(0, 1)
              .map((p) => (
                <PurposeCard
                  key={p.id}
                  p={p}
                  group={group}
                  act={act}
                  userId={userId}
                  coupleId={coupleId}
                  busy={busy}
                />
              ))}
            </div><div hidden={groupView!=="prayer"}>{state.rosaries
              .filter(
                (r) =>
                  r.groupId === group.id &&
                  !r.cancelled &&
                  completedDecades(r) < 5,
              )
              .slice(0, 1)
              .map((r) => (
                <RosaryCard
                  key={r.id}
                  r={r}
                  act={act}
                  busy={busy}
                  userId={userId}
                  names={names}
                  canManage={owner}
                />
              ))}
            </div><div hidden={groupView!=="meeting"}>{!group.meeting&&<p className="empty-text">Todavía no hay un encuentro preparado.</p>}{group.meeting && (
              <section className="card">
                <p className="eyebrow">PRÓXIMO ENCUENTRO</p>
                <h3>
                  {group.meeting.data.date} · {group.meeting.data.time}
                </h3>
                <p>{group.meeting.data.place}</p>
                {group.meeting.data.material && (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={group.meeting.data.material}
                  >
                    Abrir material de preparación
                  </a>
                )}
                {group.meeting.data.question && (
                  <p>{group.meeting.data.question}</p>
                )}
                {group.meeting.data.roles && (
                  <p>Preparación: {group.meeting.data.roles}</p>
                )}
                <div className="choice-row">
                  {[true, false].map((v) => (
                    <button
                      key={String(v)}
                      className="soft-button"
                      aria-pressed={group.meeting!.responses.some(
                        (r) => r.userId === userId && r.attending === v,
                      )}
                      disabled={busy}
                      onClick={() =>
                        send({
                          action: "meeting_rsvp",
                          groupId: group.id,
                          version: group.meeting!.version,
                          attending: v,
                        })
                      }
                    >
                      {v ? "Voy a participar" : "Esta vez no puedo"}
                    </button>
                  ))}
                </div>
                <details>
                  <summary>Confirmaciones de asistencia</summary>
                  {group.meeting.responses.map((r) => (
                    <p key={r.userId}>
                      {names[r.userId] || "Participante"}:{" "}
                      {r.attending ? "Participará" : "No participará"}
                    </p>
                  ))}
                </details>
              </section>
            )}
          </div></div>
          <div hidden={groupView!=="prayer"}><details className="card optional-details">
            <summary>Iniciar un rosario</summary>
            <CreateRosary act={act} busy={busy} groupId={group.id} />
          </details></div>
          <div hidden={groupView!=="manage"}>{owner && (
            <div><details className="card optional-details">
              <summary>Proponer un propósito</summary>
              <Form
                title="Nuestro próximo propósito"
                busy={busy}
                submit={async (f) => {
                  await act({
                    action: "purpose_create",
                    id: createPurposeId,
                    groupId: group.id,
                    title: f.get("title"),
                    reason: f.get("reason"),
                    start: f.get("start"),
                    end: f.get("end"),
                    target: Number(f.get("target")),
                    unit: f.get("unit"),
                  });
                  setCreatePurposeId(crypto.randomUUID());
                }}
              >
                <Input
                  label="Lo que acordamos practicar"
                  name="title"
                  required
                />
                <Input label="Para qué (opcional)" name="reason" max={500} />
                <div className="two-fields">
                  <Input
                    label="Desde"
                    name="start"
                    type="date"
                    value={localDate()}
                    required
                  />
                  <Input
                    label="Hasta"
                    name="end"
                    type="date"
                    value={localDate()}
                    required
                  />
                </div>
                <label>
                  Ocasiones durante todo el período
                  <input
                    type="number"
                    name="target"
                    min={1}
                    max={100}
                    defaultValue={3}
                    required
                  />
                </label>
                <label>
                  Lo registramos por
                  <select name="unit">
                    <option value="person">Persona</option>
                    <option value="couple">Matrimonio vinculado</option>
                  </select>
                </label>
                <p className="form-hint">
                  El propósito lo acuerda el grupo. No reemplaza el propósito
                  particular. Su meta y fechas quedan fijas para conservar el
                  historial.
                </p>
              </Form>
              </details><details className="card optional-details"><summary>Preparar un encuentro</summary><Form
                title="Próximo encuentro"
                busy={busy}
                submit={(f) =>
                  act({
                    action: "meeting_save",
                    groupId: group.id,
                    version: group.meeting?.version ?? 0,
                    data: Object.fromEntries(f.entries()),
                  })
                }
              >
                <Input
                  label="Fecha"
                  name="date"
                  type="date"
                  required
                  value={group.meeting?.data.date || localDate()}
                />
                <Input
                  label="Hora"
                  name="time"
                  type="time"
                  required
                  value={group.meeting?.data.time || "19:00"}
                />
                <Input
                  label="Lugar o enlace"
                  name="place"
                  max={300}
                  value={group.meeting?.data.place}
                />
                <Input
                  label="Material oficial o autorizado (enlace HTTPS)"
                  name="material"
                  max={1000}
                  value={group.meeting?.data.material}
                />
                <Input
                  label="Pregunta para preparar"
                  name="question"
                  max={500}
                  value={group.meeting?.data.question}
                />
                <Input
                  label="Encargados de oración y preparación"
                  name="roles"
                  max={500}
                  value={group.meeting?.data.roles}
                />
                <p className="form-hint">
                  Al cambiar el encuentro se solicitan nuevas confirmaciones.
                </p>
              </Form>
            </details></div>
          )}
          <details className="card optional-details" open>
            <summary>Identidad e integrantes</summary>
            {group.ideal && <p className="preserve">{group.ideal}</p>}
            {group.members.map((m) => (
              <p key={m.id}>
                {m.name}
                {group.ownerId === m.id ? " · Organizador" : ""}
              </p>
            ))}
            {owner && (
              <>
                <Form
                  title="Identidad del curso"
                  busy={busy}
                  submit={(f) =>
                    act({
                      action: "group_update",
                      groupId: group.id,
                      version: group.version,
                      ...Object.fromEntries(f.entries()),
                    })
                  }
                >
                  <Input
                    label="Nombre"
                    name="name"
                    value={group.name}
                    max={80}
                    required
                  />
                  <label>
                    Símbolo del curso
                    <select
                      name="symbol"
                      defaultValue={group.symbol || "heart"}
                    >
                      {[
                        ["heart", "Corazón"],
                        ["tree", "Árbol"],
                        ["rosary", "Rosario"],
                        ["cross", "Cruz"],
                        ["flame", "Fuego"],
                        ["star", "Estrella"],
                      ].map(([id, label]) => (
                        <option value={id} key={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Input
                    label="Lema (opcional)"
                    name="motto"
                    value={group.motto}
                    max={120}
                  />
                  <Input
                    label="Ideal que el curso ya tiene (opcional)"
                    name="ideal"
                    value={group.ideal}
                    max={500}
                  />
                </Form>
                <button
                  className="soft-button"
                  disabled={busy}
                  onClick={async () => {
                    const v = await send({
                      action: "invite_create",
                      groupId: group.id,
                    });
                    if (v) {
                      setToken(v.token);
                      setCopied(false);
                    }
                  }}
                >
                  Crear invitación
                </button>
                {token && (
                  <div className="invitation-code">
                    <p>
                      Enlace privado · vence en siete días. Requiere una cuenta
                      habilitada en Alianza.
                    </p>
                    <input
                      aria-label="Enlace de invitación al grupo"
                      readOnly
                      value={
                        new URL("./", location.href).href + "#grupo=" + token
                      }
                    />
                    <button
                      className="soft-button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            new URL("./", location.href).href +
                              "#grupo=" +
                              token,
                          );
                          setCopied(true);
                        } catch {
                          setError(
                            "No se pudo copiar. Seleccioná el enlace para copiarlo.",
                          );
                        }
                      }}
                    >
                      <Copy size={16} />
                      {copied ? "Copiado" : "Copiar invitación"}
                    </button>
                  </div>
                )}
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() =>
                    send({ action: "invite_revoke", groupId: group.id })
                  }
                >
                  Revocar enlaces de invitación
                </button>
                <Form
                  title="Cambiar organizador"
                  busy={busy}
                  submit={(f) =>
                    act({
                      action: "group_transfer",
                      groupId: group.id,
                      userId: f.get("userId"),
                    })
                  }
                >
                  <label>
                    Nuevo organizador
                    <select name="userId">
                      {group.members
                        .filter((m) => m.id !== userId)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                    </select>
                  </label>
                </Form>
              </>
            )}
            {!owner && (
              <button
                className="text-button"
                disabled={busy}
                onClick={async () => {
                  if (await send({ action: "group_leave", groupId: group.id }))
                    setGroupId("");
                }}
              >
                Salir del grupo
              </button>
            )}
          </details>
          </div><div hidden={groupView!=="now"}><details className="card optional-details">
            <summary>Historial del grupo</summary>
            {group.purposes.map((p) => (
              <PurposeCard
                key={p.id}
                p={p}
                group={group}
                act={act}
                userId={userId}
                coupleId={coupleId}
                busy={busy}
              />
            ))}
            {state.rosaries
              .filter((r) => r.groupId === group.id)
              .map((r) => (
                <RosaryCard
                  key={r.id}
                  r={r}
                  act={act}
                  busy={busy}
                  userId={userId}
                  names={names}
                  canManage={owner}
                />
              ))}
          </details></div><div hidden={groupView!=="manage"}>
          <p className="form-hint">
            <a
              href="https://www.santuariovallehermoso.cl/familias/material/cam/cam_3_cursos_programa_anual.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Propósito y vida del grupo · Rama de Familias, Chile, pp. 23–25
            </a>
            . Organización y conteos propios de Alianza; no califican
            crecimiento espiritual.
          </p></div>
        </>
      )}
    </>
  );
}
