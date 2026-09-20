# Cierre parcial de revisión — 20/09/2026

## Correcciones realizadas y comprobadas

1. **Meta inválida al desactivar repeticiones.** Reproducción automatizada: meta semanal de 99 ocasiones, desactivar «Permitir más de una vez al día» dejaba 99 pese al máximo de 7 días. Se ajusta a los límites ya existentes: diario 1, semanal 7, mensual 28. Las metas válidas se conservan. Es edición del borrador; no escribe ni modifica historia hasta Guardar. La regresión falló antes de corregir y pasó después; incluye ambos períodos y preservación de metas válidas.
2. **Retorno de foco al cerrar edición.** Chromium: lápiz → Enter → Editar compromiso → Enter → Escape dejaba el foco en el cuerpo. Se conserva el control que abrió el formulario, resolviendo también el disparador del menú, y se devuelve allí al cerrar. Si desapareció o está deshabilitado, se usa la pestaña activa. Repetido tras compilar: foco de vuelta en «Editar: Ejercicio». No cambia apariencia ni flujo aprobado.

Pasaron tipado, compilaciones runtime/conectada, experiencia aprobada, acciones de compromisos y revisión de períodos. No se repitió toda la suite para cambios sin efecto en los demás servicios.

## Accesibilidad: evidencia delimitada

- Chromium real, dummy con componentes de Journal: apertura de edición por Enter, foco inicial en el campo de título y regreso al lápiz tras Escape.
- Misa integrada: Enter abre Ritos iniciales; Espacio abre Liturgia de la Palabra y cierra Ritos iniciales. `aria-expanded` observado: true → false/true.
- Cálculo estático de contraste de pares CSS: secundario 11.282:1; reversible 12.611:1; delicado 6.887:1; principal 12.611:1; Misa 12.867:1; metadato Misa 5.755:1; adicionales 4.717:1. Superficies consideradas: `#eef3f6`, blanco, `#193649`, `#f1f4f7` y fondo app `#f5f7fa` según el selector. Superan 4.5:1 para esos pares; no es auditoría de contraste de toda la cascada, imágenes, estados o superficies renderizadas.
- Referencias: [contraste mínimo W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [ampliación W3C](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html). El criterio exige comprobar lectura y funcionalidad con ampliación; verificar tamaños CSS por sí solo no lo satisface.

No verificado en esta pasada: zoom real 200%, lector de pantalla, Safari/iPhone, foco en todos los diálogos anidados o recorrido autenticado. No hay pruebas humanas nuevas. La aprobación del propietario «Se ve bien» corresponde únicamente a lo que revisó, no certifica estos puntos.

## Cotejo de cambios de formación

Se compararon los 27 archivos que difieren de la huella registrada desde `8a666b5`. Para distinguir presentación de contenido se cotejaron también diferencias tras retirar únicamente atributos literales `className` y `data-action`:

- 19 archivos cambian solo esos atributos de acciones; sin textos espirituales ni operaciones modificadas.
- 5 archivos de frontend/lógica y una migración corresponden a reglas de producto: frecuencias, repetición, denominador diario, extras, acceso a Misa y, ahora, foco y límites de edición. No definen mérito espiritual ni añaden enseñanza del Movimiento.
- `app/mass.tsx` y `lib/mass.ts` contienen material nuevo que requiere cotejo propio. No quedan aprobados por la revisión de botones.

El inventario con hashes está en `DOCUMENTARY_DELTA_20260920.json`. Es evidencia parcial; no sustituye `methodology-review.json` ni renueva la huella de publicación. La puerta metodológica sigue cerrada.

## Misa: bloqueo real de contenido

Se leyeron nuevamente `app/mass.tsx`, `lib/mass.ts` y la entrega de Misa. `MASS_READINGS` está vacío. Los momentos muestran orientación de Alianza y un aviso de texto pendiente. El contrato de permisos rechaza conjuntos no autorizados/no cotejados. La interfaz y el lector están implementados; las lecturas completas y un calendario CR comprobado no están incorporados.

Fuentes institucionales reabiertas:

- [IGMR, Santa Sede](https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_sp.html), capítulo II, 46–90: referencia para contrastar el esquema general. No prueba todas las variantes locales.
- [USCCB, preguntas del Triduo](https://www.usccb.org/prayer-and-worship/liturgical-year-and-calendar/triduum/questions-and-answers), apartados Jueves Santo, Viernes Santo y Vigilia: contraste acotado de lavatorio opcional, carácter del Viernes Santo y orden inicial de Vigilia. No acredita Ordo CR ni derechos sobre un leccionario para la app.

No se obtuvieron permisos de textos ni se certificó calendario local. El pendiente previo de cierre de Jueves Santo sigue en revisión: la página de preguntas consultada aquí no documenta por sí sola esa variante; requiere rúbrica precisa antes de ajustar. La entrada sencilla de Ramos también debe cotejarse contra su rúbrica completa antes de dar por cerradas las variantes. No se presentó una inferencia como corrección litúrgica confirmada.

## Decisión de alcance actualizada

El propietario indicó «Cerremos el módulo de misa primero». Se descarta postergar Misa para publicar el resto. Misa permanece en revisión hasta completar contenido, calendario, cotejo y pruebas. Ver MISA_CLOSURE_20260920.md para el estado actual y la dependencia documental concreta. No hay autorización de producción.

El piloto en GitHub Pages y sus datos continúan intactos. Solo la vista privada recibe las correcciones de prueba.

Publicación privada confirmada: Sites versión 6, fuente `80ea56f02669e4d5b4f748fb2daa1e0a5cd818b9`, despliegue `appgdep_6aaf60d8db6c81918537ef697c6515ea`, estado succeeded. Las correcciones están tanto en el dummy como en la entrada conectada. No es despliegue del piloto.


## Estado actual que sustituye el bloqueo por calendario CR
- **Verificado:** el propietario confirmó carga de lecturas en su dispositivo tras corregir el modo de redirección del servidor.
- **Implementado en revisión:** consulta a Evangelizo, calendario romano general, fuente atribuida, aviso local secundario, acceso a Misa del mismo tamaño que las otras secciones.
- **Decisión aceptada:** avanzar con el calendario general disponible. La validación específica de Costa Rica queda en backlog y deja de ser condición para revisar este alcance.
- **Pendiente:** adaptación del relay al entorno del piloto, cotejo de estructura y variantes litúrgicas, oraciones completas autorizadas, cierre documental y revisión integrada de publicación.
- **Publicado:** solo revisión privada de Sites. Estos cambios no están publicados en GitHub Pages.

### Comprobación integrada posterior a la decisión
- `npm test` terminó con código 0: suite completa del repositorio, incluida auditoría diagnóstica N1–N5/S1–S2/A1–A7, Misa, proveedor, experiencia aprobada y protocolo de 75 acciones.
- `npm run typecheck` y compilación runtime con relay del mismo origen: código 0. Advertencia previa de tamaño de bundle permanece.
- Son pruebas automatizadas con datos sintéticos, excepto la comprobación del proveedor real documentada en MISA_CLOSURE. No se presenta la simulación de perfiles como prueba humana ni certificación de accesibilidad; V1 permanece sin medir.
- Revisión privada actualizada en Sites v12: fuente 67f27a90e31254ae3e5b77d22d0552c1317f4185, despliegue appgdep_6aafeca4da608191a6e25b2ced6cb24a succeeded. Sin cambios en datos o publicación del piloto.

### Delta posterior aprobado: cursos, repeticiones, espacios y lecturas
Ver `APPROVED_COMMITMENTS_20260920.md`. Las nuevas frecuencias ya tienen implementación de revisión y migración validada localmente; no se han aplicado a Supabase remoto. Se mantiene el bloqueo documental y la separación entre pruebas automáticas, aprobación de dummies y pruebas con personas.


## Actualización posterior: integración conectada v14
La aprobación visual de la integración fue recibida. La migración de cursos ya se aplicó y verificó exclusivamente en Supabase de pruebas; /connected/ fue actualizado con las nuevas frecuencias y lecturas mediante relay. Esto sustituye los estados anteriores de migración remota pendiente y ruta conectada antigua. Piloto sin publicar ni migrar. Estado y pendientes detallados: [INTEGRATED_VERIFICATION_20260920.md](INTEGRATED_VERIFICATION_20260920.md).
