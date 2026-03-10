---
name: ecg-extraction
description: Cómo extraer, guardar y plasmar datos completos de electrocardiograma desde un PDF/imagen de GP Medical Health
---

# Electrocardiograma: Extracción → Guardado → Visualización

## Contexto

Los PDFs de electrocardiograma de GP Medical Health provienen del equipo **BTL CardioPoint**.
Pueden contener: (A) el trazado ECG de 12 derivaciones con tabla de mediciones,
(B) un reporte narrativo de interpretación médica, o (C) ambos.
Este skill define EXACTAMENTE qué dato va dónde, sin genéricos.

---

## 1. ANATOMÍA DEL PDF DE ECG (BTL CardioPoint)

### Sección A: Encabezado
```
[Logo BTL]  Nombre del paciente  |  Proveedor  |  [Espacio]
```

### Sección B: Datos del Paciente
```
GUTIERREZ VARGAS, MARIA GUADALUPE
Fecha de nacimiento: 10/01/1990 (Femenino 36)
Fecha del Examen: 28/11/2025 11:45
Tipo de estudio: ECG en reposo
```

**Formato del nombre:** `APELLIDO_PATERNO APELLIDO_MATERNO, NOMBRE(S)` con coma separando apellidos de nombre(s). Esto es CRÍTICO.

### Sección C: Tabla de Parámetros Eléctricos
```
FC   75 lpm     P     104 ms    Eje P    52°
RR   800 ms     PQ    148 ms    Eje QRS  61°
SpO2  —         QRS    86 ms    Eje T    37°
BP    —         QT    368 ms    QTc     412 ms
```

### Sección D: Cuadrícula ECG (12 derivaciones)
```
┌──────────────────────┬──────────────────────┐
│ I    ─────────       │ V1   ─────────       │
│ II   ─────────       │ V2   ─────────       │
│ III  ─────────       │ V3   ─────────       │
│ aVR  ─────────       │ V4   ─────────       │
│ aVL  ─────────       │ V5   ─────────       │
│ aVF  ─────────       │ V6   ─────────       │
├──────────────────────┴──────────────────────┤
│ II (tira de ritmo largo)                     │
└──────────────────────────────────────────────┘
```
- Fondo: cuadrícula roja (5mm grandes, 1mm pequeños)
- Trazado: línea negra sobre cuadrícula
- Calibración: 10.0 mm/mV, 25.00 mm/sec
- Filtro: 0.07 Spline - 90 Adapt, ~50 Hz

### Sección E: Interpretación Automática del Equipo
```
Ritmo sinusal
Resultados dentro de los límites normales con FC entre 60 y 100 lpm
```

### Sección F: Reporte Narrativo (si existe como documento separado o misma página)
```
Ritmo: Sinusal normal, regular, FC: 75 lpm
Intervalos: PR 148ms normal, QRS 86ms normal, QT 368ms, QTc 412ms normal
Ejes: P 52°, QRS 61°, T 37° — todos normales
Morfología: Ondas P normales. Complejos QRS sin alteraciones.
Segmento ST: Isoeléctrico en todas las derivaciones.
Onda T: Positiva y simétrica.
Conclusión: ECG normal. Sin contraindicación cardiológica para actividad laboral.
```

---

## 2. EXTRACCIÓN: Qué pedir a Gemini

### Grupo 1: Identificación del paciente → `patientData`
```json
{
  "name": "GUTIERREZ VARGAS, MARIA GUADALUPE",
  "birthDate": "10/01/1990",
  "age": "36",
  "gender": "Femenino",
  "folio": ""
}
```

**REGLA DE PARSEO del nombre:**
Si `name` contiene coma → formato `APELLIDO(S), NOMBRE(S)`
```
"GUTIERREZ VARGAS, MARIA GUADALUPE"
→ apellido_paterno = "GUTIERREZ"
→ apellido_materno = "VARGAS"
→ nombre = "MARIA GUADALUPE"
```

### Grupo 2: Parámetros numéricos → `results[]` con category "Parámetros Numéricos"
```json
[
  {"name": "FC", "value": "75", "unit": "lpm", "range": "60-100", "visualizationType": "gauge", "category": "Parámetros Numéricos"},
  {"name": "RR", "value": "800", "unit": "ms", "range": "600-1000", "visualizationType": "gauge", "category": "Parámetros Numéricos"},
  {"name": "ONDA_P", "value": "104", "unit": "ms", "range": "80-120", "category": "Parámetros Numéricos"},
  {"name": "INTERVALO_PR", "value": "148", "unit": "ms", "range": "120-200", "category": "Parámetros Numéricos"},
  {"name": "COMPLEJO_QRS", "value": "86", "unit": "ms", "range": "60-100", "category": "Parámetros Numéricos"},
  {"name": "INTERVALO_QT", "value": "368", "unit": "ms", "range": "350-450", "category": "Parámetros Numéricos"},
  {"name": "INTERVALO_QTC", "value": "412", "unit": "ms", "range": "<440 H / <460 M", "category": "Parámetros Numéricos"},
  {"name": "SPO2", "value": null, "unit": "%", "category": "Parámetros Numéricos"},
  {"name": "PA", "value": null, "unit": "mmHg", "category": "Parámetros Numéricos"}
]
```

### Grupo 3: Ejes eléctricos → `results[]` con category "Ejes Eléctricos"
```json
[
  {"name": "EJE_P", "value": "52", "unit": "°", "range": "0° a 75°", "category": "Ejes Eléctricos"},
  {"name": "EJE_QRS", "value": "61", "unit": "°", "range": "-30° a +90°", "category": "Ejes Eléctricos"},
  {"name": "EJE_T", "value": "37", "unit": "°", "category": "Ejes Eléctricos"}
]
```

### Grupo 4: Interpretación automática → `results[]` con category "Interpretación Automática"
```json
[
  {"name": "RITMO_AUTOMATICO", "value": "Ritmo sinusal", "category": "Interpretación Automática"},
  {"name": "RESULTADO_GLOBAL", "value": "ECG normal", "category": "Interpretación Automática"}
]
```

### Grupo 5: Interpretación médica narrativa → `results[]` con category "Interpretación Médica"
```json
[
  {"name": "DESCRIPCION_RITMO", "value": "Ritmo sinusal normal, regular, FC: 75 lpm...", "category": "Interpretación Médica"},
  {"name": "ANALISIS_MORFOLOGICO", "value": "Ondas P normales. Complejos QRS sin alteraciones...", "category": "Interpretación Médica"},
  {"name": "SEGMENTO_ST", "value": "Isoeléctrico en todas las derivaciones", "category": "Interpretación Médica"},
  {"name": "ONDA_T_DESC", "value": "Positiva y simétrica", "category": "Interpretación Médica"},
  {"name": "CONCLUSION_ECG", "value": "ECG normal. Sin contraindicación cardiológica...", "category": "Interpretación Médica"}
]
```

### Grupo 6: Metadatos → `results[]` con category "Datos del Estudio"
```json
[
  {"name": "TIPO_ESTUDIO", "value": "ECG en reposo", "category": "Datos del Estudio"},
  {"name": "EQUIPO_ECG", "value": "BTL CardioPoint 2.33.163.0", "category": "Datos del Estudio"},
  {"name": "FECHA_ESTUDIO", "value": "28/11/2025 11:45", "category": "Datos del Estudio"},
  {"name": "MEDICO_RESPONSABLE", "value": "Dr. José Carlos Guido Pancardo", "category": "Datos del Estudio"},
  {"name": "TIENE_TRAZADO_IMAGEN", "value": "true", "category": "Metadatos"}
]
```

---

## 3. GUARDADO EN BASE DE DATOS

### Regla fundamental: 1 PDF = 1 estudio clínico

```
estudios_clinicos:
  id: uuid
  paciente_id: uuid
  tipo_estudio: 'ecg'
  fecha_estudio: '2025-11-28'
  medico_responsable: 'Dr. José Carlos Guido Pancardo'
  equipo: 'BTL CardioPoint 2.33.163.0'
  diagnostico: 'ECG normal'
  interpretacion: 'Ritmo sinusal. Resultados dentro de los límites normales.'
  archivo_origen: 'https://storage.supabase.co/...fileName.pdf'
  datos_extra: {
    patientData: {...},
    _ai_config: 'Google Gemini Flash 2.0'
  }
```

```
resultados_estudio (N filas, una por resultado):
  - FC: 75
  - RR: 800
  - ONDA_P: 104
  - INTERVALO_PR: 148
  - COMPLEJO_QRS: 86
  - INTERVALO_QT: 368
  - INTERVALO_QTC: 412
  - EJE_P: 52
  - EJE_QRS: 61
  - EJE_T: 37
  - RITMO_AUTOMATICO: 'Ritmo sinusal'
  - RESULTADO_GLOBAL: 'ECG normal'
  - DESCRIPCION_RITMO: texto completo
  - ANALISIS_MORFOLOGICO: texto completo
  - SEGMENTO_ST: texto completo
  - ONDA_T_DESC: texto completo
  - CONCLUSION_ECG: texto completo
  - TIPO_ESTUDIO: 'ECG en reposo'
  - EQUIPO_ECG: 'BTL CardioPoint 2.33.163.0'
  - TIENE_TRAZADO_IMAGEN: 'true'
  - MEDICO_RESPONSABLE: 'Dr. José Carlos Guido Pancardo'
  - FECHA_ESTUDIO: '28/11/2025'
```

---

## 4. VISUALIZACIÓN: Cómo se plasma en pantalla

### Tab "Vista Escáner" (réplica fiel del ECG)

```
┌─────────────────────────────────────────────────────────────┐
│ 🫀 Electrocardiograma                                        │
│ ECG en reposo — Dr. José Carlos Guido Pancardo               │
│ 28 nov 2025                ECG Normal ✓                      │
│                                                              │
│ [Ritmo sinusal — Resultados dentro de los límites normales]  │
│                                                              │
│ ┌─── Parámetros del ECG ─── BTL CardioPoint ─────────────┐  │
│ │ FC       RR       Onda P   PR       QRS      QT        │  │
│ │ 75 lpm   800 ms   104 ms   148 ms   86 ms    368 ms    │  │
│ │ ✓Normal  ✓Normal  ✓Normal  ✓Normal  ✓Normal  ✓Normal   │  │
│ │                                                         │  │
│ │ QTc      Eje P    Eje QRS  Eje T    SpO2     PA        │  │
│ │ 412 ms   52°      61°      37°      —        —         │  │
│ │ ✓Normal  ✓Normal  ✓Normal  ✓Normal                     │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─── Reporte de Interpretación Médica ────────────────────┐  │
│ │ Ritmo Cardiaco:    Ritmo sinusal normal...              │  │
│ │ Análisis Morfológico: Ondas P normales...               │  │
│ │ Segmento ST:       Isoeléctrico...                      │  │
│ │ Conclusión / Diagnóstico: ECG normal...                 │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                              │
│ 📎 Archivo ECG Original: ecg_gutierrez.pdf [Ver]            │
└─────────────────────────────────────────────────────────────┘
```

### Tab "Análisis IA" (interpretación generada)

```
┌─────────────────────────────────────────────────────────────┐
│ 🧠 ANÁLISIS CARDIOLÓGICO IA                                  │
│ [Visualización ritmo cardiaco animado con 4 beats]           │
│ [Conclusión clínica completa]                                │
│                                                              │
│ ┌─ Gauges Parámetros Temporales ─────────────────────────┐  │
│ │ FC ████████░░ 75lpm   PR ████████░░ 148ms              │  │
│ │ QRS ███████░░ 86ms    QTc ████████░░ 412ms             │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─ Ejes Eléctricos (SVG circular) ───────────────────────┐  │
│ │ [Diagrama circular con vectores P, QRS, T]             │  │
│ │ Eje P:   52° → Normal                                 │  │
│ │ Eje QRS: 61° → Normal                                 │  │
│ │ Eje T:   37° → Normal                                 │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─ Interpretación Cardiológica Completa ─────────────────┐  │
│ │ Frecuencia Cardiaca: 75 lpm — rango normal             │  │
│ │ Sistema de Conducción: PR 148ms normal. QRS 86ms normal│  │
│ │ Conclusión: ECG dentro de límites normales.            │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─ Aptitud Laboral Cardiovascular ───────────────────────┐  │
│ │ ✅ Sin contraindicación cardiológica para puesto actual │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. CRITERIOS CLÍNICOS DE REFERENCIA

### Intervalos y Duraciones
| Parámetro | Normal | Significado |
|:---|:---|:---|
| FC | 60-100 lpm | Frecuencia cardíaca |
| RR | 600-1000 ms | Intervalo entre latidos |
| Onda P | 80-120 ms | Despolarización auricular |
| PR | 120-200 ms | Conducción AV |
| QRS | 60-100 ms | Despolarización ventricular |
| QT | 350-450 ms | Repolarización ventricular |
| QTc | <440 H / <460 M ms | QT corregido (Bazett) |

### Ejes Eléctricos
```
Eje P     — 0° a 75° (normal)
Eje QRS   — -30° a +90° (normal)
  Izquierdo: < -30° (HVI, BRIHH)
  Derecho:   > +90° (HVD, BRDHH)
Eje T     — concordante con QRS
```

### Ritmos
- **Sinusal normal** — cada QRS precedido por P, PR constante, FC 60-100
- **Bradicardia sinusal** — sinusal con FC <60
- **Taquicardia sinusal** — sinusal con FC >100
- **Fibrilación auricular** — ausencia de P, RR irregular
- **Flutter auricular** — ondas F en dientes de sierra

### Bloqueos
```
BAV 1°    — PR >200ms constante
BAV 2° M1 — alargamiento progresivo de PR (Wenckebach)
BAV 2° M2 — PR fijo con P no conducidas
BAV 3°    — disociación AV completa
BRDHH     — QRS >120ms, rSR' en V1-V2
BRIHH     — QRS >120ms, R ancha en V5-V6
```

### Segmento ST
```
Normal     — isoeléctrico
Elevación  — >1mm en 2+ derivaciones contiguas → isquemia aguda
Depresión  — >0.5mm → isquemia subendocárdica
```

---

## 6. FLUJO DEL WIZARD

```
[Subir Archivos]
    ↓
¿Paciente Nuevo o Existente?
    ├── Nuevo → Se extraen datos del paciente del PDF
    └── Existente → Se selecciona de lista
    ↓
[Por cada archivo subido, se muestra UNA sección]
    ↓
Sección: ECG.pdf
    ├── Tipo detectado: ECG (auto-detectado por nombre o contenido)
    ├── Extracción IA: [Procesando... → NN parámetros extraídos]
    ├── Vista previa: acordeón con categorías + confirmación
    └── ✅ Confirmar datos
    ↓
[Guardar Todo]
    ├── 1 registro en `estudios_clinicos` (tipo: ecg)
    ├── N registros en `resultados_estudio` (todos los campos)
    ├── Archivo en `documentos-medicos` storage (Supabase)
    └── Redirigir al perfil del paciente → pestaña ECG
```

---

## 7. ARCHIVOS INVOLUCRADOS

1. `geminiDocumentService.ts` → Prompt de ECG (case 'ecg'), líneas 499-556
2. `EstudioUploadReview.tsx` → Motor universal de extracción + guardado (pipeline genérico)
3. `ElectrocardiogramaTab.tsx` → Tab visual con scanner + análisis IA
4. `RhythmVisualizer` — Simulación visual del ritmo en SVG animado
5. `ECGParamGauge` — Gauge circular animado por parámetro
6. `EjesElectricos` — SVG circular de ejes eléctricos
7. `estudiosService.ts` → `crearEstudioConResultados()` para guardar 1 estudio + N resultados
8. `DocumentosAdjuntos.tsx` → Mostrar archivo original subido

### App Standalone (ecg-extract)
Ubicada en: `document-analyzer/ecg-extract/`
- `App.tsx` — Upload + Gemini extraction + waveform digitization
- `ecgWaveformExtractor.ts` — Motor de extracción pixel a pixel (PDF → Canvas → waveform data)
- `EcgVisualReport.tsx` — Clon visual BTL CardioPoint con datos reales
- `EcgReport.tsx` — Reporte textual estructurado

---

## 8. VALORES CRÍTICOS / ALERTAS AUTOMÁTICAS

El `ElectrocardiogramaTab.tsx` genera alertas automáticas para:

| Condición | Alerta |
|:---|:---|
| QTc > 450 ms | ⚠ QTc prolongado — Riesgo de Torsades de Pointes |
| FC < 60 | ⚠ Bradicardia |
| FC > 100 | ⚠ Taquicardia |
| PR > 200 ms | ⚠ PR prolongado — Bloqueo AV 1° grado |
| QRS > 120 ms | ⚠ QRS ancho — Descartar bloqueo de rama |
| Eje QRS < -30° o > 90° | ⚠ Desviación axial |

---

## 9. TRANSFORMER: resultados_estudio → UI

La función `buildFromResultados()` convierte de la tabla de resultados a un objeto interno:

```typescript
// De la tabla:
// parametro_nombre: 'FC', resultado_numerico: 75
// parametro_nombre: 'RITMO_AUTOMATICO', resultado: 'Ritmo sinusal'
// etc.

// Al objeto:
{
  fc: 75,
  rr: 800,
  onda_p: 104,
  intervalo_pr: 148,
  complejo_qrs: 86,
  intervalo_qt: 368,
  intervalo_qtc: 412,
  eje_p: 52,
  eje_qrs: 61,
  eje_t: 37,
  ritmo_automatico: 'Ritmo sinusal',
  resultado_global: 'ECG normal',
  descripcion_ritmo: '...',
  analisis_morfologico: '...',
  segmento_st: '...',
  conclusion: '...',
  tipo_estudio: 'ECG en reposo',
  equipo: 'BTL CardioPoint 2.33.163.0',
  medico: 'Dr. José Carlos Guido Pancardo',
  tiene_trazado: true,
  clasificacion: 'normal'
}
```
