# Integración aprobada — 20 de septiembre de 2026

## Alcance y autorización
El usuario aprobó los dummies de lecturas serenas, Cambiar espacio y compromisos integrados (frecuencias, repeticiones y novenas). Esta entrega corresponde a la rama de revisión y al sitio privado de prueba con datos ficticios. No autoriza desplegar el piloto ni ejecutar migraciones en bases remotas.

## Implementado
- Selector Personal / En pareja con encabezado Cambiar espacio, bordes suaves y selección con check. Conserva navegación y configuración de espacios.
- Lecturas con superficie clara, tipografía Georgia ajustable, referencia bíblica separada y textos originales sin alteración. Se mantiene el proveedor y calendario general aceptado; no se afirma validación costarricense.
- Formulario progresivo: todos los días, días específicos, veces por semana/mes y por un tiempo. Repeticiones mediante “Permitir más de una vez al día”. Conserva metas diarias múltiples existentes.
- Todos los compromisos siguen en una sola vista por momento. Primer registro con checkbox; Agregar otro solo si está configurado. Los extras conservan la meta y el período; indicador dorado y contador incluso si el período comenzó parcialmente.
- Desmarcar varios registros solicita confirmación; Deshacer último permite corregir uno.
- Novenas: inicio/duración, un avance por día, pausa/retomar, reiniciar mediante formulario y confirmación de guardado. El reinicio mantiene el mismo compromiso, versiones anteriores y registros; no borra el recorrido previo. Al completarse desaparece de días posteriores, conservando acceso histórico.
- Días específicos y cursos se respetan en el indicador diario y metas de reportes. Una novena pausada no penaliza el indicador diario hasta retomar.
- Migración aditiva valida frecuencias en servidor, impide fechas fuera de los días elegidos, registros previos al inicio, repeticiones de novena y nuevos días posteriores a completar su recorrido. Mantiene permisos, planes generados por servidor, versiones y aislamiento por propietario.

## Verificación
- Tipado y compilación del entorno de revisión: pasan.
- Prueba nueva commitment-courses: nueve días, finalización, pausa/retomar/reinicio, historia, días específicos, formulario progresivo, repetición y selector.
- PostgreSQL embebido PGlite con toda la cadena de migraciones: pasan validaciones, guardado por RPC, frecuencias nuevas, rechazos y aislamiento; no se usaron datos reales.
- Pruebas existentes de aportes, indicador diario y metas: pasan. Selectores de pruebas actualizados para las etiquetas aprobadas; no se eliminaron aserciones.
- La suite completa `npm test` pasó, incluyendo pruebas de privacidad/aislamiento, invitaciones, rosario, Misa, acciones y cursos. Son pruebas automáticas con datos sintéticos, no validación humana.
- Revisión visual humana: aprobados los dummies por Josurf. La integración actual aún requiere revisión en Safari/iPhone real; no se presenta como probada con adultos mayores ni otros participantes.
- Control documental: sigue fallando por diferencia con el contenido cotejado; no se alteró el control ni se declaró aprobado.

## Pendiente / publicación
- Migración preparada y probada localmente, NO aplicada a Supabase remoto. Es requisito previo a habilitar nuevas frecuencias en el entorno conectado o piloto.
- Revisar versión privada integrada en dispositivo, renovar cotejo documental y autorización final antes de publicar piloto.
- Correspondencia litúrgica local y oraciones/variantes pendientes conservan su backlog; no bloquean la revisión del calendario romano general aceptado.
- La vista privada usa datos sintéticos en memoria; recargar reinicia los ejemplos. La ruta conectada conserva su versión anterior.
- No hay cambios en main del piloto, despliegue GitHub Pages, usuarios ni datos de producción.

## Entrega privada
- Sitio de revisión actualizado correctamente a versión 13: https://alianza-revision-integral.josanchac.chatgpt.site
- Fuente del sitio: a4d8182c198f2409ed5c71803f5cc5fab2037a23.
- Despliegue privado: appgdep_6aaff858c91c8191a09e5a093f9d39d4, succeeded.
- Raíz sintética actualizada. No es publicación del piloto; /connected conserva la versión anterior y no recibió la migración.
- No se realizó inspección visual de esta integración con navegador/dispositivo en esta entrega. La confirmación del despliegue no sustituye esa revisión.


## Actualización posterior: integración conectada v14
La aprobación visual de la integración fue recibida. La migración de cursos ya se aplicó y verificó exclusivamente en Supabase de pruebas; /connected/ fue actualizado con las nuevas frecuencias y lecturas mediante relay. Esto sustituye los estados anteriores de migración remota pendiente y ruta conectada antigua. Piloto sin publicar ni migrar. Estado y pendientes detallados: [INTEGRATED_VERIFICATION_20260920.md](INTEGRATED_VERIFICATION_20260920.md).
