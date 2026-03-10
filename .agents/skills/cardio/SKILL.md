---
name: cardio
description: 🫀 Cardiólogo + Dev — ECG, ritmo cardíaco, BTL CardioPoint, interpretación de trazados y parámetros cardiovasculares.
---

# 🫀 /cardio — Cardiólogo Senior + Full-Stack Developer

Agente experto en cardiología ocupacional Y desarrollo de software para GP Medical Health.

## Perfil Clínico

**Especialidad:** Cardiología y Electrocardiografía Clínica
**Equipo:** BTL CardioPoint

### Parámetros del ECG

#### Intervalos y Duraciones
| Parámetro | Normal | Significado |
|:---|:---|:---|
| FC | 60-100 lpm | Frecuencia cardíaca |
| RR | 600-1000 ms | Intervalo entre latidos |
| Onda P | 80-120 ms | Despolarización auricular |
| PR | 120-200 ms | Conducción AV |
| QRS | 60-100 ms | Despolarización ventricular |
| QT | 350-450 ms | Repolarización ventricular |
| QTc | <440 H / <460 M ms | QT corregido (Bazett) |

#### Ejes Eléctricos
```
Eje P     — 0° a 75° (normal)
Eje QRS   — -30° a +90° (normal)
  Izquierdo: < -30° (HVI, BRIHH)
  Derecho:   > +90° (HVD, BRDHH)
Eje T     — concordante con QRS
```

#### Ritmos
- **Sinusal normal** — cada QRS precedido por P, PR constante, FC 60-100
- **Bradicardia sinusal** — sinusal con FC <60
- **Taquicardia sinusal** — sinusal con FC >100
- **Fibrilación auricular** — ausencia de P, RR irregular
- **Flutter auricular** — ondas F en dientes de sierra

#### Bloqueos
```
BAV 1°    — PR > 200ms constante
BAV 2° M1 — alargamiento progresivo de PR (Wenckebach)
BAV 2° M2 — PR fijo con P no conducidas
BAV 3°    — disociación AV completa
BRDHH     — QRS >120ms, rSR' en V1-V2
BRIHH     — QRS >120ms, R ancha en V5-V6
```

#### Segmento ST
```
Normal     — isoeléctrico
Elevación  — >1mm en 2+ derivaciones contiguas → isquemia aguda
Depresión  — >0.5mm → isquemia subendocárdica
```

## Perfil Técnico

### Extracción
Cada parámetro numérico como item con gauge visualization.
Ejes como items separados. Interpretación automática del equipo.
Si hay trazado: marcar `TIENE_TRAZADO_IMAGEN: true`.

**Para el flujo completo de extracción → guardado → visualización,
usa el skill `ecg-extraction`** (`.agents/skills/ecg-extraction/SKILL.md`).

### Componentes React (ERP Frontend)
- `ElectrocardiogramaTab.tsx` — Tab principal con "Vista Escáner" + "Análisis IA"
  - `buildFromResultados()` — Transformer DB → UI state
  - `RhythmVisualizer` — Simulación visual del ritmo en SVG animado
  - `ECGParamGauge` — Gauge circular animado por parámetro
  - `EjesElectricos` — SVG circular de ejes eléctricos con vectores P/QRS/T
- `EstudioUploadReview.tsx` — Motor universal de upload + extracción IA + guardado a DB

### App Standalone (document-analyzer/ecg-extract)
- `App.tsx` — Upload + Gemini text extraction + waveform pixel digitization
- `ecgWaveformExtractor.ts` — Motor Canvas: PDF → Canvas → pixel trace → waveform data
- `EcgVisualReport.tsx` — Clon visual BTL CardioPoint con datos reales/simulados
- `EcgReport.tsx` — Reporte textual estructurado

### Pipeline Gemini
El prompt de ECG está en `geminiDocumentService.ts` case 'ecg'.
Pide: patientData, parámetros numéricos (FC/RR/P/PR/QRS/QT/QTc/SpO2/PA),
ejes eléctricos, interpretación automática y médica, metadatos del estudio.

