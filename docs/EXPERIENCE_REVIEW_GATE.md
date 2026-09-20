# Regla de revisión de experiencia

Decisión del propietario, 19 septiembre 2026: antes de implementar cambios de experiencia y publicarlos, preparar un dummy, revisarlo juntos y obtener aprobación explícita. Aprobar el dummy no equivale a aprobar una publicación.

Secuencia obligatoria: problema y escenarios → dummy con datos ficticios → revisión y aprobación del propietario → implementación → pruebas funcionales y visuales → aprobación de publicación. No sustituir revisión conjunta por pruebas automatizadas. Si una verificación queda bloqueada, declararla y no afirmar que pasó. No modificar producción para obtener una vista previa.

El dummy debe incluir estados vacío, parcial, completo, error y corrección relevantes para el cambio; ejemplos etiquetados como ficticios. No consultar datos espirituales privados para poblarlo. La primera propuesta de períodos todavía requiere estados adicionales y aprobación: no es diseño final.

## Acciones reconocibles y fáciles de tocar

Feedback del propietario: las acciones con aspecto de enlace son difíciles de reconocer y acertar, especialmente con prisa o poca experiencia digital. Pendiente de aplicar a toda la app después de revisar el dummy: acciones en botones con superficie reconocible, etiquetas concretas y jerarquía primaria/secundaria; controles de registro con objetivo táctil de al menos 44 × 44 CSS px y botones de acción de 44 px de alto habitual como objetivo de diseño, con ancho por contenido y apariencia liviana; espacio entre controles y foco visible. Reservar enlaces para navegación. Evitar depender de hover, color o iconos sin nombre accesible. Deshacer debe ser botón secundario visible; no necesita el mismo énfasis que registrar. No se considera auditoría de accesibilidad completa ni cambio ya publicado. Dummy vigente: review/integral; ver BUTTON_PROTOCOL_REVIEW.md.

## Conciliación del estado actual

La última entrega está implementada, pero el backlog global no está cerrado. `PILOT_LIFECYCLE_BACKLOG.md` es una propuesta histórica y no refleja las entregas posteriores; consultar `PILOT_INVITATIONS_IMPLEMENTATION.md` y `EXPANDED_JOURNEYS_20260919.md`.

- Implementado: invitaciones individuales, renovación/cancelación y enlace manual; búsqueda/filtros; pulso agregado; solicitudes persistentes; rayo; correcciones de encabezado/espaciado/scroll. No confundir implementación con validación humana.
- Problema confirmado pendiente: `app/journal.tsx` calcula `markedToday / habits.length` sin separar frecuencias. Una meta mensual ya cumplida sigue en el denominador diario. Los 14 controles anteriores no cubrían esta semántica.
- Pendiente de diseño y aprobación: avance por período; no mezclar metas diarias/semanales/mensuales. Contemplar ausencia de metas, metas múltiples, ocasiones vs días, períodos parciales, cambios de frecuencia, deshacer y registros adicionales sin obligación nueva.
- Pendiente de validación: dispositivos reales, accesibilidad completa, comprensión humana, continuidad del rosario al bloquear teléfono; correo transaccional/recuperación con entrega real comprobada, distinta del enlace manual.
- Ampliaciones pendientes: suspensión/reactivación de cuentas activas y salida/borrado con efectos en vínculos e historial; apostolado, fechas significativas, curso guiado del ideal comunitario, push y bibliotecas extensas.
- No duplicar como pendientes las notas y valoración por compromiso: existen en `app/commitment-review.tsx`, incluida valoración sin marcas que no altera el recuento.

En este turno no se cambia código de producto, base de datos ni publicación. Documento local de trabajo; sin sincronización remota todavía.
