# 0.2.0-alpha.9 — Segunda sesión de feedback con Neca

2026-09-17. Preparada para publicar en el piloto privado existente. No amplía el acceso ni cambia el carácter alfa.

## Cambios de experiencia

- Los compromisos diarios, semanales y mensuales aparecen juntos en «Mis compromisos». Cada uno conserva una etiqueta de cadencia y la marca significa «lo viví hoy»; el avance semanal o mensual se calcula sin exigir cambiar de vista.
- Ofrecimiento queda en la mañana, meditación durante el día y agradecimiento en la noche. Los tres son opcionales y abren únicamente su propio campo.
- «Oración» muestra la oración del ideal personal, ideal matrimonial, Santuario Hogar y Alianza solo cuando la persona escribió cada una. Se guardan como registros privados.
- «Mi recorrido» abre con un resumen breve de registros, compromisos y metas; los detalles y reflexiones quedan plegados hasta que la persona decida consultarlos.
- La vinculación reconoce una cuenta disponible al escribir su correo completo y confirmado. No crea el vínculo: todavía requiere solicitud, consentimiento explícito del destinatario y aceptación.

## Piloto cercano

Se retira de la interfaz el consentimiento adicional del piloto cercano para las cuatro cuentas ya incorporadas al piloto. La actividad agregada se habilita automáticamente para miembros autorizados y no puede ocultarse desde clientes anteriores. Se conservan únicamente categorías fijas de navegación y desempeño técnico, deduplicadas por persona y fecha; no se envían nombres, correos, textos, títulos ni contenidos de oración o compromisos.

La medición general voluntaria y su umbral de cinco participantes no cambian. El panel del piloto sigue mostrando muestras pequeñas y advierte que pueden permitir inferencias; las cifras no equivalen a cumplimiento ni crecimiento espiritual.

## Datos, compatibilidad y privacidad

La migración aditiva `20260917042604_neca_feedback_alpha9.sql` amplía la validación del diario con `meditation`, agrega el registro privado `prayers`, permite la búsqueda exacta de una cuenta elegible sin convertirla en directorio y mantiene la vinculación bilateral. La búsqueda exige correo completo, limita intentos y no ofrece coincidencias parciales. La meditación sigue el permiso existente de compartir reflexiones; las cuatro oraciones permanecen privadas incluso al compartir reflexiones. La versión de novedades nueva se valida sin modificar las preferencias históricas.

La función del piloto inscribe automáticamente solo a miembros autorizados y mantiene el contrato de eventos sin contenido. Las funciones continúan en el esquema privado con `search_path` vacío, permisos explícitos y tablas no legibles por clientes. La migración debe aplicarse antes del frontend.

## Verificación

- Suite completa `npm test`, tipado y compilación de producción.
- `rhythm-db.mjs`: meditación, oraciones privadas, validación estricta y aislamiento entre cuentas.
- `rhythm-ui.mjs` y `neca-feedback-ui.mjs`: vista única, cadencias visibles, campos opcionales y presentación condicional de oraciones.
- `pairing-requests-db.mjs` y `pairing-requests-ui.mjs`: búsqueda exacta, solicitud bilateral, errores claros y límites.
- `pilot-db.mjs` y `pilot-ui.mjs`: métricas automáticas sin contenido ni compuerta de consentimiento.
- `release-upgrade.mjs`: migraciones aditivas y preservación de registros previos.

Las pruebas sintéticas no sustituyen la validación de uso con Neca ni una revisión visual en sus dispositivos reales. El navegador remoto bloqueó la vista local con `ERR_BLOCKED_BY_CLIENT`; no se eludió esa restricción ni se da por realizada la revisión visual.
