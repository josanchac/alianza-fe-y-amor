import type {RecordItem} from './domain';
export const reflectionFields=[['gratitude','Mis agradecimientos'],['offering','Mis ofrecimientos a la Mater'],['meditation','Mis meditaciones'],['note','Mis notas por compromiso'],['learning','Lo que aprendí'],['next','Mis próximos pasos']] as const;
export function reflectionText(r:RecordItem){return reflectionFields.filter(([key])=>r.data[key]?.trim()).map(([key,title])=>`${title}\n${r.data[key]}`).join('\n\n');}
export function reflectionGroups(rows:RecordItem[],start:string,end:string){return reflectionFields.map(([key,title])=>({key,title,entries:rows.filter(r=>r.kind==='journal'&&r.key>=start&&r.key<=end&&r.data[key]?.trim()).sort((a,b)=>b.key.localeCompare(a.key)).map(r=>({date:r.key,text:r.data[key]}))})).filter(g=>g.entries.length);}
