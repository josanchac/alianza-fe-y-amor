# 0.2.0-alpha.4 · publicación controlada del piloto

Conserva la experiencia de alpha.3 confirmada por el propietario. Añade mantenimiento solicitado expresamente antes de activar el piloto.

- El inicio consulta un indicador público no sensible. No monta la aplicación mientras la publicación está cerrada.
- El mantenimiento posterior cubre la pantalla sin desmontar su contenido ni descartar borradores. Consulta cada 15 segundos y al volver a la pestaña; un fallo de consulta bloquea de forma conservadora.
- Triggers de base de datos protegen todas las tablas privadas, incluso frente a clientes antiguos. El cierre obtiene un bloqueo transaccional exclusivo y espera a que concluyan las escrituras que tomaron el bloqueo compartido. No se cancelan transacciones del usuario.
- El operador aplica migraciones sin identidad de usuario. El indicador y la instalación de triggers no son modificables por clientes.
- La versión del cliente se declara en x-client-info, cabecera habitual del SDK. No concede acceso: la autorización y el aislamiento existentes siguen siendo obligatorios.
- Tras la reapertura se exige la versión actual para guardar. Una pestaña anterior sin el mecanismo de aviso no puede actualizarse remotamente: deberá recargarse; el servidor rechazará sus escrituras.
- No se cambia la autenticación ni se amplía la lista de invitados. El código público no contiene registros reales ni copias de la base.

## Procedimiento

1. Pruebas locales y CI aislado de PostgreSQL y Auth/API antes del mantenimiento.
2. Publicación con config maintenance=true; comprobar entrega del aviso.
3. Instalar protección inactiva en la base existente, con timeout y bloqueos de tablas. Activarla bajo bloqueo exclusivo (8254,42).
4. Checkpoint privado en la misma base y comparación; no es un respaldo independiente de desastre ni de Auth.
5. Aplicar solo migraciones pendientes en transacción. Volver a instalar triggers en tablas nuevas y comparar todos los valores de las columnas originales con el checkpoint antes de confirmar.
6. Revisar permisos, asesores y recursos. Publicar config maintenance=false mientras el indicador del servidor sigue activo.
7. Desactivar el indicador y exigir la versión actual únicamente tras validar la publicación.

Si una comprobación falla, no reabrir sobre un estado dudoso. Mantener mantenimiento o revertir la interfaz compatible sin eliminar datos nuevos. No afirmar restauración de un respaldo independiente ni pruebas en dispositivos no realizadas.

Estado operativo y evidencias finales: se registrarán después de completar las comprobaciones del piloto.
