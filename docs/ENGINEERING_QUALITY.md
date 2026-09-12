# Alianza · Criterios de calidad de ingeniería

Requisito del propietario, 12/9/2026: además del diseño, el desarrollo debe aplicar prácticas reconocidas por la investigación y la industria tecnológica. Este documento establece cómo comprobarlas en Alianza. Adoptar una referencia no equivale a certificación ni garantiza ausencia de defectos.

## Referencias y aplicación

| Referencia primaria | Aplicación concreta en este proyecto | Evidencia requerida |
|---|---|---|
| [ISO/IEC 25010:2023 — modelo de calidad de producto](https://www.iso.org/standard/78176.html) | Definir requisitos verificables de funcionamiento, fiabilidad, seguridad, interacción, rendimiento y mantenimiento. Se utiliza la descripción pública del modelo como referencia; no se declara cumplimiento integral de una norma cuyo texto completo no se ha evaluado. | Criterios por capacidad, resultados y limitaciones. |
| [NIST SSDF 1.1, SP 800-218](https://csrc.nist.gov/pubs/sp/800/218/final) | Integrar seguridad durante el desarrollo: requisitos, protección del código, revisión de cambios, pruebas y respuesta a vulnerabilidades. Esta es la versión final consultada; revisar evolución del estándar antes de actualizar la base. | Análisis de riesgos, revisiones, comprobaciones y procedimiento de corrección. |
| [OWASP ASVS 5.0.0](https://owasp.org/www-project-application-security-verification-standard/) | Preparar una matriz de requisitos aplicables a la web y sus API: autenticación, autorización, sesiones, validación y protección de datos. Usar referencias con número de versión. | Pruebas negativas por cuenta y pareja; revisión de secretos, dependencias y configuración. No afirmar un nivel ASVS completo sin evaluarlo. |
| [WCAG 2.2 del W3C](https://www.w3.org/TR/WCAG22/) | Objetivo de accesibilidad AA: contraste, teclado, foco, nombres accesibles, errores comprensibles, ampliación, controles táctiles y autenticación utilizable. | Auditoría automática más comprobación manual en móvil, teclado y tecnologías de asistencia. Una prueba de contraste sola no acredita AA. |
| [Investigación DORA sobre entrega de software](https://dora.dev/guides/dora-metrics/) | Cambios pequeños, verificables y recuperables; medir comportamiento de las publicaciones y aprender de incidentes. | Historial de versiones, tiempo de entrega, fallos y recuperación. No medir rendimiento individual por número de cambios ni recopilar diarios para estas métricas. |

Las decisiones de implementación que siguen son criterios del proyecto, orientados por esas referencias. No se presentan como citas de sus requisitos exactos ni como un método espiritual de Schoenstatt.

## Desarrollo por entregas verificables

Cada cambio tiene un problema concreto, criterio de aceptación, riesgos de datos y evidencia esperada. Se construye en una rama, se revisa el cambio y se valida antes de incorporarlo a producción. No se utiliza la cuenta de una persona real como sustituto del entorno de pruebas. Los ensayos usan cuentas y contenido sintético.

Una corrección de estilo no necesita la misma batería que una migración o un cambio de permisos. Las pruebas se eligen por riesgo: funciones de fechas y cálculo; integración de base y autorización; recorridos completos de usuario; inspección manual de accesibilidad. No se persigue una cifra de cobertura que pueda alcanzarse sin proteger los casos importantes.

La arquitectura mantendrá separados contenido formativo, presentación, reglas de registro, cálculos y acceso a datos. Las guías llevarán referencias verificables. Cambiar un texto doctrinal requiere revisión metodológica; cambiar una función de permisos requiere pruebas de aislamiento. El crecimiento del proyecto no justifica añadir servicios o complejidad sin una necesidad concreta.

## Criterios de aceptación de la próxima versión

| Área | Criterio que bloquea publicación si falla |
|---|---|
| Primer uso | Guardar la capacidad elegida, verla después de recargar y poder retomarla sin completar otras secciones. Probar acceso directo y repaso opcional. |
| Usuarios actuales | Conservar identidad, registros, propietarios, versiones y fechas; novedades consultables sin volver a hacer la incorporación. |
| Integridad | Un guardado fallido no se anuncia como exitoso. Dos dispositivos no sobrescriben silenciosamente. La pérdida de conexión conserva el borrador visible. |
| Privacidad | Ninguna cuenta ajena accede a registros propios o matrimoniales. Confirmación bilateral para vínculos nuevos y revocación de acceso comprobada. Sin contenido espiritual en métricas o logs. |
| Mes y frecuencias | Revisar el mes anterior no modifica el propósito del nuevo mes. Ausencia de registro no se cuenta como falta. Cambiar frecuencia no recalcula el pasado con una meta distinta. |
| Accesibilidad | Texto y etiquetas legibles sobre sus fondos; formularios operables por teclado; foco visible; mensajes comprensibles; comprobar pantallas móviles y ampliación. El objetivo es WCAG 2.2 AA; queda pendiente una evaluación completa. |
| Rendimiento | Medir apertura y guardado con un teléfono y una conexión representativos del piloto, anotar condiciones y resultados. Corregir bloqueos perceptibles. No establecer afirmaciones de rapidez sin medición. |
| Recuperación | Respaldar antes de cambios destructivos, ensayar restauración y documentar qué versión del cliente es compatible con cada migración. Revertir interfaz no equivale a restaurar base de datos. |
| Contenido | Matriz metodológica resuelta, referencias oficiales cotejadas y revisión registrada sobre el contenido exacto. Noticias y planes de Costa Rica identificados por fuente y fecha. |

## Proceso de publicación y respuesta

1. Preparar una versión candidata en desarrollo, con sus diferencias y riesgos documentados.
2. Ejecutar comprobación de tipos, pruebas pertinentes y compilación reproducible con el lockfile. Investigar vulnerabilidades relevantes; no aplicar actualizaciones forzadas sin analizar compatibilidad.
3. Probar manualmente los recorridos y dispositivos afectados. Registrar observaciones, no solo «probado».
4. Cerrar revisión técnica y metodológica. No inventar un revisor independiente cuando no lo haya. Para cambios de autenticación, aislamiento o migración, obtener una revisión adicional antes de ampliar el piloto.
5. Preparar respaldo, restauración, compatibilidad y comunicación de novedades. Verificar que solo la rama de producción pueda desplegar.
6. Publicar la versión autorizada, comprobar apertura y una operación sintética de extremo a extremo, observar errores y revertir o corregir si falla un criterio crítico.

Para el reinicio individual autorizado: identificar una sola cuenta, respaldar sus registros personales, preservar acceso e historia compartida, impedir guardados desde una pantalla anterior al reinicio y verificar que los demás usuarios no cambiaron. No basta con borrar filas.

## Estado real al preparar esta revisión

- El proyecto ya cuenta con tipos TypeScript, build Vite, pruebas de autenticación/aislamiento/migración, conflictos de versión, fechas, reportes y varios recorridos de interfaz.
- Las pruebas existentes y la compilación pasaron en esta sesión. Se comprobó también que el nuevo control metodológico rechaza una revisión pendiente y contenido cambiado o añadido después de una aprobación simulada.
- El nuevo control es una comprobación de evidencia registrada; no evalúa doctrina ni reemplaza a los revisores.
- Siguen pendientes la integración completa del recorrido aprobado, pruebas de extremo a extremo sobre esa integración, restauración ensayada del reinicio, auditoría completa WCAG/ASVS y cierre de revisión documental de Schoenstatt.
- La sección Costa Rica tiene estructura y enlaces; sus reseñas, noticias seleccionadas y planes requieren verificación de las publicaciones originales.
- La compilación informa un bloque JavaScript superior a 500 kB. Debe medirse su impacto y evaluar carga por secciones en la integración; no se ocultará la advertencia para simular mejor rendimiento.

El objetivo de calidad se demuestra mediante estos resultados y sus correcciones, no mediante la etiqueta «primer mundo» ni una garantía absoluta.

## Evidencia de la primera integración del recorrido

La suite completa pasó con datos sintéticos. Las pruebas añadidas verifican: persistencia de la capacidad elegida; guardado fallido sin navegación de éxito; revisión del mes anterior sin alterar el propósito actual; continuación como borrador; metas semanales sin compensación entre períodos; meses bisiestos; semanas parciales; cambios de meta y pausas con vigencia; migración conservando filas, propietarios, versiones y fechas previas; rechazo de frecuencia inválida y de escrituras directas del historial; conflictos entre versiones; preferencias privadas y acceso de pareja condicionado al permiso de horario. Los roles anónimo, ajeno y de métricas no obtienen contenido personal.

Se ejecutaron `npm test`, `npm run typecheck` y `npm run build`. La compilación conserva la advertencia de un bloque superior a 500 kB. Estas pruebas usan PGlite y JSDOM; no sustituyen la prueba de navegador y dispositivo, los asesores de seguridad de Supabase ni un ensayo de restauración. La revisión metodológica permanece pendiente deliberadamente.

### Compatibilidad y publicación futura

La migración `20260912041345_guided_schedule.sql` debe aplicarse y verificarse antes de activar el cliente nuevo. El cliente anterior puede seguir guardando compromisos después de migrar: el servidor conserva su frecuencia aunque ese cliente no la envíe. El historial lo genera el servidor en la misma transacción del compromiso. No se trasladan registros entre propietarios ni se amplían los permisos de notas; el historial de frecuencias forma parte del permiso existente de horario.

Antes de producción: respaldo y ensayo de restauración; aplicar en preproducción, revisar los asesores de seguridad y probar clientes anterior/nuevo; inspección móvil y aprobación de contenido; luego publicación autorizada y comprobación sintética. Volver al cliente anterior no exige borrar el historial añadido. Una reversión de base de datos requiere un procedimiento ensayado y preservar los registros nuevos; no eliminar tablas o filas como atajo. El reinicio individual requiere además protección contra escrituras desde sesiones anteriores y permanece pendiente.

## Evidencia de vinculación bilateral

La segunda integración añade pruebas de migración y autorización para uso individual, invitaciones y archivos de parejas anteriores; confirma acuerdo sobre la misma revisión del ideal matrimonial y bloquea escrituras con un contexto de relación anterior. Ver [evidencia y límites](BILATERAL_PAIRING.md). La suite completa, tipos y build pasaron. Los intentos de revisión visual y asesores locales quedaron bloqueados por acceso al servidor local y ausencia de una instancia Supabase, respectivamente; no se cuentan como verificaciones aprobadas. El ensayo de concurrencia con conexiones independientes y el reinicio de cuenta siguen pendientes.
