# Alianza 0.4.0-alpha.4 · navegación aprobada

Candidata posterior a alpha.3. El propietario aprobó la revisión integrada a las 22:35 del 11/10/2026 Costa Rica y Cursos/reporte a las 22:59; ordenó continuar hacia publicación. Este documento no acredita por sí solo despliegue.

## Cambios

Navegación compacta consistente, regreso visible al desplazar, marca suave sin divisor permanente y símbolo diario de avance conservado. Historial de rosarios en filas compactas con retorno a la posición de origen. Formularios personales/mensuales, de Cursos y reporte para asesor conservan salida y acciones accesibles fuera del contenido desplazable; borradores, errores, versiones y selección privada preservados. Letanías y contenido espiritual sin cambios.

Seguimiento único: #13. Evidencia detallada: NAVIGATION_INTEGRATION_20261012.md. La rama se construye sobre main de437b1; su árbol coincide con la base local alpha.3 usada en las pruebas. No se sobrescribe trabajo de otras sesiones.

## Alcance y compatibilidad

Solo interfaz, pruebas, documentación y número de versión. Cero migraciones de esquema, cambios de API o permisos, ajustes de datos privados y dependencias nuevas. Cliente compatible con servidor alpha.3. Las notas visibles de la aplicación conservan el texto ya aprobado; la versión cambia a alpha.4.

## Verificación y publicación

- Revisión visual del propietario: navegación, movimiento, símbolo, formularios, historial, Cursos y reporte aprobados.
- Tipos, compilaciones, cotejo documental y regresiones locales aprobados antes de preparar la versión; ejecutar gates de CI sobre la candidata exacta antes de merge.
- SQL de producción limitado al registro público de mantenimiento/versión requerida; no migrar ni ejecutar tests con usuarios reales.
- Al publicar: pausa breve mediante el estado existente, merge de PR con head esperado, verificar workflow Pages y HTTP de HTML/JS/CSS/config/emblema/icono. Reabrir con versión requerida alpha.4 solo tras verificación.
- Reversión: restaurar artefacto/commit alpha.3 y required_version alpha.3. No revertir ni restaurar datos, ya que no hay migración.

## Límites conservados

Sin certificación WCAG/ASVS, prueba Android real ni medición nueva de rendimiento. Continúa aviso de bloque JS superior a 500 kB. Respaldo externo #15 diferido expresamente. #31 aceptación de invitaciones de rosario, #34 respuesta del salmo/leccionario CR y extensión general semana/año/ámbitos continúan pendientes. No se atribuye valor espiritual al avance.
