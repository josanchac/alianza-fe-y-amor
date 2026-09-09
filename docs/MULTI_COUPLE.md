# Parejas independientes y continuidad

## Flujo del piloto

1. El propietario facilita los nombres y correos de las dos personas, indicando que forman pareja. Confirmar esos destinatarios antes de preparar o enviar invitaciones.
2. El administrador crea las cuentas mediante Auth Admin y una pareja independiente en `alianza_private.couples`. Cada cuenta se asigna a esa pareja en la tabla privada de miembros: asientos 1 y 2. No habilitar a una persona dentro de una pareja existente por coincidencia de nombre, correo o metadatos.
3. Cada persona recibe su propio enlace privado, elige contraseña y entra con su correo. La recuperación automática por correo sigue pendiente de un remitente separado y probado para Alianza; los enlaces se pueden entregar privadamente por el canal autorizado. Nunca publicar enlaces ni destinatarios en GitHub.
4. La app reconoce la pareja desde la sesión, sin códigos ni un selector que el usuario deba configurar. Cada persona empieza sin compromisos, notas o encuentros precargados. Puede elegir ideas o crear sus propios compromisos y agregar después su ideal y símbolo en Ajustes.
5. El horario y las reflexiones son privados inicialmente. Compartirlos habilita únicamente al cónyuge asignado. Las 4 Rs son el espacio compartido de esa pareja. Ninguna pareja puede consultar a otra.

La app admite el piloto; las cuentas de una segunda pareja real se habilitan cuando el propietario facilite sus datos. No hay autoservicio para crear o cambiar parejas. Un cambio de cónyuge requiere un procedimiento administrativo explícito que revise los permisos y la titularidad del historial; no basta con modificar `couple_id`.

## Autorización

La API determina la identidad mediante Auth y consulta la membresía privada en cada solicitud. Los registros personales conservan como propietario el UUID de su titular; los matrimoniales usan `couple:<UUID>`. Los clientes no pueden enviar ni cambiar esos propietarios. Cada cuenta pertenece a una pareja y cada pareja admite como máximo dos miembros. Todas las tablas privadas tienen RLS y deniegan acceso directo desde clientes.

Los interruptores de compartir se evalúan en el servidor y no cambian al actualizar la app. Desactivarlos bloquea nuevas consultas. Una vista ya abierta se refresca en segundos; no es posible retirar lo que alguien ya haya leído o copiado. Los administradores de la base mantienen acceso administrativo; no es cifrado de extremo a extremo.

## Actualización sin reiniciar las cuentas

La migración `20260909143538_multi_couple_isolation.sql` conserva los UUID de Auth, nombres, ideales, registros, claves, fechas y versiones. Asigna la pareja original y convierte únicamente el propietario lógico de los encuentros matrimoniales. Las solicitudes de la versión anterior siguen aceptándose, incluso desde una pestaña abierta. El control de versiones rechaza escrituras desactualizadas para evitar sobreescribir cambios recientes.

Antes de modificar las tablas, la transacción crea una copia privada en `alianza_backup.pre_multi_members` y `alianza_backup.pre_multi_records`, restaura los registros en una tabla temporal y compara el contenido. Al terminar verifica nuevamente la conservación; cualquier diferencia aborta la transacción. La copia no tiene permisos para clientes y nunca se exporta al repositorio.

Este respaldo está en el mismo proyecto de Supabase: sirve para revisar o revertir la migración, pero no sustituye una copia independiente ante la pérdida del proyecto. Una eventual restauración debe reconciliar las escrituras posteriores, conservándolas. No reemplazar todas las tablas con la copia antigua. Si se revierte solo la interfaz, mantener el nuevo esquema compatible.

## Acceso desde el teléfono

La guía `?guia=instalar` funciona sin sesión. Ofrece cuatro pasos manuales para Safari en iPhone y Chrome en Android, diagramas orientativos, ayuda si la opción no aparece y copia de la URL normal de Alianza sin tokens. También está en Ayuda, Ajustes y la entrada.

Guardar el acceso no activa notificaciones ni uso sin conexión. El teléfono puede pedir entrar de nuevo con el mismo correo y contraseña; los registros siguen asociados a la cuenta. La guía no detecta ni afirma que la instalación se haya completado.

- [Apple: guardar un sitio como app](https://support.apple.com/es-us/guide/iphone/iphea86e5236/ios)
- [Google: aplicaciones web en Android](https://support.google.com/chrome/answer/9658361?hl=es&co=GENIE.Platform%3DAndroid)
- [Supabase: seguridad por filas](https://supabase.com/docs/guides/database/postgres/row-level-security)
