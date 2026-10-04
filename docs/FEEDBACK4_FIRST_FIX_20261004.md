# Feedback 4: primera corrección — 04/10/2026

Seguimiento único: [plan #13](https://github.com/josanchac/alianza-fe-y-amor/issues/13),
[guardado #27](https://github.com/josanchac/alianza-fe-y-amor/issues/27) y
[Misa #34](https://github.com/josanchac/alianza-fe-y-amor/issues/34).
Este documento es evidencia técnica del cambio, no otro backlog.

## Alcance y causa reproducida

Base: `6f056e7`, versión `0.4.0-alpha.2`. Rama `fix/feedback4-20261004`.
La revisión mensual y el propósito comparten un registro `purpose` y su versión.
MonthReview retenía la versión de su primer render. Editar el propósito mediante
su diálogo actualizaba el registro en el mismo celular pero dejaba la versión
de la revisión atrasada. Al guardar, el servidor rechazaba correctamente esa
versión obsoleta; la interfaz atribuía el cambio a otro celular sin evidencia.

La prueba nueva falló en la base: esperaba versión 2 y recibió 1. Esto reproduce
un camino compatible con el reporte, no demuestra que sea la única causa del
incidente original ni equivale a inspeccionar datos privados.

## Corrección acotada

- `useMonthlyReviewDraft` mantiene borrador y versión de origen juntos.
- Si solo cambió el propósito, actualiza la versión sin borrar las respuestas.
- Si llegó una revisión nueva y no hay cambios locales, refleja la versión recibida.
- Si hay cambios locales y otra revisión cambió, conserva el borrador y la
  versión original para que el servidor siga rechazando la sobrescritura.
- Un guardado fallido no incrementa la versión ni muestra éxito; uno confirmado
  avanza a la versión enviada + 1, conforme al contrato existente del servidor.
- El error 409 no supone que se usó otro celular.

Sin migración, cambios de permisos, almacenamiento persistente de diarios,
reintentos de escritura automáticos, cambio de navegación o nuevas preguntas.
No se cambian textos espirituales, frecuencias, recuentos ni consentimiento.
La revisión mensual ahora conserva en memoria sus respuestas, texto de origen y
versión al cambiar entre vistas o meses dentro del mismo Journal. Cada cuenta y
reinicio de espacio obtiene un almacén nuevo. Un guardado confirmado descarta
solo el borrador guardado; escribir durante una petición mantiene el texto nuevo.
El aviso nativo de salida también considera borradores de meses no visibles.
No usa localStorage/sessionStorage, guardado automático ni un diálogo nuevo.

La recuperación guiada de un conflicto real y la continuidad tras expirar sesión
siguen pendientes en #27. El almacén se pierde al desmontar Journal, cerrar sesión
o recargar; beforeunload no garantiza aviso ante cierre forzado o suspensión móvil.
No se declara cerrado el issue ni se extiende esta protección a todos los formularios.

## Pruebas y límites

`tests/month-review-concurrency.mjs`: edición del propósito con borrador pendiente;
revisión recibida en formulario limpio; conflicto real sin pérdida/sobrescritura;
propósito creado mientras se escribe; reintento fallido y dos guardados sucesivos,
incluyendo actualización del padre antes de resolver el guardado.
Se agregan navegación entre meses, recuperación del borrador con conflicto remoto
y escritura durante un guardado pendiente. `tests/journey.mjs` comprueba la
integración real en Journal: Mi día → Mi mes, aislamiento por mes, aviso de salida,
limpieza tras guardar, invalidación por dataEpoch y nueva sesión sin borrador viejo.
Se agrega al comando `npm test`. Datos ficticios, sin conexión a producción.

El registro de ejecución definitivo y la propuesta de cambio quedan enlazados
en #27. JSDOM no acredita Safari/PWA, teclado móvil ni recuperación operativa.
Las pruebas no validan todo el alcance de feedback 4.

CI de la primera corrección (`3ab81b7`): ejecuciones 37220836373 y 37220836455
aprobadas, incluyendo PostgreSQL concurrente, restauración sintética y Auth/API.
La ampliación de borradores requiere su propia ejecución sobre el nuevo commit.
Inventario operativo y límites de respaldo: `FEEDBACK4_RELIABILITY_AUDIT_20261004.md`.

## Cotejo documental acotado

Área M09: se preservan la opcionalidad de la revisión, sus tres preguntas,
historia y valoración elegida por la persona. Sin nuevas enseñanzas ni
interpretaciones espirituales; es protección de escritura de una regla de
producto ya existente. Se revisan únicamente las diferencias de código de esta
rama para actualizar su huella documental, sin atribuir validación territorial
al leccionario, validación humana del diseño ni aval institucional.

## Misa: diagnóstico, no corrección terminada

La respuesta XML de Evangelizo SP para 2026-10-04 trae los versículos de
`reading_text2` sin respuesta de la asamblea. No puede corregirse solo con CSS.
La app atribuye esos textos a El Libro del Pueblo de Dios y no cuenta con un
leccionario CR verificado. En #34 se exige cotejo de celebración, edición,
fuente y reproducción antes de agregar respuestas; nunca se fabrican a partir
de los versículos. No se cambia el proveedor en esta primera corrección.

## Publicación y recuperación

No publicada. Antes de integrar: revisión de la propuesta, validaciones
pertinentes y requisitos de publicación del plan #13. La rama principal
despliega automáticamente: no fusionar como simple paso de documentación.
Este cambio no requiere revertir datos; su reversión es un commit de cliente
que restablezca los archivos afectados, sin eliminar registros.
