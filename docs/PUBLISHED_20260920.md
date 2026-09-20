# Publicación 20 septiembre 2026 — 0.3.0-alpha.1

## Resultado
Publicada y reabierta antes de las 10:00 Costa Rica: comprobación de assets 09:50:50; mantenimiento retirado alrededor de 09:51. URL: https://josanchac.github.io/alianza-fe-y-amor/

- Commit publicado: d424c4fb3603f90bfe235bd62c1cf70795cba78f.
- Árbol exacto probado y subido: 5a109a3ed1e81de91194d7fc8edddfd77247c041. Coincide con la rama local de revisión bb0a1c2.
- GitHub Actions 35520726106: verify, invitation-auth y deploy terminaron success. https://github.com/josanchac/alianza-fe-y-amor/actions/runs/35520726106
- Configuración pública y bundle coinciden en buildId 78bb59dde4881acbac760aeb5dea7165; asset index-B2NmdNsn.js contiene 0.3.0-alpha.1, transporte de lecturas, repeticiones y selector de espacios. Backend confirmado: proyecto de producción existente.
- Navegador Chromium observó el aviso de mantenimiento con nueva versión antes de reabrir. No se ingresó a cuentas privadas ni se afirmó QA de Safari.

## Preservación y acceso
Mantenimiento con bloqueo de escrituras; checkpoint privado verificado; migraciones daily_occurrences_alpha_030 y scheduled_commitment_courses_alpha_030 aplicadas. Comparación exacta de tablas anteriores pasó después de migrar y nuevamente al reabrir. No se exportaron filas privadas. Checkpoint permanece dentro de la base: no es un backup independiente de desastre ni de Auth.

Función mass-readings ACTIVE v1 desplegada en producción con verify_jwt=true y resolución adicional de usuario en Auth. Preflight 204 para origen GitHub y rechazo 401 sin sesión comprobados. Prueba completa Auth real→lecturas reales HTTP200 se realizó previamente en backend aislado; cuenta sintética eliminada. No se crearon usuarios de QA en producción.

Estado final de servicio: active=false, required_version=0.3.0-alpha.1. Clientes anteriores requieren actualizar; sus datos guardados se conservan. La vista privada v14 permanece separada y no es la URL del piloto publicado.

## Backlog posterior a publicación
Implementado y publicado: compromisos en una vista, indicador diario independiente, avance semanal/mensual y extras, cursos/novena, botones y lápices aprobados, espacios claros, guía de Misa y lecturas del calendario general.

Verificado: suite automática completa local y CI, Auth/invitaciones CI, tipado, cotejo documental del alcance, compilación, respuesta del servicio aislado y assets públicos, preservación de datos. Aprobación visual del propietario registrada por separado.

Pendiente: ordo Costa Rica, oraciones completas autorizadas, cotejo detallado de variantes especiales, revisión completa Safari/iPhone/lector de pantalla y pruebas con participantes. No equivalen a bloqueo del alcance general aceptado. Administración ampliada de suspensión/reactivación/salida, correo transaccional real y push conservan sus pendientes históricos; no se declaran implementados por esta publicación.

Advisor de producción: sin error de seguridad nuevo reportado; INFO RLS sin política corresponde a tablas privadas con permisos directos denegados (comprobados en checkpoint). WARN previo de protección contra contraseñas filtradas deshabilitada queda pendiente de configuración: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . No se ampliaron permisos para silenciar avisos.

Comprobación visual posterior a reapertura: Chromium mostró «Tu espacio de fe y amor», campos de correo/contraseña, Entrar y enlace de instalación; sin aviso de mantenimiento. Ancho de documento y desplazable iguales (1363 px). Es inspección de entrada pública, no sesión de participante ni prueba móvil.
