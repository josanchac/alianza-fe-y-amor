# Implementación de experiencia aprobada — primer bloque

Actualización posterior: ver `IMPLEMENTATION_PROGRESS_20260920_BLOCK2.md`. La repetición diaria y las 75 acciones restantes ya tienen implementación y pruebas; la revisión visual/documental y la publicación siguen pendientes.

## Estado de integración
- Rama local `review/integral-experience-20260919`, base de revisión `34a2e0f`.
- GitHub consultado: main sigue en `8a666b5`; Misa en `7fd20e5`; frecuencia en `197d21d`. No se sobrescribieron otras ramas.
- Sin push, despliegue, migraciones ni operaciones sobre datos de usuarios.
- Aprobación del usuario: dummy completo, claro fijo y checkbox «Permitir más de una vez al día». No es autorización de publicación.

## Implementado en esta rama
- El símbolo diario usa `rhythmProgress(..., 'day')`, no el total de hábitos de todas las frecuencias. Excluye los diarios marcados «Hoy no aplicaba».
- Todos los compromisos siguen en una vista, ordenados por momento del día.
- Meta semanal/mensual mantiene su denominador y relleno máximo. Aportes extra muestran contador y halo de intensidad fija; sin halo si el período tiene historia parcial.
- Checkbox para metas semanales/mensuales. Mapea a `unit` existente: sin unidad/days queda desactivado; times activado. No transforma el historial.
- Registrar otra vez / Deshacer último: conservan los controles de concurrencia y conexión existentes.
- Símbolo diario ampliado a 136 px (116 px en pantallas estrechas); botones livianos aplicados a edición de compromisos y registro/deshacer.
- Fuente del dummy en claro fijo, sin funciones de color dependientes del tema. No confundir la galería anterior con una vista fiel de toda esta implementación.

## Verificación
- Tipado: pasó.
- Suite completa existente `npm test`: pasó, incluidas pruebas Misa y bases desechables. No equivale a prueba contra producción.
- Compilación app: pasó; persiste advertencia de paquete mayor de 500 kB.
- Nueva prueba `test:approved-experience`: pasó, incluidos denominador diario, mensual cumplido, aporte adicional/halo, deshacer, meta fija, diarios excluidos, checkbox y preservación de meta.
- Compilación del entorno de revisión: pasó.
- Se corrigieron expectativas antiguas de tests que contaban mensuales como deuda diaria; no se eliminaron las verificaciones de persistencia.
- Revisión visual de esta implementación: pendiente. Pruebas humanas: pendientes. Ninguna simulación se presenta como validación humana.
- `verify:methodology`: falla por cotejo documental desactualizado. No se eludió ni renovó automáticamente.

## Pendiente — no declarar entrega integral
1. Aplicar y verificar el protocolo en las acciones restantes de rosario, pareja/grupos, administración y otras pantallas; mantener excepciones por intención.
2. Revisión visual integrada a 320/390/768 px, ampliación, Safari/iPhone, scroll y estados de error.
3. Repetición en metas diarias: el servidor actual solo permite conteos múltiples para semana/mes. No se expone un checkbox diario que el servidor rechazaría. Requiere evolución y pruebas de validación/planes antes de habilitarlo.
4. Revisión de metodología y fuentes autorizadas de Misa. Biblioteca de lecturas reales sigue vacía.
5. Aprobación de la versión integrada y autorización separada de publicación.

No se interpreta el primer bloque como finalización de todo el backlog previo.
