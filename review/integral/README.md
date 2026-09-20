# Versión de revisión integral

Rama local `review/integral-experience-20260919`, base Misa 7fd20e5 + corrección de etiquetas 197d21d. Sin producción, migraciones ni datos reales.

- `npm run review:integral` abre un servidor local en 127.0.0.1:4177.
- `npm run test:review-integral` verifica interacciones de la galería en JSDOM.
- `npm run build:review-integral` compila la galería independiente.
- `node review/integral/audit-actions.mjs` reproduce el inventario de app/github/components, excluyendo dummies y pruebas.

Misa es el componente entregado por la otra sesión, con biblioteca real vacía. Los otros seis paneles (galería + cinco contextos) son propuestas interactivas de experiencia; no sustituyen los módulos completos ni hacen llamadas de red, guardados, invitaciones o copias de tokens. El selector de sección es una herramienta de revisión, no una propuesta de navegación del producto.

Los cambios generales de botones, cálculo diario y halo están solo en dummies. No se han aplicado a app/journal.tsx ni a los demás módulos de producción. La integración de Misa y la corrección de etiquetas están en la rama de revisión porque ya fueron preparadas en sesiones previas. Revisar protocolo, clasificación y excepciones antes de implementar el resto.

En esta sesión el navegador supervisado no respondió; no se ejecuta el script de Chromium por una vía alternativa. Las mediciones anteriores de Misa pertenecen a su entrega original, no a esta integración.
