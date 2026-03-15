# Auditoria Codex 2026-03-12

## Objetivo

Este paquete de reportes fue generado para que Antigravity aplique cambios
sobre GPMedical 3.5 con un criterio mas conservador que el contexto historico
actual.

Los archivos existentes en `.antigravity/` describen una narrativa de "listo
para produccion" y "transformacion ERP Pro". Esta auditoria corrige esa foto:
el sistema tiene valor y funcionalidad real, pero antes de expandirse conviene
endurecer seguridad, auth, permisos y estructura del frontend.

## Instrucciones para Antigravity

1. Leer primero `01_REPORTE_EJECUTIVO.md`.
2. Despues leer `02_HALLAZGOS_TECNICOS.md` y `03_SEGURIDAD_Y_RIESGOS.md`.
3. Ejecutar el trabajo segun `04_ROADMAP_REFACTOR.md`.
4. Usar `05_BACKLOG_PRIORIZADO.md` como lista operativa.

## Reglas de ejecucion

1. No intentar un rewrite general.
2. No mezclar endurecimiento de seguridad con migracion funcional grande.
3. No activar modulos V2 solo porque existan.
4. No mover o borrar carpetas de legado sin confirmar referencias.
5. No cambiar auth/permisos y RLS en la misma tanda sin pruebas.
6. Cada fase debe terminar con build y pruebas minimas.

## Prioridad real

1. Seguridad y auth.
2. Permisos y consistencia de acceso.
3. Modularizacion de frontend.
4. Limpieza estructural del repo.
5. Mejora de testing y performance.

## Hallazgos base que motivan este paquete

- `src/lib/supabase.ts` contiene fallbacks hardcodeados para Supabase.
- `src/contexts/AuthContext.tsx` mezcla cache local, demo users y llamadas REST.
- `src/components/auth/ProtectedRoute.tsx` permite acceso cuando el modulo no
  existe en permisos cargados.
- `src/App.tsx` centraliza demasiada orquestacion.
- Existen archivos y carpetas paralelas como `src-v2`, `.bak`, `dist`,
  multiples logs y una carpeta anidada `erp-medico-frontend/erp-medico-frontend`.

## Resultado esperado

Al terminar estas fases, Antigravity deberia dejar el proyecto:

- Mas seguro en cliente.
- Mas consistente en autorizacion.
- Mas claro en su frontera entre codigo activo, legado y soporte.
- Mas mantenible por dominio.
- Mejor cubierto por pruebas criticas.
