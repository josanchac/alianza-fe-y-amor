# Sesión 3 — integración en revisión, 27 septiembre 2026

Estado: implementación en rama `release/session3-20260927`, pendiente de publicación al piloto. Se conserva `main` y no se aplicaron migraciones en producción. La autorización de publicar ya existe; la limitación actual es recuperar el recurso visual exacto del Rosario B desde Figma, cuyo conector rechazó tanto el contexto de diseño como la captura por cuota Starter agotada.

## Cambios implementados

- Misa abre Lecturas, conserva fecha y calendario especial; Oraciones abre una lista con lectura dedicada y regreso circular. Sin explicaciones repetidas ni placeholders en cada momento.
- **Contenido de Misa parcial:** cuatro oraciones tradicionales del prototipo aprobado (Kyrie, Credo de los Apóstoles, Padre nuestro y Cordero de Dios). Padre nuestro reutiliza el texto existente omitiendo el Amén final para este contexto. No se afirma guía completa, cotejo de edición costarricense ni autorización editorial de los textos pendientes. Fuentes consultadas en los documentos de aprobación, referencias visibles por oración. No se añadieron Gloria, Santo, Credo niceno ni textos modernos sin resolver procedencia y reproducción.
- Revisión mensual con tres preguntas opcionales. Consulta por categoría con tres reflexiones por página. Móvil revela consulta aparte; escritorio consulta a la izquierda y escritura a la derecha. Propósito anterior editable; notas previas se conservan como texto legible.
- Preparación del próximo mes independiente del cierre, Todos con estado parcial, selección por compromiso y edición de recurrencia. Guarda un plan separado; al entrar el mes se aplica sin reescribir registros anteriores. Ediciones posteriores a la planificación prevalecen. Planes separados por época de datos para no reaparecer tras un reinicio de cuenta.
- Compromisos por tiempo: días consecutivos o días de semana seleccionados; cantidad programada sin extenderse automáticamente por una omisión. Novenas anteriores conservan semántica e historial.
- Pareja: Me comparte/Comparto; últimas tres novedades de la semana, consulta paginada por categoría y mes, marca Nuevo local acotada, sin contador acumulativo. Permisos Nada/Todo/Elegir por categoría, futuros desactivados inicialmente, avance y símbolo independientes. Filtrado de campos en servidor, sin notas privadas de compromisos. Se conservan elecciones de compartición anteriores hasta que el propietario guarde las nuevas.
- Curso: invitación asociada a la cuenta destinataria, no exige compartir un enlace. Ahora no, confirmación de rechazo, Deshacer, recuperación mientras esté vigente, control de versión y revocación. No envíos de correo ni push nativo nuevos.
- Rosario: preferencias de cuenta reutilizables, engranaje, opciones de misterios como selección directa y entrada al rezo al crearlo. La base ya admite varios rosarios personales; no se cancela uno al iniciar otro. **La ilustración B aprobada sigue pendiente de exportación e integración; no se ha sustituido por una aproximación.**
- Símbolo: encuadre de foto con zoom y posición, esquinas redondeadas en la propia imagen; color gradual o aro, vista 0/50/100. Miniatura JPEG reencodificada sin metadatos originales, límites existentes conservados.
- Regreso circular compartido y controles compactos. El diagnóstico anterior de acciones conserva 67 controles sin alterar su comportamiento; ocho controles reemplazados se documentan como superseded en la auditoría. Revocación de invitaciones permanece accesible.

## Evidencia

- `npm test`: suite completa pasa, incluidos privacidad, datos sintéticos, invitaciones, reinicio, convivencia con historial, lecturas, accesibilidad semántica y contratos de acciones. No equivale a pruebas de percepción o dispositivos reales.
- `tests/session3-db.mjs`: categorías privadas, selección en servidor, revocación, terceros sin acceso, versionado, destinatario exclusivo, rechazo/recuperación, aplicación mensual una sola vez, preferencias de rosario reutilizadas y aislamiento de planes tras reinicio.
- `tests/session3-ui.mjs`: consulta conserva respuestas, guardado mensual, Todos parcial, recurrencia con inicio en siguiente mes, lista acotada, futuros privados, rechazo confirmado y Deshacer, preferencias guardadas y marcador de inicio directo.
- Tipado TypeScript y compilación de revisión pasan. Después de los últimos ajustes se repitieron las pruebas afectadas de sesión 3, onboarding, acciones y recorrido mensual.
- Navegador de revisión con datos sintéticos: escritorio y iframe de 390 px; guardado de revisión, preparación del mes, edición de frecuencia y fecha 1 de octubre. No se probaron Safari/iOS/Android reales ni CarPlay.
- Vista privada reutiliza el sitio autorizado. Datos de ejemplo se reinician al recargar. Su transporte simulado no acredita sincronización real; esta se prueba en PGlite y queda pendiente de verificación del despliegue.

## Pendientes antes del despliegue

1. Recuperar recursos de Figma B e integrar/contrastar rosario completo. La guía `control-browser` pide autorización antes de pasar al navegador cuando falla un conector suficiente; no se efectuó ese fallback sin autorización.
2. Completar comprobación visual de imagen propia y rosario con sus recursos definitivos; comprobar recorridos a 320/390/768 px y escritorio.
3. Validación de invitaciones con JWT/API real en CI, migraciones de producción bajo mantenimiento y verificación de filas, versión y bundle publicado.
4. Actualizar número de versión y nota de lanzamiento al cerrar estos puntos. Esta rama no se anuncia como una publicación terminada.

CarPlay y push nativo quedan fuera de esta entrega; no se simula soporte. El inventario de oraciones completo conserva su pendiente editorial explícito y no se presenta como resuelto.

## Ajuste de revisión móvil — 27 septiembre, segunda iteración

- Títulos de compromisos destacados, frecuencia y avance secundarios; sumar y deshacer pasan a iconos con nombre accesible y área de 44 px. Se conserva el comportamiento de registro. Cabecera diaria más compacta.
- Navegación de Pareja mantiene palabras completas y distribuye opciones en filas sin comprimir cada palabra. Comprobado sin desbordamiento a 320 px.
- Invitaciones con espacio interior, título/remitente agrupados y acción independiente; acceso a rechazadas visualmente secundario.
- TypeScript, session3-ui, commitment-actions-ui y compilación de revisión satisfactorios. Navegador: incremento observado de 1 a 2; etiquetas íntegras y controles de 44 px en Pareja; recorrido de invitaciones en 390 px. No equivale a prueba en iPhone real.
- El usuario autorizó recuperación de Figma por navegador; tanto el enlace design como el enlace file suministrado devuelven “Site Unavailable”. Se requiere exportación del recurso aprobado para continuar esa integración.
