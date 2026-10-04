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
La recuperación guiada de un conflicto real y la protección al salir de un
borrador mensual siguen siendo trabajo de #27; no se declara cerrado.

## Pruebas y límites

`tests/month-review-concurrency.mjs`: edición del propósito con borrador pendiente;
revisión recibida en formulario limpio; conflicto real sin pérdida/sobrescritura;
propósito creado mientras se escribe; reintento fallido y dos guardados sucesivos,
incluyendo actualización del padre antes de resolver el guardado.
Se agrega al comando `npm test`. Datos ficticios, sin conexión a producción.

El registro de ejecución definitivo y la propuesta de cambio quedan enlazados
en #27. JSDOM no acredita Safari/PWA, teclado móvil ni recuperación operativa.
Las pruebas no validan todo el alcance de feedback 4.

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
