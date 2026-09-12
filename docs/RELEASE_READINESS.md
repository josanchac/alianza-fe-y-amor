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
| Revisión metodológica | Cotejo documental cerrado para las guías breves y exclusiones de esta versión; ver [evidencia](DOCUMENTARY_VERIFICATION.md). La revisión por asesor está diferida por decisión del propietario y no es requisito de esta etapa. |
| Respaldo y recuperación del piloto | Hay ensayo sintético exitoso. Antes de cualquier migración real, preparar y verificar respaldo del entorno real y procedimiento para conservar las escrituras posteriores. |
| Reinicio individual de la esposa | Pendiente. Confirmar la cuenta objetivo mediante el procedimiento privado, respaldar, conservar Auth e historial matrimonial y añadir protección específica contra escrituras desde sesiones anteriores al reinicio. La versión de vinculación no sustituye ese mecanismo. |

La documentación de Dropbox está pospuesta por indicación del propietario. No se presenta como un bloqueo para programar; tampoco se considera verificada. Las guías no se anuncian como oficiales, aprobadas o completamente fieles sin evidencia que lo sustente.

## Última corrección preparada

Cotejo documental, retirada de ayudas externas, consulta sin ideal personal y dieciséis símbolos. Pasaron TypeScript, la suite completa y la compilación local. La prueba de migración compara registros anteriores y verifica compatibilidad de las opciones visuales con el servidor, sin cambiar permisos o ideales. La migración `20260912141154_personal_symbols.sql` debe aplicarse antes del cliente nuevo, junto con las pendientes anteriores. No se aplicó al piloto.

## Límites de alcance

Quedan fuera los estados formativos persistentes del ideal personal y las recomendaciones automáticas. Se integraron notas privadas y valoración personal por semana o mes, además de una invitación voluntaria a explorar otra práctica cuando el usuario lo elige. Se incorporaron dieciséis símbolos y una ayuda opcional para continuar sin ideal personal. No hay curso pago ni generación automática de ideales.

El build conserva una advertencia por tamaño del bloque JavaScript; falta medir su impacto en teléfonos representativos. La prueba sintética no acredita WCAG, ASVS ni otra certificación, ni garantiza resultados espirituales.

## Seguimiento por compromiso

La migración `20260912142635_commitment_reviews.sql` añade el contrato de notas y valoraciones sin reescribir datos anteriores. Debe preceder al nuevo cliente. Cada revisión pertenece a un compromiso propio y a un período completo; los períodos abiertos solo admiten notas. Las notas anteriores continúan disponibles al cambiar frecuencia o pausar. Los asesores locales volvieron a encontrar la instancia desconectada; se mantiene pendiente esa comprobación en el entorno separado. El reinicio protegido debe incluir también los registros `habit_review`.

## 12 septiembre — acceso real y reinicio recuperable

Se agregó un trabajo aislado de CI con Supabase CLI 2.117.0, Auth y PostgREST reales; no utiliza secretos, cuentas ni datos del piloto. Prueba credenciales, confirmación, membresía, permisos, vinculación bilateral, revocación, renovación/cierre de sesión y rechazo de escrituras previas a un reinicio. La migración histórica necesita dos asientos originales: se reproducen con identidades ficticias.

El reinicio de una sola cuenta ya tiene implementación y pruebas locales de restauración, aislamiento y bloqueo de formularios antiguos. Detalle: PERSONAL_RESET.md. El cotejo documental mantiene el mismo alcance espiritual: esta entrega agrega controles técnicos de recuperación y acceso, no contenido formativo nuevo.

Pendientes para producción: resultado final de esta CI, validación visual en celular, comprobaciones del entorno gestionado, respaldo independiente del piloto y ejecución sobre la identidad verificada. La revisión pastoral y Dropbox siguen diferidos, sin bloquear esta etapa documental.

Consulta de solo lectura del piloto (12 septiembre): el asesor gestionado de seguridad informa una advertencia de protección de contraseñas filtradas desactivada, sin otros hallazgos devueltos. Referencia: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection. No se cambió configuración ni plan. Este resultado corresponde al esquema actualmente publicado, no certifica las migraciones de revisión. La CI incorpora además el asesor sobre la base desechable ya migrada, con fallo ante errores.
