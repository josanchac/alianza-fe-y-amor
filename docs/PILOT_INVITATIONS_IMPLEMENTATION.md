# Invitaciones individuales con enlace manual

Implementación autorizada para el piloto: crear, copiar, renovar y cancelar desde el módulo de administrador, sin depender de SMTP. No se generan enlaces para cuentas ya activadas. No hay eliminación ni asignación administrativa de pareja.

## Flujo

El administrador confirma el correo, genera el enlace y lo copia para compartirlo directamente con la persona. El enlace se muestra únicamente en la respuesta y en memoria de esa pantalla; al salir, debe renovarlo para obtener otro. La persona configura su contraseña y entra a su espacio individual. Vincularse como pareja sigue siendo voluntario y bilateral.

## Seguridad y límites

- Auth verifica la sesión; Edge y SQL comprueban el rol de administrador. La clave privilegiada permanece exclusivamente en servidor. Tablas privadas con RLS y permisos restringidos.
- Se usa `POST /auth/v1/admin/generate_link`, nunca `/invite` ni `/recover`. El resultado contiene solo el enlace necesario, correo y estado; no contraseñas ni claves. Referencia: https://supabase.com/docs/reference/javascript/auth-admin-generatelink
- El enlace es una credencial privada: quien lo tenga puede activar la cuenta. Compartirlo manualmente no verifica la propiedad del correo. Se comunica explícitamente en la interfaz.
- Cada solicitud tiene identificador idempotente, versión y límite de frecuencia. Un resultado incierto no genera otro enlace automáticamente; la misma solicitud no vuelve a exponer el enlace. El administrador puede renovar respetando el límite.
- La prueba de Alianza se guarda como SHA-256 y vence en 24 horas. El plazo efectivo también depende del vencimiento nativo de Auth, que puede ser menor. La interfaz distingue el límite de activación del plazo del enlace.
- Renovar/cancelar invalida la activación anterior en Alianza, incluso con una sesión Auth previa. No equivale a revocación global de todos los tokens nativos de Auth. Una comprobación transaccional final impide entregar un enlace que perdió una carrera con cancelación, renovación o aceptación.
- La entrada requiere identidad Auth confirmada y la prueba vigente. Configurar contraseña es parte de la interfaz, no una garantía independiente de la RPC. No se exponen enlaces para cuentas ya aceptadas.
- Las cuentas, contenido y parejas existentes se conservan. Las personas nuevas eligen métricas opcionales, desmarcadas por defecto; el piloto anterior mantiene su acuerdo.

## Publicación y comprobación

Aplicar ambas migraciones de invitaciones con mantenimiento, checkpoint privado y comparación exacta de los registros anteriores. Desplegar `pilot-invitations` usando los secrets estándar `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. El destino HTTPS está fijado al sitio publicado. No requiere plantillas, secretos SMTP ni remitente.

La función implementa autenticación propia mediante `/auth/v1/user` y autorización por RPC antes de procesar solicitudes. El verificador JWT de gateway puede deshabilitarse para admitir las claves de firma del proyecto sin omitir estas comprobaciones.

Habilitar el panel después de comprobar migraciones, permisos, despliegue y respuesta denegada sin sesión. Las pruebas automatizadas cubren UI/copia, permisos, conservación de datos, renovación, cancelación, concurrencia lógica, reintento y fallos ambiguos. No sustituyen una activación real de punta a punta en un dispositivo; esa comprobación debe distinguirse de las verificaciones locales y del despliegue. No se renuevan cuentas reales para probar.

La recuperación de cuentas ya activadas por correo sigue deshabilitada y no forma parte de este cambio.

## Verificación documental

Son controles de producto y privacidad. Se revisaron las etiquetas, límites y avisos; no cambian oraciones, guías ni atribuciones pastorales. Se conserva el espacio individual y el vínculo opcional.
