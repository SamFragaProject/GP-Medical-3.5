---
description: Guía de mejores prácticas para GPMedical ERP
---

# Skills Instaladas para GPMedical

## ✅ Configurado

### 1. Stagehand (Testing con IA)
- **Archivo:** `tests/stagehand-gpmedical.spec.ts`
- **Uso:** Tests E2E con lenguaje natural
- **Modelo:** OpenAI GPT-4o
- **Caching:** Activado (reduce costos)

### 2. OpenAI SDK
- **API Key:** Configurada en `.env.local`
- **Variables:**
  - `VITE_OPENAI_API_KEY` (frontend)
  - `OPENAI_API_KEY` (tests/backend)

## 📋 Skills Recomendadas (Pendientes)

Visita [skills.sh](https://skills.sh) para instalar:

1. **systematic-debugging** - Depuración sistemática
2. **error-handling-patterns** - Patrones de manejo de errores
3. **supabase-postgres-best-practices** - Optimización de Supabase
4. **e2e-testing-patterns** - Patrones de testing E2E
5. **vercel-react-best-practices** - Deploy optimizado

## 🚀 Cómo Ejecutar Tests con Stagehand

```bash
# Asegúrate de tener el servidor corriendo
npm run dev

# En otra terminal, ejecuta los tests
npx playwright test tests/stagehand-gpmedical.spec.ts
```

## 💡 Tips de Uso

### Escribir tests en español
```typescript
await stagehand.act('Haz clic en el botón de guardar');
await stagehand.act('Escribe "Juan Pérez" en el campo de nombre');
```

### Extraer datos estructurados
```typescript
const datos = await stagehand.extract({
  instruction: 'Extrae el nombre y email del formulario',
  schema: z.object({
    nombre: z.string(),
    email: z.string(),
  }),
});
```

## 📊 Costos Estimados

| Acción | Costo aprox. |
|--------|--------------|
| Primera ejecución de test | ~$0.02 |
| Ejecución cacheada | $0.00 |
| Suite completa (10 tests) | ~$0.20 |
