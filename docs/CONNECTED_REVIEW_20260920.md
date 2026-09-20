# Revisión conectada — 20 de septiembre de 2026

## Estado concreto

La app completa tiene entrada independiente en `review/connected`, compilada mediante `npm run build:review-connected`. Configuración exclusiva de `alianza-pruebas` (`xhfqcrmekfjclgazrvrm`), clave publicable, CSP limitada a ese backend, sin manifiesto de instalación y con identificación visible de prueba. No se modificó la entrada ni configuración de producción.

La vista privada existente conserva su dummy en la raíz y agrega `/connected/`. Sites confirmó publicación privada exitosa, versión 5, fuente `4ccbd8b45531d99a5d3436e618a2e1dcee8e2c2d`, despliegue `appgdep_6aaf546764048191aad1c5f4e78d95e5`. Sitio: https://alianza-revision-integral.josanchac.chatgpt.site. Esto es alojamiento de revisión, no publicación del piloto en GitHub Pages.

La función `pilot-invitations` está desplegada solo en el backend aislado, con JWT obligatorio, verificación de usuario real y administrador, destino fijo `/connected/` y comprobación de origen. El entrypoint está en `review/connected/invitations-entry.ts`; reutiliza el handler de producción sin cambiar su implementación.

## Pruebas automáticas contra servicios reales

Se crearon dos cuentas ficticias confirmadas mediante Auth Admin API, no mediante inserción de hashes de contraseña. Un helper temporal aceptaba solo un secreto aleatorio, dos correos fijos `example.test`, el proyecto de prueba y una ventana máxima de una hora. Se sustituyó inmediatamente después por una función inerte que responde 410 y exige JWT. No conserva una ruta activa de aprovisionamiento.

El administrador de prueba recibió el rol mediante SQL en el proyecto aislado. El flujo de invitación creó una tercera cuenta ficticia. No se enviaron correos. Estos tres usuarios y sus registros sintéticos quedan disponibles para continuación de QA; no son participantes reales del piloto. Credenciales y tokens no están en Git ni en el sitio. El archivo temporal protegido de ejecución no constituye una entrega de credenciales al propietario.

Resultados:

| Flujo | Evidencia | Resultado |
|---|---|---|
| Auth | Login real por contraseña de las cuentas ficticias | Pasó |
| Generación de enlace | Edge Function y Auth generate_link reales; destino exclusivo de revisión | Pasó |
| Permisos | Sin sesión: 401; participante: 403; origen ajeno: 403; administrador: habilitado | Pasó |
| Cancelación | La puerta de entrada de la app rechazó una invitación cancelada aunque Auth aún aceptara el token | Pasó |
| Renovación | Nueva prueba de aceptación; prueba antigua rechazada; aceptación correcta de la nueva | Pasó |
| Contraseña y regreso | Actualización Auth, login posterior, lectura de datos individual sin pareja | Pasó |
| Token usado | Reutilizar el token ya consumido fue rechazado | Pasó |
| Frecuencias | Extra mensual conserva el conteo diario; versión obsoleta rechazada | Pasó |
| Pareja | Solicitud, ausencia de vínculo antes de aceptar, aceptación y privacidad por defecto | Pasó |
| Solicitudes | Rayo ficticio visible en administración; actualización visible al autor; listado negado al participante | Pasó |
| Métricas | Pulso agregado sin correos | Pasó |
| Grupos | Creación, aislamiento de no miembros, acción no autorizada rechazada, adhesión voluntaria | Pasó |

Scripts: `http-smoke.mjs`, `http-lifecycle.mjs`, `http-journeys.mjs` en `review/connected`. Requieren un archivo privado de fixtures con credenciales temporales y una preparación nueva para repetir el escenario completo. No ejecutar sobre producción. Se ajustó únicamente `updated_at` de la invitación ficticia para ejercitar renovación sin esperar el enfriamiento; no se modificó la regla.

Dos errores del adaptador de prueba usaban `p` en vez de `payload` para `alianza_data` y `alianza_relationship`. La app ya usaba los nombres correctos. Se corrigieron los scripts y se reanudaron desde el estado alcanzado, sin repetir invitaciones aceptadas. El primer tramo de renovación pasó hasta la consulta de datos; la consulta corregida y el ingreso posterior pasaron en la fase `finish`. No atribuir estos fallos al producto.

## Revisión visual y límites

Chromium supervisado cargó la entrada real conectada y mostró el formulario de acceso. A 320/390/768 px, el ancho de contenido fue 305/375/753 px respectivamente, igual al ancho desplazable: sin desbordamiento horizontal en esos estados. No se detectaron errores propios de la app en la muestra de consola; los errores observados pertenecían a una extensión del navegador.

No se ingresaron credenciales mediante automatización del navegador. La habilidad control-browser exige `browserAuth` para ese paso y su capacidad expuesta recoge credenciales del usuario; no permite inyectar las credenciales sintéticas desde el agente. Las pruebas HTTP se ejecutaron como pruebas de servicios, no se presentaron como un recorrido visual autenticado ni como validación humana. No se sustituyó esa restricción con cookies, almacenamiento o tokens inyectados en el navegador.

Pendiente: recorrido visual autenticado de administración/copia de enlace/pareja/grupos, Safari/iPhone real, ampliación de texto y lector de pantalla. La copia de enlaces está cubierta por pruebas de UI simulada, todavía no por portapapeles real de iPhone.

## Cierre técnico y publicación

Pasaron tipado, compilación conectada, pruebas del handler y UI de invitaciones. También pasaron la regresión de experiencia aprobada, el aviso de actualización y el preflight CORS real.

El cotejo metodológico sigue fallando por diferencias entre el código actual y su huella revisada. Se identificaron 27 archivos afectados desde `8a666b5`, incluidos Misa y cambios generales de experiencia. No se renovó la huella para silenciarlo.

La biblioteca `MASS_READINGS` sigue vacía. Permisos de textos, correspondencia del calendario de Costa Rica y revisión documental permanecen pendientes; no afirmar que el lector ya contiene las lecturas completas. La variante de cierre de Jueves Santo previamente registrada también sigue pendiente de propuesta revisable.

No se publicó en GitHub Pages, no se fusionó main y no se modificaron datos ni funciones del proyecto de producción. La autorización final de publicación continúa pendiente.
