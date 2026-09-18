# Pendientes · Invitaciones y recorrido del piloto

Fecha: 2026-09-18. Base revisada: 0.2.0-alpha.10.
Estado: análisis y backlog solicitado; NO implementado ni publicado.
Este documento no autoriza enviar invitaciones, ampliar permisos, borrar cuentas ni modificar producción.

## Objetivo

El administrador incorpora personas al piloto desde Alianza, sin depender del chat ni del panel de infraestructura. Cada persona entra individualmente y puede vincularse como pareja después, solo por decisión y aceptación de ambos. No se exige invitar a dos personas juntas.

La incorporación individual y la vinculación bilateral ya existen. La nueva capacidad es administrar el acceso al piloto, no reconstruir el vínculo matrimonial. El panel administrativo actual no tiene operaciones de invitación ni recuperación; las funciones operativas antiguas inspeccionadas están deshabilitadas. No reactivarlas como solución permanente.

## P0 · Administración de invitaciones

Interfaz propuesta: dos secciones separadas, «Personas e invitaciones» y «Uso del piloto». Lista breve por correo, nombre administrativo opcional, estado y acción principal; detalles bajo demanda. No usar el nombre ingresado por el administrador como perfil personal elegido por el invitado.

| Situación | Acción del administrador | Resultado esperado |
| --- | --- | --- |
| Persona nueva | Invitar con correo revisado y confirmado | Alta individual y entrega de acceso, sin pareja ni contenido precargado |
| Invitación vigente | Consultar estado / reenviar con límite | Sin cuentas duplicadas; advertir si el reenvío sustituye el enlace anterior |
| Invitación vencida | Renovar | Nuevo acceso conservando identidad y membresía; verificar que el enlace sustituido no funciona |
| Correo equivocado | Cancelar; crear invitación al correo correcto | No transferir la identidad ni los datos de una cuenta a otra |
| Invitación cancelada | Volver a invitar expresamente | Nueva emisión trazable; no reactivar silenciosamente |
| Cuenta activada | Ver estado; ofrecer recuperación por canal verificado | No tratarla como invitación pendiente ni restablecer su contraseña por el administrador |
| Error de envío | Reintentar de manera segura | Mantener la cuenta preparada y explicar el error, sin duplicarla |

Separar tres estados: invitación (pendiente/vencida/cancelada/aceptada), entrega (preparada/enviada/error y entregada solo con evidencia del proveedor) y cuenta (pendiente de activación/activa). Correo aceptado por el proveedor no equivale a entregado, leído ni cuenta activada. Definir activación completa como acceso validado y configuración inicial terminada; no inferirla solo por emitir un enlace.

Cada nueva emisión debe invalidar la anterior según un mecanismo probado; la cancelación debe impedir el canje y el acceso, no solo cambiar una etiqueta. Cubrir carreras entre cancelar, renovar y activar. No fijar duración del enlace sin comprobar la configuración efectiva de Auth.

## P0 · Recorrido de la persona invitada

1. Invitación breve: qué es Alianza, quién invita, condición de piloto y privacidad.
2. Validación del acceso y elección personal de contraseña; no solicitarla al administrador.
3. Información y elección correspondiente sobre métricas antes de incorporar nuevos participantes al seguimiento.
4. Inicio individual liviano: explorar o crear un primer compromiso. Nombre, ideal y símbolo voluntarios.
5. Ayuda de instalación accesible, sin hacerla obligatoria para usar la app.
6. Vinculación opcional desde Mi espacio: solicitud a otra cuenta habilitada, aceptación de ambos y explicación de lo que se comparte. Sin directorio público ni asignación administrativa de pareja.

Un enlace vencido o ya utilizado debe explicar la situación y ofrecer una vía concreta de recuperación, sin pedir borrar y recrear el usuario. Una cuenta ya activada debe poder entrar normalmente. Invitación al piloto, vinculación de pareja e invitación a grupo son tres operaciones distintas.

## P0 · Privacidad, seguridad y entrega

- Usar el rol administrativo privado existente como punto de partida; validar en servidor cada operación. El nuevo permiso no habilita lectura de diarios, ideales, compromisos, oraciones, copias ni contenidos compartidos de terceros.
- Preferir envío directo al correo del titular. No mostrar contraseñas, sesiones ni enlaces de acceso de cuentas activas al administrador: esos enlaces permitirían suplantación. Copiar enlaces iniciales para entrega manual es una decisión pendiente, no parte automática del alcance; si se propone, documentar el riesgo expresamente.
- Operaciones Auth Admin exclusivamente en backend protegido. No incluir claves administrativas en el cliente, repositorio, chat, logs ni telemetría. No manipular directamente tablas internas de Auth.
- Configurar y verificar correo transaccional antes de prometer reenvío: remitente, dominio autorizado, entrega, rebotes y recuperación. Proveedor y eventual costo requieren decisión del propietario; no contratar ni configurar un servicio de correo ajeno por inferencia.
- Idempotencia y control de concurrencia: doble clic, reintento, respuesta perdida y fallo entre creación Auth/membresía/envío no duplican cuentas ni dejan acceso inconsistente. Prever reconciliación controlada de estados parciales.
- Revisar permisos de administradores revocados, límites de emisión y auditoría mínima de operador, acción, destinatario, fecha y resultado, sin tokens ni contenido privado. Retención y acceso a auditoría deben quedar definidos.
- El consentimiento previo de cuatro personas no se extiende automáticamente a invitados nuevos. Resolver aviso comprensible y base de participación/elección para nuevos miembros, conservando el tratamiento acordado con participantes actuales. Revisar la inscripción automática del piloto introducida en alpha.9 antes de ampliar altas.
- Eliminar no es un remedio para un enlace vencido. Suspender/reactivar, salir del piloto y eliminar cuenta/datos se diseñarán aparte: distinguir revocación de sesiones, historia compartida y recuperación. No añadir borrado irreversible a la primera entrega.

## Criterios de aceptación de la primera entrega

- El administrador puede invitar una persona, renovar acceso vencido y cancelar invitación sin usar el chat ni Supabase Dashboard.
- Un invitado puede activar su cuenta y empezar solo, sin pantallas matrimoniales obligatorias ni datos espirituales precargados.
- Reenvío, expiración, cancelación y recuperación probados de extremo a extremo con correos/cuentas sintéticos; verificar entrega real a un buzón de prueba autorizado, no solo mocks.
- No administradores, anónimos y administradores revocados no pueden emitir invitaciones ni consultar el padrón administrativo.
- Tokens inválidos, vencidos, sustituidos o usados no permiten acceso. No consumir enlaces reales para probarlos.
- Conservar UUID, membresía, registros y vínculos existentes al renovar. Comparar preservación sin leer contenidos espirituales.
- Vinculación bilateral y separación entre parejas siguen pasando pruebas; comprobar que suspender acceso en una fase posterior no destruye datos del otro integrante.
- Prueba humana del recorrido completo en móvil: invitación, contraseña, entrada individual, instalación opcional y solicitud de pareja. Confirmar que métricas de onboarding no incluyen contenido ni seguimiento individual detallado.
- Publicación y ampliación efectiva del piloto requieren autorización separada; este backlog no envía invitaciones.

## Consolidación de otros pendientes

| Prioridad | Pendiente | Tipo y límite |
| --- | --- | --- |
| P0 | Invitaciones individuales, renovación/cancelación y entrega | Nueva implementación descrita arriba |
| P0 | Aviso y tratamiento de métricas para nuevos participantes | Condición previa a ampliar el piloto, no ocultar métricas actuales |
| P1 | Recuperación de acceso autoservicio por correo | Cerrar dependencia administrativa; entrega y seguridad aún por verificar |
| P1 | Validar las mejoras de alpha.9/10 con usuarios reales | Probar claridad de marcas, progreso, edición/eliminación, Mi recorrido, rosario adaptable y vinculación; no tratarlas como funcionalidades aún no implementadas |
| P1 | Confirmar continuidad del rosario al bloquear/desbloquear el teléfono | Prueba en dispositivos reales; no prometer ejecución en segundo plano sin evidencia |
| P1 | Recorrido completo de primera entrada y privacidad | Validación humana; no rehacer onboarding individual ya existente |
| P2 | Suspensión/reactivación y salida del piloto | Diseño pendiente de consecuencias para sesiones, pareja/grupos e historial |
| P2 | Revisar pendientes históricos no reconciliados | Notas por compromiso, confirmación sin marcas, sugerencias voluntarias, borrador individual de 4 Rs: cotejar código actual antes de estimar o duplicar trabajo |
| P3 | Ampliaciones de comunidad | Apostolado, fechas significativas, curso guiado de ideal comunitario, push y bibliotecas extensas: ideas documentadas, fuera de la primera entrega |

Ya documentado como implementado: reinicio personal protegido de operador, símbolos opcionales/imagen propia, entrada liviana, vinculación bilateral, vista unificada de compromisos, oraciones opcionales y mejoras de rosario. No crear otra tarea de implementación por un «pendiente» en documentación histórica. La revisión en teléfonos reales sí sigue abierta.

## Secuencia propuesta

1. Cerrar diseño de estados, privacidad para nuevos invitados, canal de entrega y permisos.
2. Implementar backend administrativo y pruebas de ciclo completo con datos sintéticos.
3. Integrar sección compacta de personas/invitaciones y recorrido de activación/recuperación.
4. Validar preservación, seguridad, correo y experiencia móvil; preparar publicación para aprobación.
5. Renovar la cuenta pendiente del piloto mediante el nuevo flujo, sin borrarla, y ampliar solo por invitación expresa del administrador.

No hay estimación ni fecha de publicación comprometida. El bloqueo del navegador del chat es distinto de este desarrollo y no se presenta como resuelto.

## Evidencia interna consultada

- [Privacidad administrativa](admin-privacy.md), github/admin.tsx y github/main.tsx.
- [Vinculación bilateral](BILATERAL_PAIRING.md) y [alpha.6](RELEASE_0.2.0-alpha.6.md).
- [alpha.9](RELEASE_0.2.0-alpha.9.md) y [alpha.10](RELEASE_0.2.0-alpha.10.md).
- [Operación](DEPLOYMENT.md), [reinicio personal](PERSONAL_RESET.md) y [entrada liviana](LIGHT_ENTRY_RELEASE.md).
- [Revisión histórica](JOURNEY_REVIEW.md) y [comunidad](COMMUNITY_RELEASE.md); sus pendientes se contrastan con entregas posteriores.
