# Alianza · Rediseño del recorrido

Estado: prototipo de navegación revisado favorablemente por el propietario y su esposa. Primera integración funcional preparada en la rama de revisión; aún requiere prueba humana sobre esta integración y cierre de revisión metodológica antes de publicar. Ver [revisión metodológica](METHODOLOGY_REVIEW.md) y [sección Costa Rica](COSTA_RICA.md).

## Objetivo y alcance aprobado

En los primeros cinco minutos, la persona deja configurada la capacidad que más beneficio le representa y sabe dónde volver para darle seguimiento. Las capacidades disponibles no deben sentirse como una lista de obligaciones incumplidas. El registro sirve al discernimiento; no mide crecimiento espiritual.

El plan aprobado pide revisar, diseñar y prototipar; probar con José, su esposa y participantes invitados; implementar lo validado; verificar datos y permisos; y presentar una versión probada y la comunicación de cambios para aprobar su publicación. La revisión inicial incluyó un prototipo; la integración parcial posterior se describe al final. No sustituye esa prueba humana ni autoriza publicar una experiencia no validada.

## Revisión de la implementación real

Fuente revisada: `josanchac/alianza-fe-y-amor`, rama main, commit `8bf94a7`. Producción: https://josanchac.github.io/alianza-fe-y-amor/ . React, TypeScript, Vite, GitHub Pages, Supabase. GitHub Actions publica cada actualización de main. Los materiales de revisión se mantienen en una rama aparte.

| Hallazgo comprobado en código | Consecuencia | Decisión propuesta |
|---|---|---|
| Navegación actual: Hoy, Las 4 Rs, Camino, Ajustes (`app/journal.tsx`). | Hoy contiene horario, propósito y reflexión; Camino combina reportes, revisiones personales y memoria matrimonial. | Inicio personalizado; Horario con Mi día, Mi mes e Historial; Las 4 Rs; Mi espacio. Mantener guías cerca de cada tarea. |
| La cuenta inicial copia nombre e ideal desde la membresía; el ideal es editable en Ajustes. | Poder editarlo existe, pero está oculto en el recorrido. Puede aparecer un ideal que la persona no ingresó. | Nuevas personas escriben o disciernen su ideal. Conservar los ideales ya guardados y ofrecer revisarlos, sin borrarlos ni sustituirlos. |
| Cada miembro requiere `couple_id` y un asiento 1 o 2 (`supabase/schema.sql`). | La ausencia de pareja en pantalla no equivale a una modalidad individual real. La vinculación depende del administrador y no del consentimiento mutuo. | Separar membresía del piloto y pertenencia matrimonial. Crear invitación bilateral, conservando la identidad personal. |
| Perfil con cuatro símbolos; no hay registro matrimonial de ideal. | La personalización y el ideal compartido requieren ampliar validación y modelo. | 16 símbolos; ideal personal en blanco, borrador o definido; ideal matrimonial con confirmaciones de una misma revisión por ambos. |
| Los compromisos incluyen título, momento, activo, señal y versión mínima; no incluyen frecuencia. | Los reportes cuentan registros, sin evaluar objetivos semanales. | Frecuencia y vigencia histórica, con resúmenes por compromiso y período. |
| `purpose` guarda texto y revisión por mes; `review` guarda reflexiones por intervalo. | Hay dos puntos de escritura que pueden parecer duplicados. | Revisar el mes anterior y preparar el actual en una misma pantalla; conservar revisiones existentes en el historial. |
| El administrador tiene un rol separado de métricas, sin permisos de lectura sobre contenido. | Es una protección que se debe mantener al cambiar el modelo. | Sugerencias personales dentro del espacio del usuario; administración solo actividad permitida. No analizar textos para inferir hábitos. |
| Las lecturas de la pareja se filtran en servidor por dos permisos independientes. | El rediseño visual no basta para proteger vínculos nuevos y revocados. | Verificar en servidor vínculo activo, identidad y permiso en cada solicitud; revocar al desvincularse. |

## Fundamentos y traducción al producto

- Heurísticas de Nielsen: lenguaje familiar, consistencia, visibilidad del estado y control del usuario. https://www.nngroup.com/articles/ten-usability-heuristics/
- Divulgación progresiva: capacidades secundarias disponibles sin exigir su configuración inicial. https://www.nngroup.com/articles/progressive-disclosure/
- Ayuda contextual: una pregunta o ejemplo al lado de la tarea, evitando depender de un recorrido introductorio que deba memorizarse. https://www.nngroup.com/articles/onboarding-tutorials/
- BJ Fogg: facilitar una acción personalmente significativa y una señal oportuna. https://www.behaviormodel.org/
- Intenciones de implementación: vincular una conducta a una situación concreta y prever una versión mínima. https://cancercontrol.cancer.gov/brp/research/constructs/implementation-intentions
- Lally y colaboradores: la automatización varía entre personas y conductas. No hay un plazo único para afirmar que un hábito está adquirido. https://doi.org/10.1002/ejsp.674

Las reglas específicas del prototipo son hipótesis de producto, no umbrales clínicos ni prescripciones del Movimiento. La pauta consultada de la Rama de Familias de Chile documenta las cuatro Rs: rezar cada día, reencantar cada semana, revisar cada mes y renovar cada año. Las preguntas nuevas sobre ideales son apoyo inicial propuesto, pendiente de revisión por alguien con formación en el Movimiento.

## Recorrido propuesto y resultados esperados

1. **Primer acceso:** mantener activación individual por invitación al piloto. Tras autenticarse, elegir el beneficio principal: horario, cuatro Rs o ideal. No condicionar el acceso a completar nombre, ideal o pareja.
2. **Primer valor:** guardar un compromiso y su frecuencia; una idea personal para un encuentro mientras se vincula; o el ideal/borrador/una respuesta de discernimiento. Pasar sin guardar nada es válido, pero no cuenta como activación.
3. **Salida clara:** mostrar qué se guardó y dónde retomarlo. Evitar presentar una lista de secciones incompletas.
4. **Regreso:** Inicio destaca la capacidad elegida; la navegación estable mantiene disponibles las otras. No reconstruir ni mover los menús por inferencias de uso.
5. **Día:** registrar lo vivido; anotar qué ayudó o costó de forma opcional. Distinguir sin registro, me costó y no aplicaba. No generar marcas retroactivas.
6. **Mes:** al comenzar septiembre, revisar agosto; consultar propósito, cumplimiento y notas de agosto; guardar revisión en agosto; elegir propósito de septiembre. Permitir omitir cualquier paso y volver. No copiar ni sobrescribir propósitos automáticamente.
7. **Continuidad:** observar registros según la frecuencia elegida y preguntar si el ritmo resulta llevadero. Ofrecer continuar, ajustar o explorar. Una sola sugerencia. Posponer y desactivar sugerencias deben respetarse.
8. **Pausa:** conservar todo; invitar a retomar o ajustar sin mostrar deuda acumulada.
9. **Pareja:** poder comenzar individualmente y vincularse después. El remitente expresa su aceptación al invitar; el destinatario revisa y acepta con su propia cuenta. Cancelación, rechazo y vencimiento no crean vínculos.
10. **Ideales:** personal y matrimonial opcionales, con estados explícitos. Guardar preguntas incompletas. No proponer un ideal definitivo mediante inferencia automática. Si se cambia la frase matrimonial, ambas confirmaciones deben referirse a la nueva versión.
11. **Desvinculación:** conservar registros propios; revocar permisos personales; archivar el historial compartido como lectura para sus participantes originales, sin trasladarlo a una pareja futura. Esta política se muestra antes de confirmar y debe validarse con usuarios.
12. **Novedades:** una explicación contextual por versión, con accesos directos y un archivo consultable. No reiniciar la configuración de usuarios existentes.

## Reglas de aceptación de la integración completa

### Compromisos y revisión

- Objetivo semanal en días, de lunes a domingo en la zona horaria de la cuenta. Tres días por semana no son tres sesiones en un mismo día.
- Registrar días adicionales sin elevar el porcentaje de cumplimiento sobre 100% ni compensar semanas futuras o anteriores.
- Mostrar días registrados, objetivo, adicionales y estado del período. Un período abierto no se presenta como un fracaso.
- Separar cumplimiento registrado de cumplimiento confirmado por la persona cuando faltan registros. Nunca interpretar automáticamente una casilla vacía como incumplimiento.
- Guardar la vigencia de cambios de frecuencia/pausas para no recalcular el pasado con una meta nueva. Las semanas parciales al crear o cambiar un compromiso deben etiquetarse como parciales y no contarse como incumplidas por defecto.
- Incluir compromisos pausados con actividad dentro del mes en los reportes del período.
- Notas por compromiso y fecha; visibles en la revisión y bajo los mismos permisos personales correspondientes. No copiar su texto en métricas o eventos de analítica.
- El ejemplo de sugerencia del prototipo usa cuatro semanas previas con registros suficientes; es una hipótesis para visualizar la interacción, no una regla aprobada de producción. Se requiere ajustar ventanas por frecuencia, descansos y confirmación del usuario. Nunca activar otro compromiso automáticamente.

### Identidad, vinculación y seguridad

- Mantener UUID de cuenta, propietarios de registros, versiones y fechas originales.
- Proponer `members` independiente de la pareja; tabla de vínculos con estado, miembros y fechas; invitaciones con destinatario verificado, expiración y uso único.
- Solo una vinculación activa por cuenta; aceptar en transacción con bloqueo para evitar dos aceptaciones simultáneas.
- No revelar si un correo arbitrario tiene cuenta. No crear un directorio de personas. Si falta acceso al piloto, tramitarlo con el flujo de invitación existente antes de aceptar el vínculo.
- No trasladar `rs` a otro propietario ni mezclar historias matrimoniales al vincular cuentas.
- Nuevos vínculos: permisos personales apagados; sin transferencia de consentimientos de un vínculo anterior. Mantener los consentimientos de parejas existentes al migrar, sin ampliar su alcance.
- No exponer ideal personal, borradores o respuestas de discernimiento por defecto; la implementación actual muestra el ideal al cónyuge aunque los dos permisos estén apagados. La semántica de visibilidad del ideal requiere un control explícito o su inclusión claramente explicada en un permiso.
- Ideal matrimonial: control de versiones y confirmación bilateral; edición invalida confirmaciones anteriores. Notas de discernimiento individual no pasan a ser matrimoniales por vincularse.
- Revocación: no autorizar lecturas nuevas del espacio personal; limpiar contenido previamente visible en memoria al cambiar de cuenta, reconectar o volver a la pantalla.
- Extender la validación de registros sin permitir campos arbitrarios. Mantener pruebas de perfiles antiguos y conflictos de versiones.
- Preservar el rol `alianza_metrics` sin acceso a diarios, compromisos, ideales o revisiones. No ampliar permisos del administrador del piloto.

## Comunicación del lanzamiento

| Cambio | Momento | Mensaje propuesto | Acción |
|---|---|---|---|
| Inicio personalizado | Primera entrada tras actualizar | Ahora podés elegir el espacio que más te ayuda y retomarlo desde Inicio. | Elegir mi espacio / Ahora no |
| Hoy pasa a Horario | Primera entrada a Horario | Tus compromisos siguen aquí, en Mi día. | Continuar |
| Propósito y revisión mensual | Primera entrada a Mi mes | Revisá el mes anterior y prepará el actual. Tus registros se conservan. | Ver mi mes |
| Camino se reorganiza | Primera entrada al historial | Tus resúmenes y revisiones están en Horario; los encuentros de pareja, en Las cuatro Rs. | Ir al lugar correspondiente |
| Frecuencias | Primera edición de compromiso | Podés elegir cuántos días por semana querés vivirlo. | Elegir frecuencia |
| Privacidad y vínculo | Antes de vincular o cambiar permiso | Ambos aceptan la vinculación. Cada uno elige por separado qué compartir. | Revisar y decidir |

Errores menores: anotación en Novedades sin interrupción. Cambios importantes: orientación breve, saltable, que pueda consultarse de nuevo. Conservar `last_seen_release` por usuario en servidor. No enviar correos ni notificaciones externas durante esta fase. El texto de lanzamiento debe afirmar que se conservaron los registros solo después de verificar la migración.

## Prueba con usuarios

Probar primero con la esposa de José y otras personas invitadas, incluyendo alguien sin ideal y alguien que use la app individualmente. No explicar cómo navegar antes de observar. Usar datos ficticios para la prueba.

1. Elegí lo que más te serviría y dejalo preparado. Medir tiempo desde la elección hasta guardar y si se requirió ayuda.
2. Volvé a Inicio y encontrá lo que guardaste sin indicaciones.
3. Usá el ejemplo de ejercicio tres veces por semana y explicá cómo entendés su cumplimiento.
4. Revisá agosto y prepará septiembre; comprobar que distingue propósito nuevo de revisión anterior.
5. Vinculá las cuentas de prueba y explicá qué puede ver cada una. Luego rechazar/cancelar/desvincular.
6. Entrá como pareja sin ideal matrimonial y encontrá cómo continuar sin tener que escribir uno.
7. Como usuario actual, encontrá tus compromisos, revisiones y las novedades.
8. Preguntar: ¿qué te ayudó?, ¿qué te hizo sentir exigida o perdida?, ¿te queda claro qué harías al volver?

Gates antes de publicar: ninguna confusión sobre privacidad; completar la capacidad elegida en cinco minutos sin asistencia en los recorridos evaluados; poder retomarla; percibir una carga manejable. Registrar fallos y corregir antes de ampliar el piloto. Una ronda cualitativa pequeña no valida estadísticamente estos objetivos ni demuestra adopción de hábitos.

## Entrega y límites

- `prototype/journey.tsx` y `journey.css`: prototipo de navegación con datos de ejemplo en memoria; no consulta ni modifica Supabase, no autentica usuarios y no envía invitaciones reales.
- `prototype/alianza-emblema.svg`: geometría trazada del original, simplificada a azul y dorado, sin imagen raster embebida. Los originales de producción se conservan.
- `prototype/build.mjs`: genera una vista autocontenida para revisar y una vista en conversación. No forma parte del build de producción.
- La prueba del prototipo no demuestra seguridad de servidor. La primera integración descrita abajo añade pruebas aisladas; vinculación, ensayo de publicación y validación humana siguen pendientes.

No se publicaron cambios ni se modificaron datos de usuarios.

## Primera integración funcional · 12/9/2026

El propietario indicó continuar sin Dropbox e integrar sus documentos en otra sesión. Se conserva esa documentación como pendiente, sin detener el desarrollo funcional ni atribuirle una validación que no se ha realizado.

- Inicio guarda la capacidad elegida y permite retomarla o cambiarla. Explorar sin elegir no crea compromisos. La elección de ideal abre el editor existente; el curso de discernimiento y los estados de borrador aún no se integran.
- Horario reúne Mi día, Mi mes e Historial. Mi mes consulta el propósito y los registros del mes anterior; guarda su revisión en ese mes y prepara el propósito del actual. Continuar el propósito anterior solo crea un borrador que requiere guardar. Mi día conserva el recordatorio del propósito y la reflexión diaria opcional.
- Compromisos diarios o metas en días por semana/mes. Se muestran días registrados y adicionales; se conservan las marcas de compromisos pausados. Un compromiso con vigencia conocida y sin marcas aparece en el resumen sin atribuirle incumplimiento.
- El servidor registra la frecuencia y las pausas desde la fecha del cambio en Costa Rica. Los cambios del mismo día sustituyen el plan de ese día; las fechas anteriores se conservan. Para compromisos existentes se inicia la vigencia el día de la migración, sin inventar frecuencias históricas.
- Las semanas son de lunes a domingo. Los períodos con historia desconocida, pausa o cambio de meta se identifican como parciales, sin porcentaje de cumplimiento. Una semana puede aparecer completa en dos revisiones mensuales; no se suman esas filas como totales de días del mes.
- Novedades consultables en Inicio hasta reconocerlas y siempre en Mi espacio. La preferencia es personal y no se comparte con la pareja.

La frecuencia mensual admite 1–28 días: es una restricción inicial del producto para admitir todos los meses, no una norma de Schoenstatt. Las marcas describen registros; no califican la vida espiritual. Falta integrar confirmación personal de cumplimiento cuando no hay marcas, notas por compromiso, sugerencias voluntarias de continuidad, vinculación bilateral, ideal matrimonial y repertorio ampliado de símbolos.

Verificación: suite automatizada completa, tipos y compilación aprobados; pruebas nuevas de elección y recarga, errores de guardado, separación mensual, borradores, frecuencias, cambios históricos, migración y permisos. La integración actual no ha pasado todavía observación humana en móvil, evaluación completa de accesibilidad ni ensayo en un entorno Supabase de preproducción.

No se aplicó la migración a producción, no se reinició ninguna cuenta y no se publicó esta integración.

## Segunda integración funcional · individual y pareja

Implementados el inicio individual, invitación con aceptación bilateral, desvinculación, archivo del historial para sus participantes originales, permiso independiente de ideal personal y registro opcional de ideal matrimonial con confirmaciones por revisión. Detalle de modelo, migración, pruebas y límites: [BILATERAL_PAIRING.md](BILATERAL_PAIRING.md).

La interfaz permite repasar las 4 Rs mientras se vincula; todavía no ofrece un borrador individual de un encuentro pendiente de pareja. Quedan las sugerencias voluntarias de continuidad, notas por compromiso, confirmación de cumplimiento sin marcas, estados formativos del ideal personal, símbolos ampliados y reinicio individual. La prueba humana sobre estas integraciones y la revisión metodológica siguen pendientes; el juicio favorable anterior corresponde al prototipo.

## Actualización de símbolos y ayuda del ideal

Se incorporaron dieciséis símbolos con sus nombres y una ayuda cerrada para continuar sin ideal personal. El registro del ideal sigue siendo libre; no se generan frases. Las guías activas quedaron cotejadas documentalmente en DOCUMENTARY_VERIFICATION.md. La revisión por asesor está diferida y no condiciona esta etapa. Siguen pendientes las notas por compromiso, la confirmación de cumplimiento sin marcas, las sugerencias voluntarias de continuidad y el reinicio individual protegido.
