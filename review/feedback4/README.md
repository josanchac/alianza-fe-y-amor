# Feedback 4 · comparativo móvil para revisión

Seguimiento único #20/#28 en el plan #13. Prototipo aislado, sin producto ni datos reales.
No equivale a aprobación visual ni a publicación.

## Qué compara

Dos tareas: configurar un compromiso mensual y revisar un compromiso de septiembre.
La izquierda reutiliza HabitFields/CommitmentReviewFields, Dialog y CSS actuales
de 0.4.0-alpha.2, con la estructura del editor de Journal reconstruida para el
ensayo. No es una captura de la sesión del piloto ni una reproducción del sistema operativo.
La derecha propone superficie completa móvil, Cerrar visible, cuerpo desplazable,
acciones fijas, secciones separadas, unidades junto a cantidad y opciones de valoración
visibles. Los campos de texto opcionales conservan sus dos valores independientes.

«Recordatorio escrito» corresponde a anchor, que se muestra bajo el compromiso en Hoy;
«Nota personal» corresponde a minimum, que se consulta desplegando la anotación de apoyo.
Ninguno configura una notificación. No se cambia significado ni se eliminan campos.

Los desplegables se conservan donde ayudan a elegir frecuencias; no se reemplazan
todos por chips. La propuesta muestra el patrón de frecuencia día/semana/mes:
su implementación deberá conservar días específicos y recorridos temporales existentes.
El próximo paso conserva las tres opciones y su efecto actual: guardar la elección
no cambia el compromiso; el recorrido completo de preparar mes corresponde a #29.

## Ejecutar y generar archivo

```sh
npx vite --config vite.feedback4-review.config.ts
node --import tsx review/feedback4/interaction-test.mjs
npx vite build --config vite.feedback4-review.config.ts
node review/feedback4/package-preview.mjs /ruta/alianza-feedback4-formularios.html
```

Abrir el HTML descargado en un navegador. No requiere cuenta o conexión; las
operaciones son simuladas y se reinician al recargar. El selector de tarea/estado
es herramienta de revisión, no navegación propuesta para el producto.

## Estados y cobertura

Revisión: vacío, parcial, completo, error/reintento y nota larga ficticia (~3000 caracteres).
Compromiso: cantidad editable/validación, opciones, atrás, cerrar y guardado simulado;
los estados de contenido se concentran en la revisión, no representan todos los
campos de todos los formularios. Conservación ante descarte cancelado y regreso del
foco al origen comprobados en JSDOM. Tipos y compilación aprobados.

Se ofrecen anchos 320/390/430, texto base 16/32 px (simulación de ampliación, no zoom
del sistema) y altura 420 px (espacio disponible reducido, no teclado real).
Estos controles permiten revisión; **su resultado visual no se ha validado**.
El navegador remoto bloqueó localhost y file; la descarga local de Chromium no
produjo un archivo válido. Se detuvo la revisión de navegador, sin eludir restricciones.
No hay screenshots reales ni mediciones geométricas acreditadas. Safari/PWA,
teclado, safe areas, VoiceOver y toda la app con alto volumen siguen pendientes.

## Criterios para la revisión conjunta

| Observación / fuente | Propuesta | Beneficio y costo |
| --- | --- | --- |
| Feedback: salir del popup no es claro; Journal oculta el cierre superior y deja Cerrar abajo | Cerrar visible arriba y confirmación solo si hay cambios reales | Salida reconocible; ocupa una franja fija. |
| Feedback: teclado recorta formulario | Foco inicial en título, cuerpo separado de controles | Evita abrir teclado por defecto; necesita toque para empezar a escribir. |
| Feedback: Guardar se parte y acciones se pegan | Dos acciones inferiores como máximo; Cerrar arriba | Más ancho por botón; revisión de distribución a 200% aún necesaria. |
| Feedback: 01 y unidad ambigua | Texto numérico normalizado al salir + unidad contextual | Permite borrar y corregir; validar límites según frecuencia al implementar. |
| Feedback: valoración y próximo paso densos | Opciones visibles y secciones; detalle opcional | Más altura por elección, menos opciones ocultas; no todo se despliega de entrada. |
| Feedback: no se entiende recordatorio/anotación | Dos campos identificados y aclaración corta | Preserva datos e intención; todavía debe comprobarse comprensión con usuario. |

Marco consultado (04/10/2026), aplicado como criterios de diseño, sin certificación:
- Apple HIG Modality: salida explícita de la tarea modal.
  https://developer.apple.com/design/human-interface-guidelines/modality
- NN/g, Progressive Disclosure: detalle opcional accesible a demanda.
  https://www.nngroup.com/articles/progressive-disclosure/
- W3C, WCAG 2.2, Focus Not Obscured: el foco no debe quedar totalmente oculto
  por contenido de la interfaz; no equivale a que un footer fijo cumpla por sí solo.
  https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html

La auditoría transversal de #20 sigue abierta. Este lote cubre dos formularios;
no acredita auditoría completa de Hoy, Pareja, Curso, Misa, Rosario o administración.
Cambios de interfaz en app/ requieren la revisión acordada en
docs/EXPERIENCE_REVIEW_GATE.md; aprobar este patrón no aprueba el lanzamiento.
