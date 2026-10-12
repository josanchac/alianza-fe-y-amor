# Alianza — auditoría integral de navegación, densidad y movimiento

Fecha: 12 de octubre de 2026 UTC (11 de octubre en Costa Rica).

## Estado y alcance

Auditoría y propuesta, no implementación ni autorización de publicación. Se revisaron el inventario de componentes de `app/` y `github/`, los flujos y estilos compartidos, componentes críticos y capturas del piloto. Base local: rama `fix/persistent-back-navigation-20261011`, commit `9f7aadb`, sobre la versión alpha.3. La barra de regreso del prototipo está aprobada por el usuario; extenderla al producto todavía requiere implementación y pruebas.

Cobertura: todas las familias de pantallas identificadas en el código, incluidos Pareja, Cursos, ayuda, administración y estados de acceso. No equivale a haber navegado y probado visualmente cada ruta en dispositivos reales. Los riesgos de superposición, teclado y geometría se deben confirmar en la prueba renderizada. No se modificaron código funcional, datos, contenido espiritual ni producción durante esta auditoría.

Referencias internas: `docs/ENGINEERING_QUALITY.md`, `docs/VISUAL_AUDIT_20260926.md` y `docs/BACK_NAVIGATION_REVIEW_20261011.md`. Este paquete debe incorporarse al seguimiento existente asociado al issue #13, sin crear un segundo backlog paralelo. Este documento no afirma que el issue o el Project hayan sido actualizados.

## Dictamen: qué significa «más app»

No significa quitar texto indiscriminadamente, agregar movimiento ni copiar iOS. Significa reconocer dónde estoy, ver la tarea principal, actuar con respuesta inmediata, poder corregir errores y regresar sin perder contexto.

1. **No recomiendo esconder Personal/Pareja/Cursos en un menú ahora.** Son tres opciones importantes y el piloto ya tiene problemas de descubrimiento. Rectifico la sugerencia anterior de un selector desplegable: primero reducir su peso visual, conservando acceso directo.
2. **El problema de la captura es la jerarquía acumulada.** Espacios, fecha y vistas parecen tres bloques principales. El contenido queda subordinado a la navegación.
3. **Mi recorrido no es un período.** Mi día/Mi mes/Mi recorrido pueden mantenerse como destinos locales conocidos, pero no deben presentarse conceptualmente como día/mes/año. Semana/mes/año son filtros dentro de un recorrido o revisión.
4. **No todo necesita permanecer fijo.** Fijar logo, espacios, fecha, pestañas, regreso y navegación inferior consumiría la pantalla que se intenta recuperar.
5. **No toda tarjeta ni todo desplegable es malo.** Tarjetas para objetos con estado y acciones; filas para listas; selectores para opciones; texto para lectura. El patrón debe responder a la tarea, no a una estética uniforme a cualquier costo.

### Propuesta para los controles de la captura

- Mantener Hoy / Oración / Mi espacio como navegación principal inferior, predecible.
- Personal / Pareja / Cursos: pestañas compactas, sin tres contenedores grandes; activo reconocible por indicador y peso, no solo color. No ocultar las opciones habilitadas ni exigir abrir un menú para cambiar.
- Mi día / Mi mes / Mi recorrido: navegación local de menor peso; conservar nombres en esta iteración. Evitar un segundo gran bloque de botones equivalente al primero.
- Fecha: fila contextual dentro de la vista que controla, debajo de su navegación local. Flechas con área táctil suficiente y estado inactivo inequívoco; no confundirlas con regresar de pantalla.
- Reducir espacios redundantes y bordes antes de reducir letra o áreas táctiles. Mantener al menos 44 × 44 CSS px como objetivo propio de interacción; no confundirlo con el mínimo AA de WCAG.
- Al profundizar en un detalle, retirar selectores ajenos a la tarea. Volver recupera el espacio, vista, fecha, filtro y posición de origen.

## Hallazgos sustentados en el código

| ID | Hallazgo y evidencia | Consecuencia / ajuste |
|---|---|---|
| N01 | `journal.tsx`, `spaces.tsx`: encabezado, espacios, fecha y vistas son capas separadas. La captura muestra su peso acumulado. | Unificar jerarquía y definir qué queda fijo; no añadir otra barra sobre todas. |
| N02 | `today-header.tsx` y `back-header.tsx` mantienen mecanismos independientes para medir scroll. | Un contrato común de encabezado y una sola barra persistente por pantalla; Hoy conserva su significado de avance sin duplicar marca y navegación. |
| N03 | `back-header.tsx` mide el umbral contra cero, mientras CSS fija la barra con `safe-area-inset-top`. | Alinear medición e inset; verificar rotación, zoom y que no oscile entre estados cerca del umbral. |
| N04 | `journal.tsx` reinicia scroll al cambiar estados de navegación; el historial personal tiene una excepción específica. `daily-moments.tsx` ya restaura posición y foco. | Generalizar retorno por origen; no reiniciar toda navegación ni romper los casos correctos existentes. |
| N05 | En Pareja conviven regreso del contenedor y regreso propio del historial; Misa y Cursos tienen encabezados distintos al aprobado. | Un solo propietario del regreso por nivel. Título en contenido; controles específicos conservados. |
| N06 | `mass.tsx` realiza posicionamientos con anclas y un desplazamiento fijo; los nuevos encabezados cambian el espacio disponible. | Usar el inset real y márgenes de scroll compartidos; comprobar que la lectura y el foco no queden bajo la barra. |
| N07 | `app-panel.tsx` divide cabecera/cuerpo, pero reglas globales de `renewal.css` fuerzan overflow y posicionamiento de diálogos. | Riesgo de scroll anidado o salida inaccesible: confirmar por render y consolidar estilos, no añadir otro parche global. |
| N08 | Plan mensual, permisos y exportación contienen formularios/listas extensos; acciones finales dependen de su disposición. | Formularios largos como pantallas de tarea, con salida y guardado accesibles y compatibles con teclado. No convertir todo en popup. |
| N09 | `globals.css` importa varias capas de ajustes; hay reglas competidoras para botones, encabezados y diálogos. | Componentes/tokens únicos con variantes explícitas. Migrar por familia y retirar overrides sustituidos. |
| N10 | Hay soporte existente de movimiento reducido, incluso eliminación de transformaciones del encabezado de Hoy en `today-serene.css`. | Conservarlo y probarlo; no reportarlo como ausente. Cualquier nuevo movimiento debe respetar la misma preferencia. |
| N11 | Historiales, informes, cursos y permisos pueden acumular mucho contenido; existen algunos paginadores, pero no una política transversal. | Filas compactas y resumen/detalle según tarea; probar volúmenes altos sin introducir scroll dentro de cada tarjeta. |

## Una regla de scroll, con excepciones deliberadas

**La marca puede perder protagonismo; la orientación y la salida no.**

En pantallas generales, el encabezado amplio sale del área de lectura y queda un árbol pequeño dentro de la barra compacta. Transición breve y sin cambiar la posición del contenido bajo el dedo. No se expandirá y contraerá con cada pequeño cambio de dirección: se recupera el estado amplio al regresar a la zona superior.

En pantallas secundarias, **‹ Volver** permanece reconocible, con el título en el contenido, como ya se aprobó. El logo pequeño es secundario. No sumar la barra del padre a la del hijo. Al abrir una tarea inmersiva, esta sustituye la navegación del fondo.

Si se necesita volver o controlar una lectura, esas funciones tienen prioridad sobre mostrar el logo. No agregar una flecha en una pantalla raíz sin un destino real. El árbol no debe aparentar ser botón si no tiene acción; si permite ir a Inicio, debe hacerlo consistentemente y respetar cambios sin guardar.

### Cobertura por sección

| Familia / pantallas | Logo al hacer scroll | Regreso y controles | Ajuste principal |
|---|---|---|---|
| Hoy / Mi día | Excepción aprobada 11-oct 21:58: conserva el símbolo de avance, no lo reemplaza la marca | Sin regreso inventado en raíz; navegación principal estable | Compactar contexto, conservar compromiso y avance como protagonistas. |
| Mi mes: preparación y resumen | Sí | Raíz sin regreso artificial; detalles con Volver | Separar preparación, cierre y consulta; evitar navegación repetida. |
| Plan mensual, selección y edición de compromisos | No animación de marca durante la edición | Volver/cancelación protegida y Guardar accesibles | Pantalla de tarea; no confundir aplicar un cambio al borrador con guardarlo en servidor. |
| Revisión mensual y revisión de compromiso | No al escribir; marca secundaria en consulta | Salida y guardado visibles con teclado | Evitar que los campos o avisos oculten las acciones. |
| Mi recorrido: semana/mes/año/fechas | Sí en vista general | Controles de período contextuales; retorno desde detalle | Resumen primero, detalle a demanda, conservar filtro y posición. |
| Agradecimientos, ofrecimientos y reflexiones | No en el lector dedicado | Volver persistente; edición protegida | Conservar restauración de foco/scroll ya implementada; lectura sin animación de párrafos. |
| Mi camino, ideal y propósito | Sí en resumen; no durante escritura guiada | Volver y salida con borrador preservado | Pasos claros, no una larga ventana flotante. |
| Oración: inicio y opciones | Sí | Navegación principal estable | Pendientes diferenciados de historial; acciones principales visibles. |
| Rosario: preparación y preferencias | No dentro de la tarea | Volver o Cerrar según contexto; acción de iniciar | No duplicar encabezados ni abrir ventanas en cascada. |
| Rosario personal, compartido y decenas guiadas | No | Conservar controles de oración, pausa y salida | Mantener patrón inmersivo; no añadir movimiento ligado al scroll. |
| Letanías | No | Conservar salida aprobada accesible durante lectura | No reabrir el diseño aprobado; sin avance automático ni animación por invocación. |
| Historial y registro de rosarios | Sí | Volver persistente en lista y detalle, sin duplicados | Estado compacto, retorno al mismo registro/posición. |
| Misa: lecturas, salmo y oraciones | Opcional estático; no necesario en lector | Volver y Aa tienen prioridad | Unificar barra, respetar anclas y tamaño de letra; no mover texto durante lectura. |
| Guía de confesión | No | Cerrar y pasos accesibles | Flujo sensible y sereno; no añadir celebraciones o métricas. |
| Pareja: resumen, medios ascéticos y compartidos | Sí en resumen | Un regreso por nivel | Mantener visible de quién es el contenido y qué se comparte. |
| Pareja: solicitudes, permisos, archivos y detalle | No en confirmaciones; sí en listas extensas | Confirmaciones explícitas y retorno al origen | No sustituir consentimiento por gestos; evitar mover opciones bajo el dedo. |
| Cursos/grupos: listado y resumen | Sí | Volver al listado o curso según nivel | Identidad del grupo no compite con una segunda marca dominante. |
| Curso: propósito, oración, capital, encuentros, materiales, anteriores | Sí en navegación; no en lectura/oración inmersiva | Volver contextual y estable | Listas/resúmenes consistentes; lector dedicado para contenido extenso. |
| Curso: participantes, organización, roles e invitaciones | No durante formulario/confirmación | Salida protegida y guardar claro | Mantener permisos y límites de rol; no simplificarlos visualmente hasta volverlos ambiguos. |
| Mi espacio / configuración | Sí en raíz | Detalles con Volver; opción breve en panel con Cerrar | Mantener filas de configuración aprobadas, no convertirlas en tarjetas grandes. |
| Símbolo personal, imagen y recorte | No | Cancelar/aplicar claros | El área de edición y sus controles prevalecen sobre la marca. |
| Privacidad, recordatorios, pareja y espacios configurables | No en edición | Cerrar/Volver según patrón, guardado explícito | Una sola superficie de scroll; no cerrar perdiendo cambios. |
| Ayuda, formación, 4Rs, fuentes y Schoenstatt CR | Sí en índice; no en lector largo | Volver/Cerrar siempre accesible | Índice breve, lector legible; conservar contenido y referencias. |
| Instalación, donación, soporte y versiones | No en panel breve; sí en listas | Salida visible; pasos de instalación estables | No animar instrucciones, datos de pago ni errores mientras se leen. |
| Informes, selección de notas y exportación PDF/JSON | No en tarea | Volver/cancelar y exportar claros | Selección escalable; separar vista previa de generación/descarga. |
| Acceso, recuperación, invitación y bienvenida | No | Acción y estado inequívocos | Marca estática; no esconder errores o condiciones de acceso. |
| Administración, invitaciones, soporte y métricas | Sí en listas extensas | Volver persistente desde detalle | Densidad funcional y filtros persistentes; no reutilizar grandes tarjetas devocionales. |
| Mantenimiento, actualización, error y confirmaciones críticas | No | Acción explícita y estable | No recargar, salir o resolver estados mediante scroll. |

## Movimiento permitido y movimiento que evitaría

Valores iniciales propuestos para Alianza, no exigencias de Apple o WCAG:

| Interacción | Respuesta propuesta | Límite |
|---|---|---|
| Encabezado amplio a compacto | Fundido/reducción discreta, aproximadamente 180–220 ms cuando se cruza el umbral | Sin salto de layout, sin rebote ni repetición cerca del umbral. |
| Contenido pasa bajo la barra | Línea o sombra muy tenue de separación | No blur intenso ni fondos que reduzcan contraste. |
| Cambiar pestaña o selección | Cambio claro del indicador; transición corta | No desplazar toda la página lateralmente ni reproducir entrada de cada tarjeta. |
| Abrir detalle / regresar | Transición breve que confirme el cambio de contexto | Restaurar posición y foco; no obligar a esperar la animación. |
| Panel de acción breve | Una entrada/salida coherente | Una sola capa; gesto opcional, nunca único medio de salida. |
| Completar / deshacer compromiso | Respuesta local inmediata y confirmación discreta | Mantener solución aprobada de deshacer; no mover o reordenar la fila al tocar. |
| Desplegar contenido opcional | Apertura local discreta | No acordeones gigantes como estructura principal; conservar la posición del disparador. |
| Cargar más registros | Indicador de carga localizado | Sin sustituir toda la pantalla ni perder posición. |

No usar: parallax, scroll forzado, animaciones de entrada al aparecer cada párrafo, texto que cambia de escala durante la lectura, ocultar Volver/Guardar al bajar, progreso espiritual vinculado a cuánto se desplazó la página, ni adelantar oraciones automáticamente.

Con movimiento reducido: estados estables, sin desplazamientos ni escalados decorativos; cambios instantáneos conservando información y foco. El scroll normal sigue siendo del usuario. No añadir desplazamiento suave automático al regreso restaurado.

## Paquete único de implementación

### A. Base compartida y seguridad de navegación — prioridad alta

1. Definir tokens de altura, áreas seguras, capas, tipografía, áreas táctiles, espaciado y movimiento.
2. Unificar encabezado principal/secundario y sus estados; extender Volver aprobado sin título dentro del botón/barra.
3. Resolver un único scroll principal por superficie, insets comunes y foco no cubierto por barras.
4. Generalizar conservación de espacio, vista, período, filtro, posición y foco; comprobar regreso del navegador y regreso interno.
5. Conservar protección de cambios sin guardar, privacidad, consentimiento y comportamiento de teclado.

### B. Jerarquía y densidad — prioridad alta, revisión visual

1. Prototipar navegación compacta con las tres áreas visibles y jerarquía distinta para las vistas locales.
2. Reubicar fecha dentro de su contexto y reducir bloques vacíos/bordes redundantes.
3. Migrar todas las familias de la matriz a los patrones compartidos; no hacer una excepción CSS por pantalla.
4. Formularios largos como tareas; paneles para acciones breves; lectores sin marca animada.
5. Historiales y registros con filas compactas, estado visible y detalle accesible. Conservar las tarjetas cuando su información/acciones lo justifiquen.

### C. Movimiento y validación — después de resolver A/B

1. Aplicar solo los movimientos de la tabla anterior donde comuniquen estado o jerarquía.
2. Consolidar estilos sustituidos; no añadir una nueva hoja de overrides globales al final.
3. Revisar accesibilidad, tamaños, áreas seguras, rendimiento y carga alta.
4. Ejecutar regresiones y aprobación visual; publicar únicamente tras pasar estos controles.

La auditoría no permite comprometer una fecha de publicación fiable sin completar implementación y pruebas. El lote es único en criterio y seguimiento, pero se construye por incrementos verificables; no mediante un reemplazo masivo del CSS.

## Criterios de aceptación

- Una barra superior persistente por pantalla; ninguna barra del fondo visible por encima de una tarea modal.
- Volver/Cerrar disponible en inicio, mitad y final de contenidos largos. Sin títulos disfrazados de botones ni regresos duplicados.
- Una pantalla raíz no muestra regreso ficticio. El título de la pantalla sigue siendo accesible en contenido/semántica aunque no viaje en la barra.
- Regresar restaura período, filtro, elemento, posición y foco. Cambiar a una tarea nueva sí muestra su comienzo de forma predecible.
- Encabezado compacto sin desplazar contenido bajo el dedo, oscilar en el umbral ni interceptar toques.
- Elementos enfocados y anclas visibles; padding suficiente arriba/abajo. Guardar no queda oculto por teclado o navegación inferior.
- Área táctil objetivo 44 × 44 px o mayor sin reducir texto para acomodar tres botones. Verificar contraste, foco, nombres accesibles y controles sin depender solo del color.
- Probar anchos 320/360/390/430 px, escritorio, orientación horizontal, texto al 200 %, áreas seguras y teclado abierto.
- Probar movimiento reducido, teclado y lector de pantalla; las animaciones nunca son necesarias para comprender el estado.
- Probar vacío, un registro, 50 y 100 registros, notas largas y títulos extensos; carga parcial, error, sin conexión y reintento.
- No cambiar al hacer scroll: contadores, oraciones, permisos, marcas, selección, guardados o intención del usuario.
- Conservar letanías aprobadas, corrección de toque accidental, pausar compromiso, privacidad y protecciones existentes.

### Revisiones con el usuario

Una revisión agrupada de tres escenarios antes de replicar el patrón:

1. **Navegación cotidiana:** Hoy con Personal/Pareja/Cursos y vistas locales; inicio, scroll y regreso.
2. **Lista y lectura:** historial largo → registro → volver; Misa con Aa; contraste con letanías sin cambios.
3. **Tarea y teclado:** editar compromiso/plan → escribir → guardar o salir; contenido abundante.

No interrumpir para cada ajuste interno. Sí detenerse para nuevos patrones visuales, cambios de experiencia, etiquetas con significado funcional y cualquier cambio de contenido final de la aplicación. El usuario ya aprobó Volver, no todas las propuestas de este documento.

## Fuera de este paquete

Respaldos/OneDrive diferidos; modificación de textos litúrgicos y fuente oficial de Costa Rica; nuevas definiciones pedagógicas o contabilidad del capital de gracias; nuevas funciones de semana/año o consolidación entre ámbitos; cambios de permisos, base de datos o reglas de compromisos. Mantenerlos en su seguimiento existente. La unificación visual no debe presentarlos como resueltos.

## Fundamento y límites de las referencias

- Apple HIG: controles segmentados para vistas estrechamente relacionadas; navegación por pestañas predecible y conservación de estado. No implica copiar literalmente una app nativa ni esconder tres destinos importantes.
  - https://developer.apple.com/design/human-interface-guidelines/segmented-controls
  - https://developer.apple.com/design/human-interface-guidelines/tab-bars
- Android: distintos comportamientos de app bar según contexto; el colapso es una herramienta, no una obligación universal.
  - https://developer.android.com/develop/ui/compose/components/app-bars
- WCAG 2.2, 2.4.11 AA: el foco no puede quedar completamente oculto por contenido creado por la aplicación. El objetivo de este paquete es verlo completo, superior al mínimo de ese criterio.
  - https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
- WCAG 2.3.3 AAA: poder desactivar movimiento no esencial disparado por interacción. Se adopta como criterio de diseño; no se afirma que pertenezca a AA.
  - https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- Objetivo táctil propio de 44 px; WCAG 2.5.8 AA establece 24 px con excepciones, y 2.5.5 AAA corresponde a 44 px con excepciones.
  - https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
  - https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html

Los estándares de calidad del proyecto (ISO 25010, NIST SSDF, OWASP ASVS, WCAG y DORA) orientan calidad, seguridad y evidencia de entrega; no prescriben este diseño visual ni certifican el producto por citarlos.
