# Feedback 4 — entrada mensual, primer bloque

Seguimiento único: #13; recorrido mensual #29. Rama de prueba, sin publicación.

El propietario aprobó avanzar con el recorrido interactivo el 5 de octubre de 2026 (Costa Rica). La aprobación no autoriza publicación. El dummy está en `review/feedback4/month-journey.html`.

## Implementado

- Mes actual: abre propósito y compromisos; revisión disponible como acción secundaria.
- Revisión anterior pendiente: sugerencia no bloqueante si hay evidencia de actividad en el mes anterior y no existe revisión guardada. Una revisión guardada sin respuestas no obliga a escribir.
- Propósito, ajustes y nuevos compromisos utilizan los editores existentes con sus versiones, validación y privacidad. Al guardar un compromiso desde Mi mes se conserva esa vista.
- Mes pasado: conserva la revisión y su borrador. «Ahora no» vuelve al mes actual, sin intentar preparar un mes histórico.
- Próximo mes: conserva selección y preparación existentes. Un resultado fallido no incrementa la versión local del plan.

## Límite descubierto y pendiente

La acción existente `prepare_month` solo acepta el próximo mes. No se ha extendido ni modificado esa función ni se han cambiado tablas o permisos. Por eso la selección conjunta y el guardado atómico de un plan del mes actual, mostrados en el dummy, todavía NO están implementados. Los ajustes actuales se hacen individualmente y rigen desde hoy, no retroactivamente.

Pendientes: selección conjunta actual, resumen explícito de cierre, diseño completo de formularios, semanas/años, integración 4 Rs/curso, alto volumen y validación visual Safari/PWA/teclado. No considerar el recorrido completo terminado.

## Verificación

Pruebas dedicadas: `node --import tsx tests/month-entry.mjs`, `npm run test:month-review-concurrency`, `node --import tsx tests/session3-ui.mjs`. Cubren entrada contextual, ausencia de pendientes inventados para usuarios nuevos, navegación histórica, acceso a editores, destino del próximo plan y reintento con la misma versión tras fallo.

No hay acceso a contenido privado real ni despliegue. Las pruebas de interacción son JSDOM, no evidencia de geometría ni validación en dispositivo.
