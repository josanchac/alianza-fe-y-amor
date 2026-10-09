# Revisión de Hoy y preparación mensual

Entrega para revisión visual, 08/10/2026 Costa Rica (09/10 UTC). Seguimiento único #13; diseño de Hoy #20; preparación mensual #29; vigencia anterior #33. Sin cambios de producto, API, base de datos o publicación.

## Qué evaluar

1. En Mi día, ¿se puede releer el ofrecimiento sin entrar al editor? La propuesta muestra una categoría a la vez y permite cambiar a agradecimiento o meditación. Un texto extenso tiene «Leer completo»; editar es una acción separada.
2. En Mi mes, ¿resulta claro seleccionar, ajustar o agregar compromisos y confirmar la selección? El resumen informa la fecha de vigencia y cuántos compromisos quedan activos/en pausa.

`review/feedback4/daily-month-clarity.html` es el prototipo autocontenido. Usa datos ficticios, en memoria, sin llamadas, almacenamiento persistente ni textos del piloto. Incluye referencia simplificada del componente diario anterior; no es captura ni conexión a producción. Los controles del carrusel los aporta la presentación en conversación. Fuera de esa presentación, la propuesta inicial funciona sola.

## Decisiones propuestas y límites

### Hoy

- Una sola tarjeta de lectura evita desplegar tres textos extensos. El costo es tocar una categoría para consultar otra. Se conserva el término «Momento para vos».
- Las tres categorías existentes se mantienen. No se agregan preguntas ni notificaciones.
- Vista breve de 180 caracteres exactos, con expansión para leer todo; no se resume ni reescribe lo guardado.
- Vacíos y solo espacios muestran la invitación opcional a escribir. No exigen completar tres campos.
- Fecha y categoría separan lo guardado; error de guardado conserva el borrador. Cancelar con cambios permite seguir escribiendo o descartarlos.
- «Solo vos» describe exclusivamente el escenario ficticio. En producto se debe derivar la indicación de la compartición vigente, sin cambiar permisos ni asumir privacidad absoluta para quien ya comparte esa categoría.
- La implementación debe reutilizar los editores, versiones y guardas de cuenta/fecha existentes; el prototipo no es un sustituto de esas protecciones.

### Mi mes

- La entrada contextual está implementada parcialmente en PR #37. Este prototipo concreta el tramo todavía pendiente de selección y confirmación conjunta del mes actual.
- Mes actual: se propone aplicar cambios desde hoy. Mes siguiente: desde su primer día. La pantalla indica la vigencia antes de confirmar.
- Elegir otro mes no convierte borradores en guardados. Se conservan las selecciones de cada mes; el siguiente parte del plan actual guardado al abrirse por primera vez.
- Con 50 compromisos, mostrar inicialmente cinco y permitir ver todos. Seleccionar todos indica el estado parcial; agregar/ajustar no guarda el plan hasta confirmar.
- Desmarcar propone pausa desde la vigencia indicada, conservando el pasado. Guardar todo desmarcado debe seguir siendo posible y explícito.
- El editor de muestra cubre frecuencias básicas para evaluar el recorrido. No implementa ni reemplaza días elegidos, varias ocasiones diarias, novenas, compartición o cursos. Esos casos deben preservarse y verificarse en la integración real; no pueden convertirse automáticamente al formato simple del ejemplo.
- Cierre del período anterior, semana/año y espacios integrados conservan sus tareas existentes. La muestra no da por completado ese alcance.

## Trabajo de implementación que falta en #29

El límite documentado en `FEEDBACK4_MONTH_ENTRY_20261006.md` sigue vigente: `prepare_month` admite el próximo mes, no el actual. No simular un guardado integral con una secuencia de escrituras que pueda dejar la mitad aplicada.

Antes de extender esa acción, concretar y probar:

1. Guardado del conjunto en una transacción y validación de versiones de plan/compromisos afectados. Un conflicto revierte todo y conserva el borrador del usuario.
2. Vigencia calculada/validada por servidor con la fecha de Costa Rica. Ver un día pasado no altera silenciosamente la fecha de efecto.
3. Aplicar solo los cambios efectivos, conservando marcas, notas, planes anteriores, próximos planes ya preparados y las excepciones de novenas/cursos.
4. Lectura posterior que confirme la selección guardada y aislamiento por cuenta/mes.
5. Pruebas de reintento, conflicto, pausa/reactivación, cambios posteriores ya programados, último/primer día del mes y diciembre→enero.

La petición de aplicar un cambio a una fecha anterior se mantiene en #33: exige diseño del impacto sobre denominadores y versiones. Esta propuesta no aprueba retroactividad ni nuevas reglas de cálculo.

## Verificación y autorización

`node review/feedback4/daily-month-clarity-test.mjs`: aprobado. Cubre nota visible, fechas/categorías, vacío/espacios, texto de más de 4500 caracteres, descarte/reintento, 50 compromisos, selección masiva, cantidades, vigencia actual/futura, herencia del plan guardado y borradores al cambiar de mes. Sin errores de script ni red.

No se ejecutó la suite de producto porque solo cambian archivos de revisión. JSDOM no acredita geometría, desplazamiento ni teclado real. Validación visual, 320–430 px/200% y dispositivo siguen pendientes. No hay capturas reales nuevas; las restricciones de navegador ya documentadas no se eludieron.

Antes de integrar el diseño nuevo de Hoy y la confirmación mensual se solicita revisión del propietario conforme a `EXPERIENCE_REVIEW_GATE.md`. La aprobación no autoriza publicación. Reversión de esta entrega: retirar estos archivos de revisión, sin efecto sobre datos ni producto.
