# Control previo a publicación

Se comprobó la versión de revisión `1ddd2bf38ef0447478e736570ee2adeffb057953`: GitHub Actions 34703158058 terminó con éxito, incluidos PostgreSQL, Auth, API, recuperación y asesor de seguridad del entorno desechable.

En el piloto se creó una copia interna actualizada mediante la operación `private_release_checkpoint`. El SQL reproducible está en `scripts/operations/create-release-checkpoint.sql`. Copia todas las tablas de `alianza_private` y las definiciones de las funciones de aplicación; compara los registros bajo los mismos bloqueos antes de confirmar la transacción. Solo devuelve metadatos al comprobarla. No cambia registros de aplicación ni cuentas Auth.

Comprobación posterior: copia del 12 de septiembre de 2026 a las 15:53 UTC, 11 registros, 4 membresías, 2 parejas y 6 tablas. Comparación íntegra aprobada; lectura denegada a clientes y métricas. Se agregó una política explícita de denegación después del aviso informativo del asesor.

La copia queda en el esquema privado `alianza_backup`, con RLS y sin lectura para clientes o administradores de métricas. No es una copia externa ni incluye el esquema Auth. No debe descargarse su contenido a GitHub ni mostrarse en herramientas o pantallas administrativas.

Para cerrar el respaldo externo falta verificar el mecanismo nativo del proyecto. El conector disponible no ofrece listado ni descarga de backups. La documentación oficial sitúa esa consulta en Database → Backups del panel: https://supabase.com/dashboard/project/_/database/backups/scheduled . Solicitar únicamente una captura de estado y fecha del respaldo; nunca claves ni contenido de usuarios. Fuente: https://supabase.com/docs/guides/platform/backups . Si el proyecto no tiene respaldos nativos, preparar una exportación privada con el acceso de conexión adecuado antes de migrar.

La comprobación visual móvil también sigue pendiente. El navegador del entorno rechazó la vista local de pruebas; no se intenta sortear esa restricción. Queda preparada la vista de datos ficticios en `tests/preview-frame.html`.

Orden posterior: confirmar recuperación externa, comprobar el recorrido móvil, aplicar solo migraciones pendientes, publicar la versión validada, comprobar acceso y persistencia, verificar la identidad de la cuenta objetivo y ejecutar el reinicio personal recuperable. El checkpoint interno no reemplaza ninguno de estos controles.
