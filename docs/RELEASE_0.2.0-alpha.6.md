# 0.2.0-alpha.6 · vinculación por solicitud

## Alcance y decisiones

La invitación deja de depender de copiar inmediatamente un código. El emisor revisa el correo completo, reconoce el nombre si su titular autorizó mostrarlo y consiente antes de enviar. Sin nombre visible puede enviar al correo revisado; no se revela si la cuenta existe. La preferencia “Cómo me reconoce mi pareja” está disponible en Mi espacio, apagada por defecto, con nombre elegido y control de versión. No hay búsqueda parcial ni directorio público; se limita la consulta a 20 búsquedas por cuenta/día, conservando solo un contador, nunca el historial de correos.

La persona destinataria ve una solicitud discreta desde cualquier espacio sin habilitar pareja previamente. No se abre ningún diálogo automáticamente ni se interrumpe un rosario. El nombre y correo del emisor se muestran para reconocerlo. Aceptar exige consentimiento expreso y cuenta autenticada con el correo confirmado de destino. Abrir el enlace no concede acceso ni acepta la solicitud.

La solicitud pendiente se recupera al entrar de nuevo y conserva un enlace hasta vencer, ser rechazada o cancelada. Reenviar la misma solicitud activa no crea otra ni invalida su enlace. Cambiar destinatario requiere cancelar expresamente la anterior. El vínculo se genera una sola vez y habilita pareja para ambos conservando los otros espacios y su inicio preferido. Horario, reflexiones e ideal personal permanecen privados; 4 Rs e ideal matrimonial son compartidos por el consentimiento de ambos. Los códigos previamente emitidos continúan operativos.

Los avisos son internos, actualizados mediante la consulta periódica existente y al volver a la aplicación. No se implementa correo ni notificación push. No se envían invitaciones reales durante las pruebas. Es una regla de producto solicitada, no doctrina, evaluación espiritual ni aval institucional. No cambia ninguna guía de oración ni contenido formativo.

## Verificación

- tests/pairing-requests-db.mjs: opt-in, correo exacto, no enumeración de cuentas no visibles, control de identidad, doble aceptación, reinicio de datos, enlace estable, vencimiento, rechazo, cancelación, límites y tablas privadas.
- tests/pairing-requests-ui.mjs: aviso sin interrupción, consentimiento, respuesta tardía descartada al cambiar correo, copia fallida, enlace recuperable, cancelación confirmada y cuenta individual sin pareja habilitada.
- tests/pairing-ui.mjs y tests/pairing-db.mjs: compatibilidad de códigos, historial y permisos.
- tests/auth-api.mjs: mismas operaciones con JWT y PostgREST reales en infraestructura desechable de CI.
- tests/release-upgrade.mjs: checkpoint de alpha.5 y conservación exacta de datos al aplicar la migración aditiva.

Se conservan los componentes de ventanas corregidos; no se introducen traslaciones negativas. No se declara prueba física de iPhone ni estudio con participantes reales. Sigue en alfa. No cambia el alcance del piloto.

Publicación: verificar local y CI; activar mantenimiento; crear checkpoint privado; migrar y cotejar valores en la misma transacción; publicar y verificar recursos y versión antes de reabrir.
