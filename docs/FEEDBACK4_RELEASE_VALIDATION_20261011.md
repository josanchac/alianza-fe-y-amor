# Validación incremental de la candidata · 11/10/2026

Seguimiento: #13, #29 y PR #41. El propietario pide avanzar paso a paso hacia una publicación hoy. No constituye evidencia de publicación ni de condiciones ya superadas.

## Cotejo documental

Se comparó el contenido ejecutable actual con el manifiesto de revisión de `1241fcd`. Siete archivos difieren: `current-month-home`, `daily-moments`, `habit-actions-menu`, `journal`, `month-plan-editor`, `month-review` y la migración `20261011225018_current_month_plan`.

- M02/M09: propósito opcional, preparación del mes actual y siguiente, revisión accesible y sugerencia no bloqueante del anterior. Elegir compromisos y su fecha de vigencia son reglas de producto; no prescriben cambiar el propósito cada mes ni califican el crecimiento espiritual. Se mantienen las tres preguntas de revisión, las notas anteriores y las valoraciones individuales.
- M09/M11: guardar aplica decisiones explícitas del usuario. No interpreta marcas como madurez de un hábito. Preserva historia, novenas, revisión y decisiones futuras; un conflicto no impone una conciliación automática.
- M12: lectura de reflexiones en vista dedicada usando los registros y la política de compartición existentes. No crea nuevos permisos ni nuevos contenidos espirituales. Menú de compromiso: cambio de activación táctil, sin cambio de acciones.
- La migración añade un envoltorio privado con comprobaciones de acceso, época, relación, versiones y fecha. Delegación de acciones anteriores conservada; sin acceso directo de clientes a tablas ni a la función histórica renombrada.
- Comparación completa del inventario: ningún archivo de oraciones, guías doctrinales o fuentes litúrgicas cambió respecto al manifiesto anterior. No se extiende el alcance de la verificación de Misa ni se afirma correspondencia con Costa Rica.

La actualización del manifiesto registra este cotejo, no elimina ni debilita el verificador. No equivale a aval pastoral, prueba visual o autorización adicional.

## Comprobación inicial de CI

Sobre `1d4b3a7c7f513d2adf35fab0ac2a21025dcf6db5`, ejecución 38182689690 aprobada. Ejecución 38182689696: suite y tipos aprobados; trabajo Auth/API y asesor de seguridad en Supabase desechable aprobados. El trabajo PostgreSQL se detuvo por la diferencia del manifiesto documental; concurrencia y restauración quedaron sin ejecutar, no fallaron por un resultado de datos.

Se añade al arnés Auth/API el guardado mensual por RPC público, relectura, rechazo de versión repetida y aislamiento, con cuenta sintética independiente. Pendiente del nuevo resultado CI.

## Entorno y límites

Se solicitó reactivar el proyecto existente `alianza-pruebas`, sin crear recursos ni cambiar suscripción. Producción permanece sin cambios. La validación de la migración conectada, interfaz móvil y recuperación operativa sigue pendiente. El circuito OneDrive de #15 aún necesita acceso seguro y prueba de recuperación; las copias internas no sustituyen un respaldo externo.
