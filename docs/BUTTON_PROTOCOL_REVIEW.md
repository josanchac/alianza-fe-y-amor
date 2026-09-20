# Protocolo de acciones — patrón aprobado, verificación integrada pendiente

## Propósito y estado

Reconocer qué se puede hacer sin llenar la app de bloques pesados. El propietario aprobó el dummy completo y autorizó avanzar. El patrón y sus excepciones se conservan; se aplicaron 75 controles inventariados en `5f4e35e`, documentados en `ACTIONS_IMPLEMENTED_20260920.json`. Esto no certifica accesibilidad ni reemplaza la revisión visual de la app integrada. El resto de este documento conserva los criterios acordados.

## Patrones

| Tipo | Apariencia | Casos | Excepción |
|---|---|---|---|
| Principal | Azul sólido, ancho natural, texto explícito | Guardar, aceptar, avanzar | Una por bloque de decisión; Avanzar en rosario puede ser ancho y más alto por uso repetido. |
| Secundario | Fondo muy tenue y borde fino; sin sombra | Editar, registrar otro, copiar | Evitar ancho completo si el contenido no lo necesita. |
| Reversible | Fondo de superficie, borde fino, icono opcional y etiqueta | Deshacer último, cancelar edición | No confirmación para cada marca; proteger borradores al salir y respetar conflictos. |
| Delicado | Botón separado; texto y borde sobrios | Eliminar, revocar, desvincular, salir | Confirmación proporcional al efecto. Rojo reservado a pérdida o revocación; no a toda cancelación. |
| Navegación | Botón liviano con flecha o tarjeta de acceso | Volver, abrir sección, fuente | Una tarjeta completa ya es objetivo táctil: no agregar botón dentro de botón. Fuentes externas permanecen enlaces. |
| Selección | Chip, círculo o segmento con estado | Frecuencia, compromiso, variante de Misa | No confundir selección con ejecución; aria-pressed/checked y etiqueta explícita. |
| Desplegable | Fila con título y chevrón | Misa, instrucciones, oración | Ancho completo justificado; aria-expanded, foco estable y lectura bien posicionada. |

Deshacer es una intención de secundario, no una familia visual independiente. Las acciones con consecuencia delicada pueden usar confirmación sin aumentar su prominencia en la pantalla inicial.

## Medidas propuestas

- Objetivo de interacción de al menos 44 × 44 CSS px; 44 px de alto habitual, no 48/56 por defecto. Icono visible de 18–20 px dentro del área; las marcas pueden mantener círculo más pequeño si el área real es inequívoca y no se solapa.
- Texto de acción 16 px, peso normal/medio; 15 px solo en variantes que validemos con ampliación. Borde de 1 px, radio 8–10 px, relleno horizontal 10–12 px, separación mínima propuesta de 8 px entre objetivos.
- Ancho por contenido; permitir dos líneas para etiquetas largas, sin recortar, partir palabras ni reducir letra. Apilar antes de apretar. Una acción primaria puede ocupar el ancho si facilita una tarea concentrada.
- Foco visible, lectura por teclado y tecnologías de asistencia, contraste a comprobar contra la superficie final. Sin dependencia de hover, color, tooltips o gestos.
- El criterio propio de 44 px se alinea con el objetivo reforzado de WCAG 2.5.5; el mínimo AA 2.5.8 es 24 px con excepciones. No presentar 44 px como requisito universal de AA ni como certificación del producto. Fuentes consultadas: https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html y https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html.

## Etiquetas y estados

- Verbo y objeto cuando el contexto no sea suficiente: «Cancelar invitación» y «Conservar invitación», no «Sí/No».
- Iconos complementarios, no reemplazar texto en acciones poco conocidas. Flechas, cierre y tamaño de letra pueden ser controles compactos con nombre accesible.
- Guardando: bloquear repetición, indicar progreso y conservar dimensiones. No mostrar guardado antes de confirmación del sistema.
- Error: mensaje junto a la tarea, mantener borrador y ofrecer reintento. Sin conexión: explicar la razón del bloqueo, sin borrar trabajo ni fingir guardado.
- Deshacer disponible junto al registro mientras corresponda; respetar unidades (ocasiones o días), período y concurrencia. Una operación de privacidad requiere verificar estado en servidor en implementación.
- Al cerrar un diálogo, devolver foco. Si se descarta edición modificada, advertir antes de perderla. El ejemplo de edición conserva estado local y no representa persistencia real.

## Decisiones específicas a revisar

1. Diario: denominador solo diario. Metas semanales/mensuales nunca rellenan ni reducen el día. «Sin metas diarias» no equivale a deuda ni 0 % espiritual.
2. Extras: relleno máximo 100 %, meta fija y halo único con «+N adicionales». El halo no gana intensidad con el número. No sumar días extra en un mismo día si la unidad es días.
3. Metas históricas parciales o desconocidas: indicar registros/estado, sin porcentaje ni halo de superación hasta tener una meta válida. Cambiar una meta no reescribe historia.
4. Misa: filas amplias para acordeones, botones pequeños para fecha/letra; una sección principal y un texto abiertos. Comprobar posición al abrir secciones de longitud distinta y preservación del foco.
5. Edición: un Guardar principal; Cancelar secundario; error y desconexión visibles. No rediseñar confirmaciones de privacidad como parte de un cambio cosmético.
6. Pareja/grupos: aceptar separado de rechazar/salir. Administración: renovar/copiar frente a cancelar, con contexto de la persona elegida.

## Validación eficiente

Aprobar patrones y siete vistas de galería (componentes + seis contextos); revisar aparte operaciones delicadas y etiquetas dinámicas. Después aplicar componentes compartidos por intención, no un reemplazo global de text-button.

Primero: pruebas automáticas de semántica, estados, repetición, periodización y errores. Segundo: revisión renderizada a 320/390/768 px, ampliación 200 %, foco y tacto en Safari/iPhone y otro navegador. Tercero: tareas observadas con personas del piloto — nuevas, con poca experiencia digital, con necesidades de texto ampliado y con interrupciones — sin atribuir capacidad por edad.

Registrar éxito sin ayuda, toque equivocado, retroceso, comprensión del resultado y facilidad percibida. Una confusión sobre borrar, privacidad o períodos obliga a corregir antes de publicar; una muestra pequeña no produce una puntuación universal de usabilidad.
