# Backend aislado: estado verificado el 20 de septiembre de 2026

## Alcance y autorización

El propietario autorizó un backend independiente, sin datos reales ni servicios pagados, y confirmó Alianza App. Se creó `alianza-pruebas`, proyecto `xhfqcrmekfjclgazrvrm`, región `us-east-1`, con costo confirmado de $0/mes. El proyecto está activo. Producción `rvbyufrvqaslcveaowvr` no recibió cambios. No se enviaron mensajes ni invitaciones reales.

## Implementado

- Las 26 migraciones del repositorio están aplicadas en orden mediante el conector nativo.
- La cuarta migración histórica presupone dos miembros originales. Para esta instalación completamente vacía, `review/empty-backend-bootstrap.mjs` omite únicamente ese bloque de traslado cuando miembros, registros y usuarios Auth están vacíos. Conserva las restricciones para instalaciones con datos y rechaza cualquier otro proyecto. El archivo histórico permanece intacto.
- Hubo dos intentos fallidos de esa migración, ambos revertidos: precondición histórica de miembros y delimitador SQL alterado por sustitución JavaScript. Se corrigió usando una función de reemplazo; después la migración y las siguientes finalizaron correctamente.
- La configuración pública, sin credenciales, está en `review/backend.json`.

El conector asignó timestamps nuevos al registro remoto, desde `20260920030503` hasta `20260920031025`. Los nombres conservan la referencia local, excepto `multi_couple_isolation_empty_bootstrap`. No ejecutar `supabase db push` suponiendo que los timestamps locales y remotos coinciden: cotejar y reconciliar el historial antes de utilizar ese flujo.

## Verificado contra PostgreSQL remoto

`review/backend-smoke.sql` pasó usando dos identidades sintéticas dentro de una transacción revertida:

- Solicitud de símbolo de rayo: creación, visibilidad administrativa, cambio de estado y visibilidad del cambio por su autor.
- Usuario normal sin permiso de listar solicitudes administrativas ni invitaciones del piloto.
- Solicitud de pareja: sin vínculo antes de aceptar; vínculo tras aceptación; datos privados del compañero no compartidos por defecto.
- Operador de invitaciones: creación, repetición idempotente y cancelación.

Esto prueba SQL, roles y funciones RPC. No prueba inicio de sesión HTTP, entrega de correo, generación de enlaces Auth ni recorrido del navegador. Las identidades se configuraron como contexto de autorización SQL, sin suplantar sesiones reales.

Cotejo posterior: `auth.users=0`, `members=0`, `records=0`, `pilot_invitations=0`. Las 38 tablas de `alianza_private` tienen RLS habilitada y no conceden SELECT directo a `anon` ni `authenticated`. La validación local del transformador comprobó delimitadores, restricción de proyecto y detección de fuente modificada.

## Asesores y backlog

Los asesores devolvieron avisos INFO, sin WARN/ERROR:

- 13 tablas con [RLS sin políticas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). Son tablas privadas con acceso directo denegado y operaciones mediante funciones autorizadas. No agregar políticas permisivas para silenciar el aviso.
- 10 [claves foráneas sin índice de cobertura](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys). Pendiente evaluar consultas y crecimiento antes de proponer una migración.
- 3 [tablas sin clave primaria](https://supabase.com/docs/guides/database/database-linter?lint=0004_no_primary_key): dos respaldos históricos y `activity_config`. Pendiente revisión según uso real.
- 12 [índices sin uso](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index): esperable en entorno recién creado; no se eliminaron.

## Pendiente y no publicado

1. Conectar una entrada de revisión con Auth real al backend aislado, manteniendo la vista ficticia disponible y evitando cualquier referencia a producción.
2. Preparar función de invitaciones de prueba: el entrypoint actual contiene URL de retorno de producción y no debe desplegarse sin adaptación de entorno. No se ha desplegado ninguna Edge Function en este proyecto.
3. Probar ingreso, generación/copia/renovación/cancelación/aceptación de enlace extremo a extremo desde el navegador con cuentas ficticias, sin correo real.
4. Completar recorridos integrados de administración, pareja y grupos, accesibilidad y Safari real. Las pruebas SQL no sustituyen estas verificaciones ni pruebas con personas.
5. Resolver el control documental pendiente de Misa y los requisitos de contenido/calendario ya registrados.

Solo el backend aislado fue creado remotamente. No se publicó la app del piloto, no se modificó main y no se subió esta rama a GitHub durante esta tarea.
