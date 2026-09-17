# 0.2.0-alpha.10 · Compromisos y rosario

17 de septiembre de 2026. Cambios aprobados por el propietario para el piloto existente.

## Experiencia

- El símbolo semanal/mensual muestra la proporción de registros frente a la meta vigente. Si el compromiso empieza o cambia dentro del período, el contador muestra la fecha desde la que aplica. El cálculo de evaluación histórica conserva su cautela: un período parcial no se interpreta como incumplimiento.
- «Editar» sustituye el botón de tres puntos. El menú y el formulario ofrecen eliminar cuando no hay registros; con registros o revisiones, se ofrece dejar de seguir conservando el historial. Ambas operaciones piden confirmación. Los compromisos pausados siguen disponibles en Mi espacio.
- Instalación y enlace compartible accesibles en Mi espacio. Compartir siempre usa la dirección pública fija, nunca tokens, datos de sesión ni invitaciones. El acceso sigue limitado al piloto.
- Nuevos rosarios permiten colocar Padre nuestro y tres Avemarías al inicio o después de los misterios. El valor inicial propuesto es después, siguiendo la práctica descrita por el usuario. Las invocaciones «Hija, Madre y Esposa» funcionan en ambos lugares.
- Con el bloque al final: señal de la cruz, Credo, Padre nuestro inicial, acto de contrición, cinco misterios completos, Padre nuestro y tres Avemarías, Gloria, Salve y señal de la cruz. Con el bloque al inicio: señal de la cruz, Credo, acto de contrición, Padre nuestro y tres Avemarías, Gloria, cinco misterios completos, Salve y señal de la cruz. Se evita duplicar el Padre nuestro inicial en esta segunda opción. Letanías opcionales después de completar.
- El dibujo del rosario ocupa el espacio libre del panel, limitado por el ancho del dispositivo. Al expandir el texto se reduce; en pantallas bajas, el contenido puede desplazarse y los controles permanecen en su zona fija. La cuenta actual de las tres Avemarías también se destaca.

## Cotejo documental

- Juan Pablo II, *Rosarium Virginis Mariae*, 16-10-2002, n.º 37, Santa Sede: reconoce el Credo como apertura legítima entre distintas costumbres y la Salve/letanías como cierre mariano. Consultado el 17-09-2026: https://www.vatican.va/content/john-paul-ii/es/apost_letters/2002/documents/hf_jp-ii_apl_20021016_rosarium-virginis-mariae.html
- *Compendio del Catecismo de la Iglesia Católica*, 2005, apéndice «Oraciones comunes», «Acto de Contrición», Santa Sede: texto español «Dios mío, me arrepiento de todo corazón…», transcrito conservando palabras y unificando saltos de línea. Consultado el 17-09-2026: https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_sp.html
- Padre nuestro, Avemaría, Gloria, Credo y Salve conservan el texto ya cotejado. El orden configurable y el valor por defecto son decisiones de producto a petición del usuario; no se presentan como una regla nacional ni como aval institucional.

## Compatibilidad y comprobación

Los identificadores existentes 0–68 conservan su significado y 69 sigue siendo el cierre confirmado. Los dos pasos nuevos usan 70 y 71. La tabla privada rosary_order guarda el orden únicamente cuando el usuario comienza o configura un rosario aún sin avance. Sin esa configuración se conserva exactamente el recorrido anterior, incluida su omisión opcional.

La migración no reescribe registros ni oraciones existentes. Configuración y avance exigen titularidad, versión y época de datos. Solo la confirmación final registra cinco decenas. Eliminación de compromisos exige titularidad y versión, y rechaza registros o revisiones existentes. Se conserva el control de mantenimiento y actualización de clientes.

Pruebas: rosary-order.mjs, rosary-comfort-ui.mjs, renewal-ui.mjs, renewal-db.mjs, commitment-actions-ui.mjs y release-upgrade.mjs; suite general, tipado y compilación. Los datos de prueba son sintéticos. La comprobación visual en los teléfonos reales sigue pendiente; no se da por realizada mediante pruebas de DOM.
