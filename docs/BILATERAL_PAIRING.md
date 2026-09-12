# Uso individual y vinculación bilateral · revisión del 12/9/2026

Implementado en la rama de revisión; no desplegado ni aplicado a cuentas reales. Los documentos de Dropbox siguen pospuestos por indicación del propietario. Esta entrega desarrolla la cuenta individual, la vinculación y el registro opcional del ideal matrimonial; no incorpora un curso ni acredita fidelidad metodológica.

## Experiencia

- Se puede entrar al piloto sin pareja asignada. El horario y el ideal personal no dependen de una vinculación. La cuenta nueva empieza sin ideal precargado; las frases existentes se conservan.
- En Las 4 Rs o Mi espacio se puede continuar individualmente, crear una invitación o revisar un código recibido. Los formularios de encuentros compartidos aparecen una vez vinculados.
- Quien invita escribe el correo del cónyuge y confirma expresamente que desea vincularse con ese correo. La app genera un código que esa persona comparte por su canal elegido. No envía correo, no activa cuentas y no consulta ni revela si el destinatario tiene cuenta.
- Quien recibe entra con su cuenta del piloto y correo confirmado, pega el código, revisa el nombre y correo de quien invita y acepta expresamente. Puede rechazarlo. Antes de aceptar no se crea pareja ni se comparte contenido.
- La invitación vence en siete días, sirve una vez y se puede cancelar. Crear otra cancela la anterior. Límite inicial: cinco códigos por remitente en 24 horas. Estos son criterios del producto.
- Vincularse conserva los registros propios y abre un espacio matrimonial nuevo. Los permisos de horario, reflexiones e ideal personal comienzan apagados en ambos usuarios. Las 4 Rs y el ideal matrimonial son compartidos.
- Mi espacio permite desvincularse con una explicación y confirmación previas. Se apagan los permisos personales de ambos; se conserva el contenido propio y se archiva el espacio matrimonial para lectura de sus participantes originales. Una pareja posterior no recibe ese archivo ni consentimientos anteriores.

Para quienes ya estaban vinculados en el piloto se conserva la relación y los permisos existentes de horario y notas. Se añade un control específico de visibilidad del ideal personal, inicialmente apagado si no existía: la app explica el cambio en Novedades. No borra la frase. Las relaciones anteriores se identifican internamente como `existing-pilot`; no se inventa un consentimiento bilateral histórico.

## Ideal matrimonial opcional

La pareja puede continuar sin ideal. Puede escribir una frase libre como borrador; ambas personas confirman por separado la misma revisión. Cambiar la frase invalida las confirmaciones anteriores. Una confirmación repetida de la misma persona no cuenta dos veces. Vaciar la frase vuelve a dejar el ideal pendiente.

«Frase confirmada por ambos» expresa acuerdo entre usuarios, no aprobación espiritual. La ayuda documental sigue siendo opcional y mantiene la referencia institucional ya revisada. No se generan ideales ni se trasladan respuestas personales al espacio matrimonial.

## Modelo y controles

`members` admite `couple_id` y `seat` nulos y conserva la identidad Auth. `couple_participants` fija quién participó originalmente en cada espacio, con máximo dos asientos. `pair_invitations` contiene destinatario, vencimiento y estado; guarda SHA-256 del código aleatorio de 64 caracteres hexadecimales, sin almacenar el código legible. `ideal_confirmations` vincula cada confirmación con participante y revisión.

Las nuevas tablas están en el esquema privado, con RLS y sin acceso directo de clientes o del rol de métricas. La entrada pública `alianza_relationship` usa seguridad del invocador; la operación privilegiada vive en el esquema privado, tiene `search_path` vacío y comprueba sesión, membresía y correo confirmado. No usa metadatos editables de JWT para decidir permisos. La lectura de datos verifica además que la asignación actual coincida con los participantes del vínculo activo.

Las operaciones de relación se serializan mediante un bloqueo transaccional y bloquean las filas de miembros en orden estable antes de vincular o desvincular. Cada transición incrementa `relationship_version`. Los guardados de perfil —que contiene permisos— y de las 4 Rs deben corresponder a esa versión de relación. El formulario conserva la versión con la que se abrió; una pantalla antigua no puede volver a habilitar permisos ni guardar en otro matrimonio. Los registros personales ordinarios conservan sus propietarios y control de versiones.

La preparación del código es distinta de su aceptación. La previsualización no modifica la relación. El formulario conserva el código exacto previsualizado y descarta respuestas tardías si se cambia el campo, para que un consentimiento no se aplique a otra invitación.

## Migración y compatibilidad

Migración incremental: `20260912132546_bilateral_pairing.sql`, posterior a `20260912041345_guided_schedule.sql`. Se creó mediante Supabase CLI. `supabase/schema.sql` contiene también el modelo base actualizado.

La migración conserva las filas de registros originales, incluidos propietario, contenido, clave, versión y fecha. Las parejas existentes con dos miembros mantienen su identificador. Un espacio anterior con un solo miembro se archiva para esa persona y su cuenta pasa a individual: una asignación administrativa incompleta no prueba una relación bilateral. Se conserva su contenido compartido anterior, sin reasignarlo.

Los clientes anteriores siguen pudiendo leer y registrar contenido personal. Sus escrituras de perfil y 4 Rs se aceptan mientras no haya ocurrido una transición desde la migración. Después de vincular o desvincular, esos guardados requieren el cliente actualizado y el contexto de relación. Esta restricción es intencional; evita que una pantalla antigua actúe sobre el vínculo nuevo.

La habilitación de cuentas del piloto sigue siendo administrativa. Para cuentas nuevas, habilitar membresía individual, sin `couple_id` ni `seat`, y dejar que ambos usuarios completen la vinculación. No asignar manualmente un nuevo cónyuge a un espacio existente.

## Verificación y límites reales

Pasaron la suite completa `npm test`, TypeScript y compilación Vite. Las pruebas nuevas de base usan PGlite y datos sintéticos: conservación durante migración, cuenta individual, archivo de singleton, destinatario incorrecto, previsualización sin vínculo, uso único, cancelación, rechazo, vencimiento, creación sin consulta de destinatario, permisos apagados al aceptar, revocación, historial sin transferencia, escrituras antiguas rechazadas, confirmaciones del ideal y denegación al rol de métricas.

Las pruebas JSDOM comprueban consentimiento explícito, continuidad individual sin escritura, error conservando formulario, ideal vacío, versión original del borrador, descarte de una previsualización tardía y bloqueo de guardado de un formulario abierto antes de desvincularse.

Estas pruebas no demuestran concurrencia real entre conexiones PostgreSQL ni calidad visual en teléfonos. Se intentó `supabase db advisors --local --type security`; no pudo conectar a `127.0.0.1:54322` porque no hay servidor Supabase local en este entorno. No se usaron asesores del proyecto vivo para aparentar validar una migración que aún no tiene aplicada.

Se preparó una vista aislada en `tests/preview-frame.html`, con iframe de 390 × 844, y escenarios individual/pareja sin ideal. Ejecutar `npm exec -- vite --config tests/preview.config.ts` y abrir `http://127.0.0.1:5174/preview-frame.html`. Solo simula formularios en memoria; no autentica, envía ni toca Supabase. El navegador disponible rechazó la dirección local con `ERR_BLOCKED_BY_CLIENT`, por lo que no se declara inspección visual completada.

Antes de desplegar: respaldo y restauración ensayada; aplicación y asesores en preproducción; pruebas con conexiones concurrentes de aceptar/aceptar, aceptar/cancelar y guardar/desvincular; comprobación móvil, teclado y lector de pantalla; revisión metodológica del contenido exacto. El build mantiene una advertencia de bloque JavaScript superior a 500 kB; su impacto requiere medición.

No revertir la base eliminando participantes, invitaciones o ideales: perdería historia y evidencia. Una vuelta al cliente anterior tiene los límites descritos; una restauración debe conservar escrituras posteriores. El reinicio individual de la cuenta de la esposa sigue pendiente de respaldo y protección propia frente a escrituras antiguas. `relationship_version` no sustituye ese control de reinicio.
