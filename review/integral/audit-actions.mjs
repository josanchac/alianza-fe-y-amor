import ts from 'typescript';
import fs from 'node:fs';
const files=['app','github','components'].flatMap(dir=>fs.readdirSync(dir,{recursive:true}).filter(f=>f.endsWith('.tsx')).map(f=>dir+'/'+f)).sort();
const controls=[];
function classify(r){const s=(r.label+' '+r.handler+' '+r.className).toLowerCase();
 if(r.tag==='a')return ['navigation','Enlace: preservar destino y anunciar si abre otra página.'];
 if(r.tag==='summary'||r.expanded)return ['disclosure','Fila desplegable: ancho completo justificado, estado expanded y foco.'];
 if(/deshacer|quitar registro/.test(s))return ['reversible','Corrección de registro: secundario visible, sin confirmación rutinaria.'];
 if(/cancelar edición|cancelar edicion|conservar solicitud|conservar invitación|conservar vinculaci|volver a mis opciones/.test(s))return ['reversible','Salida segura: conservar borrador o estado; no apariencia destructiva.'];
 if(/eliminar|descartar|rechazar|revocar|salir del grupo|desvincul|transferir coordinaci|cancelar (?:el encuentro|invitaci|solicitud)|cerrar sesi/.test(s))return ['sensitive','Separar por consecuencia; confirmar pérdida o revocación, no cada navegación.'];
 if(r.tag==='Checkbox'||r.pressed||/symbol-grid|choice-chip|phone-choice/.test(s))return ['selection','Estado elegido visible y nombre accesible; no tratarlo como envío.'];
 if(/volver|atrás|atr[aá]s|mi espacio|mis espacios|mis grupos|ver mis registros|abrir ayuda|consultar|explorar|día anterior|día siguiente|hoy|ver la ayuda|cerrar (?:la guía|detalle)|instalar|ya tengo contraseña/.test(r.label.toLowerCase()))return ['navigation','Acceso o regreso: tratamiento liviano, sin competir con guardar.'];
 if(r.tag==='DialogClose')return ['navigation','Cierre accesible de diálogo; conservar control de borrador.'];
 if(/primary/.test(r.className)||/guardar|confirmar|aceptar|avanzar|empezar a rezar|terminé|enviar/.test(r.label.toLowerCase()))return ['primary','Candidata a acción principal: máximo una por bloque de decisión activo.'];
 return ['secondary','Operación local o acceso a opciones: botón compacto; revisar etiqueta dinámica en contexto.'];
}
for(const file of files){const source=fs.readFileSync(file,'utf8');const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);function walk(n){if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n)){const tag=n.tagName.getText(sf);if(['button','Button','a','summary','Checkbox','DropdownMenuItem','DialogClose'].includes(tag)){const attrs={};for(const a of n.attributes.properties)if(ts.isJsxAttribute(a))attrs[a.name.getText(sf)]=a.initializer?.getText(sf)||'';const parent=n.parent;const text=ts.isJsxElement(parent)?parent.children.map(x=>ts.isJsxText(x)?x.text.trim():ts.isJsxExpression(x)?x.getText(sf):'').filter(Boolean).join(' '):'';const row={id:'A'+String(controls.length+1).padStart(3,'0'),file,line:sf.getLineAndCharacterOfPosition(n.getStart()).line+1,tag,label:attrs['aria-label']||text||'(contenido delegado)',className:attrs.className||'',handler:attrs.onClick||'',pressed:!!attrs['aria-pressed'],expanded:!!attrs['aria-expanded']};const [type,rationale]=classify(row);controls.push({...row,type,rationale,review:row.label.includes('{')||row.label==='(contenido delegado)'?'Validar variantes dinámicas':'Validar patrón en contexto'});}}ts.forEachChild(n,walk)}walk(sf)}
const meta={source:'7fd20e5 + 197d21d (integración local)',files:files.length,total:controls.length,textStyle:controls.filter(x=>x.className.includes('text-button')).length,types:controls.reduce((a,x)=>(a[x.type]=(a[x.type]||0)+1,a),{}),scope:'Declaraciones estáticas; propuesta de clasificación, no fallos confirmados ni instancias renderizadas.'};
fs.writeFileSync('docs/ACTIONS_CLASSIFIED_20260919.json',JSON.stringify({meta,controls},null,2)+'\n');
const clean=s=>s.replace(/\|/g,'/').replace(/[\r\n]+/g,' ').slice(0,230);
fs.writeFileSync('docs/ACTIONS_CLASSIFIED_20260919.md','# Clasificación propuesta de acciones\n\n'+meta.scope+' Todas requieren aprobación del protocolo, no aprobación individual obligatoria. Las expresiones muestran variantes reales del código.\n\n| ID | Ubicación | Etiqueta / expresión | Tipo propuesto | Revisión |\n|---|---|---|---|---|\n'+controls.map(r=>`| ${r.id} | ${r.file}:${r.line} | ${clean(r.label)} | ${r.type} | ${r.review} |`).join('\n')+'\n');
console.log(JSON.stringify(meta));
