# Evaluación del alcance ampliado — 19 septiembre 2026

## Método y límites

Primero se ejecutó una línea base antes de modificar el producto. Son escenarios técnicos con datos ficticios y revisión de tareas; no usuarios reales ni simulación de capacidad visual, edad o comprensión. No se asigna un SUS ni porcentaje de usabilidad. Los nombres de perfiles describen necesidades, no capacidades atribuidas a una edad.

Línea base: 14 controles funcionales, 5 cumplidos y 9 brechas. Después de corregir: 14/14 controles cumplidos en JSDOM. La geometría visual, ampliación, lector de pantalla y tacto siguen pendientes de validación con navegador y dispositivos. La última conexión del navegador no respondió; no se sustituye con una afirmación de conformidad.

| Necesidad / tarea | Antes | Después |
|---|---|---|
| Primera vez: comenzar sin ideal ni pareja | Pasa | Pasa |
| Interrupción: conservar borrador tras fallo | Pasa | Pasa |
| Corregir una marca accidental | Pasa | Pasa |
| Orientarse al cambiar de sección | Falta reinicio de scroll | Pasa |
| Sin conexión: no aparentar guardado | Pasa | Pasa |
| Enviar solicitud de símbolo | Solo copia | Envío y estado |
| Elegir rayo | Ausente | Disponible |
| Buscar entre 24 participantes | Ausente | Pasa |
| Filtrar invitaciones vencidas | Ausente | Pasa |
| Administrar solicitudes | Ausente | Bandeja |
| Comparar períodos equivalentes | Ausente | Semanas completas |
| Entender poblaciones de métricas | Avisos mezclados | Medición general separada |
| Respuesta antigua después de denegación | Restaura listado | Descartada |
| Invitación cancelada con sesión | Acceso bloqueado | Acceso bloqueado |

## Mejoras descubiertas y aplicadas

- La restauración tardía del listado requería invalidar respuestas antiguas, además de comprobar permisos de servidor.
- «Cuentas registradas» representaba personas con métricas habilitadas. Se corrige la etiqueta y se mantiene la administración de cuentas separada.
- Activos en 7 y 30 días no son una tendencia comparable. El pulso agrupa semanas completas en Costa Rica, excluye la actual y marca cobertura incompleta.
- Los datos incluyen únicamente personas actualmente habilitadas que aportan métricas; cambios de población pueden afectar la comparación. No se atribuye causalidad.
- La solicitud comparte únicamente el mensaje escrito expresamente y correo, con aviso previo. Nunca extrae ideales, símbolos privados ni diarios automáticamente. Reintentos conservan identificador para no duplicar; límites y versiones se comprueban en servidor.
- El rayo se agrega al catálogo y validación; no se cambia el símbolo de Silvia ni se fabrica una solicitud a su nombre.
- Encabezados se redistribuyen; instrucciones secundarias se despliegan; contraseña pasa a Ajustes; se eliminan reservas inferiores duplicadas.

## Siguiente validación de experiencia humana

Personas nuevas, recurrentes, con poca experiencia digital, con texto ampliado, con interrupciones, vinculadas y administradoras. Tareas: aceptar invitación, instalar, crear/marcar/corregir compromiso, consultar mes, retomar rosario, vincular con consentimiento, solicitar símbolo, renovar invitación, interpretar tendencia y decidir qué investigar.

Registrar éxito sin ayuda, tiempo, errores, retrocesos y facilidad percibida; reportar muestra y tareas. Usar WCAG 2.2 AA como base: reflujo a 320 CSS px, texto al 200%, contraste, teclado y foco, controles táctiles y anuncios de estado. Las pruebas unitarias no certifican estos criterios. Referencias: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html ; https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html ; https://www.nngroup.com/articles/usability-metrics/

## Verificación y publicación

Pruebas nuevas: expanded-journeys-audit.mjs, pilot-support-db.mjs y pilot-support-ui.mjs. Se amplía el ensayo de conservación de registros y la integración de Auth/PostgREST desechable en CI. La publicación continúa condicionada a las pruebas automatizadas. No se considera terminada la revisión visual en dispositivos.

## Alcance documental

Cambios de producto, administración y privacidad; no se modifican oraciones, enseñanzas, guías ni atribuciones pastorales.
