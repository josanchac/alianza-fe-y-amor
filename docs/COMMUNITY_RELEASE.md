# Alianza · Cursos, oración compartida e identidad

Estado: candidata en rama de trabajo. No aplicada a la base del piloto ni publicada.
Alcance autorizado en la conversación: etapas 1–4, incluida identidad visual y animaciones sobrias. La revisión pastoral continúa diferida conforme a DOCUMENTARY_VERIFICATION.md; no se afirma aval institucional.

## Segunda revisión técnica · 13/9/2026

Realizada por Codex sobre la candidata de PR #4, después de la autorización de continuar. Es una segunda pasada del mismo autor, no una revisión independiente ni una certificación. Se revisaron autorización por pertenencia, llamadas repetidas, validación de entrada, estados de guardado, privacidad del cuaderno y métricas agregadas. GitHub no tenía revisiones externas registradas al consultar la PR.

- **Corregido:** una repetición de `rosary_create` con el identificador de un rosario existente podía añadir reservas de pareja a un rosario creado con otro ámbito, o restaurar reservas liberadas. Ahora se compara la configuración persistida, se rechaza un cambio de ámbito y únicamente la creación inicial asigna decenas. La prueba reprodujo el fallo antes de corregirlo.
- **Corregido:** las notas no guardadas del ideal se perdían al cambiar de pestaña. El cuaderno permanece en memoria, oculto mientras se consulta otra sección; un reinicio de datos cambia su clave y descarta el contexto anterior. Advierte al cerrar la página con cambios pendientes, bloquea envíos repetidos y retira la confirmación de guardado al editar de nuevo. No se escribe texto privado en almacenamiento local ni telemetría. El aviso de cierre depende del navegador y no sustituye guardar, especialmente en móvil.
- **Refuerzo:** se rechazan explícitamente ámbitos o tipos de aporte ausentes y datos de encuentro que no sean objetos. Las entradas incompletas de encuentro ya eran rechazadas por el validador anterior; las pruebas confirmaron esa protección.
- **Evidencia previa:** [CI PostgreSQL/Auth 34741399893](https://github.com/josanchac/alianza-fe-y-amor/actions/runs/34741399893) y [CI de aplicación 34741399788](https://github.com/josanchac/alianza-fe-y-amor/actions/runs/34741399788) aprobaron la candidata inicial. Las correcciones requieren su nueva ejecución CI; no se atribuyen a esa evidencia previa.

Continúa pendiente la inspección visual de la candidata. El navegador remoto disponible carece de acceso a localhost; no se cambió la ruta de red ni se empleó otro navegador para eludir el bloqueo. La fixture `tests/community-preview.html` permite revisar con datos sintéticos: Inicio → Mi camino → escribir notas → cambiar de sección y volver; Grupos → Curso de prueba → propósito/rosario; Donar → lectura/copia. Revisar a 320 y 390 px, ampliación, teclado, contraste, foco y movimiento reducido. No usar cuentas reales como sustituto del entorno de prueba. Mantener la PR en borrador hasta cerrar estas puertas; no aplicar migraciones a producción como medio de obtener una vista previa.

## Aplicación de metodologías reconocidas

| Referencia | Decisión aplicada | Evidencia y límite |
|---|---|---|
| [Double Diamond, Design Council](https://www.designcouncil.org.uk/resources/the-double-diamond/) | Descubrir mediante los comentarios de uso y benchmark; definir mantener vivo el curso entre encuentros; desarrollar los recorridos; entregar una candidata verificable. | Investigación y plan aprobados en conversación; esta rama implementa el desarrollo. Inspección móvil y validación humana pendientes para entrega al piloto. |
| [Jobs to Be Done, Christensen Institute](https://www.christenseninstitute.org/theory/jobs-to-be-done/) | Tres trabajos: recordar y vivir el propósito, aportar a una oración común, preparar el siguiente encuentro. | Tres tarjetas activas como máximo; herramientas administrativas en despliegues secundarios. Hipótesis de utilidad, no resultados de entrevistas nuevas. |
| [Heurísticas de Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) | Estado visible, confirmación explícita, corrección, mensajes de fallo, formularios con borrador y divulgación progresiva. | Pruebas de registros ausentes, fallo de guardado, cuentas sin escritura, reservas y conteo idempotente. |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Etiquetas, foco visible, controles táctiles, diálogos Radix, movimiento reducido. | CSS y pruebas DOM; pendiente inspección renderizada a 390 y 320 px, zoom, teclado y lector de pantalla. No certificación AA. |
| [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) | Funcionalidad, fiabilidad, seguridad, interacción, mantenimiento y rendimiento como criterios verificables. | Tipos, build, pruebas de integración e interfaz. Se usa el modelo como referencia; no certificación ni evaluación integral del estándar. |
| [NIST SSDF 1.1](https://csrc.nist.gov/pubs/sp/800/218/final) y [OWASP ASVS 5.0](https://owasp.org/www-project-application-security-verification-standard/) | Validación de servidor, autenticación, autorización por ámbito, cambios aditivos, revisión y pruebas negativas. | Tablas privadas y permisos negativos; RPC pública invoker y operación privada estrecha. Falta revisión técnica adicional y verificación gestionada en preproducción antes de ampliar el piloto. |
| [HEART, Google/ACM CHI 2010](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/) | Utilidad declarada, continuidad y éxito técnico de carga/guardado. | Especificación exacta de eventos y denominadores abajo. No se mide calidad espiritual. |
| [Cohortes, Mixpanel](https://docs.mixpanel.com/docs/reports/retention) | Retorno en semana 4 desde incorporación voluntaria a medición. | Cohortes maduras y supresión de tamaños pequeños. Sin identidad, filtros por curso ni historial de acciones en el panel. |
| [DORA](https://dora.dev/guides/dora-metrics/) | Rama revisable, CI, compatibilidad, migraciones aditivas y procedimiento de recuperación. | Historial Git/CI y esta guía. No se presentan métricas DORA calculadas sin suficientes publicaciones. |

No se transforman técnicas empresariales de hábitos en enseñanza espiritual. Se conservan las fuentes doctrinales por separado. Embudos detallados por función y experimentos A/B se difieren: el piloto no justifica secuencias de actividad identificables ni inferencia causal con muestra pequeña.

## Funciones de esta candidata

- Inicio con emblema SVG original más visible, atajos a Oración y Mi camino. Encabezado, acceso y Donar mantienen la identidad. Sin redibujar el emblema ni confundirlo con un logo oficial de Schoenstatt.
- Navegación de 220 ms y feedback de 140 ms. Preferencia de movimiento reducido respetada. Confirmaciones siguen disponibles sin animaciones y no esperan a su finalización.
- 4 Rs ocultas para usuarios individuales; espacios existentes de pareja con su autorización bilateral intacta.
- Mi camino: entender, descubrir mediante consulta de fuente y cuaderno privado, o escribir el ideal. No es un curso completo ni generación automática de ideales. Ideal matrimonial mantiene su revisión y confirmación bilateral existentes.
- Guía de examen de conciencia conservada, ahora accesible en Oración y desde compromisos pertinentes. No recoge respuestas ni eventos específicos. El examen y la confesión se registran explícitamente en el horario, nunca por terminar la guía.
- Rosarios personales, de pareja y de grupo; cinco decenas del conjunto elegido. Reserva, liberación, orden secuencial, confirmación explícita y acompañamiento de decenas ya completas. En pareja secuencial se elige quién empieza y se asignan alternadamente.
- Un toque en una cuenta de ayuda no guarda un rezo. Cada aporte por persona/decena es idempotente. Cinco aportes distintos completan el encuentro, que no vence automáticamente. Puede cancelarse; no se elimina su historia.
- Un aporte de una decena no se registra como rosario personal completo. El usuario relaciona explícitamente el aporte de hoy con un compromiso existente; el servidor comprueba cantidad y propiedad y escribe en la misma transacción. La marca diaria no se duplica.
- Grupos con nombre, lema, símbolo, ideal opcional, integrantes y organizador. Invitaciones mediante enlace privado revocable de siete días; vista previa solo con nombre y aceptación explícita. Requiere cuenta previamente habilitada del piloto. No se enviaron invitaciones ni se crearon cuentas reales.
- Propósito con plazo y meta fijos, individual o matrimonial. Aceptación voluntaria. El mismo registro aparece en horario y grupo; no se copia a un segundo compromiso. Una pareja vinculada comparte una única unidad. Se conserva cero registrado frente a ausencia de registro.
- Revisión del propósito: acuerdo común de continuar, ajustar o elegir otro. Preguntas opcionales para conversación, sin almacenamiento de respuestas individuales en el grupo.
- Próximo encuentro, material HTTPS, pregunta de preparación, encargados y asistencia. Cambiar el encuentro requiere reconfirmar asistencia.
- Donar: SINPE/IBAN y pasos del sitio nacional, no procesamiento ni confirmación de transferencias. Gratuito y voluntario.

## Contenido y cotejo documental

| Contenido | Fuente y correspondencia |
|---|---|
| Propósito, oración, encargados y vínculos | [Rama de Familias, curso de introducción 3er año, versión 2008](https://www.santuariovallehermoso.cl/familias/material/cam/cam_3_cursos_programa_anual.pdf), pp. 23–25: propósito factible entre reuniones, responsables de oración, apostolado y vínculos. Consultado 13/9/2026. La app organiza registros; no prescribe que todos los cursos deban usar una frecuencia semanal. |
| Contexto costarricense | [Liga Apostólica Femenina, sitio nacional](https://schoenstattcostarica.org/liga-apostolica-femenina/): cada encuentro orienta crecimiento y propósito para la vida diaria. No se aplica su programa como norma de la Federación de Familias. |
| Misterios del rosario | [Santa Sede, Santo Rosario](https://www.vatican.va/special/rosary/documents/misteri_sp.html): cuatro conjuntos de misterios y distribución semanal. La selección del conjunto permanece libre. Los nombres se presentan en español sencillo. |
| Oraciones | Padre nuestro, Avemaría y Gloria: textos tradicionales católicos como ayuda a la decena. La guía es breve; no pretende transcribir un rito exhaustivo ni certificar un rezo. |
| Ideal y confesión | Fuentes y alcance existentes en DOCUMENTARY_VERIFICATION.md; no se modifica el contenido del examen. Mi camino añade un cuaderno y preferencias, sin inventar un proceso formativo oficial. |
| Donaciones | [Schoenstatt Costa Rica](https://schoenstattcostarica.org/), datos publicados consultados en septiembre de 2026. Publicación institucional no equivale a certificación bancaria de vigencia; el usuario comprueba beneficiario en su banco. |

Benchmark funcional: [Rosario de Hozana](https://play.google.com/store/apps/details?hl=es&id=com.hozana.rosario), [YouVersion Plans with Friends](https://open.life.church/resources/3488-plans-with-friends), [SchoenstattApp](https://schoenstattapp.de/). Referencias de producto; no se copiaron diseños, bases de datos ni contenidos licenciados.

## Modelo de permisos

El acceso usa Auth confirmado y membresía del piloto, nunca user_metadata. Los grupos tienen membresía propia; no heredan permisos de pareja. Las tablas nuevas tienen RLS y denegación directa a anon/authenticated/alianza_metrics. La API pública es invoker y llama una función privada definer con autorización por operación y search_path vacío. Las funciones auxiliares no son ejecutables por clientes.

Los cambios comunes y las lecturas se serializan con el mismo bloqueo transaccional de los vínculos existentes. Esto simplifica la corrección del piloto; debe medirse y reemplazarse por bloqueos por ámbito antes de escalar a muchos grupos. Los borradores guardables conservan la revisión original; los conteos verifican versión. Las respuestas tardías de una lectura no reemplazan una mutación posterior.

Un grupo ve nombres elegidos, intención y reservas del rosario y asistencia confirmada. No ve horario, ideal personal, borrador del ideal, examen ni reflexiones individuales. Los aportes históricos al rosario conservan sus reservas; salir retira acceso al grupo y libera reservas pendientes. El historial personal visible de rosarios de un grupo se limita a membresías vigentes en esta candidata; conservar un archivo personal tras salir requiere una ampliación específica.

Los resúmenes de propósito solo incluyen unidades que consintieron, con al menos cinco unidades y cinco con registros. Una pareja requiere consentimiento de ambos cónyuges actuales dentro del grupo y cuenta una vez. No hay lista de rezagados, clasificaciones ni filtros. La supresión reduce exposición; no garantiza anonimato ante conocimiento externo. Los registros de pareja son compartidos entre quienes aceptaron el propósito y tienen vínculo vigente.

## Plan de medición implementado

| Evento permitido | Unidad | Interpretación |
|---|---|---|
| open | Una cuenta/día | Apertura con consentimiento; no compromiso cumplido. |
| load_ok / load_error | Solicitud genérica | Funcionamiento de carga, incluidas actualizaciones; no pantalla o contenido. |
| save_ok / save_error | Solicitud genérica | Resultado técnico; no intención ni tipo de compromiso. |
| slow_load | Carga mayor a 3 s | Umbral de diagnóstico propio del producto, no estándar universal. |
| useful_yes / useful_no | Respuesta por cuenta/día/categoría | Utilidad voluntaria. No encuesta representativa ni escala validada. |

No se admiten propiedades adicionales, texto libre, rutas, IDs de curso, tipo de práctica ni horas exactas. La función descarta eventos sin consentimiento. Los eventos se vinculan internamente con la cuenta: son datos personales restringidos, no anónimos. Desactivar borra los eventos de esta medición; se conserva la preferencia para respetarla. Retención máxima de eventos: 90 días, depurada al invocar el servicio. La depuración durante inactividad total necesita tarea de mantenimiento antes del despliegue general.

El panel devuelve solo agregados de 30 días; cada categoría requiere cinco participantes. Cohorte por mes de aceptar medición; solo usuarios con 28 días observables y dentro de la ventana de conservación. Retenido significa apertura entre días 21–27 inclusive. Se suprimen cohortes con menos de cinco retornos o cinco no retornos. Datos ausentes por supresión no se tratan como cero y no se calculan tasas mezclando categorías suprimidas.

Se detiene el RPC de actividad obligatoria de la versión anterior y se reemplaza el panel por agregados; las filas históricas se conservan privadas, sin reutilizarlas ni mostrarlas. El rol métricas no recibe permisos sobre nuevas tablas espirituales. No se añade SDK de terceros, autocaptura o grabación de sesiones.

## Verificación y siguientes puertas de entrega

- Suite local completa `npm test`, nuevos tests de PGlite y DOM, `npm run typecheck` y `npm run build`: aprobados el 13/9/2026.
- Pruebas nuevas: pertenencia, enlace revocable, ausencia de registro, corrección con versión, conteo matrimonial, orden secuencial, reserva ajena, confirmación duplicada, acompañamiento, vínculo al horario, notas privadas, consentimiento y panel agregado.
- No se inspeccionaron registros reales ni se usaron cuentas de personas como datos de prueba.
- Navegador remoto: `net::ERR_BLOCKED_BY_CLIENT` al abrir localhost; no se eludió la restricción. Inspección visual móvil pendiente; la fixture local `tests/community-preview.html` es sintética y no se publica.
- Build mantiene advertencia previa por bloque JS >500 kB. No se afirma rendimiento móvil medido, certificación WCAG/ASVS ni auditoría independiente.
- Ejecutar CI de PostgreSQL y Auth en PR; se añadieron comprobaciones concurrentes específicas de reservas, confirmaciones y propósitos para esa ejecución. Los tests PGlite son transacciones secuenciales, no prueban simultaneidad de conexiones.

## Publicación y recuperación

1. Revisar esta candidata, completar prueba móvil y revisión técnica adicional de las nuevas autorizaciones conforme ENGINEERING_QUALITY.md.
2. Respaldo privado y ensayo de restauración. No copiar contenido real a GitHub.
3. Aplicar en entorno de prueba las dos nuevas migraciones en orden; ejecutar pruebas con clientes anterior/nuevo y asesores gestionados de seguridad. No ejecutar schema.sql encima de una base existente.
4. Antes del piloto, migrar producción y comprobar las RPC; después integrar la rama autorizada. La PR por sí sola no despliega GitHub Pages.
5. Comprobar recursos y una operación sintética autorizada. Registrar resultado e incidentes.
6. Ante fallo, volver al cliente anterior conservando las tablas añadidas. La escritura de preferencias acepta identificadores anteriores. No borrar las tablas nuevas ni revertir datos como atajo. El panel antiguo no es compatible con la nueva respuesta agregada; si se revierte cliente, ocultar su entrada administrativa, sin restaurar el detalle por cuenta.

Pendientes de ampliación: apostolado, fechas significativas, curso guiado del ideal comunitario, recordatorios push y bibliotecas extensas. Se conserva la importación voluntaria de recordatorios de calendario existente; no se anuncian notificaciones automáticas nuevas.

## Revisión visual en entorno separado · 13/9/2026

La vista previa independiente en Sites usa la misma interfaz, con datos ficticios y transporte en memoria; no contiene conexiones ni credenciales del piloto. Se revisaron Inicio, Grupos, propósito, rosario, Donar y Mi camino en un marco de 320/390 px. Se observaron y corrigieron: desbordamiento del encabezado a 320 px (ancho desplazable 316 frente a 303 disponibles; después ambos 303) y falta de retorno del foco al cerrar Donar (comprobado después de usar DialogTrigger). Se comprobaron contador de propósito 1→2, rosario 1→2 decenas y conservación del borrador al salir y volver.

Esta inspección permite revisar la interfaz; no es una prueba en un iPhone físico, una auditoría completa de WCAG, una medición de rendimiento móvil ni una validación del backend mediante la demo. Las pruebas de autorización y concurrencia corresponden a CI. La vista previa se publica separadamente para revisión del propietario; la app de GitHub Pages y sus migraciones continúan pendientes de entrega.
