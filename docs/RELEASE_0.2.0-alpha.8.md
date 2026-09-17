# 0.2.0-alpha.8 — Visibilidad del piloto cercano

2026-09-16. Implementada para revisión; no publicada ni aplicada al servicio de producción.

## Problema y solución

El panel general oculta datos con menos de cinco participantes, e indicadores usados por menos de cinco. Por ello no sirve para el piloto actual de dos parejas y cuatro personas.

Se agrega un panel independiente para quienes acepten «Participar en el piloto cercano». Muestra cantidades desde una persona, incluyendo cero eventos recibidos. No cambia el consentimiento general ni reduce su umbral. No utiliza registros personales anteriores para reconstruir actividad.

## Información mostrada

- Cuentas que aceptaron; cuentas activas en siete y treinta días.
- Personas y días-persona por función: día, semana, mes, revisión, recorrido/reporte, oración, grupo, espacio personal y pareja. Cada categoría se cuenta una vez por fecha y persona.
- Cargas y guardados correctos, errores y cargas de más de tres segundos. Son solicitudes técnicas, no cumplimiento de compromisos.
- Sin nombres, correos, identificadores, textos, títulos de compromisos, fechas individuales ni fichas por usuario. La muestra pequeña puede permitir deducciones; la interfaz lo explica y no promete anonimato.

El criterio se alinea con la separación ya documentada entre adopción/uso y éxito técnico de tareas. Estos conteos no son una prueba causal, ni una escala de crecimiento espiritual, ni una tasa de retención por cohorte. Sirven para decidir qué flujo observar o conversar con los participantes. Cero eventos recibidos no prueba ausencia de errores fuera de conexión.

## Datos y autorización

Migración aditiva `20260916221507_pilot_metrics.sql`. Tablas privadas con RLS; rol de métricas sin lectura del contenido personal. RPC admite exclusivamente categorías fijas, sin metadatos libres, rutas, texto, identificadores externos ni marcas de tiempo del cliente. El servidor usa fecha de Costa Rica. Ventana máxima consultable de noventa días con limpieza al llamar la RPC; el panel usa treinta días.

La aceptación es propia y revocable. No se habilita a terceros desde la cuenta administradora. La retirada borra los eventos de ese participante y el resumen deja de incluirlos. Los datos generales existentes conservan sus reglas. El panel admite únicamente administradores vigentes y miembros con correo confirmado.

Para publicar, aplicar la migración mediante mantenimiento/checkpoint y desplegar frontend compatible, con autorización separada. No publicar únicamente el frontend. La rama incluye alpha.7, que también requiere su migración.

## Verificación

`pilot-db.mjs`: cuatro participantes, evento de una persona visible, ausencia de captura antes de aceptar, deduplicación diaria, revocación, eliminación, rechazo de texto adicional, rechazo de categorías sensibles, acceso administrador y aislamiento de tablas personales.

`pilot-ui.mjs`: datos pequeños visibles, borrado de resultados al perder acceso, aceptación independiente, ningún evento de función antes de aceptar ni después de retirar la aceptación. `release-upgrade.mjs` ensaya preservación de datos existentes. Se ejecutan además tipado, compilación y pruebas de regresión.

Pendiente: publicación autorizada y prueba con participantes reales, sin activar opciones por ellos. No se declara validación en teléfonos reales ni medición histórica recuperada.
