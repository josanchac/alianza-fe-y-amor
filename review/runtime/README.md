# Prueba integrada local

Ejecutar `npm run review:runtime` desde la raíz. Abre el Journal real con estilos de producción y registros ficticios en memoria. No incluye credenciales ni transporte a Supabase. La navegación a Misa usa su implementación real, con biblioteca vacía.

Las mutaciones ordinarias de registros se simulan para probar edición y conteo. No se simulan operaciones de administración, pareja o grupos; no usar este entorno para afirmar que se validó su backend. Recargar restablece los datos de ejemplo. La versión compilada se genera con `npm run build:review-runtime`.

No publicar esta vista como aplicación del piloto ni confundir sus datos con datos reales.

## Vista privada autorizada

El propietario autorizó alojar una prueba separada el 20/09/2026. Disponible en https://alianza-revision-integral.josanchac.chatgpt.site (acceso privado del propietario). Sites confirmó despliegue exitoso; esto no certifica revisión visual ni pruebas humanas.

Exportación estática aislada en `/workspace/alianza-private-review-site`, con su propio repositorio de Sites. Identidad persistida en ese checkout: `appgprj_6aaf3a818cec8191b77e39447dce4281`. Reutilizar ese sitio para futuras actualizaciones; no crear otro. La app del piloto, main y Supabase no fueron modificados por este alojamiento. La política CSP de la vista bloquea conexiones de datos y formularios externos; recargar restablece los ejemplos. Se copiaron los tres recursos públicos de marca necesarios.

Ajuste aprobado: todos los compromisos usan checkbox; Agregar otro aparece solo tras el primer registro del día cuando unit=times. Deshacer último y desmarcar quitan un registro; con varios registros la marca permanece hasta quitar el último. Pruebas rhythm-ui, approved-experience, action-protocol, tipado y compilación de prueba aprobadas. Sin cambios de esquema ni producción.
