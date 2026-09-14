# 0.2.0-alpha.3 — 14 de septiembre de 2026

Corrección del desplazamiento de ventanas en el resultado publicado.

## Causa y corrección

En alpha.2 la compilación transformó translate:none y transform:none en transform:translate(0), mientras las clases del componente seguían aplicando translate:-50% -50%. Las comprobaciones anteriores sobre CSS de desarrollo no detectaban este resultado. Se eliminaron las clases de traslación y centrado del componente compartido: el posicionamiento pertenece exclusivamente a las reglas de la aplicación. Se conservan Radix, foco, cierre y semántica.

## Evidencia

- Reproducción con los archivos compilados anteriores: Mis espacios presentó top=-271.99 px y translate=-50% -50% en Chromium.
- Archivos compilados corregidos: a 390 px, ventana en x=8, y=8 y translate=none, dentro del marco.
- Comprobación adicional a 320 px con texto al 200%; límites del diálogo y ausencia de desbordamiento horizontal.
- TypeScript y ocho recorridos simulados aprobados.

No es una prueba en Safari físico. La confirmación del usuario en iPhone sigue pendiente. Sin cambios de datos, permisos, audiencia o piloto.
