# Alianza · Verificación metodológica de Schoenstatt

Estado: **pendiente; no habilita la publicación de la nueva experiencia**.

Requisito del propietario, 12 de septiembre de 2026: toda metodología de la aplicación, incluido el Horario Espiritual, debe contrastarse con documentos oficiales de Schoenstatt. La prueba favorable de navegación no constituye validación metodológica. Este requisito se aplica también a los contenidos ya existentes.

## Qué se debe demostrar

Cada definición, pregunta guiada, ejemplo, frecuencia y regla que pueda influir en la práctica espiritual necesita una referencia identificable: institución o autor, título, edición, página o apartado y enlace o documento autorizado. Se revisarán el texto completo y su contexto; una noticia, un resultado de búsqueda o una página que mencione el tema no certifican un ejercicio.

La matriz debe demostrar la correspondencia entre fuente, texto y comportamiento real de la app. Una interfaz más breve puede omitir explicaciones inicialmente, pero no cambiar el sentido de la práctica. «Empezar directamente» y «Repasar los conceptos» deben conducir al mismo método; solo cambia la cantidad de ayuda visible.

La verificación documental y el aval pastoral son distintos. No hay un aval de un padre o de una instancia del Movimiento registrado en este proyecto. No se anunciará «100 % fiel», «oficial», «aprobada» ni equivalentes mientras no exista evidencia que permita esa afirmación. Un aval tendrá el alcance, versión y autoría que realmente se concedan.

## Fuentes consultadas y alcance

| ID | Documento y procedencia | Ubicación consultada | Qué permite comprobar y qué falta |
|---|---|---|---|
| S1 | [Movimiento Internacional de Schoenstatt](https://schoenstatt.com/es/) | «Quiénes somos» | El sitio se identifica como página oficial y órgano de noticias de la Presidencia General. Esto acredita la procedencia del sitio, no transforma cada artículo en un manual normativo. |
| S2 | [Como montar seu Horário Espiritual?](https://schoenstatt.org.br/2021/01/07/faca-um-planejamento-espiritual/), Karen Bueno, con explicaciones del P. Ottomar Schneider; Movimiento de Schoenstatt de Brasil. También publicado por el [Secretariado de la Campaña de la Madre Peregrina](https://www.maeperegrina.org.br/noticias/como-montar-seu-horario-espiritual/). | «Horário Espiritual», «Monte o seu Horário Espiritual», «Algumas dicas». Publicación original: 7/1/2021. | Respalda registro cotidiano en una planilla mensual, vínculos con Dios, prójimo, trabajo y uno mismo, empezar con pocos puntos, perseverar, orientación espiritual y ofrecimiento a María. Debe revisarse la traducción antes de usarla como enseñanza en español; no demuestra por sí sola una pauta completa para todos los usuarios. |
| S3 | [Curso de Introducción CAM, primer año, versión 2008](https://santuariovallehermoso.cl/familias/material/cam/cam_1_cursos_programa_anual.pdf), documento identificado como Rama de Familias, Movimiento Apostólico de Schoenstatt, alojado en Santuario Valle Hermoso. | Páginas impresas 3, 16–18; séptimo encuentro. | Incluye acompañamiento por asesores, revisión mensual matrimonial y preparación personal de propósito y puntos del horario. Remite a *Somos historia por hacer*, P. Rafael Fernández, Ed. Patris. Falta confirmar que esta edición y su ámbito CAM sean la referencia adecuada para el piloto de Costa Rica. |
| S4 | [150 preguntas sobre Schoenstatt](https://schoenstatt.link/en/literature/150-preguntas-sobre-schoenstatt), atribuido al P. Rafael Fernández, reproducción que declara permiso. | Preguntas 86–88. | Distingue ideal, actitud del propósito particular y actos concretos del horario; describe renovación y registro cotidiano. Es una reproducción: falta cotejar edición original y acreditar su condición de documento de referencia autorizado. No basta como única fuente oficial. |
| S5 | [¡Descubre y conviértete en lo que eres!](https://schoenstatt.com/es/descubre-y-conviertete-en-lo-que-eres/), Francesca Silli, 19/1/2023. | Relato del curso de ideal personal. | Publicación en el sitio oficial, pero es una crónica. No contiene un curso completo ni valida las tres preguntas del prototipo. |

La referencia comercial a *Somos historia por hacer* que hoy figura en la app no pudo leerse íntegramente en esta revisión. Tampoco se ha cotejado un manual oficial completo del ideal matrimonial. Los materiales encontrados en repositorios de terceros y los fragmentos de buscador se consideran pistas, no respaldo suficiente. No se reproducen libros ni cursos completos en este expediente.

## Matriz de revisión del contenido y comportamiento

| ID | Elemento actual | Evidencia o brecha | Cambio concreto que debe revisarse antes de publicar |
|---|---|---|---|
| M01 | Presentación del Horario Espiritual; `app/start-guide.tsx`, `app/journal.tsx`. | S2 ofrece respaldo parcial. La app destaca compromisos y hábitos, sin desarrollar suficientemente su sentido espiritual. | Vincular la explicación con autoeducación, vida de alianza y las distintas dimensiones de la vida; conservar una entrada breve y el repaso opcional. Cotejar texto final con el manual elegido. |
| M02 | Propósito particular mensual y revisión; `app/journal.tsx`, `prototype/journey.tsx`. | S3 respalda una revisión mensual; S4 distingue cultivo de la actitud y renovaciones cotidianas. | Separar la preparación/revisión mensual de la renovación y examen diario del propósito. No exigir cambiar el propósito cada mes, ni enseñar que solo se trabaja una vez al mes. La pantalla diaria debe permitir recordar y registrar su cultivo. |
| M03 | Ejemplos de compromisos; `lib/domain.ts`. | Algunas sugerencias describen actitudes amplias; S4 las distingue de actos concretos. | Revisar cada ejemplo y la ayuda del formulario. No presentar una actitud genérica como si fuese un punto concreto ya definido del horario. |
| M04 | Marcas «Lo viví», «Me costó», «No aplicaba» y ausencia de registro. | S2 admite distintas formas de marcar según la evaluación personal. | Confirmar que los estados elegidos permiten un examen honesto. Una casilla vacía significa que la app desconoce lo ocurrido; no equivale a cumplimiento ni a incumplimiento. Revisar cómo expresar realización parcial. |
| M05 | Tres días por semana y resúmenes de cumplimiento del prototipo. | No se cotejó aún una pauta oficial suficiente sobre frecuencias no diarias. | Verificar frecuencia, unidad y tratamiento de semanas parciales; documentar que el cálculo describe registros frente a una meta elegida. No convertirlo en calificación espiritual ni alterar el pasado al cambiar la meta. |
| M06 | Las cuatro Rs; `lib/domain.ts`, ayuda y formularios. | S3 respalda la revisión matrimonial mensual. Falta cotejar el material completo para las cuatro prácticas. | Verificar nombres, sentido, cadencias, preguntas y ejemplos de cada R contra una misma referencia autorizada. No mezclar variantes regionales ni considerar verificada la definición por haberla heredado del código. |
| M07 | Ideal personal; preguntas y estados del prototipo. | S5 describe un curso, pero no esas preguntas; S4 es apoyo pendiente de cotejo. | Conseguir el cuaderno o pauta oficial, referenciar cada ejercicio y su secuencia. Mantener escritura libre del ideal y borradores; la app no determina ni certifica que una frase sea el ideal de la persona. |
| M08 | Ideal matrimonial y tres preguntas del prototipo. | No hay documento completo cotejado. | Verificarlo con documentación propia del ideal matrimonial; no trasladar automáticamente el ejercicio individual a la pareja. La doble confirmación acredita acuerdo entre usuarios, no validez espiritual del ideal. |
| M09 | «Agradecer y elegir un paso»; `app/reports.tsx`. | Es una formulación de producto, no una etapa de Schoenstatt acreditada en el expediente. | Explicar su función como revisión de registros o sustituirla por una pauta documentada. No presentarla como parte oficial de las cuatro Rs o del horario sin respaldo. |
| M10 | Señal cotidiana y «versión mínima»; `lib/domain.ts`, formularios y metodología. | Proceden de modelos de conducta externos; no son documentación oficial de Schoenstatt. | Revisar si son admisibles como ayudas de uso y cómo se identifican. Una versión reducida no debe cambiar silenciosamente el compromiso ni registrarse como cumplimiento íntegro de otro. Retirar las recomendaciones metodológicas sin respaldo autorizado. |
| M11 | Sugerencia de otra práctica tras cuatro semanas del prototipo. | Es una hipótesis de producto; no un criterio de hábito adquirido ni de avance espiritual. | No activar esa inferencia en producción. Cualquier invitación a ampliar prácticas debe pasar la revisión, respetar la libertad y no interpretar registros como madurez espiritual. |
| M12 | Enseñanza opcional, novedades y eventual curso pago. | Decisión de experiencia, no doctrina. | Ofrecer acceso directo o repaso del mismo contenido validado. El pago podría añadir profundidad y acompañamiento; no debe cambiar la fidelidad de la guía básica. El curso necesita programa, autoría, revisión y autorización para utilizar sus materiales. No está incluido en esta publicación. |

Esta es una revisión inicial del código actual y del prototipo, no una certificación exhaustiva. Todas las filas permanecen abiertas hasta cotejar la referencia pertinente, corregir y comprobar el comportamiento final. Una cita parcialmente pertinente no cierra la fila.

## Entrega concreta para revisión por el Movimiento

Preparar una sola versión con: textos íntegros de cada pantalla, ejercicios, referencias exactas, capturas de los recorridos directo y guiado, reglas de registro y cálculo, y esta matriz resuelta. El revisor deberá poder identificar observaciones, correcciones aceptadas, alcance del aval y versión revisada. No se le enviará contenido personal de usuarios. No se ha contactado a ningún padre ni enviado material a terceros.

La ficha de aprobación se mantiene en `docs/methodology-review.json`. Queda pendiente por defecto; ningún asistente puede completarla inventando aprobación. `npm run verify:methodology` debe bloquear una publicación sin aprobación registrada o si cambia el contenido revisado. Las pruebas técnicas y las vistas de desarrollo continúan disponibles para preparar la revisión.

## Publicación y reinicio individual

La autorización para actualizar la app y reiniciar exclusivamente el espacio personal de la esposa se conserva, condicionada ahora a este requisito metodológico. El reinicio se ejecutará cuando la experiencia completa esté lista y verificada, con respaldo recuperable, identidad y acceso conservados, y sin modificar datos de otros usuarios ni historia matrimonial compartida. No se ha ejecutado en esta etapa.
