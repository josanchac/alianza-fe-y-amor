# 0.3.0-alpha.1 — entrega integrada, 20 septiembre 2026

## Autorización y alcance
El propietario autorizó publicar hoy antes de las 10:00 Costa Rica. Aprobó previamente los dummies y la integración clara. Esta entrega reúne compromisos, repeticiones, novenas, botones livianos, cambio de espacios y Misa con calendario romano general. No incluye un Misal completo, ni validación del calendario propio de Costa Rica.

## Cotejo documental renovado
Base: 8a666b5fb6bc9f2f84d065a64801c3ee258a1886. Los archivos sin cambios conservan el cotejo documentado anterior. Comparación de cambios de acciones: mismos textos y handlers salvo className/data-action; evidencia en INTEGRATED_VERIFICATION_20260920.md y pruebas de protocolo. Cambios restantes leídos en journal, habit-fields, spaces, symbol-progress, schedule, rhythm, commitment-totals y domain: decisiones de producto aprobadas, sin nuevas enseñanzas Schoenstatt. Un curso de nueve días representa registros elegidos por el usuario; la app no establece validez devocional ni obligación de reiniciar. El halo expresa registros extra, nunca mérito espiritual. Las migraciones validan formatos sin reinterpretar ni cambiar registros previos.

Misa se coteja como guía breve de navegación, no reproducción del Misal: IGMR 46–90 para estructura general; 51–52 para aspersión y Kyrie, con aclaraciones dentro de los detalles; 55–71 para Palabra; 72–89 Eucaristía/Comunión; 90 cierre. Fuente oficial: https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_sp.html .

USCCB, Questions on the Sacred Paschal Triduum, consultado 20 septiembre: confirma lavatorio opcional después de homilía, ausencia de celebración eucarística Viernes Santo y secuencia luz/Palabra de la Vigilia. https://www.usccb.org/prayer-and-worship/liturgical-year-and-calendar/triduum/questions-and-answers . Las variantes detalladas de Ramos, Jueves y Vigilia no se certifican: se muestran como orientación en revisión y se pide seguir al celebrante; las lecturas especiales no se sustituyen por lecturas genéricas. En entrada sencilla se indica seguir los ritos iniciales parroquiales, sin inventar una secuencia incompleta como obligatoria. El cierre de Jueves se presenta condicional, sin imponer traslado donde no corresponda. Cotejo completo de rúbricas especiales y oraciones autorizadas quedan en backlog.

Reader oficial Evangelizo https://feed.evangelizo.org/v2/reader.php documenta integración web de lecturas SP, calendario romano general y ventana de fechas. Se conserva atribución, texto íntegro del proveedor convertido a texto inerte, sin comentarios ni almacenamiento permanente. No se atribuye territorio CR validado. El propietario confirmó carga real en su dispositivo y aceptó general como alcance inicial.

Estas limitaciones son parte explícita del alcance publicado, no una declaración de validación completa. La renovación de la huella documenta el código efectivamente cotejado y sus límites; el control metodológico permanece intacto.

## Verificación
Suite completa npm test, tipado y compilación opt-in pasaron en la pasada previa. Prueba actual: cuenta exclusivamente sintética creada en backend aislado, login real Auth y Edge Function con JWT retornaron HTTP200, XML de fecha correcta y Evangelio (6595 caracteres); logout y eliminación de esa cuenta al terminar. Preflight y rechazo de sesión ausente/inválida también pasaron. Sin correo enviado ni identidad real utilizada.

La aprobación visual es del propietario. No se atribuye validación humana a simulaciones; Safari exhaustivo, lector de pantalla y cohortes de participantes quedan pendientes de seguimiento del piloto. No se declara certificación WCAG.

## Operación y reversión
Antes de migrar: mantenimiento y checkpoint privado verificable. Aplicar únicamente daily_occurrences y scheduled_commitment_courses; son aditivas y no cambian registros. Comparar los valores existentes. Desplegar mass-readings con verify_jwt y validación adicional Auth. Publicar frontend con versión y required_version coordinadas. Si falla el frontend, conservar mantenimiento y restaurar el commit previo; no borrar nuevas filas para revertir. Migraciones aditivas pueden permanecer, sin revertir datos privados.
