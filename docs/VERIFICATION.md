# Verificación de la instalación

## Completado

- Proyecto Supabase en la organización autorizada, costo informado por el proveedor: USD 0/mes.
- Dos cuentas personales creadas mediante Auth Admin. La activación y elección de contraseña quedan a cargo de sus titulares.
- Cinco registros iniciales de la versión anterior conservados. No existían reflexiones ni encuentros registrados en la consulta de migración.
- 15 grupos de pruebas locales: privacidad, validación, permisos, versiones, calendario y resúmenes.
- 8 grupos de integración contra Supabase alojado: anonimato, contraseña incorrecta/correcta, cuenta ajena, persistencia, compartir/revocar, sincronización/conflictos, acceso directo y cierre de sesión.
- Las tres cuentas de prueba, sus permisos y sus registros se eliminaron al terminar. Los permisos de las cuentas reales quedaron restaurados.
- La función temporal de preparación quedó sustituida por una respuesta permanente HTTP 410, sin credenciales ni operaciones administrativas.
- Las tablas privadas tienen RLS y una política explícita de denegación. La API comprueba la pertenencia a la pareja en cada solicitud.

## Mejora de acceso — 9 de septiembre de 2026

- Mínimo de 6 caracteres confirmado contra Supabase alojado; no se requieren símbolos ni mayúsculas. Cinco caracteres fueron rechazados por el servidor.
- Probados acceso con contraseña corta, recuperación mediante enlace privado generado por Auth Admin, cambio a otra contraseña de 6 caracteres, rechazo del enlace reutilizado, rechazo de la contraseña anterior y acceso con la nueva.
- La cuenta temporal no recibió membresía ni acceso a los diarios; se eliminó al finalizar. No se modificaron las dos cuentas personales. La función de comprobación se desactivó tras las pruebas.
- Se repitieron y pasaron typecheck, las 15 pruebas locales y la compilación.
- Estas pruebas verifican el restablecimiento en Auth; **no verifican entrega de correo**. El envío automático sigue pendiente de configurar un proveedor SMTP y las URL autorizadas.

## Publicación y límites

- GitHub Pages quedó habilitado por el propietario. Los trabajos `verify` y `deploy` del flujo 34353453653 concluyeron correctamente. La interfaz publicada se comprobó en navegador; la entrada y sus recursos cargan sin errores de la aplicación.
- No se han consumido los enlaces privados de los titulares ni se conocen sus contraseñas. Las pruebas de integración usaron exclusivamente cuentas temporales.
- La recuperación automática por correo está desactivada en la interfaz hasta disponer de SMTP configurado y probado. El administrador puede generar un enlace privado nuevo mediante Auth Admin.
- El asesor de Supabase avisa que la detección de contraseñas filtradas está desactivada. Esa función requiere Pro o superior; se conserva el plan gratuito solicitado. [Explicación y configuración del proveedor](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- La interfaz pide al menos 6 caracteres al crear/cambiar contraseña, sin exigir símbolos ni mayúsculas, a petición del propietario. Muestra el correo de la sesión como usuario durante la elección de contraseña. Desactivar el registro de cuentas de Auth requiere ajustes administrativos adicionales; aun si un tercero crea una cuenta de Auth, la API de Alianza rechaza su acceso por no pertenecer a la tabla privada de miembros.
- El plan gratuito puede pausar proyectos por inactividad. [Condiciones operativas de Supabase](https://supabase.com/docs/guides/deployment/going-into-prod#availability).

No publicar contraseñas, enlaces de activación, claves administrativas ni exportaciones personales en GitHub.
