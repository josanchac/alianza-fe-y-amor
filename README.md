# Alianza · Fe y Amor

Un espacio sencillo para cuidar el horario espiritual personal y las 4 Rs matrimoniales: rezar cada día, reencantarse cada semana, revisar cada mes y renovar cada año.

El árbol y el rosario son un emblema original; no representan una aplicación oficial de Schoenstatt.

## Estado de publicación

**Publicada:** [Abrir Alianza](https://josanchac.github.io/alianza-fe-y-amor/). GitHub Actions completó verificación y despliegue del commit `32e5d5b42775bfccafbfbd057fe54d8dcf244e61`. La pantalla de entrada fue comprobada en navegador.

Base de datos Supabase y dos cuentas configuradas. Verificación local: 15 grupos de pruebas. Verificación contra Auth y PostgreSQL alojados: 8 grupos de integración con cuentas temporales, luego eliminadas. GitHub Pages está habilitado con GitHub Actions. Cada titular debe activar su enlace privado y elegir su contraseña; no se probaron ni se conocen sus contraseñas.

## Funciones

- Entrada individual con correo electrónico (el usuario) y contraseña de al menos 6 caracteres, sin símbolos ni mayúsculas obligatorios; activación por enlace privado y cambio de contraseña. La recuperación automática por correo está desactivada hasta configurar SMTP; el administrador puede emitir un nuevo enlace privado.
- Compromisos editables, señales cotidianas y una versión mínima para días difíciles.
- Registro diario: «Lo viví», «Me costó» y «No aplicaba».
- Propósito particular mensual y reflexión privada.
- Las 4 Rs con preguntas de apoyo, planificación e historia compartida.
- Resúmenes semanales, mensuales, anuales y de intervalos acumulados; comparación con el período anterior equivalente.
- Revisiones guardadas: agradecer, aprender y elegir el siguiente paso.
- Compartir horario y reflexiones mediante dos interruptores independientes, apagados inicialmente.
- Recordatorios mediante archivos de calendario. El usuario debe confirmar su importación; no hay notificaciones push propias.
- Exportación de registros personales y matrimoniales. No se exportan registros privados del otro usuario.

## Privacidad

GitHub contiene código público, no diarios ni contraseñas. Supabase Auth administra las contraseñas. Los registros viven en un esquema privado de PostgreSQL con RLS activado y sin permisos directos de lectura/escritura para clientes. La función de acceso comprueba identidad, correo confirmado y pertenencia en cada solicitud; nunca confía en metadatos que pueda editar el usuario.

Los permisos de compartir se evalúan en el servidor. Apagarlos bloquea nuevas consultas; las pantallas abiertas se actualizan al regresar o cada diez segundos. No se pueden retirar copias que alguien ya haya leído o guardado. El administrador de la base puede acceder a sus datos: no hay cifrado de extremo a extremo.

Solo persisten en el navegador los tokens de autenticación. Los registros se mantienen en memoria durante el uso y en la base de datos. No hay publicidad, analítica ni seguimiento añadido. Es necesario estar conectado para guardar.

## Desarrollo

Requiere Node.js 22.13 o posterior.

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run dev
```

La configuración pública está en `github/config.public.json`. Para sobrescribirla localmente, usar `github/config.local.json`, ignorado por Git:

```json
{"url":"https://PROJECT.supabase.co","publishableKey":"sb_publishable_REPLACE"}
```

Solo se admite una clave **publishable**. El compilador rechaza claves administrativas, secretas y claves antiguas JWT. El resultado público queda en `github-dist/`.

La configuración pública permite publicar sin secretos. Opcionalmente se puede sobrescribir con las variables de GitHub `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`. Nunca utilizar una clave `service_role`, una contraseña o un token administrativo como variable pública.

## Arquitectura y mantenimiento

- React, TypeScript y Vite; Radix UI para controles accesibles.
- GitHub Pages sirve la interfaz estática. Supabase proporciona Auth y PostgreSQL.
- `app/journal.tsx`: registro personal, matrimonio, ajustes y controles de compartir.
- `app/reports.tsx` y `lib/reports.ts`: historia, rangos y comparaciones.
- `github/main.tsx`: entrada, recuperación de cuenta y transporte de datos.
- `supabase/schema.sql`: esquema canónico y API con autorización y control de versiones.
- `tests/password-db.mjs`: PostgreSQL real en PGlite, con identidades simuladas en el límite de Auth.
- `docs/DEPLOYMENT.md`: activación y comprobaciones de producción pendientes.

Las actualizaciones se trabajan en ramas y se revisan antes de integrarlas en `main`. El flujo de GitHub Actions ejecuta las pruebas antes de publicar.

## Evidencia y límites

El diseño incorpora planes de acción, señales estables, reducción de dificultad y revisión del propio registro. Estos principios orientan la práctica; la app no ha sido validada en un ensayo y los recuentos no miden crecimiento espiritual.

- [Schoenstatt: horario espiritual](https://www.schoenstatt.org/es/vida/2015/10/agenvida-el-horario-espiritual-ahora-tambien-como-app/)
- [Las 4 Rs, Somos historia por hacer](https://reader.digitalbooks.pro/book/preview/20584/presentacion.xhtml)
- [National Cancer Institute: implementation intentions](https://cancercontrol.cancer.gov/brp/research/constructs/implementation-intentions)
- [BJ Fogg: facilitar la conducta](https://www.behaviormodel.org/ability)
- [Lally et al.: formación de hábitos](https://doi.org/10.1002/ejsp.674)
- [Nielsen Norman Group: heurísticas de usabilidad](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Supabase: autenticación por contraseña](https://supabase.com/docs/guides/auth/passwords)
- [Supabase: seguridad de funciones](https://supabase.com/docs/guides/database/functions)

Las pruebas locales cubren acceso anónimo, cuentas ajenas, privacidad, revocación, suplantación de propietario, escrituras simultáneas, validaciones y retiro de acceso. No sustituyen la prueba de entrega de correo ni las pruebas con cuentas reales en producción.
