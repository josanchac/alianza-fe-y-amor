# Activación y mantenimiento

Estado actual: consultar [VERIFICATION.md](VERIFICATION.md). La base y las dos cuentas ya están preparadas; no recrearlas.

No solicitar ni publicar las contraseñas de los usuarios. No incluir correos personales, tokens de invitación, diarios ni copias de bases en este repositorio.

1. Crear o seleccionar un proyecto Supabase gratuito autorizado. Verificar la cuota y las condiciones vigentes antes de crear recursos; no contratar servicios de pago automáticamente.
2. Para una instalación nueva usar el esquema canónico; para actualizar una base existente aplicar solo las migraciones pendientes, nunca recrear las tablas. Mantener `alianza_private` fuera de los esquemas expuestos. Ejecutar los asesores de seguridad; comprobar que solo `public.alianza_data` es la entrada pública y que `anon` no puede ejecutarla.
3. Configurar la URL del sitio y las redirecciones permitidas al origen exacto de GitHub Pages y su subcarpeta. Desactivar registros públicos y acceso anónimo. Establecer una longitud mínima de contraseña de 6 caracteres, sin clases obligatorias, según la preferencia del propietario.
4. Crear/invitar cada cuenta mediante Supabase Auth Admin. Para una pareja nueva, crear primero un UUID en `alianza_private.couples` y asignar los dos UUID de Auth a `alianza_private.members`, con ese mismo `couple_id` y asientos 1 y 2. Usar el rol genérico `member`; `jose` y `neca` se conservan solo por compatibilidad con las cuentas originales. Los nombres se preparan con los datos facilitados; el ideal puede quedar vacío y el símbolo predeterminado es `heart`. Consultar [MULTI_COUPLE.md](MULTI_COUPLE.md). No enrolar cuentas por metadatos editables ni modificar directamente tablas internas de Auth.
5. Comprobar la entrega de invitaciones y recuperación. El servicio SMTP predeterminado tiene restricciones: no dar por probada la entrega externa. Si necesita SMTP propio, configurarlo solo mediante un servicio autorizado. Usar enlaces privados de configuración cuando proceda; nunca registrarlos en GitHub.
6. Antes de sustituir una versión anterior, comprobar si existen registros y migrarlos de forma privada, identificando propietarios por su UUID y pareja. Conservar versiones e historia; evitar duplicar registros matrimoniales. No retirar la versión previa hasta verificar la migración.
7. Establecer `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` como variables de GitHub Actions. Son configuración pública; no admiten claves administrativas. En Settings → Pages elegir GitHub Actions.
8. Publicar mediante el flujo preparado. Confirmar el resultado de GitHub Actions y que la página publicada usa rutas relativas, carga recursos y muestra la entrada.
9. Con cuentas de prueba autorizadas, verificar entrada, contraseña incorrecta, recuperación, cierre, persistencia, acceso denegado a terceros, compartir y revocar desde dos sesiones. Repetir las pruebas con interfaz móvil. Eliminar los datos de prueba sin afectar datos reales.
10. Marcar la publicación como operativa en README solo después de completar las comprobaciones.

Los resultados locales se documentan como locales. No afirmar que las cuentas, los correos o la sincronización funcionan en producción antes de comprobarlo.
