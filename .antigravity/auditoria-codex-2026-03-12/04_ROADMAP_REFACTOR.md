# Roadmap de Refactor

## Principio rector

No reescribir. Corregir primero lo riesgoso, despues modularizar, despues
optimizar.

## Fase 0. Preparacion

### Objetivo

Levantar una linea base segura antes de tocar piezas grandes.

### Tareas

- Confirmar build actual.
- Confirmar tests actuales.
- Inventariar carpetas activas, legacy y artefactos.
- Documentar feature flags realmente vigentes.

### Criterio de salida

- Foto tecnica actual validada.

## Fase 1. Seguridad y auth

### Objetivo

Sacar ayudas de demo y fallbacks sensibles del flujo real.

### Tareas

- Quitar fallbacks hardcodeados de Supabase en cliente.
- Aislar credenciales demo.
- Revalidar cache local antes de exponer zonas sensibles.
- Cambiar `ProtectedRoute` a comportamiento conservador.

### Criterio de salida

- Entorno real no depende de valores embebidos.
- Accesos no se conceden por ausencia de datos de permisos.

## Fase 2. Unificacion de permisos

### Objetivo

Tener una sola narrativa de autorizacion.

### Tareas

- Auditar `usePermisosDinamicos`, CASL, middleware y RLS.
- Decidir flujo oficial de permisos.
- Eliminar duplicidades no usadas.
- Crear pruebas negativas por rol y empresa.

### Criterio de salida

- Permisos coherentes entre frontend y backend.

## Fase 3. Modularizacion del frontend

### Objetivo

Bajar el acoplamiento de `App.tsx` y de paginas criticas.

### Tareas

- Dividir rutas por dominio.
- Extraer wrappers locales.
- Partir `Pacientes`, `HistorialClinico`, `RayosX`, `FarmaciaHub`,
  `Usuarios` y `dataService`.

### Criterio de salida

- Menor complejidad por archivo.
- Mejor capacidad de prueba por dominio.

## Fase 4. Limpieza estructural

### Objetivo

Separar codigo activo de legado y artefactos.

### Tareas

- Clasificar `src-v2`, `.bak`, `dist`, carpeta anidada y logs.
- Mover reportes operativos a una zona documental clara.
- Eliminar dependencias globales entre V1 y V2 cuando no sean necesarias.

### Criterio de salida

- Repo con frontera mas limpia.

## Fase 5. Testing y performance

### Objetivo

Fortalecer confiabilidad y bajar peso innecesario.

### Tareas

- Reescribir pruebas E2E blandas a pruebas mas deterministas.
- Agregar smoke tests por dominio y pruebas de permisos.
- Auditar `pdfjs`, CSS global y chunks pesados.

### Criterio de salida

- Mejor red de seguridad para cambios futuros.

## Secuencia recomendada para Antigravity

1. Fase 0 completa.
2. Fase 1 completa.
3. Fase 2 completa.
4. Solo entonces entrar a Fase 3.
5. Fase 4 y Fase 5 al cierre o en paralelo controlado.
