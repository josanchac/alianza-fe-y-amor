# Evidencia de pruebas de Misa — 19/09/2026

Implementación: `a432bb55ee256dfbb2f62451673a5bee5ef8c795`. Node 24.19.0 en este entorno (CI existente usa Node 22). Sin conexiones a producción.

| Comprobación | Resultado | Alcance |
| --- | --- | --- |
| `npm run typecheck` | PASS, salida 0 | Tipos de toda la aplicación; repetido después de los ajustes de anclaje |
| `npm test` | PASS, salida 0 | Suite existente completa, incluido test inicial de Misa. Bases sintéticas PGlite; no migraciones remotas |
| `npm run test:mass` final | PASS, salida 0 | Incluye el ajuste final de scroll y la prueba adicional de acceso desde Journal sin escrituras |
| `npm run build` final | PASS, salida 0 | Bundle y assets; advertencia de chunk >500 kB, no se optimizó el bundle general |
| `npm run verify:methodology` | **BLOQUEADO, salida 1** | “El contenido actual no coincide con la versión cotejada documentalmente. Volver a revisar los cambios.” No se actualizó el cotejo ni se eludió el control |
| `git diff --check` | PASS | Sin errores de whitespace |
| `tests/mass-browser.mjs` | PASS | Chromium 153.0.8010.0, headless, vista independiente |

La suite completa se ejecutó antes del pequeño ajuste final de reserva inferior y de agregar el caso Journal; después se ejecutaron los tests específicos, typecheck, build y navegador sobre los cambios finales. No se afirma una segunda ejecución integral innecesaria.

Casos de lógica/UI comprobados:

- Hoy en Costa Rica antes/después de medianoche UTC local; febrero inválido, bisiesto y rango.
- Pascua 2024, 2026 y 2027; sábado previo a Ramos, Sábado Santo y variantes de Navidad.
- Viernes Santo sin bloque eucarístico; lavatorio opcional.
- Doce rechazos de contenido: permiso pendiente, alcance incorrecto, vencimiento, calendario pendiente, otro territorio, otra fecha, otro formulario, incompleto, vacío, URL no HTTPS, sin referencia de permiso e IDs repetidos.
- Texto sintético largo completo (inicio y final), cambio entre lecturas sin conservar la anterior, padre abierto, navegación libre y último desplazamiento prevalece.
- Cambio de fecha/Hoy limpia elecciones y contenidos; quick browse cerrado inicialmente y después de elegir.
- Integración Journal → Oración → Misa → Oración sin escrituras.

Casos de navegador comprobados:

- Sin overflow horizontal y botones visibles de al menos 44 × 44 CSS px en 320, 390 y 768 px.
- Colapso largo → corto y cambios rápidos: encabezado elegido a 24 px del borde superior. El texto largo añadido al DOM por la prueba se identifica como sintético; no existe en el producto. No se usó padding fijo de vista previa para simular el resultado.
- Acceso a Navidad desde el desplegable, actualización del selector, cierre del desplegable.
- Teclado Enter/Espacio abre/cierra acordeón.
- Sin overflow a 390 px al aumentar a 200% el tamaño del contenedor; esto **no** equivale a zoom de navegador o tamaño de texto del sistema.
- Sin errores JavaScript ni solicitudes fuera del servidor local durante el recorrido.

No comprobado: Safari/iOS/PWA reales, lector de pantalla, bloqueo/reactivación de pantalla, experiencia de personas mayores, geometría con el shell completo y barras de navegación, uso offline persistente y textos reales licenciados. El ejemplo visual no requiere autenticación. La revisión metodológica global sigue bloqueada y las fuentes locales no están completamente cotejadas.

Evidencia de ejecución transitoria: `test-results/misa-browser.json` y `test-results/misa-mobile.png` (ignorados por Git y regenerables). Los logs completos de esta sesión están en `/workspace/scratch/1e90babeccd1/mass-full-tests.log`, `mass-build-final.log`, `mass-methodology.log`; este documento conserva los resultados para futuras sesiones.
