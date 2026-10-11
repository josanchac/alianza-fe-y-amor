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

Se añade al arnés Auth/API el guardado mensual por RPC público, relectura, rechazo de versión repetida y aislamiento, con cuenta sintética independiente. En `c54e0e9069f0bc3422968d59dae1c1fb083eab1f`, las ejecuciones 38183201046 y 38183201049 finalizaron correctamente, incluyendo PostgreSQL con conexiones independientes, restauración sintética y Auth/API real.

## Entorno y límites

Se reactivó el proyecto existente `alianza-pruebas`, sin crear recursos ni cambiar suscripción. Se aplicaron allí las tres migraciones pendientes (session3, invitaciones internas y guardado mensual). `tests/current-month-plan-connected.sql` aprobó guardado/relectura, preservación de diario, conflicto e aislamiento por RPC con datos sintéticos y ROLLBACK. Producción permanece sin cambios. La inspección móvil y recuperación operativa siguen pendientes. El circuito OneDrive de #15 aún necesita acceso seguro y prueba de recuperación; las copias internas no sustituyen un respaldo externo.


## Refinamientos propuestos para revisión del propietario

Instrucción del 11/10: avanzar sin consulta para trabajo técnico; solicitar revisión para cambios visuales, de experiencia y contenido final. Estos cambios están preparados en rama y vista privada, **pendientes de esa revisión**, sin publicación en el piloto.

- Formularios: foco inicial en título, cierre explícito conservando protección del borrador, botones sin palabras partidas y selección de cantidad al editar. Etiquetas propuestas: «Cuándo quiero recordarlo» y «Nota para mí».
- Rosario: acceso desde Oración al rosario compartido existente; historial concluido aparte; presentación compacta al concluir; letanías opcionales después del Salve. No se añaden aceptación/rechazo de invitaciones ni estados de lectura.
- Misa: aviso de respuesta del salmo ausente y límite de correspondencia con Costa Rica. No se aporta aún el estribillo ni se reemplaza el proveedor.

Cotejo incremental M10/M12: nombres de campos conservan los datos personales existentes; navegación e historial no crean marcas, permisos ni valoraciones espirituales. Las letanías usan el texto ya cotejado, sin modificar ninguna oración o referencia. La nota de Misa es una explicación de la limitación actual, pendiente de aprobación editorial del propietario; no acredita la edición local.

Evidencia: la suite completa llegó hasta la última prueba de acceso al rosario; esa prueba tenía un evento sintético incorrecto para las pestañas y se corrigió a mouseDown, como los demás recorridos. Reejecutada, pasó sin cambios adicionales del producto. Pruebas previas, incluidas notas/foco, guardado mensual, Rosario y Misa, pasaron. El manifiesto documental no sustituye aprobación visual/editorial.

Vista privada: https://alianza-revision-integral.josanchac.chatgpt.site. Datos ficticios, reinicio al recargar; variante `?scenario=rosary` y `?volume=50`. El adaptador de vista previa no sustituye los ensayos conectados. Navegador real no disponible en este entorno; pendiente inspección humana en móvil. Continúa la advertencia de tamaño de bloque JS; no se afirma rendimiento móvil medido.

## Revisión del propietario · 11/10, 17:40 Costa Rica

Misa: tercera prueba aprobada en su presentación actual. No constituye confirmación de la edición bíblica/leccionario de Costa Rica. Las referencias aportadas son pistas generales; no identifican aún un texto editorial exacto para reemplazar Evangelizo. Se conserva la fuente actual y el pendiente #34.

Correcciones propuestas, pendientes de revisión visual/editorial: restar uno junto a sumar con cantidad del día visible; quitar el interruptor duplicado «Incluir en mi horario» y nombrar la acción «Pausar compromiso». El diálogo explica conservación del historial y ruta para retomar. «Editar y retomar» prepara active=true y solo guarda al confirmar Guardar; cerrar conserva la confirmación de descarte. Compromisos nuevos sin historial conservan eliminación explícita. No cambian reglas de frecuencia, permisos ni SQL.

Se cotejó el diff de journal/habit-fields: nuevo acceso al decremento ya existente, etiquetas y eliminación de control duplicado; sin cambios de oración o referencia. La reactivación conserva el registro original para controlar borrador y versión.
