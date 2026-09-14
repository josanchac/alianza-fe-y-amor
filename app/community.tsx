import {GroupsWorkspace} from './groups-workspace';
import { useState, useRef } from "react";
import {PersonalRosary} from './personal-rosary';
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
export function Form({
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
export function Input({
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
      if(v.action==="purpose_log")setFeedback("Ocasión registrada");
    } catch (e) {
      setError((e as Error).message);
    } finally {sending.current=false;}
  }
  if(compact&&!expanded){const todayLog=p.logs.find(l=>l.day===localDate());return <section className="card purpose-quick"><div><p className="eyebrow">{group.name}</p><h3>{p.title}</h3><p>{personalProgress(p)} de {p.target} ocasiones</p></div><button className="quick-mark" aria-label={'Registrar ocasión: '+p.title} disabled={busy||!p.joined||(todayLog?.amount??0)>=20||!current} onClick={()=>send({action:'purpose_log',day:localDate(),amount:(todayLog?.amount??0)+1,version:todayLog?.version??0})}><Plus size={22}/></button><button className="text-button purpose-detail" onClick={()=>setExpanded(true)}>Ver mis registros<ArrowRight size={16}/></button>{feedback&&<p className="quiet-feedback" role="status">{feedback}</p>}{error&&<p role="alert">{error}</p>}</section>;}
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
            Participar en el propósito
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
          <QuietProgress symbol={group.symbol} image={group.symbolImage} value={personalProgress(p)} total={p.target} label="Mi avance del propósito"/>
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
              aria-label={day===localDate()?"Lo viví hoy":"Lo viví ese día"}
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
            {log && log.amount > 0 && (
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
                Deshacer una ocasión
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
      {!compact&&<div className="group-summary"><strong>Avance colectivo</strong>{p.summary?<><p>Participación registrada: {p.summary.participation}</p><p>Meta alcanzada: {p.summary.completed}</p><small>Resumen al cierre, entre quienes eligieron compartir.</small></>:<p>El resumen se publica al cerrar el período cuando puede protegerse la privacidad.</p>}</div>}
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
  defaultScope="personal",
}: {
  act: CommunityAction;
  busy: boolean;
  coupleId?: string | null;
  groupId?: string;
  onCreated?: () => void;
  defaultScope?: "personal"|"couple";
}) {
  const [scope, setScope] = useState(groupId ? "group" : defaultScope);
  const today=localDate(), suggested=mysteriesFor(today);
  const [chosenMystery,setChosenMystery]=useState<Mystery|null>(null);
  const weekday=new Date(today+"T12:00:00").toLocaleDateString("es-CR",{weekday:"long"});
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
          scope: groupId ? "group" : f.get("scope") || defaultScope,
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
      {!groupId && coupleId && defaultScope!=="couple" && (
        <label>
          ¿Con quién?
          <select name="scope" value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="personal">Personal</option>
            {coupleId && <option value="couple">Con mi pareja</option>}
          </select>
        </label>
      )}
      <div className="rosary-suggestion"><CalendarDays size={20} aria-hidden="true"/><div><strong>Hoy, {weekday}: {MYSTERIES[suggested].name.toLowerCase()}</strong><p>Sugeridos para hoy. Podés elegir otros.</p></div></div>
      <label>
        Misterios
        <select name="mystery" value={chosenMystery??suggested} onChange={e=>setChosenMystery(e.target.value as Mystery)}>
          {Object.entries(MYSTERIES).map(([id, m]) => (
            <option value={id} key={id}>
              {m.name}{id===suggested?" · sugeridos hoy":""}
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
  if(!r.groupId&&!r.coupleId)return <PersonalRosary r={r} act={act} busy={busy} habits={habits} onLinked={onLinked}/>;
  return <SharedRosaryCard r={r} act={act} busy={busy} userId={userId} names={names} canManage={canManage} habits={habits} onLinked={onLinked}/>;
}
function SharedRosaryCard({r,act,busy,userId,names={},canManage=false,habits=[],onLinked}:Parameters<typeof RosaryCard>[0]){
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
export function CommunityPanel(props:Props){return <GroupsWorkspace {...props}/>;}
