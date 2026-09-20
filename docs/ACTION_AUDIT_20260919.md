# Auditoría de acciones y controles — 19 septiembre 2026

## Alcance y límite

Inventario estático de 47 archivos TSX en app, github y components, más revisión de las reglas CSS compartidas y específicas. Se identificaron 304 declaraciones de controles: 244 button, 3 Button, 30 summary, 17 enlaces, 6 DropdownMenuItem, 3 DialogClose y 1 Checkbox. Son declaraciones en código, no 304 controles simultáneos ni una cuenta de problemas. Componentes repetidos generan más de una instancia en ejecución. No abarca contenido todavía no integrado en este árbol de trabajo.

Hay 76 declaraciones con la clase text-button. Son botones semánticos, pero su presentación puede confundirse con texto o enlaces. Ninguno de los 17 enlaces examinados tiene onClick. No se justifica convertir indiscriminadamente todos los botones o enlaces.

Esta auditoría no mide la geometría renderizada, contraste final, tacto en teléfono ni éxito humano. Los hallazgos de CSS requieren validación visual a 320/390 px, con texto ampliado, foco y estados de error/espera antes de implementar una regla global.

## Decisión de diseño

El propietario acepta que las acciones sean reconocibles y fáciles de tocar, pero rechaza los botones grandes, toscos y a todo el ancho del dummy anterior. Nueva candidata: ancho según contenido, fondo tenue o borde fino, sin sombra ni relleno excesivo. Mantener área táctil de al menos 44 × 44 CSS px como objetivo propio de diseño; no confundir tamaño visual con área de interacción. Los iconos acompañan etiquetas claras. Botones secundarios no compiten con la acción principal.

## Hallazgos y ajustes propuestos

| Prioridad | Zona | Evidencia | Ajuste para revisión |
|---|---|---|---|
| P1 | Compromisos, revisión e historial | journal.tsx: 16 text-button; commitment-review: 3; month-review: 2; reflection-summary: 1 | Editar, deshacer, retomar y actualizar como secundarios compactos. Mantener navegación diferenciada y aclarar a qué registro se aplica deshacer. |
| P1 | Rosario | personal-rosary: 6; community: 8, incluyendo reservas y encuentros | Pausar, opciones, desplegar oración y deshacer reconocibles. Conservar Avanzar como principal. No hacer todos los controles a todo el ancho. |
| P1 | Pareja | pairing-requests: 7; pairing: 8 | Copiar y gestionar solicitudes como secundarios. Separar rechazar/cancelar/desvincular de aceptar y conservar confirmaciones existentes. |
| P1 | Grupos | groups-workspace: 9 | Diferenciar editar/registrar/deshacer de salir, revocar o transferir coordinación. No dar a acciones de alto impacto el mismo énfasis que a la actividad habitual. |
| P1 | Acceso, administración | main: 3; invitations: 2; admin: 1 | Estados de espera, errores y copiar enlace claros. Mantener navegación ligera; cancelar invitación como acción explícita. |
| P2 | Inicio, guías, símbolos, espacios | home: 2; install-guide: 2; confession-guide: 1; formation-guide: 1; my-path: 1; spaces: 1; start-guide: 1; symbol-picker: 1 | Diferenciar enlaces de navegación de quitar imagen, cambiar elección y cerrar. No convertir tarjetas de acceso ya claras en otra capa de botones. |
| P1 | Estilos compartidos | globals.css text-button: fondo/borde ausentes y solo 4 px de relleno lateral; normalmente 46 px de altura | Resolver reconocimiento y separación, sin afirmar que todos carecen de altura táctil. Crear variantes por intención, no reemplazo global ciego. |
| P1 | Excepciones de estilos | app-experience.css: acciones de propósito de 40 px y 12 px de fuente; otras reglas posteriores usan 44 px y 16 px | Comprobar cascada final por contexto. Evitar overrides contradictorios; consolidar después del dummy aprobado. |
| P1 | Marcas de compromisos | globals.css: círculo visible de 26–27 px y pseudo-elemento extendido 9 px por lado | El área extendida puede llegar a 44 px; medir y comprobar que no se solapa con controles vecinos. No catalogarlo como fallo solo por tamaño del círculo. |
| P2 | Paneles y navegación | app-panel, choice-chips, informes, pulso, soporte y mantenimiento inventariados | Preservar tarjetas, chips, formularios y navegación ya reconocibles. Revisar foco, textos largos y estados deshabilitados en la pasada visual. |

## Verificación antes de llevarlo al producto

Probar registrar/deshacer sin desplazar accidentalmente; botones con etiquetas largas; alto de fuente ampliado; diálogos estrechos; una sola acción principal por grupo; cancelar separado de confirmar; acciones repetidas durante guardado; foco visible y retorno al cerrar; controles accesibles sin hover; navegación y acciones con semántica correcta.

El dummy `alianza-botones-livianos.html` mantiene la separación de progreso diario/semanal/mensual y el halo de aportes adicionales. Sus interacciones se verifican con datos ficticios; la revisión humana del aspecto sigue abierta. No se modifica ni publica código de producto en esta fase.

Inventario de declaraciones: ACTION_INVENTORY_20260919.json. Las etiquetas dinámicas pueden quedar vacías; eso no demuestra falta de nombre accesible.
