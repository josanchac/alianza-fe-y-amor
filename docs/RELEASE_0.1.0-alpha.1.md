# Entrega 0.1.0-alpha.1

Autorizada por el propietario el 13/9/2026: implementar todas las mejoras, ampliar el logo y llevar historial de versiones. Añadió sugerir los misterios según el día sin quitar la elección.

Alcance: candidata de PR 4, sin ampliar la lista de participantes del piloto. Las ejecuciones 34769273183 y 34769273175 aprobaron la candidata previa, incluidos PostgreSQL concurrente, restauración sintética y Auth/API aislado; esta entrega añade presentación del logo, versión y sugerencia visible.

## Cotejo documental

La distribución de [Santa Sede, Los misterios del Santo Rosario](https://www.vatican.va/special/rosary/documents/misteri_sp.html), consultada 13/9/2026: lunes/sábado gozosos, martes/viernes dolorosos, miércoles/domingo gloriosos, jueves luminosos. La fuente expresa libertad de adaptación. Se usa día local del dispositivo y selección inicial sugerida, sin modificar rosarios persistidos. No se calculan excepciones litúrgicas automáticas.

El emblema SVG original se amplía sin modificarlo. Versionado y notas son reglas de producto; no cambian enseñanzas, preguntas, permisos ni significados espirituales. RELEASE interno se conserva para no invalidar preferencias existentes.

## Compatibilidad

La base ya contiene voluntary_personalization. Antes de activar el cliente se requieren community_prayer y aggregate_product_metrics, con checkpoint privado y comparación de registros originales dentro de la transacción. No se publica contenido real ni se reinician cuentas. Reversión: conservar tablas añadidas y no reactivar el panel anterior por cuenta.

## Evidencia

La inspección de recorridos se documenta en UX_REVIEW_20260913.md. La revisión visual es sintética, no prueba en iPhone físico ni certificación de accesibilidad. Ver historial de CI del commit de entrega para resultados definitivos.

## Pausa solicitada por el propietario

Antes de publicar al piloto, el propietario pidió revisar uno a uno los recorridos, comenzando por rosario individual. No se aplicaron migraciones, no se fusionó la PR y no se modificaron cuentas reales. Se actualiza únicamente la vista privada con los cambios ya preparados.

Criterio a revisar: acompañamiento del rosario individual completo con oración correspondiente y avance de cuentas; la ayuda actual es por decena y requiere evaluación del propietario antes de rediseñarla.
