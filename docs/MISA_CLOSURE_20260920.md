# Misa: cierre pendiente — 20/09/2026

Decisión del propietario: cerrar Misa antes de preparar publicación del resto. No se recorta ni se oculta el módulo. Este registro actualiza la prioridad de entrega; no autoriza producción.

## Estado comprobado

| Elemento | Implementado | Verificado | Pendiente | Publicado |
| --- | --- | --- | --- | --- |
| Navegación integrada y lector | Sí | Pruebas automáticas existentes de fechas, variantes, lectura completa sintética y regreso a Oración | Safari/iPhone, accesibilidad y contenido real | Vista privada v6; no piloto |
| Identificadores de lecturas | Corrección local: prefijo separado de secciones/momentos | Regresión falla antes y pasa después | Incorporar al próximo preview integrado | No |
| Cambio de variante del rito | Corrección local: cerrar el detalle al cambiar lavatorio/bautismos | Regresión del lavatorio falla antes y pasa después | Revisión visual con textos completos | No |
| Lecturas reales | Lector disponible; biblioteca vacía | Rechazo de 12 casos inválidos con datos sintéticos | Fuente, autorización, calendario y cobertura de fechas/celebraciones | No |
| Oraciones de cada momento | No: solo orientación y aviso pendiente | Inspección del código | Textos, variantes y asociación estable a cada momento | No |
| Calendario Costa Rica | Zona horaria y fechas móviles generales | Cálculo y fechas límite | Ordo vigente, particularidades diocesanas y cotejo | No |
| Ramos y Jueves Santo | Esquemas parciales | No certificados litúrgicamente | Rúbricas precisas de entrada sencilla y cierre sin traslado | No |

No confundir una prueba del lector con validación de un leccionario. Los identificadores actuales de celebración son genéricos salvo casos especiales; deberán resolverse contra el calendario documentado al incorporar contenido. El contrato de lecturas no reemplaza una biblioteca de oraciones por momento.

## Fuentes consultadas y límites

- [CONALI, Conferencia Episcopal de Costa Rica](https://www.iglesiacr.org/comisiones/): la institución se presenta como responsable de subsidios litúrgicos. Publica `conali@iglesiacr.org`, teléfonos 2223-6535 / 2221-3053. La página consultada enlaza Ordo 2022–2023 y 2023–2024; no se obtuvo allí el Ordo vigente. Esto no demuestra que no exista por otro canal. El enlace a SharePoint no se pudo abrir y la búsqueda directa del sitio devolvió 403; no se eludió el acceso.
- [IGMR, Santa Sede](https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_sp.html): cotejo puntual de 46–54. La guía general tiene el orden básico. Debe contemplar la aspersión que puede sustituir el acto penitencial y evitar repetir el Kyrie si se incluyó en él (51–52). La etiqueta condicional del Gloria no sustituye el calendario. Estos ajustes litúrgicos quedan pendientes del paquete de variantes; no se improvisaron textos.
- [Lecturas en español de USCCB, muestra](https://bible.usccb.org/es/bible/lecturas/091524.cfm): el pie identifica derechos de la Conferencia Episcopal Mexicana y uso bajo permiso; advierte diferencias posibles de salmos. No se encontró en esta página permiso de reutilización para Alianza ni prueba de calendario CR. No se copió contenido a la app.

## Material necesario para completar el trabajo

1. Ordo vigente de Costa Rica y confirmación de cobertura nacional/diocesana y actualizaciones del próximo año.
2. Edición y proveedor del Misal y Leccionario aprobados para el uso previsto; acceso al texto digital completo, incluidas respuestas, salmos y variantes.
3. Licencia o autorización que contemple reproducción dentro de la app, atribución y condiciones de almacenamiento/distribución. Un enlace público de consulta no documenta por sí solo esos derechos.
4. Cotejo de las variantes pendientes con sus rúbricas; después integrar contenido y completar pruebas con datos reales autorizados, en la versión privada.

## Borrador de consulta — no enviado

Para: CONALI, conali@iglesiacr.org (contacto publicado por CECOR).

Asunto: Calendario y textos autorizados para guía de Misa en Alianza Fe y Amor

Estimados miembros de CONALI:

Estamos preparando Alianza Fe y Amor, una aplicación en etapa de piloto que incluye una guía para acompañar la Misa. Queremos presentar las lecturas y oraciones completas correspondientes a Costa Rica, con fidelidad litúrgica y las autorizaciones necesarias.

¿Podrían facilitarnos el Ordo vigente y orientarnos sobre la edición del Misal y Leccionario que corresponde utilizar, así como el titular o proveedor al que debemos solicitar permiso para reproducir los textos dentro de la aplicación? Agradeceríamos conocer las condiciones de atribución, almacenamiento y actualización, y si existe una fuente digital autorizada.

También buscamos cotejar las variantes de la entrada sencilla del Domingo de Ramos y el cierre del Jueves Santo cuando no corresponde el traslado del Santísimo.

Muchas gracias por su orientación.

Alianza Fe y Amor

## Evidencia técnica de esta pasada

`npm run test:mass` y `npm run typecheck` pasan después de las dos correcciones. Se conserva la evidencia de fallo previo de cada regresión. Sin pruebas humanas nuevas. No se cambió la huella de aprobación metodológica: continúa pendiente el cotejo completo. Sin mensajes enviados, datos de usuarios modificados ni despliegue de producción.


## Fuente aportada por el propietario: Evangelizo — actualización

La app id379577026 es **Evangelizo – Evangelio del Día**, del proveedor EVANGELIZO EVANGILE AU QUOTIDIEN. El propietario informa que usualmente coincide con las lecturas de Costa Rica; es una referencia de uso, no certificación de todas las fiestas locales.

- [Ficha de App Store CR](https://apps.apple.com/cr/app/evangelizo-evangelio-del-d%C3%ADa/id379577026): español y calendario romano ordinario entre las versiones disponibles.
- [Lectura observada](https://evangeliodeldia.org/SP/gospel/2026-09-19): atribuye la traducción a El Libro del Pueblo de Dios. No se incorporaron sus textos al repositorio.
- [Sindicación oficial](https://evangeliodeldia.org/SP/rss): anuncia expresamente Reader Evangelizo para incorporar lecturas, títulos y comentarios en sitios propios. Hay RSS español oficial. Es una vía de integración documentada, que cambia la conclusión anterior de no haber encontrado una fuente de incorporación.
- [Manual Reader v2](https://feed.evangelizo.org/v2/reader.php): consulta por fecha YYYYMMDD, idioma SP y contenido; soporte XML, lecturas, salmo, títulos. Documenta límite de 30 días desde hoy. No documenta selector específico CR, variantes de Navidad/Triduo ni biblioteca de oraciones del Misal. No inferir permiso de archivo perpetuo o redistribución sin límites a partir del permiso de mostrar contenido vía Reader.
- Prueba HTTP de solo lectura: título de 2026-09-20 responde 200, «25o domingo del Tiempo Ordinario»; XML responde 200, 6595 caracteres, CORS `*`. RSS responde 200. Esto verifica disponibilidad de una consulta, no fidelidad de todos los textos ni continuidad del servicio.
- La Nota Legal observada es una política de privacidad; no añade condiciones específicas de licencia de textos.

Siguiente trabajo: evaluar integración oficial de lectura dentro de los acordeones existentes, preservar atribución, verificar límites/errores/fecha y cobertura litúrgica local. Mantener las variantes especiales sin datos confirmados explícitamente pendientes. Las oraciones del Misal siguen siendo una dependencia separada. No marcar automáticamente `territory=CR` o `calendar.status=verified` por recibir una respuesta HTTP correcta. Sin publicación ni mensajes enviados.


## Integración de prueba implementada (siguiente pasada)

- `lib/evangelizo.ts`: Reader oficial HTTPS, consulta SP/XML por fecha; convierte el marcado a texto inerte; comprueba XML, fecha, campos únicos y lecturas requeridas. Sin HTML remoto insertado, comentarios, credenciales ni almacenamiento permanente. Ventana conservadora de ±30 días; plazo de solicitud de 15 segundos en el componente.
- `app/evangelizo-review.tsx`: estados de carga/error/reintento, atribución y enlace al proveedor; acordeones controlados por Misa, con su posicionamiento existente. Un cambio de fecha cancela la solicitud y descarta respuestas anteriores.
- Activación **solo** en las compilaciones de revisión runtime y Misa. Producción y revisión conectada definen explícitamente la bandera en falso. La búsqueda del endpoint en los assets de producción no encontró coincidencias. No se relajó `availableMassReadings` ni se fabricó acreditación CR.
- Las variantes especiales no consultan el Reader genérico. La pantalla indica calendario romano general y cotejo local pendiente. Sigue sin biblioteca de oraciones del Misal.
- Pruebas: `npm run test:mass` (incluye nuevo `test:evangelizo`), tipado, build runtime y build de producción pasan. El build de producción es una comprobación local, no publicación. Mantiene aviso de tamaño de bundle.
- Verificación HTTP real con el parser: 2026-09-19 devuelve 3 lecturas; 2026-09-20, 4. Se comprobaron referencias y longitudes sin guardar textos en el repositorio. No es validación de todo el calendario.
- Revisión visual bloqueada en esta pasada: navegador rechazó puertos locales y no pudo conectar a terminal.local:4173. No se declara comprobación visual, móvil ni humana nueva.
- Estado de entrega: código y compilación locales en rama de revisión; **no desplegado todavía en la vista privada v6 ni en el piloto**. Pendientes: vista integrada accesible y revisión visual, cotejo CR/variantes, oraciones y control metodológico.


## Avanzar con lo disponible — decisión del propietario

El propietario autoriza buscar la fuente faltante y, si no se obtiene, continuar con lo disponible. Oraciones completas, Ordo CR y variantes pendientes se conservan en backlog; no bloquean la revisión privada de Evangelizo ni se presentan como terminados.

Búsqueda adicional: [Liturgia en idiomas de CEE](https://www.conferenciaepiscopal.es/interesa/liturgia-en-idiomas/) y [Liturgia en español](https://www.conferenciaepiscopal.es/liturgia-en-espanol/). Su [aviso legal, 3.2–3.4](https://www.conferenciaepiscopal.es/aviso-legal/) exige autorización expresa escrita para reutilización. No se obtuvo esa autorización ni calendario CR vigente en la página CONALI. No se copiaron los textos.

Corregido bloqueo real de integración: el CSP de `review/runtime/index.html` prohibía todas las conexiones; ahora permite exclusivamente `https://feed.evangelizo.org`. No se habilitaron conexiones a bases de datos desde el dummy.

Comprobación con Chromium en vista integrada: Oración → Misa → sábado/celebración del domingo → Lecturas; aparecen cuatro lecturas reales. Primera lectura → Evangelio deja únicamente Evangelio abierto; texto de 1608 caracteres, sin desbordamiento horizontal a 1363×936. Posición final del encabezado 23.78 px. No equivale a prueba móvil, lector de pantalla ni prueba humana. Se resolvió el bloqueo de acceso anterior usando la vista supervisada del sitio privado.

Vista privada preparada: versión 7, fuente Sites `b4eb1a0a106000bacf1af58aad34cd84efc575ba`. Solo raíz de la vista privada; `/connected/` conserva su entrega anterior sin Evangelizo. El piloto GitHub Pages no se publica.

Despliegue privado confirmado: `appgdep_6aaf6c8a49548191b28fcfc97754cc1c`, estado succeeded; https://alianza-revision-integral.josanchac.chatgpt.site.


## Corrección de acceso y diagnóstico de carga

Reporte del propietario: ninguna lectura cargó; acceso Misa más pequeño. Se reprodujo la diferencia visual: botón soft-button con SVG20 y regla CSS fit-content. Se reemplazó por la misma tarjeta prayer-entry, SVG28 y flecha de Rosario/Confesión; se eliminó la excepción CSS. Chromium: las tres tarjetas miden 821px en el viewport observado y sus iconos 28px.

No se reprodujo el fallo de lecturas: vista integrada → Misa del domingo → Lecturas cargó cuatro entradas y Evangelio abrió 1608 caracteres. La captura del propietario muestra el acceso, no el estado interno del lector; causa de su fallo aún no determinada. No se declara resuelto un error de red desconocido. Se mejoró el diagnóstico visible para timeout, conexión y respuesta inválida; en fallo se ofrecen Reintentar y Abrir en Evangelizo para la fecha elegida. Pruebas mass/evangelizo, tipado y compilación pasan. Pendiente reproducción en el dispositivo del propietario si continúa.

Sin publicación del piloto. Actualización de vista privada preparada en Sites fuente 0544ef4143a8cee8609a07c50e1127fa40c8a722.


## Mobile connection follow-up — same-origin review relay
- User screenshot still showed the TypeError connection branch after v8. This establishes a browser fetch failure, not the precise CORS/CSP/network cause.
- Owner-private Sites review now uses a Worker relay at `/api/mass-readings`; browser requests its own origin with same-origin credentials. No browser request to Evangelizo, no user information sent upstream.
- Relay only permits GET, one real date within ±30 days of Costa Rica today, fixed Spanish XML upstream, no redirects, maximum 500 kB and 12-second timeout. Client retains complete XML, field and date validation and inert rendering. No persistence or production database changes.
- Configure runtime review build with `MASS_READINGS_RELAY=same-origin` only when the host supplies that route. Standalone local previews retain direct provider access; GitHub production integration remains disabled.
- Relay implementation and tests live in the separate Site repository (`server/readings.js`, `tests/readings.mjs`). The Site retains its identity and owner-private audience; existing connected preview assets preserved.
- Automated relay tests, Mass suite and typecheck passed. Real upstream relay returned HTTP 200 with Gospel for 2026-09-20. Safari/iPhone confirmation and local calendar verification still pending.

### Delivery evidence: private review v9
- Main review commit: b0742ab (local). Sites source commit: cc17c7417838757da1db5ad4509c1e543ea5bb24 (pushed).
- Saved version: appgprj_6aaf3a818cec8191b77e39447dce4281~appgver_b8847cc54efc8191b2e8bffc2e43c6bc.
- Deployment appgdep_6aaf70e5a06081918d999d65762c4912 succeeded, owner-private https://alianza-revision-integral.josanchac.chatgpt.site. Production pilot remains unchanged.
- Browser preview did not establish success: direct internal API navigation returned net::ERR_BLOCKED_BY_CLIENT. Native server handler against live provider returned HTTP 200 / 6595 characters / Gospel present; synthetic relay and client tests passed. Do not characterize this as Safari or deployed end-to-end validation.
- Remaining: owner iPhone verification of private v9, deployed relay operational validation, Costa Rica calendar/content authorization, existing methodology gate.


## Confirmed hosted bug and fix — 2026-09-20, private v11
- Root cause established from deployed Worker error logs: `TypeError: Invalid redirect value, must be one of "follow" or "manual"`. Previous `redirect: error` worked in Node tests but was rejected before an upstream call in Workers. iPhone requests reached `/api/mass-readings` and received HTTP 502 in 0–1 ms.
- Corrected the Site relay to `redirect: manual`; non-2xx responses, including redirects, remain rejected. No arbitrary redirects or user headers are forwarded. Added an explicit 302 rejection test; relay suite passed.
- Site source c5d82d0062a8f57ff20a9ce2bb6b1f67c14b16d0 pushed; private deployment appgdep_6aafe8b55f608191a3c516c57437a17e succeeded for version appgprj_6aaf3a818cec8191b77e39447dce4281~appgver_3b986badc94c81918c3563cefc129529.
- Verified the actual hosted route with the connector-provided authorized Sites header: September 20 returned HTTP 200, matching date 20260920, four readings, Gospel Mt 20,1-16a (1608 characters); September 19 returned HTTP 200, matching date 20260919, Gospel Lc 8,4-15. No credentials stored in repository or artifacts.
- Passed client validation and automated component rendering using the real hosted September 20 XML response: four controls, Gospel expanded, full text exactly matches the parsed response. This is an automated component check, not human validation.
- Internal supervised browser preview still returned a generic load failure; this does not invalidate the separately verified hosted endpoint but visual end-to-end on iPhone remains pending. No claim of completed Safari QA.
- Production pilot and GitHub Pages remain unchanged. Production integration, local liturgical correspondence and methodology gate remain pending.


## Decisión del propietario: avanzar con calendario general
El propietario confirmó «Ahora sí cargan las lecturas» y autorizó «si no encontramos la litúrgica específica de Costa Rica sigamos con la general». La carga en su dispositivo queda confirmada por él; no equivale a revisión de todas las fechas ni validación pastoral.

- Alcance aceptado: calendario romano general y lecturas diarias disponibles en Evangelizo. La búsqueda previa no obtuvo una fuente local verificada; el calendario costarricense pasa a mejora pendiente, sin bloquear este alcance general.
- Implementado: etiqueta breve de calendario general; explicación de posibles diferencias parroquiales/locales dentro de Fuentes; fecha marcada expresamente como hora de Costa Rica. Se retira la afirmación obsoleta de que toda la biblioteca está vacía.
- No se inventan oraciones ni se rellenan variantes especiales con lecturas de otra celebración. Sus textos y cotejo siguen pendientes, diferenciados de la adaptación local.
- El cambio no autoriza publicar el piloto: revisión integrada y adaptación del servicio de lecturas a GitHub Pages siguen pendientes. La puerta documental no se modifica sin cotejo.

## Preparación del servicio para GitHub Pages — siguiente pasada
- Implementado `supabase/functions/mass-readings`: autenticación resuelta en Auth, CORS con dos orígenes explícitos, solo GET/OPTIONS, fecha real dentro de ±30 días CR, proveedor fijo, sin reenvío de credenciales al proveedor, redirecciones rechazadas, respuesta limitada y sin almacenamiento. No usa service_role ni consultas de datos del usuario.
- Instalado solo en xhfqcrmekfjclgazrvrm: función ACTIVE v1, verify_jwt=true. La ruta remota rechaza solicitudes sin JWT e inválidas con 401. Falta la solicitud completa con sesión válida; no confundir estos rechazos con verificación de carga autenticada.
- Cliente preparado: transporte configurado al iniciar la app, sesión actual en cada consulta y endpoint del mismo proyecto que la configuración de Auth. El lector mantiene validación de XML y presentación inerte.
- Compilación opt-in: `MASS_READINGS_RELAY=supabase npm run build`. La compilación habitual conserva el lector deshabilitado hasta cerrar la verificación y desplegar el servicio en el proyecto destino. No se modificó el workflow para activarlo accidentalmente.
- IGMR 51–52 cotejados: aclaraciones dentro del detalle de Acto penitencial y Señor, ten piedad. Sin controles nuevos ni cambio de disposición visual. Fuente: https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_sp.html
- Changelog Supabase consultado y revisado; no se identificó cambio incompatible aplicable. CORS contrastado con documentación actual: https://supabase.com/docs/guides/functions/cors
- Pruebas dirigidas: preflight/origen, rechazo de sesión, fecha/rango/parámetros duplicados, aislamiento de credenciales, tamaño/correspondencia de respuesta, transporte autenticado cliente, regresión de Misa, tipado y compilación opt-in pasan.
- Pendiente documental: variantes de Ramos y cierre del Jueves Santo siguen sin cotejo suficiente. Búsqueda adicional no produjo una fuente primaria accesible; no se improvisaron rúbricas ni se marcó cerrado el gate.
- Entrega en código de revisión; vista privada continúa v14. No publicación del piloto ni modificación de usuarios o datos de producción.

Verificación final de esta pasada: `npm test` terminó con código 0, incluyendo el nuevo relay. El endpoint desplegado también respondió OPTIONS 204 con Access-Control-Allow-Origin exactamente https://josanchac.github.io. Esto comprueba preflight del navegador, no reemplaza una sesión válida ni Safari. Fuente de autenticación consultada: https://supabase.com/docs/guides/functions/auth (verificación JWT de plataforma mantenida y usuario validado adicionalmente en Auth).
