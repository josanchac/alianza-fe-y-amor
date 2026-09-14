# 0.2.0-alpha.5 · rezo acompañado

## Necesidad y alcance

La experiencia real reportó letra y controles pequeños, salidas involuntarias, bloqueo de pantalla y un cierre desconectado del horario. Esta entrega concentra el rosario individual en una ventana dedicada con avance de 80 px de alto, letra de 20–32 px (24 por defecto), texto de oración opcional y botones secundarios separados. Mantiene colores y dibujo existentes con transiciones discretas que respetan movimiento reducido.

El toque exterior no cierra. Pausa y navegación Atrás piden confirmar; el paso confirmado permanece en el servidor. En la misma sesión del navegador se recuerda qué rosario retomar tras recarga. No se afirma funcionamiento sin conexión: una escritura fallida conserva el paso y requiere reintento. Los rosarios personales permanecen montados al ocultarse la pestaña; los datos compartidos siguen retirándose.

Screen Wake Lock se solicita solo durante rezo activo y letanías; se libera al salir, terminar o desactivarlo. Se solicita nuevamente al volver visible. El sistema puede denegarlo o liberarlo por batería: no se promete impedir todo bloqueo. Preferencias de letra y pantalla son locales al dispositivo.

## Oraciones y fuentes cotejadas el 14 de septiembre de 2026

- [Holy Rosary Parish, Evansville, Cómo rezar el Santo Rosario](https://www.hrparish.org/rosario), apartado 14: textos completos de las tres Avemarías con Hija de Dios Padre, Madre de Dios Hijo y Esposa de Dios Espíritu Santo.
- [Opus Dei, Devocionario móvil, Santo Rosario](https://opusdei.org/es/prayers/section/?section1=25&section2=35): corrobora las tres invocaciones breves. Son oraciones tradicionales, no textos atribuidos como creación del producto.
- [Santa Sede, Letanías de la Virgen](https://www.vatican.va/special/rosary/documents/litanie-lauretane_sp.html): invocaciones, respuestas y oración final; incluye Madre de la misericordia, Madre de la esperanza y Consuelo de los migrantes.
- [W3C, Screen Wake Lock](https://www.w3.org/TR/screen-wake-lock/): página visible, liberación y rechazo por condiciones del sistema.

La fuente parroquial coloca las tres invocaciones después de los misterios. El producto permite la variante en el bloque inicial existente por elección solicitada del propietario. Esto es una preferencia de recorrido, no una afirmación de que exista una única versión oficial de Costa Rica. El bloque de un Padre nuestro y tres Avemarías se puede incluir u omitir antes de comenzar; se conservan Cruz, Credo y Gloria. Las otras Avemarías no cambian. Se guarda la elección por rosario, bloqueada cuando empieza, y se conserva el protocolo de 69 posiciones de las sesiones antiguas. Omitir el bloque salta únicamente posiciones 2–5, sin generar aportes.

Las letanías aparecen como opción al terminar: no agregan rosarios ni alteran el compromiso ya registrado. La selección se hace con botones, sin párrafos de instrucción obligatorios.

## Datos y decisiones

- Descartar es una cancelación lógica de un rosario propio, individual e incompleto. Exige versión vigente, confirmación y no genera contribuciones. Cancelaciones compartidas conservan sus permisos existentes.
- Al finalizar se propone el compromiso de rosario de hoy, independientemente de la fecha consultada en el horario. La marcación automática requiere elección expresa, se recuerda por cuenta en ese dispositivo y solo actúa al completar un rosario en esa sesión; abrir un historial no marca nada.
- La operación verifica finalización y cinco contribuciones propias de hoy en Costa Rica. Si ya estaba marcado, no reescribe ni incrementa versión.
- “Añadir solo por hoy” usa una clave diaria estable, plan activo exclusivamente ese día y hábito no recurrente; repetir la llamada no agrega duplicados ni modifica otros compromisos.
- Tabla privada nueva para opciones, RLS sin acceso directo, funciones de autorización con search_path fijo, control de versiones/data epoch y mantenimiento en toda escritura. No se modifican los valores de filas anteriores al migrar.

## Verificación y publicación

Pruebas de interacción: tests/renewal-ui.mjs y tests/rosary-comfort-ui.mjs. Casos: los 69 pasos, error de red, toque exterior, Escape, descarte y fallo, letra, invocaciones, letanías, marcación explícita/automática y vida del bloqueo de pantalla.

Pruebas de datos: tests/renewal-db.mjs añade configuración privada, exclusión del bloque, versiones obsoletas, otra cuenta, descarte inválido, idempotencia y plan de un día. tests/auth-api.mjs repite el flujo con JWT y PostgREST reales en el entorno desechable. tests/release-upgrade.mjs ensaya checkpoint de alpha.4, migración alpha.5 y comparación exacta de todos los valores originales.

Fixture reproducible sin datos reales: compilar con npx vite build --config tests/rosary-vite.config.ts y servir /tmp/alianza-rosary-qa. La conexión del navegador remoto a localhost devolvió ERR_BLOCKED_BY_CLIENT, por lo que no se afirma una inspección visual completada ni pruebas físicas de iPhone. Queda pendiente validación en el teléfono del propietario; no se declara beta.

Publicación autorizada: mantener alpha.4 funcionando mientras pasan verificaciones; activar mantenimiento bajo bloqueo exclusivo, crear checkpoint privado reciente, migrar y verificar valores en la misma transacción, publicar y comprobar recursos alpha.5 antes de reabrir. Evidencia operativa final en el PR de entrega.
