# Navegación de retorno — revisión posterior a alpha.3

Solicitud: Volver desaparece al desplazar Mis aportes al rosario. Producción alpha.3 no se modifica sin revisión visual.

Propuesta: cabecera compacta sticky con flecha y título, área táctil 44px, fondo opaco y respeto al área segura superior; z-index bajo los diálogos. No fijar logo/encabezados grandes. No crear otra barra inferior.

Primera muestra: Mis aportes al rosario, Misa y cabecera de cursos. Historial personal restaura scroll del origen. Muestra ficticia con 24 rosarios para probar longitud.

Inventario para completar tras validar el patrón:
- Historial de pareja: eliminar los dos retornos superpuestos y mantener destino inmediato.
- Mis reflexiones: integrar título/retorno preservando foco y scroll ya implementados.
- Mi camino, preparación de rosario, lectores de oraciones y revisión mensual: adaptar por pantalla, no fijar botones aislados sin contexto.
- Diálogos de rezo/letanías: ya tienen salida fuera del scroll; conservar diseño aprobado.

Sin cambios de datos, RPC, textos de oraciones ni permisos. Pruebas de destino y scroll automatizadas; geometría móvil real pendiente de revisión del propietario. Esta primera muestra no acredita una corrección integral de todas las vistas.

## Variante solicitada a las 20:55

El propietario elimina el título de la barra persistente. La muestra personal mantiene el título en el contenido, botón explícito «Volver» de 44px y árbol pequeño que aparece al salir la marca grande del área visible. Barra de altura estable, transición breve de opacidad/escala y movimiento reducido respetado. Pruebas de entrada/salida del estado compacto y navegación sin escrituras. Todavía no es regla desplegada en toda la app; se espera revisión de esta variante.
