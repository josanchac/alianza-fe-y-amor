# Historial de versiones de Alianza

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
