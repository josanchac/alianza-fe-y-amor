# Historial de versiones de Alianza

## 0.2.0-alpha.9 — 2026-09-17 (preparada para publicación)

- Una sola vista para compromisos diarios, semanales y mensuales, con cadencia y significado de la marca visibles.
- Ofrecimiento por la mañana, meditación durante el día y agradecimiento por la noche; todos opcionales.
- Oraciones privadas del ideal personal, ideal matrimonial, Santuario Hogar y Alianza, visibles solo si fueron escritas.
- «Mi recorrido» abre con un resumen breve y deja detalles y reflexiones plegados.
- Vinculación por correo exacto corregida, conservando solicitud y aceptación bilateral.
- Métricas agregadas del piloto cercano automáticas para sus cuentas autorizadas, sin ocultar resultados ni capturar contenido privado.
- Evidencia y límites: docs/RELEASE_0.2.0-alpha.9.md.

## 0.2.0-alpha.8 — 2026-09-16 (preparada, no publicada)

- Panel «Piloto cercano»: actividad y errores visibles desde un participante que acepte esta medición.
- Activos en 7/30 días y uso por función, sin nombres, correos ni textos privados.
- Participación explícita independiente del consentimiento general; al retirarla se eliminan sus eventos del piloto.
- Umbral general de cinco participantes conservado. No se reconstruye el pasado ni se interpreta cumplimiento espiritual.
- Evidencia: docs/RELEASE_0.2.0-alpha.8.md.

## 0.2.0-alpha.7 — 2026-09-16 (preparada, no publicada)

- Avances independientes de día, semana y mes, con símbolos compactos y tonos suaves.
- Las metas semanales y mensuales no reducen el avance diario; «Hoy no aplicaba» excluye un compromiso diario sin marcarlo cumplido.
- Metas por días distintos o por veces, con varias ocasiones en una fecha y opción de deshacer.
- Agradecimientos y ofrecimientos separados, fechados y conservados literalmente en revisión y reporte seleccionado.
- Migración aditiva preparada y probada localmente. Sin cambios al servicio publicado ni a los datos del piloto.
- Evidencia y límites: docs/RELEASE_0.2.0-alpha.7.md.

## 0.2.0-alpha.6 — 2026-09-15

- Solicitudes de pareja dentro de Alianza, visibles desde cualquier espacio y sin abrir ventanas automáticamente.
- Solicitud pendiente recuperable, enlace para compartir, cancelación y aceptación sin copiar códigos.
- Reconocimiento opcional por nombre al ingresar el correo completo; activado únicamente por su titular.
- Aceptación mutua habilita el espacio de pareja sin activar permisos personales ni modificar otros espacios.
- Los códigos anteriores siguen funcionando. Evidencia y límites: docs/RELEASE_0.2.0-alpha.6.md.

## 0.2.0-alpha.5 — 2026-09-14

- Rezo individual en pantalla dedicada, letra ajustable, avance amplio, pausa protegida y descarte confirmado.
- Pantalla encendida cuando el dispositivo lo permite; continuidad al volver de una interrupción.
- Padre nuestro y tres Avemarías iniciales configurables, con invocaciones Hija, Madre y Esposa como alternativa.
- Letanías opcionales y cierre con compromiso de hoy, marcación automática voluntaria o registro solo por hoy, sin duplicados.
- Evidencia y límites: docs/RELEASE_0.2.0-alpha.5.md.

## 0.2.0-alpha.4 — 2026-09-14

- Publicación controlada de la experiencia aprobada, con aviso de mantenimiento, protección de escrituras antiguas y conservación de borradores durante pausas.
- Procedimiento y límites en docs/RELEASE_0.2.0-alpha.4.md. No se declara beta ni se amplía el acceso.

## 0.2.0-alpha.3 — 2026-09-14

- Eliminado el desplazamiento negativo del componente de ventanas que sobrevivía a la compilación.
- Reproducción del fallo y verificación sobre archivos compilados, incluyendo tamaño móvil y texto ampliado.
- Registro técnico y límites de validación en docs/RELEASE_0.2.0-alpha.3.md.

## 0.2.0-alpha.2 — 2026-09-14

- Logo de cabecera destacado y navegación al inicio del espacio activo.
- Selección de espacios mediante botones accesibles.
- Encuadre compartido de ventanas según el área visible, sin traslaciones acumuladas.
- Ajustes de legibilidad a 320 px y texto ampliado. Evidencia en docs/RELEASE_0.2.0-alpha.2.md.

## 0.1.0-alpha.1 — 2026-09-13

Primera entrega con numeración formal. Alfa privada para el piloto existente. El `1.0.0` anterior de package.json era metadato inicial, no una declaración de versión estable; no se renumeran ni sobrescriben entregas históricas.

### Añadido
- Sugerencia visible de misterios según el día local, conservando la elección libre y los rosarios iniciados.
- Ampliación del emblema SVG al tocar el logo, con cierre por botón o Escape y retorno del foco.
- Versiones y novedades en Mi espacio → Ayuda.
- Cursos, propósitos, encuentros, rosarios compartidos y medición voluntaria agregada de la candidata aprobada.

### Mejorado
- Se corrige que cambiar de personal a pareja al preparar el rosario conservara el ámbito anterior al guardar.
- Entrada directa en Hoy; Oración permanente; tareas de grupo y ajustes separados.
- Examen de conciencia paso a paso, ideal opcional y áreas matrimoniales condicionadas al vínculo.
- Controles y navegación con texto ampliado, correcciones de superposiciones y conservación de borradores.

### Compatibilidad y datos
- Requiere las migraciones community_prayer y aggregate_product_metrics después de voluntary_personalization.
- No borra registros ni vuelve a incorporar a usuarios existentes. El identificador interno community-2026-09 se mantiene compatible con preferencias guardadas.
- El panel anterior de métricas no es compatible con la nueva respuesta agregada; una reversión de cliente debe ocultar su acceso administrativo.

### Verificación
Ver docs/UX_REVIEW_20260913.md y docs/RELEASE_0.1.0-alpha.1.md. Las pruebas sintéticas no sustituyen la validación con personas.

## Entregas previas sin numeración formal
- 2026-09-13: nueva experiencia y personalización del piloto, documentadas en RELEASE_READINESS.md y LIGHT_ENTRY_RELEASE.md.
- 2026-09-13: tres vistas privadas de revisión, previas a la activación de comunidad; no equivalen a versiones del piloto.
- Los commits originales permanecen como registro histórico; no se inventan etiquetas alfa o beta retrospectivas.

## 0.2.0-alpha.1 · 2026-09-14

Espacios independientes; rosario individual guiado y persistente; símbolos de avance; revisión con notas integradas; reporte PDF; identidad del grupo, capital de gracias y permisos por actividad. [Alcance, pruebas y límites](docs/RELEASE_0.2.0-alpha.1.md). Alfa privada; piloto sin modificar.
