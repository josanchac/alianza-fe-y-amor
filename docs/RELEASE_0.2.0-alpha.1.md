# Alianza 0.2.0-alpha.1 — espacios independientes

Fecha: 14 de septiembre de 2026. Estado: alfa privada, con datos sintéticos en la vista de revisión. La implementación y la migración están preparadas; no se aplican a las cuentas ni a la base del piloto en esta entrega.

## Qué cambia

- Personal, pareja y cursos se eligen y combinan voluntariamente; cada contexto tiene su propia navegación. Elegir un grupo no crea compromisos personales ni una vinculación matrimonial. Cambiar de espacio conserva los registros.
- El rosario individual avanza oración por oración, conserva su posición y muestra un rosario gráfico. El texto de cada oración se abre a petición. Solo la confirmación final registra cinco decenas; marcar un compromiso requiere otra elección explícita. Las sugerencias por día respetan una elección distinta.
- El símbolo personal se colorea con registros diarios y metas conocidas por período, y acompaña el examen de conciencia. No representa calidad de oración, fe o profundidad de reflexión. El examen no recoge respuestas ni da por recibido un sacramento.
- El propósito mensual tiene una ayuda de tres preguntas. Las notas de cada compromiso se consultan junto a su revisión. Los períodos anteriores se eligen directamente.
- Mi recorrido prepara un PDF para conversar con el asesor: metas respaldadas por historial, cantidades registradas y notas seleccionadas por la persona. Las notas no se resumen mediante IA ni se incluyen automáticamente. Se incrusta DejaVu Sans para mantener acentos y espaciado. Los cambios de frecuencia, períodos parciales e historia ausente se señalan; no se reconstruyen metas antiguas a partir del plan actual.
- Mi espacio utiliza un icono personal. La orientación, las fuentes y los ajustes secundarios quedan en pantallas de consulta; los diálogos se mantienen dentro de la pantalla, con desplazamiento y cierre accesible. El logo conserva su ampliación al tocarlo.
- Los grupos tienen ideal, lema, símbolo elegido o subido y fotografía. El administrador puede crear y editar el texto de un propósito; cambiar fecha o meta exige crear otro período, preservando las marcas previas. “Deshacer una ocasión” aparece solo cuando existe una ocasión que retirar.
- Mi participación y Organizar distinguen la labor del miembro de la coordinación. Se delegan rosarios, propósitos, encuentros y encargos, capital de gracias, materiales, invitaciones e identidad. Cada tarea admite coordinadores, personas específicas o todos. Los permisos se verifican en la base; ocultar botones no es la protección.
- Encuentros incluyen asistencia y encargos con responsable. Esa logística es visible según el permiso correspondiente. No da acceso a notas o cumplimiento espiritual individual.
- El capital de gracias admite intenciones comunes, aportes propios, deshacer y consentimiento independiente para el resumen colectivo. El conteo expresa lo que la persona decidió registrar; no cuantifica gracia espiritual.
- Los enlaces al Santuario, la Mater y el Padre Kentenich remiten al portal institucional. El Santuario tiene un pictograma propio sencillo; se conservan símbolos e imágenes aportados por usuarios. No se redistribuyen fotografías institucionales cuya autorización pública no se haya comprobado.

## Resúmenes colectivos y límites

Los miembros y coordinadores reciben sus registros propios y, cuando corresponde, un resumen por rangos. No reciben filas identificables de los demás. Un propósito matrimonial requiere consentimiento de ambos para el resumen.

La publicación se hace una vez, después de un día completo desde el cierre. Se requieren al menos diez unidades consentidoras y al menos cinco a cada lado de los conteos divulgados. La participación y la meta registrada se agrupan en rangos de veinte puntos porcentuales; el capital, en intervalos de diez aportes. Una corrección no genera una segunda publicación comparable; un cambio de consentimiento o membresía oculta el resultado. Si no se cumplen los requisitos, no se publica una cifra. Esto reduce el riesgo de inferencia; no es una garantía matemática de anonimato frente a información externa o cuentas coludidas.

Son umbrales conservadores del producto, no una metodología oficial del Movimiento ni un resultado de investigación con este curso. Grupos pequeños pueden no obtener cifras colectivas; mantienen su uso personal, oración y logística. La ausencia de registro no equivale a incumplimiento. El servidor conserva registros identificables para autorización: no hay cifrado de extremo a extremo.

## Evidencia de diseño y contenido

Se aplica divulgación progresiva y secuencias breves, sin confundir una guía espiritual con un manual de interfaz. Referencia de diseño: [Nielsen Norman Group, Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/), consultada el 14-09-2026. Se adapta la idea de reservar funciones secundarias para cuando sean necesarias; la selección concreta de pantallas es una decisión de este producto.

El orden inicial con Credo y tres Avemarías sigue la variante descrita por [USCCB, How to Pray the Rosary](https://www.usccb.org/how-to-pray-the-rosary). La distribución semanal, las cinco decenas y oraciones se cotejan con [Santa Sede, Los misterios del Santo Rosario](https://www.vatican.va/special/rosary/documents/misteri_sp.html). El Credo se coteja con [Vatican News, Símbolo de los Apóstoles](https://www.vaticannews.va/es/oraciones/simbolo-de-los-apostoles.html). Estas fuentes describen variantes; la app no presenta su secuencia breve como la única forma de rezar. Se omiten invocaciones opcionales y letanías del recorrido breve. Consulta: 14-09-2026.

Se conserva la matriz documental de horario, propósito e ideales de las versiones anteriores. Las preguntas de ayuda para formular el propósito son redacción de la app basada en actitud, objetivo y concreción del material institucional previamente cotejado. Los textos extensos se sustituyen por acciones y consulta voluntaria, sin introducir nuevas prescripciones.

## Verificación

- Suite de regresión: incorporación voluntaria, revisión mensual, borradores, errores de guardado, privacidad matrimonial, revocación, reinicio, accesibilidad semántica y sugerencias de los siete días.
- `renewal-db.mjs`: doce cuentas sintéticas; permisos por actividad, revocación, versiones obsoletas, posiciones del rosario, confirmación final, espacios privados, capital propio y publicaciones protegidas. Se ejecutan todas las migraciones en PGlite; esto no sustituye la comprobación en PostgreSQL y el entorno real antes del piloto.
- `renewal-ui.mjs`: los 69 pasos del rosario individual, texto opcional, recuperación de fallo y envío de la selección más reciente de responsables.
- `renewal-reports.mjs`: cuotas conocidas, ausencia de planes, cambios, fechas futuras, PDF con acentos y varias páginas. Inspección visual y extracción de texto mediante Poppler.
- Revisión móvil supervisada: navegación contextual, diálogos, permisos y rosario; anchos de 390 y 320 píxeles, texto ampliado y controles de error de la vista de prueba.

Los perfiles son escenarios sintéticos, no personas entrevistadas. Su paso por pruebas automatizadas no demuestra que adultos mayores o jóvenes encuentren fácil la app. Antes de llamar beta a una versión, corresponde completar la revisión del usuario, observaciones con participantes reales y comprobar estabilidad en el piloto. No se afirma conformidad WCAG completa, certificación OWASP ni aval pastoral.

## Medición para mejorar

Se mantiene medición técnica voluntaria, desactivada por defecto, sin textos espirituales, rutas de reflexión ni identidades en el panel agregado. El marco [HEART / Goals–Signals–Metrics, Google Research](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/) orienta objetivos y señales; no obliga a instrumentar cada acción sensible.

| Objetivo | Señal disponible | Interpretación y límite |
|---|---|---|
| Poder completar una acción | Guardados correctos y errores | Razón de operaciones técnicas; no cantidad de oraciones ni éxito espiritual. |
| Acceso confiable | Cargas correctas, errores y cargas lentas | Detecta fricción técnica; no mide por sí sola la comprensión. |
| Continuidad voluntaria | Actividad agregada y cohortes | No equivale a disciplina espiritual; el consentimiento introduce sesgo de selección. |
| Utilidad percibida | Respuesta voluntaria de utilidad | Complementar con entrevistas; no inferir de permanencia en pantalla. |

La publicación técnica tiene sus umbrales y retención propios ya documentados. El cambio de modalidad es una preferencia privada y no se añade a telemetría. Para pruebas reales: observar tareas con éxito sin ayuda, tiempo, errores, dudas y facilidad declarada, registrando tamaño y diversidad de la muestra. Priorizar fallos de acceso y pérdida de borradores antes que frecuencia de uso.

## Recuperación y siguiente publicación

La versión anterior permanece en el historial de la vista privada. El repositorio principal mantiene una rama de trabajo revisable. No se ha desplegado este código ni ejecutado la migración en el piloto real. Para pasar al piloto: revisar esta alfa, ejecutar los controles del entorno real y aplicar primero la migración aditiva; una reversión de interfaz no debe eliminar datos nuevos. Revisar los lectores anteriores antes de mezclar clientes de distintas versiones.
