# Entrega de Misa para revisión general de experiencia

Fecha: 19 de septiembre de 2026. Propietario: José Ángel Chacón. Diseño aprobado en conversación; implementación autorizada únicamente en prueba, sin producción.

## Identificación

- Repositorio: https://github.com/josanchac/alianza-fe-y-amor
- Rama de revisión: `review/misa-experience-20260919`.
- Sincronización autorizada expresamente por el propietario; SHA remoto final verificado en el resumen de entrega.
- Base remota comprobada: `8a666b5fb6bc9f2f84d065a64801c3ee258a1886` (`main`).
- Commit local de implementación probado: `a432bb55ee256dfbb2f62451673a5bee5ef8c795`.
- La entrega remota se crea desde el mismo árbol de archivos mediante la conexión de GitHub; obtener el SHA completo de la entrega con `git rev-parse HEAD` en la rama indicada. El resumen de entrega en la conversación incluye ese SHA final.
- Copia aislada de trabajo: `/workspace/alianza-misa-review`. No se cambiaron las ramas activas ni los archivos de las otras sesiones.

## Resultado y frontera

Implementación parcial, apta para continuar la revisión de experiencia; **no es una sección litúrgica lista para producción**. La navegación y el lector están implementados. **No se suministran lecturas reales ni oraciones litúrgicas completas**: falta acreditar permisos, cotejar la edición utilizada y validar el calendario local. La app expresa esta ausencia; no presenta los ejemplos de 2024 del dummy como contenido real.

El componente es de lectura: no recibe identidades, registros espirituales ni transporte de red; no escribe marcas de asistencia, oraciones, compromisos, almacenamiento local o métricas. No se agregan tablas, RPC, servicios ni migraciones.

## Funciones implementadas

- Botón Misa en Oración y regreso al espacio anterior.
- Acceso directo a cualquier sección, orden litúrgico resumido y cinco bloques en la guía general. No hay avance obligatorio.
- Una sección principal abierta; dentro de ella, un solo texto/momento abierto. Cambiar sección cierra el contenido previo.
- Desplazamiento después del cierre y nuevo render. Descarta callbacks antiguos; margen de 24 px. Una reserva inferior calculada solo cuando hace falta permite alinear las últimas secciones sin un espacio fijo artificial en la vista previa.
- Fecha anterior/siguiente, selector con validación 1900–2100 y Hoy en `America/Costa_Rica`. Se limpian las elecciones anteriores al cambiar fecha.
- Sábados: elección sábado/domingo sin introducir una hora. Sábado Santo: antes de la Vigilia/Vigilia Pascual. El calendario local definitivo deberá resolver las precedencias excepcionales.
- Celebraciones especiales cerrado inicialmente, con título desplegable. Los accesos usan el año elegido; Ramos/Triduo se calculan por Pascua gregoriana, Navidad por fecha fija. Estos accesos son navegación del calendario romano general, **no un Ordo de Costa Rica validado**.
- Estructuras resumidas para Ramos, Cena del Señor, Pasión del Señor, Vigilia Pascual y Navidad. Viernes Santo no contiene liturgia eucarística. Opciones locales para entrada en Ramos, lavatorio y bautismos.
- Navidad: vigilia/noche el 24; noche/aurora/día el 25. Son formularios distintos dentro de la estructura común.
- Vistas Guía/Lecturas, texto ajustable 20–32 px, lectura completa sin truncamiento ni salida obligatoria de la app; atribución y enlace de fuente cuando exista un conjunto aprobado.
- Botones nativos, ligeros, con área táctil de 44 px, foco visible y etiquetas. Encabezados de acordeón ocupan la fila por su función; acciones ordinarias tienen ancho según contenido.

## Lecturas: estado de fuentes, permisos y correspondencia

Biblioteca `MASS_READINGS`: vacía. No hay scraping, proveedor remoto, traducción improvisada ni textos de ejemplo empaquetados en la app. Los textos sintéticos están exclusivamente en pruebas.

Fuentes consultadas el 19 de septiembre de 2026:

| Fuente | Evidencia y uso | Pendiente / límite |
| --- | --- | --- |
| [IGMR, Santa Sede](https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_sp.html), capítulos II y IV | Estructura y momentos; orientación resumida propia | No se copió un misal completo. Falta cotejar todas las fórmulas, posturas y variantes locales. |
| [USCCB, Triduo](https://www.usccb.org/prayer-and-worship/liturgical-year-and-calendar/triduum/questions-and-answers) | Diferencias de estructura del Triduo y opciones | Es fuente estadounidense; no acredita un calendario territorial costarricense. |
| [USCCB, lecturas en español del 15/09/2024](https://bible.usccb.org/es/bible/lecturas/091524.cfm), aviso al pie | Identifica textos de los Leccionarios I–III de la Comisión Episcopal de Pastoral Litúrgica de la Conferencia Episcopal Mexicana, copyright 1987, quinta edición 2004; derechos reservados, usados por USCCB con permiso | No encontramos permiso aplicable a Alianza. El aviso advierte que los salmos de la parroquia pueden diferir. No se incorporó ninguna lectura de esa página. |
| [Calendario USCCB 2026](https://www.usccb.org/resources/2026cal.pdf), Navidad | Referencia de los cuatro formularios de Navidad, consultada durante diseño | No se adopta el calendario estadounidense como calendario de Costa Rica. |
| [Conferencia Episcopal de Costa Rica](https://www.iglesiacr.org/) | Autoridad territorial identificada; la búsqueda localizó referencia al Ordo 2025–2026 | No se obtuvo y cotejó íntegramente el Ordo ni su autorización de reutilización. Una descarga pública no equivale a licencia de reproducción. |

El contrato de `MassReadingSet` exige fecha efectiva, identificador de celebración/formulario, territorio CR, estado de cotejo del calendario y fuente/revisor; titular, referencia de permiso, atribución, alcance dentro de app y vigencia; fuente HTTPS y textos marcados completos, no vacíos y con IDs únicos. Si algo no coincide, no entrega textos al lector. La comprobación de metadatos **no sustituye** el examen documental; no introducir `verified`/`authorized` por conveniencia técnica. El conjunto debe corresponder a la celebración del día; no reutilizar un domingo o el formulario de Navidad de otra hora como fallback.

Para completar: obtener edición y licencia del titular que cubra distribución digital, atribuciones y, si se implementa, caché/offline; cotejar Ordo CR, diócesis, traslados, preceptos y variantes; verificar cada lectura completa (incluido salmo/aclamación y formas corta/larga); registrar pruebas documentales y revisión. La identificación `general` actual debe sustituirse por IDs litúrgicos precisos al conectar el calendario completo. No se contactó a ninguna institución ni se solicitó una licencia en nombre del propietario.

## Archivos y dependencias

| Archivo | Cambio |
| --- | --- |
| `app/journal.tsx` | Importación, botón de acceso y vista Misa; cambio acotado al espacio Oración |
| `app/globals.css` | Importación del estilo de Misa |
| `app/mass.tsx` | Interfaz de lectura, fecha, acordeones, anclaje y estados pendientes |
| `app/mass.css` | Estilo aislado por clases de Misa y botón de acceso |
| `lib/mass.ts` | Fechas, estructuras, tipos, validación de contenido y biblioteca vacía |
| `package.json` | Scripts `test:mass`, `review:misa`; incorpora test de Misa a la suite |
| `tests/mass.mjs` | Pruebas de lógica, contenido, navegación y acceso desde Journal |
| `tests/mass-browser.mjs` | Prueba opcional en Chromium; inicia y detiene el servidor local |
| `review/misa/index.html`, `main.tsx`, `review.css` | Vista independiente sin Auth ni datos reales |
| `vite.misa-review.config.ts` | Servidor en loopback 4176; build opcional en `tests/preview-dist/misa` |
| `docs/MISA_HANDOFF_20260919.md` | Esta entrega |
| `docs/MISA_TEST_EVIDENCE_20260919.md` | Resultados, alcance y limitaciones |

No se añadieron dependencias ni cambios al lockfile. React, Vite, Lucide, JSDOM y Testing Library ya existían. La prueba visual opcional requiere Playwright y Chromium disponibles externamente: no se agregaron al producto. En este entorno se reutilizó la instalación de dependencias existente. Migraciones necesarias para este cambio: **ninguna**.

## Vista previa y reproducción

Vista local, no hospedada ni publicada; no existe URL pública de revisión.

```sh
git fetch origin
git worktree add -b review/misa-general ../alianza-misa-general origin/review/misa-experience-20260919
cd ../alianza-misa-general
npm ci
npm run review:misa
```

Abrir `http://127.0.0.1:4176/` en el equipo donde corre Vite. No es un enlace accesible desde el teléfono del propietario. La vista funciona sin credenciales, sin Supabase y sin acceso a contenido personal. Al cerrar el proceso deja de estar disponible. Alternativamente `npm run dev` permite revisar la integración completa usando exclusivamente un backend de prueba configurado por el revisor; **no usar cuentas reales para poblar esta revisión**.

Pruebas repetibles:

```sh
npm run typecheck
npm test
npm run build
npm run verify:methodology
# Opcional: rutas a herramientas ya instaladas; el script inicia el servidor.
PLAYWRIGHT_MODULE=/ruta/a/playwright/index.mjs CHROMIUM_PATH=/ruta/a/chromium node tests/mass-browser.mjs
```

`verify:methodology` actualmente falla porque la huella de contenido difiere de la revisión documental registrada. Es un bloqueo explícito antes de publicar; no se modificó `docs/methodology-review.json` ni se desactivó el control.

## Integración con las otras sesiones

Usar esta rama de revisión o aplicar su commit remoto sobre una rama de revisión general, después de revisar el diff desde la base indicada. No copiar directorios enteros de copias antiguas. El punto probable de conflicto es `app/journal.tsx`; preservar los cambios de otras sesiones y añadir únicamente el acceso/estado de Misa. Conservar todos los scripts existentes al conciliar `package.json`. No modificar el modelo de datos ni los trabajos de ritmo, rosario, invitaciones o métricas.

Para completar la revisión general: aplicar el protocolo de acciones de la otra sesión; probar Misa con las barras y navegación reales en móvil, personas mayores, texto del sistema ampliado y lectores de pantalla. Las pruebas de geometría de esta entrega corresponden a la vista aislada; no equivalen a evaluación humana ni a prueba en Safari/iOS instalado.

## Publicación

Esta entrega se conserva en rama de revisión; los commits locales probados también se conservan. **No se fusionó a main, no se publicó Misa en GitHub Pages, no se ejecutó workflow de despliegue, no se aplicó ninguna migración de producción y no se cambiaron datos de usuarios.** Compilar localmente no es publicar, aunque el test heredado imprima “Published vector emblem and app icon verified.”

La producción existente no se modificó por esta tarea. La base de código remota se verificó; no se realizó una auditoría del despliegue activo para afirmar su SHA exacto. La autorización de diseño no autoriza producción. Antes de cualquier publicación siguen pendientes los contenidos/licencias/calendario, el cotejo metodológico y la revisión general solicitada.

## Historial de sincronización remota

La revisión automática de permisos rechazó `git push -u origin review/misa-experience-20260919`. Su motivo fue que subir código y documentación a GitHub requiere autorización explícita del usuario para compartirlos con ese destino, que el revisor automático no consideró verificado. No se intentó eludir el rechazo con API ni otro mecanismo. Una consulta posterior de ramas confirmó que `review/misa-experience-20260919` no existe en remoto.

El propietario dio luego autorización explícita para subir solo la rama de revisión a `josanchac/alianza-fe-y-amor`. La terminal falló por falta de credenciales; se utiliza la conexión autenticada de GitHub para crear un commit con el mismo árbol de archivos. Esto no autoriza ni ejecuta merge, despliegues o migraciones. Los commits locales previos se conservan para trazabilidad; los SHA locales y remoto pueden diferir por los metadatos del commit. La comprobación del árbol permite demostrar que es el mismo contenido probado.
