# Integración del paquete de navegación · 12-oct-2026 UTC

Trabajo del 11-oct por la noche en Costa Rica. Rama de prueba; no publicación al piloto.

## Implementado sobre componentes reales

- Navegación compacta por espacios y períodos; fecha debajo de la vista correspondiente.
- Encabezado compartido con Volver persistente, título en contenido, transición suave sin divisor permanente. Las vistas ocultas no activan el encabezado de otra pantalla.
- Mi día conserva el símbolo personal vivo, su llenado, imagen/anillo y detalle. Aprobación del propietario a las 21:58 del 11-oct.
- Formularios personales, de compromisos y revisión: encabezado de salida, campos con scroll independiente y acciones vinculadas al formulario fuera del área desplazable. Se conservan confirmación de descarte, versiones, errores y bloqueo de guardado.
- Preparación mensual y edición de sus compromisos con salida y acciones persistentes. Aplicar al borrador sigue separado de guardar el plan en servidor. Conserva todos los controles de concurrencia y recuperación.
- Historial de rosarios personal y de pareja en filas compactas; abre el registro existente y restaura scroll/foco al volver. No altera participación, vinculación ni cumplimiento.
- Regreso común en Misa y oraciones, reflexiones, consulta mensual, pareja, cursos, invitaciones y administración. Se eliminó el regreso duplicado en historial de pareja.
- Consulta de contenido compartido mantiene filtros y borrador; retorno local con posición/foco.
- Paneles de configuración ya no heredan el posicionamiento/overflow del formulario antiguo; conservan su propio encabezado y cuerpo.
- Letanías, sus textos y el recorrido inmersivo aprobado no se modifican.

## Alcance y pendientes explícitos

Esto no acredita que todas las pantallas hayan sido verificadas visualmente en móvil. Permanecen por comprobar las familias de formularios avanzados de grupos, permisos, reportes/exportación y las variantes de calendario/teclado en dispositivos. Sus funciones no se reescribieron. No se implementa aquí una nueva experiencia de capital de gracias, agregación entre ámbitos ni lecturas oficiales costarricenses.

La restauración general de contexto no se declara universal: está implementada/probada para el historial de rosarios y la lectura compartida; las demás familias mantienen sus reglas de navegación existentes. No se cambia el guardado de contenido ni el acceso a datos.

## Evidencia técnica

- `tests/integrated-navigation.mjs`: 50 rosarios reales de prueba, apertura de registro, un regreso por nivel, scroll/foco, editor real, asociación de Guardar a su formulario, foco inicial en título y protección de borrador sin escrituras.
- `tests/persistent-day-progress.mjs`: scroll conserva elemento y cálculo; marcar/deshacer, fechas, símbolo propio, anillo, exclusión de novenas y 50 compromisos.
- `tests/back-navigation.mjs`, `tests/navigation-experience.mjs`, `tests/session3-ui.mjs`, `tests/daily-moments.mjs`, `tests/current-month-plan-ui.mjs` y pruebas de BD, `tests/rosary-entry-ui.mjs`.
- La auditoría histórica de acciones conserva sus 64 destinos: 63 controles clasificados y el regreso de administración delegado a BackHeader. La prueba sigue comprobando el handler, sin excluir silenciosamente esa acción.
- TypeScript, build de revisión, build de producción sin desplegar, suite general `npm test` y cotejo `verify:methodology`: correctos. Las pruebas específicas de navegación integrada también pasan y quedan incorporadas al comando de pruebas para próximas ejecuciones.
- Advertencia no bloqueante del build: paquete principal superior a 500 kB. No se oculta ni se declara resuelto el presupuesto de rendimiento por esta mejora visual.

Los ensayos DOM no renderizan geometría, safe areas, contraste ni animación real. No certifican WCAG ni sustituyen la prueba en iPhone. No se ha usado la cuenta de un participante para probar.

## Cotejo incremental de contenido

Respecto de `2845225`, no hay cambios en `lib`, `components` ni SQL. En las pantallas modificadas se conservan oraciones, fuentes, preguntas formativas, permisos, cálculos y payloads. Los cambios de texto son controles de navegación y estado del historial, reglas de producto, no enseñanza espiritual. El símbolo sigue siendo progreso de registros, nunca valoración de fe.

Se actualiza la huella documental únicamente para esta revisión técnica acotada. No implica aprobación institucional, validación litúrgica costarricense ni revisión humana de toda la integración.

## Revisión integrada que corresponde al propietario

1. Editar un compromiso con teclado abierto: salida y Guardar accesibles; cancelar conserva lo guardado.
2. Mi mes → elegir/ajustar compromisos: lista larga, edición y regreso, diferencia entre aplicar al borrador y guardar el plan.
3. Oración → Mis rosarios → registro → Volver: fila y posición conservadas, sin duplicar barras.

No se pide rediseñar otra vez el símbolo ni las letanías ya aprobados. Esta revisión busca errores de integración. Mantener el seguimiento en el paquete/issue existente de navegación; no abrir un backlog paralelo. Producción no se publica desde esta entrega.

## Continuación · 11-oct, 22:35 Costa Rica

El propietario aprobó la revisión integrada anterior (formularios personales/mes, historial y regreso). Esta aprobación no se extiende automáticamente a las modificaciones siguientes.

### Cursos y reporte para asesor

- Los formularios avanzados de Cursos usan el mismo patrón de tarea: salida arriba, campos desplazables y acción principal fuera del scroll. Incluye responsabilidades, identidad, propósito, encuentro, encargo, material, invitación, transferencia y creación; las reglas y payloads existentes se conservan.
- `TaskActions` mantiene el botón asociado mediante el atributo HTML `form`; utiliza el handler original y respeta validación nativa, versiones, errores y estado guardado. Fuera de un `TaskDialog` continúa en su posición original.
- Cursos protege la salida por Volver/Escape/toque exterior cuando hay cambios sin guardar. Bloquea salida durante envío. No es un respaldo de borradores frente a recarga/cierre del navegador.
- Reporte conserva selección voluntaria, ideal y registros matrimoniales inicialmente excluidos, y restauración de opciones al cerrar/reabrir. Descargar PDF queda fuera de la lista larga; el PDF, cálculos, fuentes y reglas de acceso no cambian.
- La prueba privada dispone de `?scenario=courses` (50 integrantes ficticios, guardar responsabilidades/identidad/encuentro solo en memoria) y `?scenario=reports&volume=50` (acceso directo al reporte). Operaciones no implementadas en la demostración de Cursos muestran error y no se anuncian guardadas.

### Evidencia y límites

`tests/advanced-task-navigation.mjs`: 50 integrantes y 50 compromisos; asociación de botón/formulario; conflicto conserva borrador; salida protegida; bloqueo durante envío; versión enviada; foco al origen; reporte con selección privada voluntaria y opciones conservadas al reabrir. Se incorpora a la suite de navegación y general. Regresiones de comunidad y PDF y auditoría de recorridos existentes aprobadas. Verificación completa y builds se registran al finalizar.

Cotejo del diff: no cambian textos espirituales, fuentes, cifras del reporte, permisos de servidor ni SQL. Mensaje de descarte reutilizado del editor aprobado. No hay nuevo modelo de responsabilidades ni nuevo consentimiento. El cambio visible pendiente de revisión es únicamente la aplicación del patrón existente a Cursos/reporte, con protección del borrador.

Pendiente: revisión humana del teclado y geometría de estas dos familias; luego preparar integración/publicación de la candidata. Se conserva el alcance del issue #13; no se crean tickets ni se afirma actualización remota de seguimiento. Producción permanece sin cambios en esta entrega.

### Cierre técnico de esta continuación

- Suite general aprobada en dos tramos: ejecución completa hasta el inventario de acciones y reanudación desde ese inventario hasta el final. Se ajustaron dos expectativas documentales de quitar imagen/foto para incluir la protección del borrador; sus destinos siguen siendo locales y se probó descartar sin modificar la imagen guardada. No se eliminó ninguna comprobación.
- La primera ejecución detectó una carrera del arnés de `community-ui`: el evento de salida se emitía antes de terminar los efectos de React tras resolver el guardado. Se espera ahora la resolución dentro de `act`; misma aserción de salida y mismo componente de producto.
- Formularios de tarea bloquean los campos durante envío para impedir nuevas ediciones mientras se confirma el payload; el FormData se recoge antes del bloqueo. Pruebas de responsabilidades, error/reintento, foto, comunidad y renovación ejecutadas sobre el componente final.
- Tipos, builds privado/productivo sin despliegue y cotejo documental aprobados. Sigue la advertencia de bloque JS superior a 500 kB. Sin nueva prueba visual automatizada: no hay control de navegador disponible en este entorno.
- Revisión humana requerida: Cursos → Curso de prueba → Organizar → Permisos/identidad y reporte largo con acciones visibles. Aprobaciones previas de navegación, símbolo y letanías conservadas.

## Aprobación y preparación de publicación · 11-oct 22:59 Costa Rica

El propietario respondió «Ok adelante» tras revisar Cursos y reportes. Estas dos familias quedan aprobadas. Se prepara 0.4.0-alpha.4 sobre main de437b1, sin nuevas modificaciones visuales o editoriales. El issue #13 fue actualizado a las 22:48 y continúa como seguimiento único. La publicación se documentará con su ejecución y verificación posteriores; no inferirla de esta aprobación.
