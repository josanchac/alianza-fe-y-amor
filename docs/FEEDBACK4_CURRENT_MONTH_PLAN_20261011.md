# Preparación y guardado integral del mes actual

Trabajo de #29 dentro del plan #13, sobre PR #40. Continúa la propuesta mensual revisada en #39: selección y diferencias visibles junto a cada compromiso, guardado directo, vigencia explícita y sin pantalla de confirmación adicional. El propietario pidió continuar el 11/10/2026. No hay publicación ni migración aplicada a producción.

## Recorrido implementado

Mi mes → Elegir y ajustar compromisos abre el conjunto del mes actual. Permite seleccionar individualmente o todos, crear, ajustar y pausar compromisos; propósito opcional en la misma vista. El inicio mensual conserva acceso a la revisión y a preparar el siguiente mes, y muestra un resumen del horario en vez de repetir toda la lista.

El editor reutiliza HabitFields para conservar días elegidos, varias sesiones, cursos y novenas. Las diferencias se muestran junto al elemento. El próximo mes conserva la acción existente `prepare_month` y su aplicación diferida; los recorridos ya existentes continúan sin trasladar ni reiniciar su avance.

Borradores en memoria por mes, cuenta, época y relación. Incluyen los cambios dentro de la edición de un compromiso al navegar fuera del módulo. La descarga/recarga advierte de borradores pendientes mediante la protección existente. No es recuperación persistente después de cerrar el navegador. Cancelar la edición de un elemento descarta sus cambios locales. Volver al mes mantiene los cambios ya aplicados al borrador del plan.

Guardar bloquea doble envío y cambios durante la solicitud. Solo confirma el mes actual si recibe el estado guardado. En error conserva el borrador. Permite volver a intentar o, con confirmación expresa, descartar el borrador y cargar la versión guardada. Un conflicto no se resuelve adoptando versiones silenciosamente.

## Servidor y conservación

Migración generada con `supabase migration new current_month_plan`: `20261011225018_current_month_plan.sql`.

Añade `save_current_month` al enrutador privado existente. Conserva las demás acciones mediante el envoltorio anterior. Verifica acceso al piloto, usuario autenticado, membresía, época, relación, versiones de plan/propósito/compromisos, incorporaciones ajenas al borrador y fecha efectiva calculada en Costa Rica. Solo permite el mes actual y la fecha de hoy, nunca una fecha anterior enviada por el cliente.

El propósito y los compromisos se guardan en una sola transacción. Un conflicto o validación fallida revierte todo. Mantiene la revisión del mes dentro del registro de propósito y no toca checks, journal ni habit_review. Las filas de compromisos sin cambios no se reescriben. El historial de frecuencia/actividad usa el disparador existente con vigencia de hoy, preservando lo anterior.

Los planes futuros permanecen separados. Cuando una elección futura referencia exactamente la versión que cambia hoy, se actualiza solo esa referencia para que su contenido ya elegido pueda aplicarse después. No se cambian sus frecuencias, selección o propósito. Avanza la versión del plan futuro para rechazar editores antiguos. Referencias que ya eran conflictivas no se concilian automáticamente.

El guardado repetido con la misma versión se rechaza; no duplica compromisos ni marcas. Una respuesta perdida requiere revisar la versión guardada antes de reintentar; no hay garantía de idempotencia por identificador de solicitud.

## Validación

- `tests/current-month-plan-db.mjs`: ejecuta todas las migraciones en PGlite con usuarios/datos sintéticos y un reloj de prueba inyectado exclusivamente en el arnés. Verifica creación, pausa/reactivación, historial, notas y revisión intactas, novena no reescrita, conflictos atómicos, duplicados, versión/época/relación, aislamiento entre cuentas y acceso de roles.
- Reloj de prueba: 30/31 de diciembre, 1 de enero y el instante 05:59→06:00 UTC que cambia el día en Costa Rica. Un plan de enero ya preparado sigue aplicándose tras los cambios de diciembre.
- `tests/current-month-plan-ui.mjs`: payload atómico, diferencias, error/reintento, doble toque, controles bloqueados, borradores por mes, versiones confirmadas, recuperación explícita, próximo mes y 50 compromisos.
- Suite completa `npm test`, tipos, build y diff check aprobados. Se mantiene el aviso previo de bundle mayor de 500 kB. Tras añadir la detección de compromisos omitidos/agregados se volvió a ejecutar el bloque de base de datos e interfaz.

`supabase db advisors --local --type security` se intentó: no hay Postgres local escuchando en 127.0.0.1:54322. El arnés PGlite sí ejecuta SQL y verificaciones de catálogo: la tabla permanece privada, anon no ejecuta el nuevo envoltorio y authenticated no ejecuta directamente el envoltorio histórico. No se presenta esto como un informe completo de Advisors. Ejecutarlo en un entorno Supabase de prueba antes del despliegue sigue pendiente.

Changelog y documentación oficial de funciones revisados el 11/10: https://supabase.com/changelog y https://supabase.com/docs/guides/database/functions. El aviso de Postgres 15.19/17.11 trata extensiones/operadores que esta migración no añade ni modifica. No se leyeron datos reales.

## Entrega y límites

Aplicar la migración en el entorno de prueba antes de probar el cliente conectado; luego validar con Safari/Android, teclado y texto ampliado. Las pruebas JSDOM no acreditan geometría ni comprensión humana. Producción permanece intacta.

Una reversión debe retirar primero el cliente que invoca `save_current_month`. El nuevo envoltorio puede permanecer sin uso; no borrar registros, historia ni month_plans. Para restaurar la función anterior mediante una migración posterior, conservar la concesión y nombre públicos del enrutador; ensayar esa migración en el entorno de prueba. No realizar un rollback destructivo de datos guardados.

Siguen fuera de este bloque: vigencia retroactiva (#33), recorridos completos semana/año, integración de ámbitos (#30), criterios restantes de #29 y aceptación global de entrega. Este bloque no certifica que todo el backlog esté listo para publicar.
