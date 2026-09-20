# Verificación integrada y backlog — 20 de septiembre de 2026

## Alcance real

Rama local `review/integral-experience-20260919`, código evaluado en `5f4e35e`. Árbol limpio al iniciar. Se preservan los worktrees y ramas ajenos. Misa está integrada desde `7fd20e5`; los dos bloques aprobados están en `b493917` y `5f4e35e`. No se realizó push, despliegue, migración remota ni escritura sobre participantes.

Este registro sustituye el estado operativo de `INTEGRAL_REVIEW_STATUS.md`, que conserva la evidencia histórica de preparación del dummy. No confundir aquella propuesta con los controles ya implementados.

## Estado de capacidades

| Capacidad | Implementado | Verificado | Pendiente | Publicación de esta candidata |
|---|---|---|---|---|
| Vista única por momento del día | Sí | Pruebas de Journal | Geometría y lectura integrada | No |
| Símbolo diario independiente de semana/mes | Sí | Denominador, exenciones, avance proporcional y extras | Revisión visual con el propietario | No |
| Meta fija, halo suave y contador adicional | Sí | Agregar/deshacer, tope y aislamiento entre períodos | Apariencia, contraste y movimiento | No |
| Permitir más de una vez al día | Sí, también diario | UI y SQL en base desechable | Migración en entorno real no productivo autorizado | No |
| Botones livianos | 75 acciones clasificadas | Semántica y handlers por AST; regresión funcional | Inspección renderizada en todos los contextos | No |
| Misa | Navegación, estructura y lector vacío | Pruebas funcionales con contenido sintético | Cotejo completo de variantes, calendario CR y textos autorizados | No |
| Invitaciones, métricas y solicitudes | Código heredado más tratamiento de acciones | Regresión automatizada; no operación real | Comprobar correo/copia/activación en entorno autorizado y revisión visual del administrador | No se verificó el despliegue actual |
| Suspender/reactivar y salida del piloto | No implementado en estos bloques | No | Diseño y alcance separado | No |

## Cotejo documental: avance, no cierre artificial

Se contrastó `lib/mass.ts` y la entrega de Misa con dos fuentes primarias consultadas el 20/09/2026:

- [Instrucción General del Misal Romano, capítulo II, nn. 46–90](https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_sp.html): la agrupación general de la guía corresponde a los ritos iniciales, Palabra, Eucaristía y conclusión. La interfaz presenta Comunión por separado para navegación; no pretende definir una liturgia distinta. Esto no valida todas las variantes de celebraciones especiales.
- [USCCB, preguntas sobre el Triduo](https://www.usccb.org/prayer-and-worship/liturgical-year-and-calendar/triduum/questions-and-answers): respalda que el lavatorio no es obligatorio, la distinción de Viernes Santo respecto de la misa y el carácter nocturno de la Vigilia. La referencia estadounidense no acredita calendario, precedencias ni permisos para Costa Rica.

La fuente general y estas preguntas no bastan para certificar cada momento de Ramos, todas las alternativas bautismales o las precedencias de sábados/solemnidades. Se requiere completar esa correspondencia antes de declarar el cotejo integral cerrado. No se incorporaron textos litúrgicos ni se contactó a terceros. `MASS_READINGS` sigue vacío.

Los nuevos cálculos de progreso, extras y repetición son reglas de producto acordadas con el propietario, no exigencias espirituales. Se revisaron sus cambios respecto a `8a666b5`; no se modifica la meta histórica para celebrar extras ni se interpreta un porcentaje como evaluación de fe. La prueba de 75 acciones coteja cambios de apariencia/intención sin cambiar handlers; no certifica su geometría.

`npm run verify:methodology` continúa fallando porque la huella actual no coincide con la cotejada. No se actualizó `reviewedContent` ni se alteró el verificador para conseguir un resultado verde. El cierre documental continúa pendiente, con alcance identificado.

## Evidencia automática de esta pasada

Todas las siguientes órdenes finalizaron con código 0 sobre `5f4e35e`:

| Orden | Resultado y límite |
|---|---|
| `npm test` | Suite completa, incluyendo Misa, experiencia aprobada y protocolo de 75 acciones. Usa datos sintéticos y bases desechables; no prueba servicios remotos. |
| `npm run typecheck` | Tipado aprobado. |
| `npm run test:frequency-labels` | Contrato CSS aprobado; no mide geometría. |
| `npm run test:review-integral` | Siete vistas e interacciones de la galería aprobadas en JSDOM. |
| `npm run build:review-runtime` | Compilación de la prueba integrada aprobada. |
| `npm run build` | Compilación y comprobación de recursos aprobadas; no ejecuta publicación. |

Las dos compilaciones mantienen advertencia por chunks mayores de 500 kB: queda pendiente medir rendimiento y evaluar división de código, sin ocultar la advertencia. El log de la suite de esta pasada está temporalmente en `/tmp/alianza-final-suite-20260920.log`. El control documental se ejecutó por separado y sigue fallando; no se cuenta como una prueba aprobada dentro de `npm test`. La evidencia anterior se mantiene en `IMPLEMENTATION_PROGRESS_20260920_BLOCK2.md`.

## Revisión visual y personas

Se completó además la revisión adaptable de compromisos, edición y Misa a 320/390/768 px mediante iframes Chromium: sin desbordamiento en estados medidos, lápices 44 × 44 y encabezados de Misa a ~24 px. Evidencia y límites en `RESPONSIVE_REVIEW_20260920.md`. Safari real, ampliación 200 % y otros contextos siguen pendientes.

Última actualización: se completó una primera revisión integrada real de Chromium usando la vista supervisada. Ver `BROWSER_REVIEW_20260920.md`: edición, navegación y acordeones de Misa comprobados; compatibilidad HTTP corregida solo en la entrada de prueba. El bloqueo de localhost descrito abajo es histórico, no un bloqueo total actual. Siguen pendientes tamaños móviles, Safari, ampliación y otros contextos.

Actualización posterior: el propietario autorizó una vista de prueba separada. Se alojó privadamente con datos ficticios en https://alianza-revision-integral.josanchac.chatgpt.site y Sites confirmó éxito. La siguiente revisión conjunta puede usar ese enlace. No se navegó a la URL desde el navegador cloud ni se declara geometría verificada. La autorización y el despliegue corresponden únicamente al sitio de prueba; producción y Supabase siguen intactos.

El intento anterior de abrir la vista local devolvió `ERR_BLOCKED_BY_CLIENT`. No se evadió el bloqueo ni se trasladó a otro mecanismo. Esta pasada no produce capturas ni validación de geometría. El dummy aprobado no es una prueba visual de la implementación.

La vista `npm run review:runtime` usa Journal real con datos ficticios en memoria, sin producción. Cubre compromisos y acceso a Oración/Misa/Mi espacio; no representa todos los servicios de administración o pareja. `127.0.0.1:4178` solo es local al equipo que la ejecuta, no un enlace compartido.

El propietario revisó la vista privada y aprobó la interacción uniforme de compromisos y, posteriormente, el botón de edición solo con lápiz («Ok listo aprobado»). La referencia aprobada es el código `5edc02c`, publicado únicamente en el sitio privado de prueba, versión 3. Incluye checkbox para todos, «Agregar otro» tras el primer registro cuando se permite repetir y lápiz con área táctil de 44 × 44 px y nombre accesible. Las pruebas de acciones de compromisos y protocolo y la compilación de prueba pasaron.

Esta es aprobación de experiencia por el propietario sobre los cambios revisados. No equivale a pruebas observadas con otros participantes, auditoría completa de accesibilidad ni autorización para desplegar la app del piloto. Los escenarios automatizados con distintas personas ficticias se registran únicamente como regresión funcional.

## Orden de cierre

1. Completar evidencia documental de variantes de Misa; mantener permisos y calendario CR como requisitos explícitos de contenido.
2. Completado: entorno privado de prueba autorizado y disponible; compromisos y edición revisados y aprobados por el propietario. Mantener el mismo enlace para continuar.
3. Revisar 320/390/768 px, ampliación 200 %, foco, desplazamiento entre secciones y acciones delicadas; incluir Safari en dispositivo real.
4. Probar la migración y los recorridos que requieren backend en un entorno no productivo autorizado. No usar cuentas ni registros reales del piloto como fixtures.
5. Realizar tareas observadas con participantes y revisar resultados con el propietario.
6. Solicitar autorización separada de publicación, con versión, migraciones y plan de recuperación identificados. Ninguna prueba aprobada equivale a esa autorización.

## Actualización: backend aislado disponible

Se creó `alianza-pruebas` en Alianza App por autorización del propietario, costo confirmado $0/mes. Las 26 migraciones están aplicadas con una adaptación de arranque vacío delimitada al proyecto de pruebas. Pasaron pruebas SQL remotas de solicitudes, límites administrativos, aceptación bilateral, privacidad e invitaciones. Fixtures revertidos; no se copiaron usuarios del piloto.

Evidencia, diferencias del historial de migraciones y avisos de asesores: `TEST_BACKEND_20260920.md`. Esto completa la creación y primera comprobación del backend del punto 4, no el recorrido extremo a extremo: faltan conectar Auth a la vista de revisión y verificar la función de enlaces en ese entorno. La vista privada actual sigue usando datos en memoria. Producción permanece intacta.

## Actualización: entrada completa y servicios reales

La revisión privada incorpora una entrada conectada independiente, con la app real y el backend aislado. Se desplegó la función de enlaces solo allí. Pasaron login Auth, generación/cancelación/renovación/aceptación de invitación, regreso con contraseña, frecuencias independientes, pareja, solicitudes y grupo mediante HTTP. La pantalla de acceso se revisó en Chromium a tres anchos sin desbordamiento. Ver `CONNECTED_REVIEW_20260920.md` para evidencia y límites.

No confundir con recorrido visual autenticado: sigue pendiente, junto con Safari real, accesibilidad integral, fuentes/calendario de Misa y cotejo documental. La revisión conectada no implica que el propietario tenga ya una cuenta de prueba entregada. Las tres cuentas creadas son fixtures sintéticos. Producción continúa intacta.

## Actualización: teclado, límites y cotejo parcial

Se corrigieron límites inválidos al desactivar repeticiones y pérdida de foco al cerrar edición. Regresión y Chromium confirmaron las correcciones. Se revisaron siete pares de contraste estático y acordeones de Misa con teclado. Evidencia y límites: `UX_CLOSURE_REVIEW_20260920.md`.

La revisión de 27 archivos distingue 19 cambios exclusivos de presentación, seis de reglas de producto y dos de Misa pendientes. La huella de publicación no se renovó. Publicar Misa completa todavía depende de contenido autorizado y calendario/variantes cotejados. Mantener Misa solo en revisión y publicar el resto es una alternativa pendiente de decisión, no una acción realizada.


---

# Cierre parcial de integración — 20 septiembre 2026

## Estado actual
Josurf aprobó visualmente la integración con «Ok lo veo bien continuemos». Esta aprobación no equivale a prueba de accesibilidad, Safari real, evaluación con participantes ni autorización de publicación del piloto.

- Implementado y compilado: frecuencias, novenas, repeticiones, indicadores independientes, lecturas serenas y selector de espacios.
- Verificado automáticamente: suite completa en 5561771; compilación conectada posterior con lector habilitado y relay del mismo origen. El artefacto apunta exclusivamente al proyecto aislado xhfqcrmekfjclgazrvrm, no al proyecto de producción.
- Base de pruebas: aplicada scheduled_commitment_courses. Una transacción sintética comprobó persistencia de course.days=9 y rechazo de dos avances en un día; terminó en ROLLBACK. Sin datos de usuarios reales ni correos. Permisos comprobados: cliente no puede ejecutar trigger privado; anon no puede ejecutar validación.
- Publicado únicamente en sitio privado de revisión: versión 14, fuente b81bc72c250de63d3422a1e3a68300a6e71f269a, despliegue appgdep_6aaffa589e488191945ba46e6341cde8 succeeded. /connected/ incorpora la integración y lector; raíz conserva ejemplos sintéticos aprobados.
- Piloto: no publicado, no migrado, main sin cambios.

## Cotejo documental realizado
Comparación contra 8a666b5fb6bc9f2f84d065a64801c3ee258a1886, normalizando únicamente text-button/action-button y atributos data-action: igualdad del contenido restante en commitment-review, community, confession-guide, formation-guide, groups-workspace, home, install-guide, month-review, my-path, pairing-requests, pairing, personal-rosary, reflection-summary, start-guide, symbol-picker y github/admin, invitations, main. Esos cambios son presentación, sin nuevo texto espiritual.

Frecuencias, repeticiones y pausa/reinicio de cursos son reglas del producto, no prescripciones religiosas. Se revisaron schedule, rhythm, commitment-totals, domain, habit-fields y journal y sus migraciones frente a esa frontera.

El Reader oficial de Evangelizo documenta su integración web y el parámetro SP como calendario romano ordinario en español: https://feed.evangelizo.org/v2/reader.php. No acredita correspondencia costarricense ni licencia para un archivo permanente. Se conserva visualización transitoria y atribución.

La estructura general de Misa corresponde a los bloques de IGMR 46–90: https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_sp.html. Esto no cierra el cotejo detallado de variantes especiales ni de todas sus rúbricas. El control metodológico global permanece pendiente; no se actualizaron hashes para forzar aprobación.

## Pendientes reales para liberar
1. Cerrar cotejo detallado de Misa (incluyendo alternativas penitenciales/Kyrie y variantes especiales), mantener estados explícitos de contenido aún no disponible.
2. Implementar y probar relay de lecturas para el destino del piloto. vite.github.config.ts aún deshabilita el lector; el relay de Sites no existe en GitHub Pages. No basta activar un flag ni asumir que CORS funcionará.
3. Prueba integrada en entorno conectado y Safari/iPhone; distinguir automatización, aprobación visual del propietario y pruebas con participantes.
4. Preparar migración y despliegue de producción, revisión final y autorización del propietario.

Calendario CR y oraciones completas autorizadas siguen pendientes; el usuario aceptó el calendario general como alcance inicial. No se afirma disponer de Misal completo.

## Configuración de pruebas observada
Advisor: protección de contraseñas filtradas deshabilitada; revisar antes de promover configuración. https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
Tablas privadas con RLS y sin políticas generan avisos informativos; no se abrieron permisos para silenciarlos. https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
