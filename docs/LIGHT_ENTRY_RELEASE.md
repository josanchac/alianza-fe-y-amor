# Entrada liviana y personalización voluntaria

## Cambios preparados

- Inicio de dos opciones para cuentas individuales y tres para cuentas vinculadas; una frase de orientación. No hay novedades automáticas para nuevos usuarios.
- Primer compromiso en dos pantallas: acto concreto y frecuencia. Frecuencias y períodos de historial con botones etiquetados de selección (chips), estado aria-pressed y foco visible.
- Las 4 Rs se retiran de la navegación y de los resúmenes individuales. La vinculación sigue disponible en Mi espacio, con consentimiento de ambas personas.
- Novedades breves, detalles de ayuda cerrados y opciones secundarias de ajustes bajo demanda. La guía de las 4 Rs usa una lista en lugar de un párrafo concatenado.
- Nombre opcional; no se presenta como elegido el nombre del perfil mínimo inicial. Se elimina el símbolo deducido del rol o la membresía. Las elecciones explícitas ya guardadas se conservan.
- Selector de símbolos con opción Sin símbolo. Imagen propia: JPG/PNG/WebP de hasta 5 MB, convertida localmente en una miniatura JPEG de 192 px, sin guardar el original ni sus metadatos. Se guarda solo al confirmar. El registro `appearance` es privado incluso con permisos de pareja activados.
- Solicitar símbolo prepara un texto para copiar y compartir con quien invitó al usuario. No hay envío automático, bandeja administrativa nueva ni promesa de entrega.
- El emblema SVG de curvas reemplaza al PNG en las pantallas de la aplicación. El icono de instalación sigue en PNG por compatibilidad; no hay cambio de nombre ni nuevo diseño de marca.

## Datos y seguridad

La migración `20260913044134_voluntary_personalization.sql` amplía el contrato exacto de validación sin modificar registros existentes. La imagen solo admite una URL de datos JPEG limitada en tamaño, base64 y marcadores binarios; no admite SVG, URL remota ni claves extra. Esto no equivale a un análisis antivirus ni a una decodificación completa en el servidor. El navegador decodifica y reexporta la imagen elegida antes de guardarla.

Se conserva el camino de escritura propio, versiones, bloqueo frente al reinicio, RLS y exclusión del registro de la lista de contenidos compartibles. No se reinicia ninguna cuenta durante esta entrega.

## Cotejo de los cambios

Comparación contra DOCUMENTARY_VERIFICATION.md y sus fuentes ya cotejadas: las descripciones, ritmos, preguntas y referencias de las 4 Rs permanecen; solo cambia su disposición en lista. Las guías del ideal, confesión, propósito y horario conservan su doctrina y atribución. Se acortan instrucciones de producto y se trasladan explicaciones a detalles opcionales. No se añaden técnicas espirituales ni se presenta un aval institucional. La miniatura, los chips y las opciones de navegación son reglas de producto, no metodología de Schoenstatt.

## Validación y límites

Pruebas de contrato, privacidad, conservación, recuperación y escritura desactualizada en `tests/personalization-db.mjs`. Entrada sin identidad heredada, ausencia de navegación matrimonial individual, nombre opcional, persistencia explícita de símbolos y fallo de guardado en `tests/light-entry.mjs`. Las pruebas existentes de recorrido se adaptan a los dos pasos y a las opciones visuales.

La verificación DOM no acredita legibilidad o ausencia de desbordamiento en un teléfono real. La revisión visual interactiva sigue pendiente: el navegador del entorno había bloqueado la vista local y no se elude esa restricción. No se afirma certificación de accesibilidad. No se modifican los datos privados del piloto para probar.
