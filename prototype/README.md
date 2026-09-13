# Prueba del recorrido de Alianza

Prototipo separado de la aplicación en uso. Solo datos sintéticos en memoria. Ninguna petición de red, almacenamiento persistente, autenticación ni envío de correo. Elegir un escenario reinicia los datos de ejemplo; cambiar la cuenta de prueba permite revisar las dos perspectivas de una vinculación.

## Abrir

Con las dependencias del proyecto instaladas, desde la raíz:

```sh
node prototype/build.mjs
```

Abrir `prototype/dist/alianza-prototipo.html`. El archivo generado incluye código, estilos y logo. No necesita conexión. El script también genera `/workspace/alianza-recorrido-contraste.html` para la vista de revisión en conversación; esa ruta puede ajustarse al ejecutar en otro entorno.

## Qué probar

- Primera visita: elegir capacidad, completar algo útil, guardar y encontrarlo al volver.
- Usuario actual: comprender qué cambió, cerrar el aviso y volver a consultar Novedades.
- Mi mes: revisar agosto y preparar septiembre en registros distintos; consultar notas de dificultades.
- Frecuencia: ejercicio tres días por semana; registrar un cuarto día sin alterar la meta.
- Invitación: cambiar a la cuenta de Luis, aceptar y comprobar que los permisos personales continúan apagados.
- Pareja sin ideal: usar las cuatro Rs y explorar el ideal solo si lo desean.
- Ideal matrimonial: escribir una frase, confirmar desde la otra cuenta y comprobar que editarla requiere nuevas confirmaciones.
- Continuidad: indicar que resulta llevadero, que cuesta o que se prefiere continuar igual.

## Comprobación realizada

TypeScript sin errores. Build normal de la aplicación sin errores. Pruebas de navegador del prototipo: diez grupos pasados (primer valor, personalización, meses separados, frecuencia semanal, vinculación, ideal bilateral, archivo al desvincular, sugerencias, novedades y compatibilidad visual). Sin errores JavaScript ni solicitudes externas. Sin desbordamiento horizontal en 320, 390 y 768 px. Inspección visual de entrada y revisión mensual; logo vectorial renderizado e inspeccionado.

Estos resultados prueban el comportamiento del prototipo con datos ficticios. No certifican permisos de Supabase ni sustituyen la validación con personas. El prototipo no se importa desde la aplicación y no cambia su publicación.

### Corrección de contraste

La captura de prueba en iPhone reveló títulos y etiquetas claros sobre superficies claras. Se reprodujo inyectando estilos de texto del anfitrión en modo oscuro: los elementos sin color propio tomaban el color del anfitrión, pese al color del contenedor. Se corrigió la cascada de texto dentro del prototipo, el color de placeholders y controles deshabilitados, y se dio superficie propia a los selectores de prueba. Verificación con estilos del anfitrión en claro/oscuro: 632 instancias de texto y placeholders, contraste mínimo 5.02:1 y ningún fallo bajo 4.5:1. También se verificó el título dentro del envoltorio real de la vista en conversación. Inspección visual del formulario afectado en 390 px. Esto no constituye una auditoría integral de accesibilidad ni una prueba en Safari físico.

## Logo

`alianza-emblema.svg` traza la geometría de `public/emblem.png`, con dos colores y fondo transparente. No contiene una imagen raster incrustada. Los originales permanecen intactos. `trace-logo.py` permite reproducir el trazado con Pillow y vtracer 0.6.15.

El diagnóstico, recorrido, propuesta de modelo de datos, reglas de privacidad, comunicación y guion de prueba están en `docs/JOURNEY_REVIEW.md`.
