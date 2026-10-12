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

## Revisión visual · 11/10, 17:49 Costa Rica

El propietario aprueba «Pausar compromiso» y confirma el funcionamiento de sumar/restar, pero rechaza la prominencia visual de los controles. Nueva propuesta pendiente: contador compacto al costado del título que abre Agregar uno / Restar uno; recupera la altura compacta de la fila. La cantidad corresponde al día seleccionado; el progreso del período conserva su ubicación y cálculo. Cotejo técnico/documental: presentación y acceso a acciones existentes, sin nuevos textos espirituales, permisos, datos ni reglas de cumplimiento. Tipos y regresión de sumar/restar, fallo, cero y pausa/retomar aprobados. Esta alternativa requiere aprobación visual y de interacción.

## Corrección de dirección visual · 11/10, 17:59 Costa Rica

El propietario rechaza el contador con menú y pide recuperar la apariencia original. Se restaura la fila original con su único botón de suma. Propuesta pendiente: aviso temporal «Registro añadido · Deshacer» durante ocho segundos después de un guardado exitoso. Deshacer restaura el valor anterior del día seleccionado usando la versión esperada del guardado recién hecho; si hubo otra modificación, el control de versiones existente impide sobrescribirla. Fallos no se anuncian como éxito, el aviso permite reintento y la opción existente «Deshacer último» continúa en el menú cuando el aviso desaparece. Se conserva «Pausar compromiso», ya aprobado.

Cotejo incremental: restauración visual y reversión de un registro técnico; no añade contenido espiritual ni cambia frecuencias, permisos o SQL. Tipos y prueba de suma, deshacer, primer registro a cero, fallo/reintento, versión esperada y pausa/reactivación aprobados. Falta aprobación humana del aviso temporal.

## Aprobación e integración · 11/10, 18:03 Costa Rica

El propietario aprueba el diseño original con aviso Deshacer. Se conserva aprobación de Pausar compromiso y presentación de Misa; el Rosario no recibe aprobación implícita. PR42 se retargetea a main como candidata acumulada de #35–#41 para evitar despliegues intermedios. Main confirmado en 6f056e7420b11eb14897f0c8a126be602e1e2e6d; sin merge ni modificación de producción.

CI del head fb980383: Auth/API y asesor de seguridad aprobados. El trabajo PostgreSQL se detuvo en la comprobación documental A146, que conservaba el handler anterior de retomar; no es fallo de restauración. Se actualiza únicamente esa entrada del inventario con el handler revisado, preservando previousHandler y evidencia de la prueba funcional; no se elimina ni flexibiliza la comparación de acciones. Regresión completa reejecutándose.

Base de pruebas: 42 tablas privadas/backup, todas con RLS, ninguna con acceso directo anon/authenticated. Los RPC public.alianza_data y public.alianza_relationship son invoker y no ejecutables por anon. Comparación de hashes prosrc, security-definer y search_path de producción/pruebas: relationship (antes de current_month), apply_month_plans, valid_record y require_pilot_access coinciden. Producción ya soporta prepare_month; la migración mensual es la pendiente del sprint. El inventario de migraciones de producción usa entregas históricas agrupadas; no reaplicar archivos antiguos por diferencia de nombre.

### Secuencia de publicación de la candidata

1. Cerrar revisión humana restante y verificar respaldo externo/recuperación #15. Continúa bloqueado por acceso seguro al destino OneDrive, exportación DB y custodia de clave; no se han configurado credenciales ni exportado datos reales.
2. Confirmar CI de la candidata final, congelar versión/changelog y comprobar nuevamente main.
3. Respaldo recuperable previo; aplicar únicamente 20261011225018_current_month_plan en producción, sin recrear tablas. Ejecutar comprobaciones de permisos y ensayo sintético autorizado con rollback.
4. Fusionar la candidata acumulada una sola vez; no fusionar las ramas intermedias por separado. Comprobar workflow Pages y una operación sintética de extremo a extremo.
5. Ante fallo de cliente, restaurar cliente anterior, compatible con la migración aditiva. No borrar tablas, planes o registros nuevos como reversión. Una restauración de DB requiere el procedimiento ensayado y reaplicar decisiones de borrado/revocación posteriores.

Alcance restante fuera de cierre automático: invitación al Rosario con aceptación/rechazo, respuesta del salmo/edición CR, semana/año e integración general de ámbitos. La candidata no acredita mejoras no implementadas ni medición móvil de rendimiento.


## Decisiones y refinamiento de Rosario · 11/10 · 19:31–19:45 Costa Rica

El propietario difiere arquitectura de respaldos y configuración OneDrive (#15) a otra sesión: deja de bloquear esta entrega. No se configuraron credenciales ni se exportaron datos; no se acredita recuperación externa. Esta decisión sustituye la condición anterior de bloqueo, conservada como historial. Los workflows 38186878817 y 38186878805 aprobaron sobre b6e6ce; son evidencia de la candidata anterior a este refinamiento, no de producción.

A las 19:41 aprobó la entrada de letanías después del Salve, pero pidió unificar accesos personal/pareja y eliminar los 68 toques. A las 19:45 aprobó sección compacta común y lectura continua, solicitando Terminar letanías siempre visible durante el desplazamiento.

Implementación: misma entrada con etiqueta, icono, misterios y avance; personales y pareja reunidos bajo Continuar un rosario; concluidos en historial. Personal mantiene su diálogo hasta cerrar la conclusión y las oraciones finales siguen pendientes aunque ya se hayan completado cinco misterios. Intención consultable en opciones del rezo. Texto íntegro LITANY sin cambios ni nuevas fuentes. Lectura desplazable independiente del footer persistente; Terminar letanías no escribe ni marca cumplimiento y devuelve al paso anterior. El manifiesto A249 documenta la retirada de paginación de invocaciones conservando Atrás para cuentas del rosario.

Cotejo M10/M12: cambios de presentación e interacción aprobados conceptualmente, sin cambios de oraciones, reglas de progreso, compartición o backend. Pruebas de entrada, cierre, integridad de 68 invocaciones, salida sin escrituras y orden del rosario. Inspección visual final en teléfono pendiente en vista privada; no se afirma verificación de navegador local ni publicación al piloto.
