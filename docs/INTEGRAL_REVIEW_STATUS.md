# Revisión integral: integración, auditoría y pendientes

> Registro histórico de la preparación del dummy. No describe el estado actual de implementación. El propietario aprobó el dummy y se implementaron dos bloques en `b493917` y `5f4e35e`. Consultar `INTEGRATED_VERIFICATION_20260920.md` para la verificación actual y el backlog; no se ha publicado esta rama.

## Repositorio y conservación

Se verificaron por GitHub las ramas `main` (8a666b5fb6bc9f2f84d065a64801c3ee258a1886), `review/misa-experience-20260919` (7fd20e57236e9a91262824cd108a0b5a2ea4295f) y `fix/frequency-label-wrap` (197d21d18687f14c36f200e6d0afba236b7f6bf4).

La copia original de esta sesión tiene historial diferente, pero su árbol en fd3e7da es exactamente el de main remoto: 535b33b2813d016fade0ad6d53819a3bd067bb10. Por eso no se hizo merge de historiales divergentes ni reset. Sus tres documentos de trabajo sin commit fueron copiados y se conservan en origen.

Se creó el worktree `/workspace/alianza-integral-review`, rama `review/integral-experience-20260919`, desde 7fd20e5. Se aplicó 197d21d como 2a547bf sin conflictos, preservando los scripts y cambios de Misa. Esta corrección de etiquetas todavía no estaba en main. Las dos ramas de origen no fueron modificadas.

El producto de la rama de revisión contiene la Misa entregada y la corrección de etiquetas. El cálculo diario nuevo, halo y tratamiento general de botones están exclusivamente en la galería independiente: no se aplican al producto hasta aprobar la revisión. Sin escrituras a Supabase, migraciones, nuevas dependencias, cambios en datos ni publicación. La nueva rama es local; no se ha sincronizado remotamente.

## Auditoría actualizada

48 archivos TSX de app/github/components, 325 declaraciones de controles (21 más que la auditoría anterior), 76 con clase text-button. No equivalen a 325 instancias ni 76 fallos. Inventario reproducible con TypeScript AST: `review/integral/audit-actions.mjs`.

| Tipo propuesto | Declaraciones |
|---|---:|
| Secundario | 122 |
| Navegación | 66 |
| Selección | 35 |
| Desplegable | 37 |
| Principal | 36 |
| Reversible | 9 |
| Delicado | 20 |

La clasificación cubre todas las declaraciones; es una propuesta asistida por reglas, no una conclusión de usabilidad por control. Las etiquetas dinámicas, callbacks delegados, visibilidad simultánea y precedencia CSS requieren inspección renderizada. Una instancia clasificada principal solo conserva esa jerarquía si es la acción principal de su bloque activo. No aplicar estas asignaciones mediante reemplazo automático.

Hallazgos nuevos: Misa añade acciones compactas ya reconocibles y acordeones de ancho completo que deben conservar ese comportamiento; la rama de etiquetas soluciona el corte de palabras pero no el denominador diario. El problema diario permanece confirmado en el producto actual. Misa usa desplazamiento respecto a ventana y 24 px; su adecuación al encabezado/navegación de la app completa y a Safari sigue pendiente, aunque la entrega aislada informó pruebas de Chromium correctas.

Las excepciones prioritarias son Avanzar en rosario (puede ser grande), acordeones de Misa (fila amplia), tarjetas de navegación (no anidar botones), fuentes externas (enlaces), selección de frecuencia (chips) y revocación/desvinculación (consecuencias y confirmación, no solo color).

## Estado por capacidad

| Capacidad | Implementación | Verificación | Publicación / siguiente paso |
|---|---|---|---|
| Invitaciones, panel agregado y solicitudes | En main | Evidencia de entrega anterior; no repetida íntegramente aquí | Publicadas en entrega anterior; revisión de controles pendiente |
| Misa: navegación/lector | Rama de prueba | Pruebas específicas e integración Journal aprobadas aquí; Chromium solo en evidencia previa | No publicada; faltan contenidos, calendario CR y control documental |
| Lecturas y oraciones completas de Misa | Biblioteca vacía deliberadamente | Rechazo de conjuntos inválidos y estado pendiente comprobados | Obtener permisos y cotejo; no rellenar con ejemplos ni fuentes de otro territorio |
| Etiquetas Diario/Semanal/Mensual | Corrección incorporada en rama de prueba | Contrato CSS aprobado; geometría aún pendiente aquí | No publicada |
| Separación del símbolo diario | Dummy funcional | No compensación por semana/mes, cero metas y deshacer comprobados en dummy | Aprobar detalle y luego implementar en producto |
| Halo de aportes adicionales | Dummy funcional | Contador y deshacer sin variar meta ni día | Aprobar y aplicar respetando unidades y períodos parciales |
| Protocolo y catálogo de botones | Propuesta documentada | Clasificación reproducible; galería interactiva | Aprobación conjunta antes de ajustes generales |
| Accesibilidad y experiencia humana | Pendientes | No se han medido en esta sesión | Revisión visual, dispositivos y tareas con participantes |
| Suspender/reactivar cuentas, salida del piloto | Pendiente de diseño | Sin cambios | Fuera de la presente revisión visual |
| Correo transaccional y recuperación entregada | Pendiente de comprobación operacional | No resuelto por los dummies de enlaces | Verificación aparte |

## Comprobaciones de esta sesión

- Tipado TypeScript aprobado sobre la versión integrada.
- Pruebas de Misa aprobadas: fechas/variantes, rechazos de contenido, acordeones, cancelación de scroll anterior y acceso Journal → Oración → Misa sin escrituras.
- Prueba del contrato de etiquetas aprobada.
- Galería: siete vistas (componentes más seis contextos); aprobadas en JSDOM las interacciones de período, extras/deshacer, vacío diario, guardando, error con borrador, sin conexión, confirmación reversible, pausa del rosario y Misa con biblioteca vacía.
- Compilación de producto y de galería aprobadas. Producto conserva advertencia de bundle >500 kB; no implica fallo de compilación ni prueba de rendimiento.
- Control metodológico: **FALLA**, como en la entrega de Misa, porque el código no coincide con el cotejo documental. No se renovaron hashes, no se eludió y no se declara aprobado.
- Navegador supervisado: selección disponible, consulta de pestañas terminó en timeout. No se ejecutó Chromium por otro mecanismo. La geometría de esta integración no está verificada; las pruebas visuales previas de Misa no se trasladan automáticamente.
- Suite completa y Auth real: no repetidas en este turno. Se conserva evidencia histórica sin presentarla como prueba de la candidata actual. La regresión completa corresponde a la implementación posterior a aprobación.

## Revisión que solicitamos al propietario

Evaluar los siete paneles de la galería, especialmente acciones secundarias/reversibles, conservar/cancelar y la excepción de acordeones. Confirmar si los patrones son reconocibles y livianos. Después de aprobar: implementar por grupos, comprobar privacidad/concurrencia y flujo de borradores, repetir regresión relevante, validar visualmente y con personas, cerrar fuentes/documentación, pedir autorización de publicación de la versión revisada.
