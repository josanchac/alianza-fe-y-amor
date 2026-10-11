# Actualización 11/10/2026

La presentación desplegada descrita abajo fue sustituida tras revisión del propietario por un acceso compacto con lectura aparte. Ver `FEEDBACK4_COMPACT_REFLECTIONS_20261011.md`. El resto se conserva como evidencia histórica de la primera implementación.

# Notas guardadas visibles en Hoy

Implementación del bloque de #20; seguimiento #13. El propietario revisó el prototipo, solicitó simplificar la confirmación mensual y cerró comentarios con «Eso era sigamos» el 08/10/2026 Costa Rica. Se incorpora el bloque diario aprobado al recorrido de trabajo. Sin publicación.

## Qué cambia

`DailyMoments` presenta una categoría del día seleccionado: Ofrecimiento, Agradecimiento o Meditación. Muestra el texto guardado sin abrir el editor, una vista breve de hasta 180 puntos de código y «Leer completo» cuando hace falta. El texto completo se conserva literalmente; no se resume. Vacío/espacios ofrece escribir, sin obligación.

Cambiar de categoría y expandir solo modifican estado de lectura. Editar usa `editJournal` y el formulario existente: permisos, versión, error/reintento y guardado del registro completo siguen en Journal. La confirmación de guardado procede del flujo existente.

La etiqueta de privacidad utiliza la misma función que el editor, ampliada para aceptar el registro/categoría mostrado. Respeta clave de fecha, categoría, opciones de compartición, versión de relación, estado sin pareja y compatibilidad con el esquema anterior. No se amplía acceso ni se consultan registros de la pareja para mostrar notas propias.

El estado de lectura se aísla por cuenta, reinicio de datos y relación; expansión se reinicia por fecha, categoría y versión del registro. No hay almacenamiento persistente nuevo, telemetría de textos, migraciones ni datos reales en pruebas.

## Pruebas

- `npm run test:daily-moments`: integración con Journal real y datos sintéticos. Lectura sin escrituras; texto largo exacto; vacíos; separación por día/categoría; error seguido de reintento; preservación de los otros campos; etiquetas de compartición selectiva, antigua, relación cambiada y sin pareja.
- `tests/neca-feedback-ui.mjs`: adaptado al acceso por categoría y botón Escribir; sigue comprobando el editor específico y guardado.
- `npm test`, `npm run typecheck` y `npm run build`: aprobados sobre esta entrega, incluida la nueva regresión de notas y la regresión táctil del menú. El aviso de tamaño del bundle existente no es un error de compilación.

La validación de interfaz es JSDOM, no un teléfono real. Continúa pendiente Safari/Android, 320–430 px y texto ampliado. No se eludieron los bloqueos de navegador documentados en el lote anterior.

## Alcance mensual y reversión

La corrección de la propuesta mensual está en PR #39: guardar desde la selección, cambios concretos junto a cada compromiso, fecha de vigencia visible y sin pantalla intermedia. El guardado integral del mes actual requiere el trabajo de persistencia de #29; no está implementado por esta entrega diaria.

Para revertir este bloque, revertir su commit; no hay transformación de datos. Mantener los cambios anteriores de guardado, menú táctil y entrada mensual. Los issues siguen abiertos hasta completar sus criterios; la aprobación de diseño no autoriza despliegue.
