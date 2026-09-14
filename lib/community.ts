export type PurposeLog = { day: string; amount: number; version: number };
export type GroupPurpose = {
  id: string;
  title: string;
  reason: string;
  start: string;
  end: string;
  target: number;
  unit: "person" | "couple";
  decision: string;
  version: number;
  joined: boolean;
  share: boolean;
  logs: PurposeLog[];
  summary: null | { participation:string; completed:string };
};
export type Meeting = {
  version: number;
  data: {
    date: string;
    time: string;
    place: string;
    material: string;
    question: string;
    roles: string;
  };
  responses: { userId: string; attending: boolean }[];
};
export type GroupCapability='rosary'|'purpose'|'meeting'|'capital'|'materials'|'invites'|'identity';
export type PermissionRule={mode:'coordinators'|'selected'|'all';users:string[]};
export type CapitalCampaign={id:string;title:string;start:string;end:string;version:number;mine:{day:string;amount:number;version:number}[];summary:null|{range:string};share:boolean};
export type GroupTask={id:string;title:string;assignee:string;done:boolean;version:number};
export type CommunityGroup = {
  photo?:string;
  symbolImage?:string;
  permissions?:Partial<Record<GroupCapability,PermissionRule>>;
  coordinators?:string[];
  capital?:CapitalCampaign[];
  tasks?:GroupTask[];
  materials?:{id:string;title:string;url:string}[];

  id: string;
  name: string;
  symbol?: "heart" | "tree" | "rosary" | "cross" | "flame" | "star";
  ideal: string;
  motto: string;
  version: number;
  ownerId: string;
  members: { id: string; name: string }[];
  purposes: GroupPurpose[];
  meeting: Meeting | null;
};
export type Rosary = {
  opening?: import('./rosary-guide').RosaryOpening;
  personalStep?: number;
  progressVersion?: number;
  id: string;
  ownerId: string;
  groupId: string | null;
  coupleId: string | null;
  mystery: Mystery;
  mode: "free" | "sequential";
  intention: string;
  cancelled: boolean;
  slots: { decade: number; userId: string; done: boolean }[];
  mine: { decade: number; day: string }[];
};
export type CommunityState = { groups: CommunityGroup[]; rosaries: Rosary[] };
export type CommunityAction = (
  payload: Record<string, unknown>,
) => Promise<any>;
export type Mystery = "joyful" | "luminous" | "sorrowful" | "glorious";
export const MYSTERIES: Record<Mystery, { name: string; items: string[] }> = {
  joyful: {
    name: "Gozosos",
    items: [
      "La Anunciación",
      "La Visitación",
      "El nacimiento de Jesús",
      "La presentación en el Templo",
      "Jesús perdido y hallado en el Templo",
    ],
  },
  luminous: {
    name: "Luminosos",
    items: [
      "El Bautismo en el Jordán",
      "Las bodas de Caná",
      "El anuncio del Reino de Dios",
      "La Transfiguración",
      "La institución de la Eucaristía",
    ],
  },
  sorrowful: {
    name: "Dolorosos",
    items: [
      "La oración en el Huerto",
      "La flagelación",
      "La coronación de espinas",
      "Jesús con la cruz a cuestas",
      "La crucifixión y muerte de Jesús",
    ],
  },
  glorious: {
    name: "Gloriosos",
    items: [
      "La Resurrección",
      "La Ascensión",
      "La venida del Espíritu Santo",
      "La Asunción de María",
      "La coronación de María",
    ],
  },
};
export function mysteriesFor(date: string): Mystery {
  const day = new Date(date + "T12:00:00Z").getUTCDay();
  return day === 1 || day === 6
    ? "joyful"
    : day === 2 || day === 5
      ? "sorrowful"
      : day === 4
        ? "luminous"
        : "glorious";
}
export const completedDecades = (r: Rosary) =>
  r.slots.filter((s) => s.done).length;
export const personalProgress = (p: GroupPurpose) =>
  Math.min(
    p.target,
    p.logs.reduce((n, l) => n + l.amount, 0),
  );
