# Revisión adaptable de la versión aprobada

Fecha: 20/09/2026. Chromium supervisado con tres iframes del mismo origen y la app real compilada con datos ficticios. Harness reproducible: `review/runtime/layout-check.html`, servido junto a la entrada de prueba. No modifica el viewport mediante JavaScript ni simula Safari, teclado móvil o barras del sistema.

## Mediciones

| Ancho de iframe (CSS px) | Ancho útil / scrollWidth en compromisos | Ancho útil / scrollWidth en Misa | Lápices | Encabezado Palabra abierto |
|---|---|---|---|---|
| 320 | 305 / 305 | 305 / 305 | 44 × 44 | top 24.19 px; alto 50.39 px |
| 390 | 375 / 375 | 375 / 375 | 44 × 44 | top 23.59 px; alto 50.39 px |
| 768 | 753 / 753 | 753 / 753 | 44 × 44 | top 23.58 px; alto 50.39 px |

La diferencia de 15 px corresponde al espacio de la barra de desplazamiento del navegador. No hubo desbordamiento horizontal en los estados medidos. Son mediciones del DOM renderizado, no assertions de CSS ni pantallas de dispositivos físicos.

## Recorridos verificados

- Editar Ejercicio a 320 px: el menú abre y el diálogo queda entre x=8 y x=297 (ancho 289). Captura revisada: texto y opciones legibles; frecuencia se distribuye en varias líneas; formulario desplazable, sin corte horizontal. Cerrar sin cambios funciona.
- Hoy → Oración → Misa → Misa del domingo en los tres anchos. Guía y aviso de biblioteca pendiente visibles. Abrir Palabra conserva el posicionamiento esperado.
- A 320 px, agregar una segunda vez a Ejercicio completa los dos compromisos diarios; agregar una tercera muestra +1 adicional sin superar 2/2. Deshacer último conserva 2/2; la meta mensual de rosario permanece en 2.
- No se modificó la apariencia aprobada ni se añadieron funcionalidades a producción.

## Pendientes, sin certificación implícita

La suite completa `npm test` volvió a ejecutarse sobre el código aprobado actual (base `35db111`) y terminó con código 0. Incluye migraciones en bases desechables y pruebas de invitaciones/pareja/administración con fixtures; no equivale a una prueba contra Supabase remoto. Log temporal: `/tmp/alianza-approved-final-regression.log`.

Safari/iPhone real, teclado virtual, ampliación global 200 %, lector de pantalla, contraste completo, formularios con textos largos y los contextos de pareja/grupos/administración. Este resultado cubre los estados indicados, no todas las 75 acciones ni todo el producto. No hubo pruebas observadas con participantes del piloto.
