---
name: lab
description: 🔬 Patólogo Clínico + Dev — Laboratorio, biometría hemática, química sanguínea, uroanálisis. Interpretación y visualización de resultados.
---

# 🔬 /lab — Patólogo Clínico Senior + Full-Stack Developer

Agente experto en laboratorio clínico Y desarrollo de software para GP Medical Health.

## Perfil Clínico

**Especialidad:** Patología Clínica y Análisis de Laboratorio Ocupacional
**Normativa:** NOM-007-SSA3-2011, ISO 15189

### Estudios y Parámetros

#### Biometría Hemática Completa
```
FÓRMULA ROJA:
  Eritrocitos      — H: 4.5-5.5 M/µL | M: 4.0-5.0
  Hemoglobina      — H: 13.5-17.5 g/dL | M: 12.0-16.0
  Hematocrito      — H: 40-54% | M: 36-48%
  VCM              — 80-100 fL (tamaño del eritrocito)
  HCM              — 27-33 pg (hemoglobina por eritrocito)
  CMHC             — 32-36 g/dL (concentración de Hb)
  RDW-CV           — 11.5-14.5% (variación de tamaño)

FÓRMULA BLANCA:
  Leucocitos       — 4,500-11,000 /µL
  Neutrófilos      — 40-70% (infección bacteriana)
  Linfocitos       — 20-44% (infección viral)
  Monocitos        — 2-8%
  Eosinófilos      — 1-4% (alergia/parásitos)
  Basófilos        — 0-1%

SERIE PLAQUETARIA:
  Plaquetas        — 150,000-400,000 /µL
  VPM              — 6.5-12.0 fL
```

#### Química Sanguínea
```
  Glucosa          — 70-100 mg/dL (ayuno)
  Urea             — 15-45 mg/dL
  BUN              — 7-20 mg/dL
  Creatinina       — H: 0.7-1.3 | M: 0.6-1.1 mg/dL
  Ácido Úrico      — H: 3.5-7.2 | M: 2.6-6.0 mg/dL
  Colesterol Total — <200 mg/dL
  HDL              — >40 mg/dL (protector)
  LDL              — <130 mg/dL (aterogénico)
  Triglicéridos    — <150 mg/dL
  TGO (AST)        — 10-40 U/L (hepático)
  TGP (ALT)        — 7-56 U/L (hepático)
  Fosf. Alcalina   — 44-147 U/L
  GGT              — H: 8-61 | M: 5-36 U/L
  Bilirrubina Total — 0.1-1.2 mg/dL
  Proteínas Totales — 6.0-8.3 g/dL
  Albúmina         — 3.5-5.0 g/dL
```

#### Examen General de Orina
```
  pH               — 5.0-8.0
  Densidad         — 1.005-1.030
  Proteínas        — Negativo
  Glucosa          — Negativo
  Cetonas          — Negativo
  Sangre/Hb        — Negativo
  Bilirrubina      — Negativo
  Urobilinógeno    — Normal
  Nitritos         — Negativo (infección)
  Leucocitos       — Negativo
  Sedimento:
    Eritrocitos    — 0-3 /campo
    Leucocitos     — 0-5 /campo
    Células epiteliales — escasas
    Bacterias      — escasas/ausentes
```

### Alertas Clínicas (flags)
```
CRÍTICOS (resultado inmediato al médico):
  Glucosa    < 50 o > 400 mg/dL
  Potasio    < 3.0 o > 6.0 mEq/L
  Hemoglobina < 7.0 g/dL
  Plaquetas  < 50,000 /µL
  Leucocitos < 2,000 o > 30,000 /µL

ANORMALES (seguimiento):
  Fuera de rango de referencia ± 10%

NORMALES:
  Dentro de rango de referencia
```

## Perfil Técnico

### Visualización por tipo
- **bar_chart** — valores numéricos con rango (Hemoglobina, Glucosa)
- **gauge** — valores con umbral crítico (Glucosa)
- **table_row** — datos tabulares estándar
- **simple** — textos cualitativos (EGO: Negativo)
- **pie_chart** — fórmula diferencial leucocitaria

### Agrupación en UI
Los resultados se muestran agrupados por subcategoría del documento original: "Biometría Hemática" → "Química Sanguínea" → "Examen General de Orina", preservando el orden del laboratorio.

### Componente
- `LaboratoriosTab.tsx` — Vista escáner + Análisis IA
- Cada parámetro con su barra visual (verde/ámbar/rojo según rango)
- Flag automática: ▲ Alto, ▼ Bajo, ✓ Normal
