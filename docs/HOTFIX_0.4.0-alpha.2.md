# Pareja: compatibilidad con compromisos antiguos

Incidente reportado por el propietario con video: entrar en Pareja desmontaba la aplicación y dejaba una pantalla en blanco.

Causa reproducida con datos ficticios: el DTO de compartir incluye `frequency: null` para compromisos históricos sin esa propiedad. `frequencyLabel` solo cubría `undefined`; acceder a `null.course` lanza TypeError desde PartnerSharing. Se confirmó únicamente mediante recuentos de estructura que existen registros de ese tipo seleccionados para compartir en producción, sin leer contenido personal.

Corrección: tratar frecuencia nula como la frecuencia diaria histórica, igual que la propiedad ausente. No modifica registros, permisos, relaciones ni migraciones. Una barrera de errores local a Pareja ofrece reintentar o volver a Personal sin desmontar la app ni registrar contenido privado.

Regresión: caso nulo de PartnerSharing (falló antes del arreglo), navegación integrada de Journal con registro histórico compartido y recuperación de fallo de renderizado. Conservar pruebas completas y cotejo documental antes del despliegue. Evidencia operativa final en la PR de este hotfix.
