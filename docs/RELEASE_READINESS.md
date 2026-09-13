# Publicación de la nueva experiencia · 13/9/2026

**Publicada.** La [PR 1](https://github.com/josanchac/alianza-fe-y-amor/pull/1) se integró como `c515e917b7da43232940a5ebf3852fe977305eb0`. La [ejecución 34731324548](https://github.com/josanchac/alianza-fe-y-amor/actions/runs/34731324548) aprobó pruebas, TypeScript, cotejo documental, compilación y publicación de GitHub Pages.

Aplicación: https://josanchac.github.io/alianza-fe-y-amor/

Comprobación HTTP posterior: página, JavaScript `index-DE5Xb9kf.js` y CSS `index-BU300EB6.css` respondieron 200. El JavaScript publicado contiene `journey-2026-09`. Esto verifica entrega de recursos, no sustituye una prueba visual ni una sesión del usuario.

## Base de datos y conservación

Se renovó el checkpoint privado con `20260913014430_refresh_private_release_checkpoint`. Luego se aplicó `20260913014437_guided_journey_reviewed_release`, que reúne, en este orden, las cinco migraciones revisadas:

- `20260912041345_guided_schedule.sql`
- `20260912132546_bilateral_pairing.sql`
- `20260912141154_personal_symbols.sql`
- `20260912142635_commitment_reviews.sql`
- `20260912153148_recoverable_personal_reset.sql`

Se conservaron las sentencias originales, retirando sus BEGIN/COMMIT exteriores para ejecutarlas en una sola transacción. Se usaron límites de espera y ejecución, bloqueos y una comparación de todos los registros originales antes de confirmar. La comparación posterior con el checkpoint devolvió cero registros originales alterados. Permanecieron cuatro miembros y dos parejas; los once registros originales pasaron a catorce por las tres filas iniciales de historial de compromisos.

Las entradas públicas siguen usando seguridad del invocador. Los clientes no pueden ejecutar las funciones anteriores al reinicio ni la operación privada de reinicio; tampoco consultar sus copias. Los RPC de datos y vínculo rechazaron peticiones anónimas por HTTP con 401.

## Reinicio individual

Tras la publicación se verificó la identidad objetivo con UUID, nombre, rol, correo confirmado y versión. El reinicio autorizado se completó a las 01:47 UTC: cuatro registros propios respaldados, versión del espacio de 1 a 2. La transacción comparó íntegramente la copia propia, registros ajenos, identidades, parejas y la cuenta Auth; fallaría si hubiera un cambio no previsto. La cuenta objetivo quedó sin registros personales y lista para el primer comienzo al volver a entrar. El acceso, el vínculo y los datos matrimoniales permanecen. No se publican identificadores personales ni contenido espiritual. Detalle operativo en PERSONAL_RESET.md.

## Evidencia previa

La [ejecución 34703652703](https://github.com/josanchac/alianza-fe-y-amor/actions/runs/34703652703), correspondiente a `a85fc628ddf58c7cc5d0a781af2abd7ad6da1efb`, aprobó la suite, concurrencia PostgreSQL, restauración sintética y Auth/API reales en un entorno desechable. Incluye aislamiento, consentimiento bilateral, revocación, notas privadas, renovación de sesión y bloqueo de escrituras anteriores al reinicio. Sus artefactos contienen solo resultados sintéticos.

El propietario completó un respaldo local cifrado de PostgreSQL: el archivo fue leído con pg_restore y el descifrado coincidió con el original mediante SHA-256. No se exportaron datos reales a GitHub ni se solicitó la contraseña al asistente. Esa comprobación no equivale a restaurar el respaldo real en una base nueva; el ensayo completo realizado fue con datos sintéticos. El dump tampoco equivale a clonar todos los servicios y archivos de Supabase.

## Límites y seguimiento

- Prueba visual en celulares pendiente. El navegador del entorno había rechazado la vista local y no se eludió esa restricción. Verificar recorrido, legibilidad, teclado, foco y controles táctiles con los usuarios.
- La comprobación de Auth/API con sesiones reales fue en Supabase desechable. En producción se comprobaron permisos y rechazo anónimo; la navegación autenticada completa queda para los usuarios.
- Cotejo documental de las guías breves cerrado dentro de su alcance; ver DOCUMENTARY_VERIFICATION.md. La revisión pastoral y Dropbox siguen diferidos por decisión del propietario. No se anuncia aprobación oficial ni certificación espiritual.
- El asesor gestionado posterior a la migración no devolvió errores. Informó [protección de contraseñas filtradas desactivada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) y [RLS sin política](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) en la tabla privada de copias de reinicio. Esta tabla tiene RLS activo y carece de permisos para clientes y métricas; su denegación por defecto fue verificada. No se cambió el plan del proyecto.
- El bloque JavaScript conserva una advertencia de tamaño; falta medir el impacto en teléfonos representativos. No se afirma certificación WCAG o ASVS.
- Quedan fuera el curso pago, generación automática de ideales, estados formativos persistentes y recomendaciones automáticas de hábitos. Se ofrece una invitación voluntaria a explorar otra práctica.
