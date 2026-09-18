# Invitaciones individuales — implementación local

Estado: no publicada. No se han enviado correos ni modificado cuentas reales.

## Alcance

El administrador puede listar correo/estado, invitar, renovar y cancelar una invitación pendiente. El envío requiere confirmar el destinatario. No recibe enlaces de sesión ni contraseñas. Las cuentas activadas usan recuperación por su titular. No hay eliminación ni asignación administrativa de pareja.

La entrada crea un espacio individual; conserva la vinculación voluntaria existente. Las cuentas e historiales anteriores no se recrean. Las personas incorporadas mediante este flujo eligen métricas opcionales, desmarcadas por defecto y revocables; el piloto anterior mantiene su acuerdo existente.

## Seguridad y límites

- Edge valida identidad y rol; SQL vuelve a comprobar permisos. Operaciones administrativas reservadas a service_role; tablas privadas con RLS.
- Cada solicitud tiene identificador idempotente, versión y límite de frecuencia. Un resultado incierto no dispara un segundo correo automáticamente.
- La prueba de activación se guarda como SHA-256, vence en 24 horas y rota al renovar. Cancelar/renovar invalida el acceso a **Alianza**, incluso con una sesión Auth obtenida del enlace anterior. No equivale a revocar globalmente todos los tokens de Supabase Auth.
- El acceso a datos, pareja, comunidad y métricas se bloquea en servidor para invitaciones gestionadas pendientes/canceladas. La aceptación comprueba correo confirmado y prueba; la contraseña se configura en el flujo de interfaz, no es una garantía independiente de la RPC.
- La entrega se presenta como solicitada, fallida o desconocida, nunca como correo recibido. No se dispone de webhooks de entrega.
- Usuarios ajenos a este flujo siguen sujetos al sistema previo de membresía; deshabilitar registros públicos y no crear miembros por vías alternativas durante el piloto.

## Requisitos antes de activar

1. Confirmar con el propietario remitente y SMTP de Supabase Auth. No se ha contratado ni configurado proveedor nuevo. Mantener `ALIANZA_INVITATION_MAIL_READY=false` hasta completar todas las comprobaciones.
2. Ensayar en un proyecto de prueba con cuentas desechables: destinatario nuevo, invitado previo sin confirmar, confirmado sin terminar, expiración, cancelación, reenvío, apertura doble, correo distinto y concurrencia real. Las pruebas locales PGlite y mocks no sustituyen Auth/SMTP/PostgREST.
3. Configurar `ALIANZA_APP_URL` con la URL HTTPS exacta de la aplicación y sin query/fragmento. Autorizar exclusivamente el destino correspondiente en Auth. Verificar que se conserva el fragmento de activación.
4. Plantillas personalizadas de **Invite user** y **Reset password** deben usar `RedirectTo` y `TokenHash`, no `ConfirmationURL`, para no perder la prueba. Para invitaciones gestionadas, el destino ya contiene `#pilot_invite=…&invite_proof=…`; añadir `&token_hash={{ .TokenHash }}&type=invite` o `&token_hash={{ .TokenHash }}&type=recovery`. La recuperación ordinaria sin ese fragmento debe conservar su propia plantilla/rama con `#token_hash=…&type=recovery`. Probar ambas ramas: no pegar una plantilla única que rompa recuperación normal. Escapar atributos HTML, sin seguimiento de enlaces.
5. Verificar TTL nativo de Auth y documentar que el plazo efectivo es el menor entre Auth y las 24 horas de Alianza. Comprobar políticas antiabuso y límites SMTP del proveedor.
6. Aplicar migración `20260918054033_pilot_invitations.sql` con mantenimiento y checkpoint privado siguiendo el procedimiento existente. No usar reset, eliminación de cuentas ni migraciones históricas modificadas.
7. Desplegar `pilot-invitations` con autenticación de JWT activa. Secrets servidor: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALIANZA_APP_URL`, `ALIANZA_INVITATION_MAIL_READY`. Nunca claves privilegiadas en frontend/repositorio/chat. Comprobar compatibilidad del verificador de JWT del proyecto antes del despliegue.
8. Habilitar `invitationManagementEnabled: true` en configuración pública solo tras backend, correo y pruebas de extremo a extremo. Por defecto, al faltar la propiedad, está apagado.
9. Probar en móvil y escritorio: admin, activación, recuperación, cerrar sesión/cambiar cuenta, métricas opcionales, espacio individual y solicitud de pareja aceptada por ambas personas. Revisar que logs/analytics no reciban fragmentos/tokens/correos.

No hay push, despliegue, correo real ni renovación de una persona concreta incluidos en esta implementación local.

## Verificación documental

Estos cambios son controles de producto y privacidad, no contenido doctrinal. Se revisaron las nuevas etiquetas, el aviso de métricas y el mantenimiento del espacio individual; no se modificaron oraciones, guías ni atribuciones pastorales. La actualización del manifiesto documental refleja únicamente este alcance.
