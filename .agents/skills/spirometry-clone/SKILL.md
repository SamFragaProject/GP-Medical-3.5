---
name: spirometry-clone
description: 🫁📄 SpiroClone + Midu — Extracción, replicación digital y guardado de espirometría PDF sin pérdida de datos. Pipeline completo: PDF → Gemini → JSON → Supabase → SpirometryReport UI.
---

# 🫁📄 /spirometry-clone — Replica Digital Fiel de PDFs de Espirometría

Agente experto que combina neumología clínica (/neumo) + ingeniería frontend limpia (/midu) para extraer, guardar y visualizar espirometría sin perder **ningún dato** del PDF original.

---

## 🎯 Objetivo

Dado un PDF de espirometría (EasyOne Connect / GP Medical), producir:
1. **Un JSON completo** con 100% de los datos del PDF
2. **Un registro en Supabase** (`estudios_clinicos.datos_extra.spiroclone_data`)
3. **Una visualización React idéntica** al reporte físico (`SpirometryReport`)

---

## 📐 Arquitectura del Pipeline

```
PDF / Imagen
     ↓
  toBase64()           ← FileReader API, mimeType preservado
     ↓
Gemini API Call        ← modelo cascada, SIN responseSchema
     ↓
JSON SpiroClone        ← patient + testDetails + results[] + session + doctor + graphs
     ↓
Supabase INSERT        ← estudios_clinicos.datos_extra.spiroclone_data = json
     ↓
EspirometriaTab        ← detecta spiroclone_data → <SpirometryReport data={json} />
```

---

## 🔑 Reglas Críticas del Pipeline (lecciones aprendidas)

### 1. NUNCA usar `responseSchema` para espirometría
```typescript
// ❌ MAL — responseSchema silencia arrays que el modelo no puede llenar
config: {
  responseMimeType: "application/json",
  responseSchema: spirocloneSchema,   // ← causa results: undefined
}

// ✅ BIEN — JSON libre, estructura en el prompt
config: {
  responseMimeType: "application/json",
  temperature: 0.1,
  // SIN responseSchema
}
```

### 2. Cascade de modelos — el API key puede no tener acceso a todos
```typescript
const MODELS_TO_TRY = [
  'gemini-3.1-pro-preview',  // SpiroClone usa este (AI Studio)
  'gemini-2.5-pro',          // Alternativa GA
  'gemini-2.0-pro',          // Fallback
  'gemini-2.0-flash',        // Último recurso
]
// Iterar hasta que uno devuelva results.length > 0
```

### 3. Imágenes ANTES del texto en `contents`
```typescript
// ✅ CORRECTO — igual que SpiroClone App.tsx
const contents = [
  { inlineData: { data: base64, mimeType: 'application/pdf' } },  // ← imagen/PDF primero
  promptText   // ← texto después
]

// ❌ MAL — texto primero confunde al modelo
const contents = [promptText, { inlineData: ... }]
```

### 4. Validar que `results` tenga datos antes de aceptar respuesta
```typescript
if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
  // rechazar y probar siguiente modelo
  continue
}
```

### 5. Nombre del paciente en formato "APELLIDO APELLIDO, NOMBRE"
```typescript
// SpiroClone devuelve: "URIBE LOPEZ, FEDERICO"
// Parsear así:
if (name.includes(',')) {
  const [apellidoPart, nombrePart] = name.split(',').map(s => s.trim())
  const apellidos = apellidoPart.split(' ')
  return { nombre: nombrePart, apellido_paterno: apellidos[0], apellido_materno: apellidos[1] || '' }
}
```

---

## 📋 Estructura JSON Completa (SpiroClone Format)

```typescript
interface SpirometryData {
  patient: {
    name: string        // "URIBE LOPEZ, FEDERICO"
    id: string          // "#0571"
    age: string         // "39 años"
    dob: string         // "23/07/1986"
    sex: string         // "Masculino"
    height: string      // "172 cm"
    weight: string      // "82 kg"
    origin: string      // "Hispano"
    smoker: string      // "No"
    asthma: string      // "No"
    copd: string        // "No"
    bmi: string         // "27.7"
  }
  testDetails: {
    date: string           // "28/11/2025 10:06:55 a. m."
    interpretation: string // "GOLD(2008)/Hardie"
    predicted: string      // "Hankinson (NHANES III), 1999 * 1.00"
    selection: string      // "BTPS (INSP/ESP)"
    bestValue: string      // "1.12/1.02"
    fev1PredPercent: string // "83 %"
  }
  results: Array<{
    parameter: string    // "FVC [L]", "FEV1 [L]", "FEV1/FVC [%]", etc.
    pred: string         // "4.52"
    lln: string          // "3.71"
    mejor: string        // "3.89*"  ← asterisco = mejor valor
    prueba2: string      // "3.82"
    prueba5: string      // "3.65"
    prueba6: string      // "3.71"
    percentPred: string  // "86"
    zScore: string       // "-0.53"
  }>
  session: {
    quality: string        // "Previo C (FEV1 Var=65 mL, FVC Var=76 mL)"
    interpretation: string // "Previo Espirometría Normal"
  }
  doctor: {
    name: string    // "DR. JOSE CARLOS GUIDO PANCARDO"
    date: string    // "30/11/2025"
    notes: string   // "PATRON RESPIRATORIO NORMAL."
  }
  graphs: {
    flowVolume: Array<{
      volume: number      // Eje X (L) — 0 a ~8
      flowPred: number    // Curva predicha (punteada)
      flowMejor: number   // Mejor prueba (azul sólida)
      flowPrueba2: number
      flowPrueba5: number
      flowPrueba6: number
    }>
    volumeTime: Array<{
      time: number        // Eje X (s) — -1 a ~8
      volumePred: number  // Curva predicha
      volumeMejor: number // Mejor prueba
      volumePrueba2: number
      volumePrueba5: number
      volumePrueba6: number
    }>
  }
}
```

---

## 💾 Guardado en Supabase

```typescript
// Guardar como datos_extra en estudios_clinicos
await supabase.from('estudios_clinicos').insert({
  paciente_id: pacienteId,
  tipo_estudio: 'espirometria',
  fecha_estudio: new Date().toISOString().split('T')[0],
  estado: 'completado',
  datos_extra: {
    spiroclone_data: spiroJson,         // ← el JSON completo
    _source: 'SpiroClone Direct Pipeline',
    _model: modelUsado,
    _extracted_at: new Date().toISOString()
  }
})

// Lectura en EspirometriaTab.tsx:
if (est.datos_extra?.spiroclone_data) {
  setDirectSpiroData(est.datos_extra.spiroclone_data)
  // También setData() para que la UI no muestre "Sin registros"
}
```

---

## 🖥️ Visualización — SpirometryReport

El componente `SpirometryReport.tsx` (copiado de SpiroClone) renderiza:
- **Header GP Medical** con logo y datos del paciente
- **Tabla de parámetros** con columnas Pred/LLN/Mejor/PruebaX/%Pred/Z-Score
- **Gráfica Flujo-Volumen** SVG con todas las curvas (medida + predicha + pruebas)
- **Gráfica Volumen-Tiempo** SVG
- **Sección calidad** y **diagnóstico del médico**

```tsx
// En EspirometriaTab.tsx — sección "scanner"
{directSpiroData ? (
  <SpirometryReport data={directSpiroData} />
) : spiroReportData ? (
  <SpirometryReport data={spiroReportData} />  // datos de DB legacy
) : null}
```

---

## 🔄 Flujo Completo de Implementación

Cuando el usuario pida leer/replicar un PDF de espirometría:

### Paso 1 — Verificar función `analyzeSpirometryDirect`
```
archivo: src/services/geminiDocumentService.ts
función: analyzeSpirometryDirect(_text: string, imageFiles: File[])
verificar:
  - modelos en cascade (no solo flash)
  - SIN responseSchema en config
  - contents: [imágenes primero, prompt después]
  - prompt incluye estructura JSON completa
  - validación: data.results?.length > 0
```

### Paso 2 — Verificar `documentExtractorService.ts`
```
función: extractFromFile(file: File)
verificar:
  - detecta categoria 'espirometria'
  - llama a analyzeSpirometryDirect (NO analyzeDocument)
  - incluye _spiroclone_raw en el resultado
  - adaptSpiroCloneToFlat() parsea correctamente
```

### Paso 3 — Verificar `EspirometriaTab.tsx`
```
función: loadData()
verificar:
  - FUENTE 1: estudios_clinicos donde datos_extra->spiroclone_data existe
  - setDirectSpiroData(est.datos_extra.spiroclone_data)
  - render: <SpirometryReport data={directSpiroData} />
```

### Paso 4 — Verificar `PacientesHub.tsx` (ImportarWizard)
```
handler: onComplete async (data, existingId)
verificar:
  - si data._spiroclone_raw && existingId → INSERT en estudios_clinicos
  - navega al perfil del paciente después
```

---

## 🚨 Anti-patterns — NUNCA hacer

```typescript
// ❌ Nunca usar analyzeDocument() para espirometría — es el pipeline genérico
// que no extrae resultados, curvas ni doctor correctamente

// ❌ Nunca confiar en responseSchema para datos complejos — silencia campos
// que el modelo no puede llenar

// ❌ Nunca usar solo gemini-2.0-flash para documentos médicos complejos
// — no tiene capacidad para tablas espirométricas detalladas

// ❌ Nunca parsear el nombre del paciente directamente como "NOMBRE APELLIDOS"
// — el formato del PDF es "APELLIDO PATERNO APELLIDO MATERNO, NOMBRE(S)"

// ❌ Nunca skip la validación de results.length > 0
// — Gemini puede devolver valid JSON pero con arrays vacíos
```

---

## 📝 Prompt Gemini Probado y Funcional

```
ERES UN EXPERTO EN EXTRACCIÓN DE DATOS MÉDICOS. Extrae todos los datos de este reporte de espirometría.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta (sin markdown, sin texto adicional):
{
  "patient": { "name": "", "id": "", "age": "", "dob": "", "sex": "", "height": "", "weight": "", "origin": "", "smoker": "", "asthma": "", "copd": "", "bmi": "" },
  "testDetails": { "date": "", "interpretation": "", "predicted": "", "selection": "", "bestValue": "", "fev1PredPercent": "" },
  "results": [
    { "parameter": "FVC [L]", "pred": "", "lln": "", "mejor": "", "prueba2": "", "prueba5": "", "prueba6": "", "percentPred": "", "zScore": "" }
  ],
  "session": { "quality": "", "interpretation": "" },
  "doctor": { "name": "", "date": "", "notes": "" },
  "graphs": {
    "flowVolume": [{ "volume": 0, "flowPred": 0, "flowMejor": 0, "flowPrueba2": 0, "flowPrueba5": 0, "flowPrueba6": 0 }],
    "volumeTime": [{ "time": 0, "volumePred": 0, "volumeMejor": 0, "volumePrueba2": 0, "volumePrueba5": 0, "volumePrueba6": 0 }]
  }
}

INSTRUCCIONES CRÍTICAS:
- Extrae TODOS los parámetros de la tabla (FVC, FEV1, FEV1/FVC, PEF, FEF25-75, etc.)
- El campo "mejor" puede tener asterisco (e.g. "3.89*")
- Extrae 20-25 puntos de cada gráfica leyendo los ejes X e Y visualmente
- Si un valor no existe, usa null o cadena vacía
- NO uses el formato ```json```, devuelve SOLO el JSON
```

---

## 🛠️ Debugging Checklist

Si `results` llega vacío (`undefined` o `[]`):

1. **Verificar consola** → ¿qué modelo se usó? ¿hubo error 403/404?
2. **Verificar `responseSchema`** → asegurarse de que NO está en el config
3. **Verificar order de `contents`** → imágenes primero, texto después
4. **Verificar mimeType** → `file.type` debe ser `'application/pdf'` o `'image/jpeg'`
5. **Probar con imagen** → convertir PDF a imagen primero si el modelo no soporta PDF inline
6. **Ver JSON raw** → agregar `console.log(jsonStr)` antes del parse

Si el JSON llega pero `SpirometryReport` no lo muestra:

1. **Verificar** `directSpiroData` en EspirometriaTab → debe estar seteado
2. **Verificar** `estudios_clinicos.datos_extra` en Supabase → columna tipo jsonb
3. **Verificar** `.datos_extra?.spiroclone_data` → check anidamiento correcto
