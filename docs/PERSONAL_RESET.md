# Reinicio personal recuperable

Implementado para revisión y pruebas sintéticas. No ejecutado sobre ninguna cuenta del piloto.

La operación privada `alianza_private.reset_personal_records(uuid,email,epoch,backup?)` requiere privilegios de operador; no existe un botón administrativo ni un RPC público de reinicio. Verifica UUID, correo confirmado y versión actual antes de modificar nada. Los administradores de actividad no pueden leer las copias.

En una transacción guarda una copia de los registros propios, los retira y aumenta `data_epoch`. Conserva Auth, identidad, membresía, vínculo, historia matrimonial y registros de otras personas. Al volver a entrar se crea el perfil mínimo y se ofrece elegir un comienzo. No significa borrar el matrimonio ni sus 4 Rs compartidas.

Todas las escrituras de datos y vinculación verifican la versión del espacio. Clientes antiguos sin versión funcionan solo antes del primer reinicio; después reciben conflicto. La interfaz conserva la versión de su carga inicial y, al detectar un cambio, retira los formularios y pide recargar. No convierte borradores antiguos en nuevos silenciosamente.

Para recuperar se suministra el identificador de copia, perteneciente al mismo usuario, junto con la versión actual. Primero se respalda el trabajo posterior al reinicio, luego se restaura lo anterior y se aumenta otra vez la versión. Compartir permanece apagado; recuperarlo exige una decisión del usuario. El trigger existente puede normalizar compromisos históricos que no tenían frecuencia, agregando su valor diario de compatibilidad; el JSON original permanece en la copia privada.

Antes de la ejecución real: identificar la cuenta mediante metadatos, comprobar respaldo independiente recuperable del piloto y desplegar conjuntamente la migración y la interfaz revisadas. No extraer contenido espiritual a registros de herramientas ni a GitHub. Registrar únicamente identificador de operación, resultado y conteos. Una copia dentro de la misma base permite deshacer este reinicio, pero no sustituye el respaldo independiente ante pérdida de la base.

Pruebas: `tests/personal-reset.mjs` (alcance, recuperación, permisos, versiones), `tests/reset-ui.mjs` (pantalla antigua y nuevo comienzo), `tests/postgres-concurrency.mjs` (guardado/reinicio en ambos órdenes con conexiones reales) y `tests/auth-api.mjs` (JWT real previo al reinicio). Evidencia de CI vinculada en RELEASE_READINESS.
