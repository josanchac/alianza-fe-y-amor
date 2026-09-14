# Versionado y etapas

Usamos formato [Semantic Versioning 2.0.0](https://semver.org/lang/es/), con política de madurez propia del producto. SemVer define números y prelanzamientos; no certifica usabilidad ni prescribe las puertas de alfa/beta.

- **Alfa de acceso por invitación**: funcionalidades en evaluación con el piloto existente; cambios de experiencia esperables. Versión preparada 0.2.0-alpha.5, con publicación controlada y mantenimiento. El código es público; los datos personales requieren autenticación y permisos. La vista privada de revisión conserva alpha.3 con datos sintéticos.
- **Beta privada**: recorridos esenciales observados con usuarios diversos, sin bloqueos conocidos; conservación, privacidad y recuperación verificadas. Ampliación de usuarios por decisión expresa.
- **Candidata (rc)**: alcance congelado, correcciones finales y ensayo de publicación/recuperación.
- **Estable (1.0.0)**: criterios de lanzamiento cerrados, compatibilidad documentada y soporte operativo preparado. No equivale a certificación ni ausencia garantizada de errores.

Cada nueva entrega cambia número y fecha, añade CHANGELOG y evidencia, y conserva commits/publicaciones previas. La nueva línea de espacios independientes usa 0.2.0-alpha.1; las correcciones de esta línea continuarán como 0.2.0-alpha.5. Nunca reemplazar el contenido de una versión ya entregada.

La fuente del número es package.json, leída por app/version.ts; package-lock.json debe coincidir. Las versiones de Sites cuentan vistas privadas, no sustituyen este número de producto. Las migraciones tienen su propio registro y compatibilidad. RELEASE en app/home.tsx es un identificador interno de preferencias anterior al versionado; no cambiarlo sin comprobar validación del servidor.

Antes de publicar: tipo, pruebas según riesgo, cotejo documental, build, CI y compatibilidad de migraciones. Después: verificar recursos y versión entregada, registrar incidentes y evidencia. Registrar tiempo/fallo/recuperación de cada entrega permite medir DORA cuando haya suficientes observaciones; no inventar estadísticas con una sola versión.
