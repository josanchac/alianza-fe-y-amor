# Avance personal persistente · corrección de integración

Actualización posterior: símbolo aprobado por el propietario a las 21:58. El estado técnico y los pendientes posteriores se documentan en `NAVIGATION_INTEGRATION_20261012.md`; el apartado de estado más abajo conserva el corte original de esta corrección.

El 11-oct-2026, José aclaró que la navegación compacta aprobada no debe hacer desaparecer el símbolo que representa el avance de sus compromisos.

## Regla incorporada

- En Mi día, el encabezado persistente conserva el símbolo personal y su llenado real. No se reemplaza por el logo decorativo de Alianza.
- El símbolo se reduce gradualmente mediante transformación, sin cambiar la altura del flujo ni desplazar la lista bajo el dedo.
- Se conserva el botón «Ver mi avance», la imagen personal o anillo elegidos, el detalle por períodos y el cálculo existente. No se suman novenas ni compromisos semanales/mensuales al avance diario.
- Marcar o deshacer actualiza el mismo elemento. Cambiar la fecha consulta su propio avance.
- No hay línea permanente; la sombra aparece discretamente al desplazar. Con movimiento reducido no se aplica la transformación.
- Las otras vistas conservan el patrón de marca/regreso aprobado. No se alteran oraciones ni letanías.

## Comprobación

`npm run test:daily-progress`: elemento persistente, avance 75 → 100 → 75 %, otra fecha, imagen personal, anillo, detalle y ejemplo con 50 compromisos. Se probaron también navegación del prototipo, ritmos, reflexiones, preparación mensual y entrada al rosario. TypeScript y build de revisión correctos.

Límite: JSDOM no renderiza posiciones sticky ni certifica animación/teclado en iPhone. Falta revisar el resultado en dispositivo.

## Estado del paquete mayor

Este cambio se integra en la rama `fix/persistent-back-navigation-20261011`; no es un lanzamiento al piloto. La migración transversal de formularios, vistas secundarias y retorno con contexto sigue incompleta. El cotejo `verify:methodology` detecta correctamente cambios de fuente y queda pendiente de actualizar con evidencia al terminar la integración, no se omite ni se fuerza su aprobación. El primer pase de la suite amplia detectó una expectativa obsoleta del nombre accesible de Volver en administración; se actualizó el test a la etiqueta accesible sin flecha decorativa. No se declara la suite amplia completa ni producción lista.

Seguimiento: mismo paquete de navegación/issue existente, sin crear un backlog paralelo. La publicación privada usa datos ficticios, no modifica registros de usuarios. Producción permanece intacta.
