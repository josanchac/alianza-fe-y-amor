# Experiencia aprobada — segundo bloque (sin publicar)

> Actualización: la suite completa con las pruebas nuevas ya se volvió a ejecutar y pasó. Ver `INTEGRATED_VERIFICATION_20260920.md` para la evidencia vigente y el backlog consolidado. El cotejo documental y la revisión visual permanecen pendientes.

Este documento actualiza el estado del primer bloque. La aprobación del dummy no se interpreta como autorización de despliegue.

## Implementado en la rama de revisión

### Frecuencias
- Checkbox «Permitir más de una vez al día» disponible también para metas diarias. Desactivado por defecto; conserva la unidad existente al editar.
- Conteo numérico diario de 1 a 99, con meta editable, corrección y extras. El símbolo diario pondera cada compromiso por igual y permite avance parcial: un compromiso de 2 veces con 1 registro aporta la mitad de su parte. Extras no superan el 100 % ni se trasladan al siguiente día.
- «Hoy no aplicaba» excluye ese compromiso del símbolo y de su meta diaria; no genera extras.
- Nueva migración `20260920011333_daily_occurrences.sql`, creada con Supabase CLI y ejecutada únicamente en bases PGlite desechables. No aplicada a Supabase ni a producción.
- La normalización usada en validación no cambia los datos almacenados: los planes siguen siendo diarios. No hay reescritura masiva ni cambio de propietarios, RLS, permisos de contenido o autenticación.
- La migración debe aplicarse y verificarse antes de desplegar el cliente que permite repeticiones diarias. Este paso requiere la autorización posterior de publicación.

### Acciones
- Aplicado el inventario aprobado a 75 controles: navegación, secundarios, reversibles, desplegables y acciones delicadas.
- Un enlace institucional externo conserva apariencia y semántica de enlace. Los dos enlaces internos de acceso/instalación mantienen su destino y semántica de navegación con apariencia de control.
- No se modificaron handlers, diálogos de confirmación, estados disabled, permisos ni llamadas de red como parte de esta conversión. Una prueba AST verifica tags y handlers contra la matriz previa.
- «Cerrar sesión» conserva tratamiento de navegación, no alarma roja. Las acciones de eliminación/revocación tienen tratamiento sobrio diferenciado.
- Misa conserva sus controles específicos de 44 px y sus filas desplegables. Avanzar en rosario mantiene su excepción de acción principal amplia. No se sustituyeron indiscriminadamente tarjetas, chips ni fuentes.
- La asignación exacta está en `ACTIONS_IMPLEMENTED_20260920.json`; el script de aplicación falla si cambia el inventario de origen, y no debe repetirse sobre el árbol ya transformado.

## Pruebas ejecutadas

| Verificación | Resultado |
|---|---|
| Tipado | Pasó |
| Suite completa previa + migración nueva | Pasó |
| Validación SQL de repeticiones diarias | Pasó en base desechable |
| Aislamiento entre cuentas, revisiones obsoletas, límite 99 y preservación de conteos legacy | Pasó |
| Diario proporcional, extras, siguiente día, exenciones y no compensación entre frecuencias | Pasó |
| Journal real: 1/2 parcial, completar, agregar extra sin alterar otra meta | Pasó |
| Checkbox diario y semanal y conservación de meta | Pasó |
| Matriz de 75 acciones: tags y handlers | Pasó |
| Compilación app y prueba integrada | Pasó; advertencia de bundle >500 kB pendiente |
| Revisión visual nueva | Bloqueada: navegador devolvió `ERR_BLOCKED_BY_CLIENT` al abrir localhost |
| Safari/iPhone y pruebas con personas | No realizadas |
| Cotejo documental | Pendiente; `verify:methodology` falla y no se eludió |

Las pruebas nuevas se agregaron a `npm test`. Los tests con nombres de personas/journeys son escenarios automatizados con datos ficticios, no validación humana ni certificación UX.

## Entorno de revisión

`npm run review:runtime` prepara `http://127.0.0.1:4178/` en la computadora que ejecute el comando. No es un enlace público ni accesible desde el teléfono del usuario por defecto.

Esta vista monta Journal real y sus estilos actuales, con datos ficticios en memoria y sin conexión con producción. Sirve para compromisos, edición y navegación a Oración/Misa/Mi espacio. No simula todo el backend: administración, vinculación y grupos requieren sus fixtures/pruebas específicos. La galería anterior no sustituye esta revisión integrada.

## Backlog aún abierto
1. Desbloquear revisión visual local o acordar un entorno de prueba privado; no hospedar sin autorización.
2. Revisar las 75 acciones en contexto a 320/390/768 px, con ampliación y teclado; probar Safari/iPhone y scroll en recorridos completos.
3. Cotejo documental de los cambios y Misa; mantener vacía la biblioteca de lecturas hasta contar con textos autorizados y calendario validado.
4. Probar la migración en un entorno real no productivo autorizado antes de producción. No se ejecutaron advisors contra un proyecto remoto.
5. Revisión conjunta del resultado y autorización separada de publicación.

## Publicación y datos
No se hizo push, despliegue, envío de invitaciones ni operaciones sobre datos de personas del piloto.
