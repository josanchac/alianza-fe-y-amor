# Alianza — dirección visual B y aplicación a sesión 3

Fecha: 26 de septiembre de 2026, Costa Rica.

## Decisión aprobada

El propietario aprobó y cerró el diseño visual del Rosario B y pidió aplicar sus criterios al resto de la experiencia. Esta aprobación no equivale a aprobar pantallas nuevas ni publicar.

Referencia editable: https://www.figma.com/design/ZiDkAY5TNwRVUlDIrgkiF5
Rosario B: preparación 3:318; oración 3:405.
Crucifijo: madera satinada, Cristo con opacidad 0.58 y desenfoque 0.35; desplazamiento vertical final neto +1.5 respecto de la figura inicial. Medalla con imagen de Schoenstatt con el Niño. Mantener el rosario completo.

## Criterios transversales

- Fondo cálido, azul oscuro legible y dorado discreto. La suavidad corresponde a la ornamentación, nunca a textos o controles.
- Mantener jerarquía, espacio y textos breves. Una acción principal por contexto; revelar personalizaciones al pedirlas.
- Botones reconocibles con borde fino o fondo tenue y tamaño según contenido, salvo acciones principales que lo justifiquen. Área táctil prevista de 48 unidades, con adaptación por plataforma.
- Reservar textura y relieve para objetos devocionales; formularios y lectura permanecen limpios.
- Iconos solos para acciones inequívocas como ajustes, siempre con nombre accesible. Acciones menos conocidas conservan etiqueta.
- Lora e Inter son las fuentes propuestas del diseño aprobado en Figma. La app usa Georgia y Arial; la implementación debe resolver esta diferencia explícitamente, sin sustitución silenciosa.
- Estados identificables sin depender solo del color. Texto ampliable, foco visible y movimiento reducido se validan al implementar.
- Diseñar para web e iOS/Android sin asumir que un archivo de Figma produce automáticamente una app nativa.
- No inventar lecturas ni oraciones; no usar contenido de usuarios reales en ejemplos. Errores no deben aparentar guardado exitoso.

## Aplicación por flujo

### Misa — prioridad 1

Portada centrada en Lecturas del día. Fecha seleccionable y anterior/siguiente visibles; retorno a Hoy. Guía de la misa como acceso secundario. Una lectura abierta a la vez, texto íntegro con fuente, tamaño ajustable y posición correcta al cambiar. Conservar selección de celebración cuando corresponda. El diseño completo debe incluir lector, selector de fecha y estados de indisponibilidad. Completar oraciones sigue siendo un pendiente real; no sustituirlas por frases de relleno.

### Cambio de mes — prioridad 1

Revisar septiembre y Preparar octubre son acciones independientes. Revisión opcional y recuperable. Preparación muestra propósito, compromisos que se conservarán, frecuencia resumida y Editar junto a cada uno. Permitir quitar del próximo mes, agregar y empezar de cero. El borrador no cambia el historial anterior.

Editor: nombre, repetición, cantidad y momento visibles. Más opciones contiene múltiples sesiones, duración, recordatorio y nota de apoyo. Reutilizar el catálogo aprobado: diario, días específicos, veces por semana/mes y por un tiempo. Aplicar al borrador y Cancelar claramente separados. Semanas y novenas que cruzan de mes conservan continuidad.

### Pareja — prioridad 2

Separar Lo que recibo de Lo que comparto. Cada categoría ofrece Privado, Todo lo actual o Elegir elementos. Compartir futuros es independiente y apagado inicialmente. Registros y notas tienen alcance separado. Vista previa antes de confirmar. Mostrar vínculo pendiente, ausencia de contenido y revocación sin simular permisos efectivos.

### Cursos — prioridad 2

Invitación pendiente dentro de la cuenta, con remitente y curso. Ver detalles y aceptar, Ahora no y Rechazar tienen efectos distintos. Rechazar pide confirmación, ofrece Deshacer y permite recuperar desde Rechazadas si sigue vigente. Recuperar no inscribe automáticamente. Push es un canal futuro independiente.

## Estado de la ejecución

Se revisó el documento de diseño v0.2 y la base aprobada del Rosario. Se creó el contenedor Figma 14:14, pero la siguiente operación fue rechazada por el límite de llamadas MCP del plan Starter. No se guardó la composición de las seis pantallas propuestas. No hay nuevas pantallas revisadas visualmente ni aprobadas. El contenedor puede estar vacío y marcado en progreso.

Continuación: componer Misa, cierre de mes, preparar mes, editor de recurrencia, pareja y cursos dentro de 14:14; conectar recorridos relevantes y revisar capturas. Completar el lector real de Misa y sus estados antes de solicitar aprobación del flujo completo. Validar primero Misa y mes; no bloquearlos por detalles de los otros módulos.

Sin cambios en código funcional, datos, permisos, invitaciones ni producción. No se han creado issues ni sincronizado este documento con GitHub remoto en esta operación.


## Estándar de regreso aprobado — 26 septiembre 23:30 CR
Flecha arrow-left en botón circular de fondo tenue, 44×44px de área interactiva, arriba a la izquierda. Sin etiqueta visual redundante; nombre accesible contextual Volver a… y foco visible. Conservar borrador y posición de lectura al volver; advertir antes si una acción realmente descarta cambios. Usar como componente compartido en toda la app. No confundir regresar con cerrar un modal o cancelar una operación. Referencia aprobada /workspace/alianza-misa-regreso-app.html. Pendiente de implementar en código productivo.


## Regla global confirmada — 23:43 CR
El usuario exige experiencia de app de alta calidad en toda Alianza, móvil y escritorio. Aplicar familia coherente de componentes, jerarquía clara, controles táctiles reconocibles, navegación predecible, lectura cuidada y estados de carga/error/guardado. Evitar controles visualmente improvisados, relleno explicativo, expansión indiscriminada de contenido y estilos independientes por pantalla. No confundir app-like con ocultar etiquetas necesarias o sustituir controles semánticos accesibles. Revisar cada recorrido integrado; prototipos aislados no prueban integración productiva. Mantener la identidad serena aprobada.

Foto propia: encuadre con esquinas suaves sobre la foto (no óvalo difuminado), zoom y posición ajustables; transición gris-color gradual o aro conservando imagen a color. Prototipo aprobado para avanzar /workspace/alianza-simbolo-foto-redondeada.html. Implementación pendiente.

Inicio de implementación: componente BackButton compartido, aplicado al regreso de Misa. No altera el destino ni la persistencia; esos contratos corresponden al recorrido. Extensión al resto pendiente.
