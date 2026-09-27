# Auditoría visual de Alianza — 26 septiembre 2026

Estado: diagnóstico de código y patrones, propuesta de diseño. No es una certificación visual ni una auditoría completa en dispositivos. No se modificó producción. Aprobaciones previas del rosario y cierre mensual se conservan.

## Regla transversal propuesta por el usuario
Toda experiencia nueva o modificada debe aplicar la identidad serena aprobada del rosario y una familia compartida de componentes. Revisar jerarquía, densidad, interacción y adaptación por dispositivo; cambiar radios de botones por sí solo no resuelve la experiencia. HTML semántico es apropiado y se conserva. No copiar indiscriminadamente la apariencia de iOS a Android.

- Acciones de ancho según contenido, con variantes primaria, secundaria, discreta y destructiva. Una acción dominante por tarea.
- Botones, selección y navegación son funciones distintas; su apariencia y estados deben diferenciarlas.
- Áreas cómodas de interacción, foco visible, nombres accesibles y texto legible. Validar tamaño calculado; no inferir accesibilidad del CSS aislado.
- Formularios con campos pertinentes y opciones adicionales bajo demanda. No reemplazar selectores nativos útiles solo por estética.
- Móvil: tarea primero, consulta opcional. Escritorio: dos paneles cuando consultar y escribir simultáneamente ayuda.
- Estado de carga, error, vacío, selección parcial, guardado y recuperación forman parte del diseño.
- Usar tokens compartidos de color, texto, espacio, radio y movimiento; no añadir otra capa global de correcciones CSS.
- Mantener navegación Hoy / Oración / Mi espacio y la identidad gráfica aprobada; evitar rediseñar a la vez todos los recorridos frente al usuario.

## Hallazgos verificados y acciones

| Prioridad | Evidencia | Problema o riesgo | Acción propuesta |
|---|---|---|---|
| Alta | components/ui/button.tsx; app/approved-experience.css; app/mass.css; app/globals.css | Conviven variantes del componente Button con estilos action-button, primary, soft-button y botones específicos | Consolidar contrato visual y estados, migrar familias de controles; no reemplazo global ciego |
| Alta | app/renewal.css usa múltiples !important en diálogos y dimensiones | Cambios locales pueden quedar anulados; layout móvil condicionado por correcciones globales | Estabilizar AppPanel/Dialog con variantes de lectura y edición, validar teclado y contenido largo |
| Alta | app/reflection-summary.tsx muestra varios grupos y expansión global; app/month-review.tsx mezcla propósito, registros y revisión | Consulta crece antes de llegar a la tarea | Aplicar cierre aprobado: móvil preguntas primero; escritorio consulta izquierda, escritura derecha; categorías con paginación |
| Alta | app/habit-fields.tsx mezcla frecuencia, duración y repetición; curso solo start/days | Falta expresar duración no consecutiva | Separar duración y calendario. Requiere revisar dominio/persistencia antes de implementar; no basta cambiar etiquetas |
| Alta | app/mass.css y app/mass.tsx tienen controles y acordeones propios, estados de texto pendiente | Jerarquía y estilo distintos al sistema general | Lecturas primero, fecha visible, guía secundaria, eliminar relleno y verificar contenido real |
| Alta | app/personal-rosary.tsx contiene preferencias en el paso inicial y estilos propios | Experiencia no coincide aún con diseño cerrado | Integrar diseño aprobado y configuración recordada; entrada directa al rezo |
| Media | app/renewal.css .group-actions > * flex:1; globals.css .schedule-nav button flex:1 | Acciones se estiran por reglas de layout | Usar ancho por contenido; conservar ancho completo solo cuando tenga propósito de interacción |
| Media | app/choice-chips.tsx, globals.css .choice-chips, otros selectores propios | Múltiples representaciones de selección | Familia coherente para selección única, múltiple y todos/parcial/ninguno |
| Media | app/app-panel.tsx añade descripción genérica cuando no hay hint | Texto repetido ocupa espacio sin orientar | Eliminar relleno visual; mantener descripción accesible pertinente cuando sea necesaria |
| Media | app/journal.tsx y groups-workspace.tsx tienen editores y acciones propios | Formularios y permisos extensos requieren revisión contextual | Opciones progresivas, guardar/cancelar consistentes y recuperación de decisiones |

## Cobertura de la auditoría visual pendiente

Revisar por familias, con una pantalla representativa y las excepciones; no aprobar cada botón por separado.

1. Acceso, invitaciones, instalación y primer ingreso: github/main.tsx, password/invitations, start-guide, install-guide.
2. Hoy y compromisos: home, journal, habit-fields, quiet-progress, rhythm-progress, commitment-review.
3. Mi espacio: my-path, month-review, reflection-summary, spaces, symbol-picker, personal-symbol.
4. Oración: mass, personal-rosary, confession-guide, formation-guide, use-prayer-screen.
5. Pareja: pairing, pairing-requests y áreas matrimoniales de journal.
6. Curso/comunidad: community, groups-workspace, invitaciones, permisos y rechazos recuperables.
7. Apoyo: reports, pilot-support, donation, movement-costa-rica, logo-viewer.

Criterios de evaluación por recorrido: acción inicial reconocible; información relevante antes de scroll innecesario; controles táctiles; navegación y retorno; texto largo y vacío; carga/error/offline; teclado/foco; 320–430px y escritorio amplio. Todavía no se ha realizado esta inspección renderizada en todas las rutas.

## Eficiencia y orden

A. Acordar familia de botones, selección, campos y paneles en preparar mes (prototipo actual).
B. Aplicar el sistema a recorridos de la publicación acordada, conservando aprobaciones anteriores.
C. Revisar regresiones en todas las familias inventariadas, priorizando móvil y luego desktop.
D. Registrar problemas residuales por impacto, alcance y esfuerzo. Solo declarar terminada la auditoría al revisar pantallas renderizadas y estados relevantes.

No convertir la auditoría en requisito de rediseñar toda la aplicación para esta publicación. Las fallas que bloquean tareas o privacidad sí son impedimentos; mejoras cosméticas independientes pueden entrar en el siguiente ciclo.

## Preparar mes: ajuste en prototipo

- Casilla Todos con estados marcado, parcial y desmarcado. Actúa solo sobre compromisos a trasladar, conserva datos e historial.
- Por un tiempo: cantidad de días + fecha inicial + consecutivos o días de semana elegidos. Ejemplo: 10 días contando lunes, miércoles y viernes; no 10 días calendario.
- Los días no programados no son incumplimientos. La definición de qué ocurre ante un día omitido debe quedar explícita al implementar; el prototipo no reinicia ni extiende automáticamente.
- Novena en curso conserva su progreso; no se convierte automáticamente en compromiso flexible.
- Prototipo /workspace/alianza-preparar-mes-flexible.html: datos ficticios, sin persistencia. Verificados selección total/parcial/vacía, edición de días y resumen.

## Referencias

- Apple HIG Buttons: https://developer.apple.com/design/human-interface-guidelines/buttons
- Apple HIG Layout: https://developer.apple.com/design/human-interface-guidelines/layout
- Material 3 Foundations / tokens: https://m3.material.io/foundations/
- Android adaptive layouts: https://developer.android.com/codelabs/adaptive-material-guidance

Aplicación de principios, no afirmación de cumplimiento integral de estas guías.
