# Auditoría de la actualización instalada

Se verificó que el archivo JavaScript publicado contiene el símbolo de progreso restaurado. El usuario confirmó que lo ve en Safari, pero no en el acceso instalado. No se inspeccionó el almacenamiento del iPhone; no se puede afirmar si el contenido retenido procede de caché HTTP o de la restauración de una página abierta.

Hallazgos comprobados:
- La publicación conservó alpha.10 y el detector existente solo compara APP_VERSION con required_version del servidor. No detecta publicaciones diferentes de la misma versión.
- La respuesta HTTP del documento permite caché durante 600 segundos.
- No hay service worker registrado por este proyecto.
- El botón de actualización existente usa location.reload(), sin cambiar la URL del documento.
- El panel de invitaciones está apagado intencionalmente; no es un fallo de caché. Su backend/SMTP aún no está habilitado.

Corrección: cada compilación incorpora una identidad aleatoria de publicación, compartida por el código y config.json. Una comprobación sin caché al abrir, volver a primer plano y cada minuto detecta una publicación distinta, incluso conservando la versión funcional. Muestra un aviso sin desmontar el editor. Solo al pulsar Actualizar navega a una URL de la misma app con un identificador nuevo, conservando otros parámetros y fragmentos. No limpia almacenamiento, sesión ni datos. Una comprobación fallida no bloquea el trabajo.

Límite: el código nuevo no puede ejecutar su detector en una copia antigua que todavía no lo ha cargado. El acceso instalado necesita una primera carga de la publicación corregida. El comportamiento físico de iOS requiere comprobarlo en ese dispositivo; las pruebas locales verifican detección, reanudación, borradores y navegación, no emulan su caché.

Regla de producto, sin cambios doctrinales ni de contenido espiritual. Pruebas: tests/app-update.mjs y tests/build-assets.mjs.
