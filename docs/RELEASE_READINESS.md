# Preparación de la nueva experiencia · 12/9/2026

**No publicada.** La rama `review/guided-methodology` contiene una versión verificable. El piloto y sus usuarios siguen intactos. No se reinició la cuenta de la esposa del propietario.

## Evidencia ejecutada

La [ejecución 34697732996 de GitHub Actions](https://github.com/josanchac/alianza-fe-y-amor/actions/runs/34697732996) concluyó con éxito para el commit `899e649bed5cc591cb2675f0b683a1babb9208c7`:

- Instalación con lockfile, TypeScript, suite completa y compilación.
- Todas las migraciones incrementales sobre PostgreSQL 17.11, con conservación de los registros personales originales de prueba.
- Conexiones independientes compitiendo por aceptar una invitación, aceptar invitaciones distintas y aceptar/cancelar.
- Guardado/desvinculación en ambos órdenes: sin reactivación de permisos antiguos. Un encuentro cuyo guardado ya había comenzado permanece en el archivo de sus participantes.
- Confirmación y revisión simultáneas del ideal: la frase nueva no hereda confirmaciones anteriores.
- RLS activo en tablas privadas; denegación de contenido a clientes y métricas; entradas públicas con seguridad del invocador.
- Respaldo y restauración con herramientas de PostgreSQL en otra base del mismo contenedor. Coincidieron tablas de aplicación, identidades sintéticas y definiciones de funciones. No se exportó ningún dato real ni se subió el respaldo como artefacto.

El flujo guarda únicamente evidencia JSON y destruye el contenedor al terminar. Sus permisos son de lectura de código; no puede desplegar ni acceder al proyecto de Supabase. El código de pruebas rechaza direcciones de bases remotas y exige una base vacía llamada `alianza_ci` en localhost.

## Pendientes para publicar

| Requisito | Estado y siguiente acción concreta |
|---|---|
| Prueba visual y uso en celular | Pendiente. El navegador del entorno bloqueó tanto el servidor local como la apertura del archivo de prueba; no se insistió mediante otra vía de control. La vista con datos ficticios está preparada en `tests/preview-frame.html`. Observar el recorrido sin explicar antes dónde tocar; verificar legibilidad, teclado, foco y controles táctiles. |
| Auth y API de Supabase alojados | Pendiente para estas migraciones. Solo existe el proyecto del piloto; no se creó una rama ni un proyecto de pago. Preparar un entorno separado autorizado y ejecutar el recorrido con cuentas sintéticas, JWT y permisos reales. |
| Asesores de Supabase | Pendientes sobre la versión migrada. La comprobación local anterior no pudo conectar; los controles SQL del CI aportan evidencia específica, pero no sustituyen los asesores del servicio alojado. |
| Revisión metodológica | Trece áreas pendientes. [Pauta preparada para un padre o asesor](PASTORAL_REVIEW.md), con fuentes y preguntas. Registrar quién revisa, en qué calidad, correcciones y alcance de conformidad sobre la versión exacta. |
| Respaldo y recuperación del piloto | Hay ensayo sintético exitoso. Antes de cualquier migración real, preparar y verificar respaldo del entorno real y procedimiento para conservar las escrituras posteriores. |
| Reinicio individual de la esposa | Pendiente. Confirmar la cuenta objetivo mediante el procedimiento privado, respaldar, conservar Auth e historial matrimonial y añadir protección específica contra escrituras desde sesiones anteriores al reinicio. La versión de vinculación no sustituye ese mecanismo. |

La documentación de Dropbox está pospuesta por indicación del propietario. No se presenta como un bloqueo para programar; tampoco se considera verificada. Las guías no se anuncian como oficiales, aprobadas o completamente fieles sin evidencia que lo sustente.

## Límites de alcance

Siguen fuera de esta integración las sugerencias graduales de nuevas prácticas, las notas por compromiso, la confirmación de cumplimiento cuando faltan marcas, los estados formativos del ideal personal y la ampliación del repertorio de símbolos. No hay curso pago ni generación automática de ideales.

El build conserva una advertencia por tamaño del bloque JavaScript; falta medir su impacto en teléfonos representativos. La prueba sintética no acredita WCAG, ASVS ni otra certificación, ni garantiza resultados espirituales.
