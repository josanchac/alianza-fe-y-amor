# Revisión integrada en navegador — 20/09/2026

## Alcance y evidencia

Se logró abrir el mismo paquete estático de la prueba privada mediante la vista supervisada de Sites, sin navegar al sitio publicado desde el navegador cloud. Chromium, viewport observado 1363 × 936 CSS px. Datos ficticios. No se usaron cuentas del piloto.

| Recorrido / observación | Resultado |
|---|---|
| Compromisos | Vista legible en captura de escritorio, ancho de documento 1348 px frente a viewport 1363; sin desbordamiento horizontal. |
| Lápices | Tres botones de edición medidos: 44 × 44 px, sin texto visible, con nombre accesible por compromiso. |
| Editar Ejercicio | Menú y formulario abren; checkbox de repetición marcado y meta 2 preservados; cerrar sin cambios funciona. |
| Hoy → Oración | Posición observada antes 620 px; después 0 px. |
| Oración → Misa | Selector de sábado/domingo y secciones accesibles. Biblioteca vacía muestra aviso, sin lecturas inventadas. |
| Palabra → Ritos finales | Palabra abierta a 24.41 px del borde superior; luego cerrada y Ritos finales abierto a 23.58 px. |
| Misa → Oración | Retorno a scrollY 0. |
| Preparar rosario | Acceso, misterio sugerido y campo de intención visibles. No se comenzó un rosario: su backend no está simulado por esta prueba. |

## Problema encontrado y corrección acotada

Abrir Oración dejó inicialmente la página en blanco: `crypto.randomUUID` no está disponible en el contexto HTTP de la vista supervisada. Se añadió `review/runtime/preview-crypto.ts`, exclusivamente importado por la entrada de prueba, con UUID v4 a partir de `crypto.getRandomValues` cuando falta el método nativo. No se cambió la entrada de producción ni se usó aleatoriedad débil. Tras recompilar, Oración, Misa y preparación de rosario abrieron correctamente. Tipado y compilación de prueba pasaron.

Esto demuestra un fallo de compatibilidad de la prueba HTTP; no se afirma que ocurriera en el piloto HTTPS. Los mensajes de extensión del navegador se distinguieron del error de la app.

## Límites

No se midieron todavía 320/390/768 px, Safari/iPhone, contraste completo ni teclado. Los atajos de zoom intentados no cambiaron el viewport; no se cuentan como prueba de ampliación al 200 %. La revisión del propietario ya registrada sigue siendo aprobación de experiencia, no estudio de usabilidad con participantes.

## Hallazgo documental adicional de Misa

MISA-THU-01, pendiente: `massSections('thursday')` termina siempre con traslado/adoración. La [orientación oficial de USCCB sobre la Cena del Señor, referencia a rúbrica 44](https://www.usccb.org/prayer-and-worship/liturgical-year-and-calendar/triduum/roman-missal-and-the-evening-mass-of-the-lords-supper) contempla el cierre habitual si no habrá celebración de la Pasión en esa iglesia. Debe representar esa alternativa antes de declarar completa la guía. No se alteró el diseño aprobado; queda para dummy y revisión de la variante. La misma fuente respalda la omisión del Credo y el lugar de la oración después de la comunión, ya presentes en el esquema. No acredita permisos ni calendario costarricense.

Las páginas adicionales de Vigilia y Viernes Santo enlazadas por USCCB devolvieron 403; no se declaran consultadas ni verificadas. El cotejo documental integral sigue pendiente.
