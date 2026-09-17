# 0.2.0-alpha.7 — Ritmos del horario y reflexiones

Fecha: 2026-09-16. Estado: implementación para revisión; no publicada.

## Comportamiento

- El símbolo principal resume exclusivamente compromisos diarios aplicables. Semana y mes tienen botones compactos, símbolos y tonos secundarios. Solo aparecen si existen compromisos de esa frecuencia.
- «Hoy no aplicaba» excluye el compromiso diario del denominador, sin crear un cumplimiento. Si todos quedan excluidos no se muestra un 100 % artificial.
- Cada meta semanal/mensual pesa lo mismo en su indicador. Su contribución se limita a 100 %; exceder una meta no satisface otra.
- Una meta por días distintos mantiene una marca por fecha. Una meta por veces permite 1–99 ocasiones por fecha, con deshacer. Las metas por veces se limitan a 1–99 por semana o mes.
- Las configuraciones anteriores conservan su significado de días distintos. Para dos rosarios en cualquier momento del mes, editar frecuencia a «Por mes», «Veces», «2». No se reinterpreta automáticamente el pasado.
- Períodos con cambios, pausas o historia insuficiente se identifican como parciales, sin fabricar porcentajes. Los avances semanales/mensuales cubren el período de la fecha seleccionada, hasta hoy.
- Las reflexiones se agrupan en «Mis agradecimientos» y «Mis ofrecimientos a la Mater», con fecha y texto original. La vista breve muestra hasta tres por grupo y permite ver todas.
- El reporte PDF separa las categorías de las notas seleccionadas; compartir continúa siendo voluntario. No se genera una interpretación automática de reflexiones privadas.

## Compatibilidad y privacidad

Migración `20260916215636_schedule_rhythms.sql`, preparada pero no aplicada al piloto. No modifica registros existentes; conserva versiones, propietarios y planes históricos. La validación adicional admite cantidades solo donde el plan propio admite veces. Conserva protección contra escrituras desactualizadas y aislamiento entre cuentas.

Un cliente antiguo o el enlace existente del rosario que guarde «done» no reduce un conteo numérico previo. Los registros adicionales se introducen con «Registrar otra ocasión»: esta versión no convierte automáticamente cada rosario adicional en un incremento.

Antes de publicar: aplicar mediante el procedimiento de mantenimiento y checkpoint existente, verificar preservación y después desplegar la versión compatible. No activar esta interfaz sobre una base sin la migración. La publicación requiere autorización separada.

## Cotejo de producto

Estos cambios responden al feedback del titular y de Neca; no son enseñanza espiritual ni evaluación de fe. Separan períodos, reducen información simultánea y conservan el contexto junto a cada reflexión. No se afirma validación con personas reales ni aval pastoral.

Pruebas: `rhythms.mjs` (cálculo y agrupación), `rhythm-db.mjs` (validación, compatibilidad, concurrencia e aislamiento), `rhythm-ui.mjs` (navegación, ocasiones, deshacer y categorías), `release-upgrade.mjs` (preservación exacta), más suite de regresión, tipado y compilación.

Resultado local: `npm test`, `npm run typecheck`, `npm run build`, `npm run verify:methodology` y `git diff --check` aprobados. La compilación conserva la advertencia de tamaño del paquete principal; no se declara resuelta en este cambio.

Pendiente de revisión humana: legibilidad y tacto en teléfono real; preferencia de los tonos; utilidad de las categorías en el acompañamiento. Las simulaciones automatizadas no sustituyen esa revisión.
