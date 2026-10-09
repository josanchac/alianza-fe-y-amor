# Corrección de activación del menú de compromisos

Evidencia técnica de #28; orden de entrega en #13. Este documento no sustituye los estados de los issues. Fecha: 09/10/2026 UTC.

## Problema y alcance

El feedback posterior al 05/10 describe opciones que aparecen al deslizar por una lista larga en Android. No demuestra que se haya guardado un estado involuntariamente.

El trigger de Radix abre en `pointerdown`, antes de que el navegador distinga toque de desplazamiento. `tests/habit-menu-touch.mjs` reprodujo el problema en el Journal real, con 50 compromisos ficticios: falló `touch contact must not open the menu` antes de la corrección.

## Cambio

`HabitActionsMenu` limita la corrección al título del compromiso. Evita la activación interna en pointerdown y abre con click (activación completada). El navegador suprime click cuando interpreta el gesto como scroll; no se añade captura de puntero, touch-action:none, umbrales de presión ni pulsación prolongada. Radix conserva Enter, Espacio, flecha abajo, Escape y gestión de foco. Mouse y click de tecnología asistiva siguen disponibles.

No cambia textos, opciones, permisos, reglas de guardado ni disposición visual. No es un rediseño del patrón de formularios, que mantiene su revisión pendiente. No hay migraciones ni consulta de datos reales.

## Verificación ejecutada

- Regresión reproducida antes y aprobada después: contacto, movimiento/cancelación y pointerup sin click no abren el menú ni escriben. Un toque completo abre; solo seleccionar «Me costó» envía el cambio esperado. 50 compromisos sintéticos.
- Enter, Espacio, flecha abajo, Escape, mouse y click sin detalle de puntero.
- Pruebas existentes de acciones de compromisos, revisión, frecuencias y experiencia aprobada: aprobadas. Sus helpers ahora simulan click completo en vez de depender de apertura prematura.
- Typecheck y build: aprobados. Persiste el aviso de tamaño del bundle.

La simulación JSDOM no ejecuta el motor de scroll del navegador ni acredita rendimiento/validación visual. Pendiente antes de cerrar #28: Android real y comprobación Safari con lista extensa, scroll iniciado sobre título/checkbox, toque deliberado, cierre y retorno del foco. La revisión global a 200% de letra y con teclado sigue pendiente.

## Entrega y reversión

PR en borrador sobre `fix/feedback4-month-entry-20261006` (PR #37), sin despliegue. Para revertir esta corrección, revertir su commit; no hay transformación de datos. No revertir los bloques anteriores de guardado o entrada mensual.
