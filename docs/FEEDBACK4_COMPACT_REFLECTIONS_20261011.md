# Reflexiones compactas en Hoy

Seguimiento único: #20 dentro de #13; actualización del PR #40. El propietario cuestionó la ubicación y el scroll el 09/10. Revisó la propuesta de Hoy completo con acceso compacto, lectura aparte y regreso, y respondió «ok» el 11/10/2026 Costa Rica. Se implementa esa corrección; no autoriza publicación.

## Cambio

Se reemplaza la tarjeta de lectura permanente por una fila «Mis reflexiones» debajo de compromisos y su acción de añadir. Muestra cuántas de las tres categorías tienen texto; espacios en blanco no cuentan. Es un dato de contenido guardado, sin meta ni puntuación. La cantidad de texto no aumenta la altura de Hoy.

Abrir oculta la vista del día y su navegación, muestra fecha, categoría y privacidad vigente, y permite leer el texto completo. No abre el teclado. El botón «Volver a Hoy» restaura foco y posición de scroll. La vista del día permanece montada pero oculta, preservando sus controles. El contexto se reinicia al cambiar fecha, cuenta, datos reiniciados, relación, espacio o período.

Editar reutiliza el formulario existente, incluida su protección de cambios sin guardar, conflictos, errores y reintento. La privacidad reutiliza la misma función del editor; no cambia permisos, base de datos ni API.

La propuesta revisada con datos ficticios se conserva en `review/feedback4/compact-reflections.html`. Es una referencia del flujo: sus controles de navegación global son contexto visual, no módulos funcionales completos.

## Validación y límites

Pruebas específicas de Journal aprobadas: ausencia del texto en Hoy cerrado, lectura sin escrituras, fecha y privacidad, apertura con foco en Volver, cierre con restauración de foco/solicitud de scroll, edición con fallo/reintento y preservación de otros campos. La cantidad se actualiza después del guardado. Regresiones de primer uso y experiencia aprobada adaptadas al nuevo acceso.

Suite completa `npm test`, `npm run typecheck`, `npm run build` y `git diff --check` aprobados. La compilación mantiene el aviso existente de bundle mayor de 500 kB.

La prueba de scroll verifica la llamada y el valor restaurado en JSDOM; no acredita geometría ni teclado en un teléfono real. Pendientes Safari/Android, texto ampliado y evaluación con listas extensas. Con muchos compromisos, llegar al acceso sigue requiriendo recorrer esa lista: esta corrección evita el crecimiento por notas, no resuelve toda la longitud de Hoy.

Sin publicación ni merge. Revertir este commit restaura la tarjeta anterior sin transformar datos. Guardado integral del plan mensual sigue en #29, fuera de este ajuste.
