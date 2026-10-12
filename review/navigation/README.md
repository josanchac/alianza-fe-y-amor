# Revisión visual — navegación, regreso y edición

## Aprobación del 11 de octubre, 21:35 (Costa Rica)

El usuario aprobó los tres patrones: navegación compacta, historial/regreso y edición/teclado. Solicitó suavizar la transición del logo y evitar la línea divisoria permanente en los primeros dos. Ajuste: aparición progresiva durante 64 px de desplazamiento, escala muy leve, sin borde; sombra tenue del regreso solo cuando pasa contenido por debajo. Se conserva la edición aprobada. Movimiento reducido presenta estados sin escala ni transición. La aprobación no implica que la migración transversal a producción esté terminada.

Propuesta aislada de la app del piloto. `NavigationExperience` solo es importado por `review/runtime/main.tsx`; no por `github/main.tsx`. No utiliza el transporte de Journal, Supabase ni registros del piloto. Cambios de ejemplo en memoria, reiniciados al recargar. Reutiliza `HabitFields`, `SymbolProgress`, etiquetas de frecuencia y adaptación al viewport visual.

## Accesos

- `?scenario=experience`: navegación y contexto compactos.
- `?scenario=experience&view=history`: 24 rosarios ficticios; abrir uno tras desplazarse y volver.
- `?scenario=experience&view=form`: editar compromiso directamente, sin recorrer pasos anteriores.
- `?scenario=experience&volume=50`: volumen alto.
- `?scenario=litany`: conserva la revisión anterior aprobada de letanías.
- `?scenario=legacy`: Journal anterior con datos ficticios para contraste.

La vista principal de Sites abre esta propuesta. Pareja y Cursos son muestras de cambio de contexto, explícitamente identificadas; no implementan sus servicios. Mi mes/Mi recorrido solo muestran accesos representativos, no reemplazan los flujos completos del piloto. El menú de escenarios está fuera de la app y se despliega desde «Prueba visual · 3 recorridos».

## Qué se prueba

1. Reconocimiento de los tres espacios visibles; diferencia con navegación local y fecha; marca compacta sin desplazar el contenido.
2. Regreso identificable y persistente sin título dentro de la barra. Historial compacto, retorno a posición y foco de origen; navegación inferior conservada fuera de la tarea de edición.
3. Formulario de tarea con cabecera, un cuerpo desplazable y pie Guardar, ajustados al viewport visual. Sin foco automático en un input al abrir. Cancelar cambios requiere confirmación del navegador. Guardar es local al ejemplo, no una confirmación del backend.

Conservados: acceso rápido a letanías anteriores, campos de compromiso existentes, símbolo de avance diario y deshacer un registro accidental desde opciones. Las pruebas de conteos están aisladas por día.

## Verificación

`node --import tsx tests/navigation-experience.mjs` comprueba navegación, espacios, conteos/deshacer/fechas, 24 registros, posición/foco al regresar, guardado/cancelación, acceso directo a escenarios, 50 compromisos y contratos de CSS para movimiento reducido/viewport.

El tipado y la compilación son comprobaciones adicionales. Los tests DOM no validan geometría real, animación, teclado del teléfono, texto ampliado ni accesibilidad completa. Falta revisión humana móvil antes de aplicar estos patrones transversalmente.

No se modifican contenido litúrgico, servicios del piloto, versión publicada, permisos ni base de datos. La auditoría integral permanece en `docs/UX_NAVIGATION_MOTION_AUDIT_20261012.md`; esto es su primer control visual, no el paquete terminado.
