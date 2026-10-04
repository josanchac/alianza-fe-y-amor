# Bloque 1: comprobación de privacidad y recuperación · 04/10/2026

Evidencia de #15 y #17 del plan único #13. No es un backlog paralelo ni certificación.
Revisión de código en main `6f056e7` y rama del PR #35, más consultas de metadatos
de producción. No se leyeron diarios, reflexiones, miembros, correos ni payloads
de copias; no se exportaron datos reales ni se modificó producción.

## Hallazgos comprobados

| Control | Evidencia | Límite |
| --- | --- | --- |
| Acceso directo | Las 43 tablas de alianza_private/alianza_backup tienen RLS. Ninguna concede SELECT/INSERT/UPDATE/DELETE a anon o authenticated. | No demuestra por sí solo que todos los RPC y casos de compartición sean correctos. |
| Rol de métricas | Sus SELECT se limitan en esos esquemas a activity_config/days, admin_members, pilot_consent/days y product_consent/days. Sin SELECT en records ni en copias. | El propietario de infraestructura mantiene acceso privilegiado. No hay cifrado de extremo a extremo. |
| Copias internas | 14 release_checkpoints, todos con verified=true; último 2026-09-28 01:52:19 UTC. | Es una marca histórica de verificación; no una restauración ejecutada hoy. Viven en la misma base y no cubren una pérdida total del proyecto. |
| Storage | Cero buckets y cero objetos observados. | No implica que no haya archivos/imágenes dentro de registros. Repetir inventario antes de activar respaldos. |
| Proyectos | Producción activa; proyecto de pruebas inactivo. | No se reactivó ni cambió de plan. |
| CI anterior | Runs 37220836373 y 37220836455 de 3ab81b7 aprobados. | Restauración de datos sintéticos en PostgreSQL, no circuito OneDrive ni restauración operativa de producción. |

Consultas reproducibles sin valores privados:

```sql
select count(*) as tables_checked,
 count(*) filter (where not c.relrowsecurity) as tables_without_rls,
 count(*) filter (where
  has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE') or
  has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE'))
  as directly_accessible_tables
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where c.relkind='r' and n.nspname in ('alianza_private','alianza_backup');

select count(*) as checkpoint_count,max(captured_at) as latest_checkpoint_at,
 count(*) filter (where verified) as verified_count
from alianza_backup.release_checkpoints;

select (select count(*) from storage.buckets) as buckets,
       (select count(*) from storage.objects) as objects;
```

## Privacidad: tratamiento y mensajes que deben conciliarse

| Área | Implementación revisada | Acción mínima pendiente en #17 |
| --- | --- | --- |
| Registros personales | Acceso mediado por funciones y permisos; admin de app distinto del dueño de infraestructura. | Documentar finalidades y conservación por categoría en un aviso completo; no confundirlo con consentimiento de métricas. |
| Medición general | Activación voluntaria, eventos enumerados, umbral de cinco personas; revocar elimina product_days del usuario. | Conservar esta elección y explicar los límites de identificación interna. |
| Piloto | Cohorte antigua automática; nuevas invitaciones permiten elección. Se registra pilot-privacy-v1 y accepted_at. UI advierte inferencias en grupos pequeños. | Verificar correspondencia de acuerdos históricos y política actual sin publicar identidades. No cambiar silenciosamente el acuerdo de la cohorte. |
| Retención técnica | product_days y pilot_days eliminan días anteriores a today-89 al invocar sus RPC. | La eliminación depende de actividad: no equivale a una purga garantizada al día 90. Definir ejecución y evidencia antes de prometer un plazo estricto. |
| Borradores nuevos | Memoria de Journal por mes, cuenta y dataEpoch; sin persistencia de textos en navegador. | Explicar su límite de recuperación; no presentarlos como respaldo. |
| Respaldos futuros | OneDrive aún no acreditado como destino operativo. | Incorporar proveedor, acceso, retención y efecto de borrado/restauración cuando se habilite. |

`docs/admin-privacy.md` describe el primer límite de administración, no todo el
tratamiento actual. Fuentes: `github/admin.tsx`, `github/main.tsx`, migraciones
`20260913052746_aggregate_product_metrics.sql` y `20260918054033_pilot_invitations.sql`.
Esta revisión no ha contrastado los avisos vistos por cada participante histórico.

Preguntas concretas para una eventual revisión jurídica, sin conclusión normativa:
alcance de los datos religiosos sensibles y su consentimiento; roles del titular
del proyecto y proveedores; condiciones de transferencia/almacenamiento; conservación
y atención de solicitudes; efecto de copias en un borrado y cómo documentar su ejecución.

## Respaldo: cobertura y puesta en marcha aún pendiente

Destino decidido: OneDrive empresarial existente de Tamarindo Tree. Ejecutor
propuesto: GitHub Actions; costo y cuota aún no verificados. No se agregaron
credenciales, automatizaciones, suscripciones ni permisos.

| Elemento | Cobertura necesaria |
| --- | --- |
| Datos privados | Todas las tablas, incluidos registros y metadatos de pareja/curso; solo en exportación cifrada autorizada. |
| Auth | Usuarios y referencias que necesita la restauración; proceso compatible con Supabase y versiones. |
| Estructura | Esquema, funciones, roles, permisos, migraciones y versiones de extensiones. |
| Configuración | Auth, URLs, SMTP, Edge Functions y referencias a secretos custodiados aparte; un dump de DB no los reconstruye todos. |
| Archivos | Objetos Storage si aparecen; archivos incrustados en datos ya pertenecen al conjunto privado. |
| Borrado/revocación | Procedimiento para reaplicar decisiones posteriores a la fecha de la copia antes de abrir la restauración a usuarios. |

**Preparación revisable del circuito:**
1. Verificar destino, cuota y permisos mínimos de OneDrive; configurar acceso por
   canal seguro y clave pública de cifrado. Custodiar clave privada fuera de copias/CI.
2. Verificar método de exportación Supabase, acceso DB, versiones y cuota de Actions.
   No se considera suficiente un pg_dump genérico por contener objetos internos.
3. Ejecutar con datos sintéticos: exportar → cifrar → subir → descargar → verificar
   hash → descifrar → restaurar aislado → comprobar cobertura y permisos. No usar
   datos reales del piloto en pruebas ni subir dumps a artifacts/logs.
4. Solo después activar copia diaria y previa a entregas. Identificador por ejecución,
   confirmación remota, retención de siete diarias y cuatro semanales. Nunca purgar
   la última copia válida por fallo de exportación, red, autenticación o cuota.
5. Añadir detección de trabajos fallidos y ausentes con evidencia de la última copia
   recuperable; una notificación de error del propio job no detecta que no corrió.
6. Medir restauración, registrar manifiesto sin contenido/secretos y practicar
   recuperación de permisos, Auth y decisiones de borrado antes de reabrir servicio.

**Bloqueo concreto:** este entorno no dispone de una conexión de OneDrive ni de
credenciales de exportación DB o clave de recuperación configuradas. No se pudo
verificar destino/cuota ni ejecutar el circuito de nube. Los secretos de Actions
no son inspeccionables con las herramientas disponibles; no se afirma que no existan.
La conexión SQL de metadatos disponible no reemplaza una exportación recuperable.

Referencias oficiales consultadas para delimitar cobertura:
- https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
- https://supabase.com/docs/guides/self-hosting/restore-from-platform

La documentación advierte de diferencias de versiones/roles internos y elementos
externos a la base. El procedimiento final debe ajustarse al destino real y probarse.
No se establece un RPO/RTO garantizado ni se declara listo el requisito de publicación.
