# Historial de versiones de Alianza

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
