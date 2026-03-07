---
name: spirometry-extraction
description: Cómo extraer, guardar y plasmar datos completos de espirometría desde un PDF de GP Medical Health
---

# Espirometría: Extracción → Guardado → Visualización

## Contexto

El PDF de espirometría de GP Medical Health (equipo EasyOne Connect) contiene datos estructurados
en secciones claras. Este skill define EXACTAMENTE qué dato va dónde, sin genéricos.

---

## 1. ANATOMÍA DEL PDF DE ESPIROMETRÍA

El PDF tiene estas secciones visuales, de arriba a abajo:

### Sección A: Encabezado
```
GP Medical Health                                    [Logo]
GP Medicina Laboral
Dr. José Carlos Guido Pancardo
Medicina del Trabajo y Salud Ocupacional
```

### Sección B: Datos del Paciente (primera línea en negritas)
```
URIBE LOPEZ , FEDERICO          ID: #0571    Edad: 39 (23/07/1986)
Sexo    Masculino     Altura    172 cm       Asma    No
Origen étnico  Hispano   Peso   82 kg  IMC  27.7   EPOC   No
Fumador   No
```

**Formato del nombre:** `APELLIDO_PATERNO APELLIDO_MATERNO , NOMBRE(S)`
La coma separa apellidos de nombre. Esto es CRÍTICO.

### Sección C: Configuración del Test
```
FVC (sólo esp)                           Su FEV1 / Predicho: 83 %
Fecha del test    28/11/2025 10:06:55 a.m.
Tiempo posterior  -
Interpretación    GOLD(2008)/Hardie
Predicho          Hankinson (NHANES III), 1999 * 1.00
Selección         BTPS (INSP/ESP)        Mejor valor  1.12/1.02
```

### Sección D: Tabla de Parámetros
```
                            Previo
Parámetro   Pred   LLN    Mejor  Prueba2  Prueba6  Prueba5   %Pred  Puntuación Z
FVC [L]     4.89   4.03   3.96*  3.96*    3.76*    3.78*     81     -1.78
FEV1 [L]    3.96   3.24   3.28   3.28     3.13*    3.12*     83     -1.55
FEV1/FVC    0.814  0.723  0.827  0.827    0.832    0.826     102     0.23
FEF25-75    4.07   2.46   3.63   3.63     3.57     3.24      89    -0.45
PEF [L/s]   9.78   7.29   10.85  9.90     10.40    10.85    111     0.71
FET [s]     -      -      7.0    7.0      7.1      7.2       -      -
```

**NOTA:** El asterisco (*) indica valor situado fuera del rango normal.

### Sección E: Control de Calidad
```
Calidad de la sesión    Previo    C (FEV1 Var=0.14L (4.4%); FVC Var=0.19L (4.7%))
Interpretación sistema  Previo    Espirometría Normal
```

### Sección F: Gráfica de Barras Z-Score
Barras horizontales para FVC, FEV1, FEF25-75, PEF, FEV1/FVC mostrando la puntuación Z
con marcas en -5, -4, -3, -2, -1, 0, 1, 2, 3. El LLN y predicho están marcados.

### Sección G: Curva Flujo-Volumen
Eje X: Volumen [L] (0-8)
Eje Y: Flujo [L/s] (0-14)
Líneas: Previo Prueba 2 (sólida), Previo Prueba 6 (guiones), Previo Prueba 5 (punteada), Predicho (puntos azules)

### Sección H: Curva Volumen-Tiempo
Eje X: Tiempo [s] (-1 a 8)
Eje Y: Volumen [L] (0-8)
Mismas líneas que Flujo-Volumen + marcadores de Predicho

### Sección I: Pie
```
DR. JOSE CARLOS GUIDO PANCARDO 30/11/2025    [Firma]
PATRON RESPIRATORIO NORMAL
```

---

## 2. EXTRACCIÓN: Qué pedir a Gemini

Gemini debe extraer TODO como items separados en `results[]`.

### Grupo 1: Identificación del paciente → `patientData`
```json
{
  "name": "URIBE LOPEZ, FEDERICO",
  "birthDate": "23/07/1986",
  "age": "39",
  "gender": "Masculino",
  "folio": "0571"
}
```

**REGLA DE PARSEO del nombre:**
Si `name` contiene coma → formato `APELLIDO(S), NOMBRE(S)`
```
"URIBE LOPEZ, FEDERICO"
→ apellido_paterno = "URIBE"
→ apellido_materno = "LOPEZ"  
→ nombre = "FEDERICO"
```

### Grupo 2: Parámetros espirométricos → `results[]` con category "Parámetros Espirométricos"

Cada parámetro es UN item con value como JSON que contiene TODAS las columnas:

```json
{
  "name": "FVC",
  "value": "{\"pred\":4.89,\"lln\":4.03,\"mejor\":3.96,\"pruebas\":[3.96,3.76,3.78],\"pct_pred\":81,\"z_score\":-1.78,\"fuera_rango\":true}",
  "unit": "L",
  "category": "Parámetros Espirométricos",
  "description": "FVC 81% del predicho — Limítrofe"
}
```

**Campos del JSON value:**
- `pred`: valor predicho
- `lln`: límite inferior normal
- `mejor`: mejor resultado de las pruebas
- `pruebas`: array con valor de cada prueba individual [Prueba2, Prueba6, Prueba5]
- `pct_pred`: porcentaje del predicho
- `z_score`: puntuación Z
- `fuera_rango`: boolean si tiene asterisco (*)

### Grupo 3: Configuración del test → `results[]` con category "Configuración del Estudio"
```json
[
  {"name": "TIPO_PRUEBA", "value": "FVC (sólo esp)", "category": "Configuración del Estudio"},
  {"name": "FECHA_ESTUDIO", "value": "28/11/2025 10:06:55", "category": "Configuración del Estudio"},
  {"name": "CRITERIO_INTERPRETACION", "value": "GOLD(2008)/Hardie", "category": "Configuración del Estudio"},
  {"name": "ECUACION_PREDICHO", "value": "Hankinson (NHANES III), 1999 * 1.00", "category": "Configuración del Estudio"},
  {"name": "SELECCION_VALORES", "value": "BTPS (INSP/ESP)", "category": "Configuración del Estudio"},
  {"name": "MEJOR_VALOR_RATIO", "value": "1.12/1.02", "category": "Configuración del Estudio"},
  {"name": "EQUIPO", "value": "EasyOne Connect [3.7.0.2] / PC-Sensor [2.0.0.0] SN 251437", "category": "Configuración del Estudio"},
  {"name": "MEDICO_RESPONSABLE", "value": "Dr. José Carlos Guido Pancardo", "category": "Configuración del Estudio"}
]
```

### Grupo 4: Antropometría → `results[]` con category "Antropometría"
```json
[
  {"name": "ALTURA", "value": "172", "unit": "cm", "category": "Antropometría"},
  {"name": "PESO", "value": "82", "unit": "kg", "category": "Antropometría"},
  {"name": "IMC", "value": "27.7", "unit": "kg/m²", "range": "18.5-24.9", "category": "Antropometría"},
  {"name": "FUMADOR", "value": "No", "category": "Antropometría"},
  {"name": "ASMA", "value": "No", "category": "Antropometría"},
  {"name": "EPOC", "value": "No", "category": "Antropometría"},
  {"name": "ETNIA", "value": "Hispano", "category": "Antropometría"}
]
```

### Grupo 5: Control de calidad → `results[]` con category "Control de Calidad"
```json
[
  {"name": "CALIDAD_SESION", "value": "C", "description": "Dudosa", "category": "Control de Calidad"},
  {"name": "VARIABILIDAD_FEV1", "value": "0.14L (4.4%)", "category": "Control de Calidad"},
  {"name": "VARIABILIDAD_FVC", "value": "0.19L (4.7%)", "category": "Control de Calidad"}
]
```

### Grupo 6: Curvas gráficas → `results[]` con category "Gráficas"
```json
[
  {
    "name": "CURVA_FLUJO_VOLUMEN",
    "value": "{\"medido\":[{\"x\":0,\"y\":0},...],\"predicho\":[...],\"pruebas\":{\"prueba2\":[...],\"prueba6\":[...],\"prueba5\":[...]}}",
    "category": "Gráficas",
    "description": "Curva Flujo-Volumen (Flujo L/s vs Volumen L)"
  },
  {
    "name": "CURVA_VOLUMEN_TIEMPO", 
    "value": "{\"medido\":[...],\"predicho\":[...]}",
    "category": "Gráficas"
  },
  {
    "name": "ZSCORE_BARRAS",
    "value": "{\"FVC\":-1.78,\"FEV1\":-1.55,\"FEF25-75\":-0.45,\"PEF\":0.71,\"FEV1/FVC\":0.23}",
    "category": "Gráficas",
    "description": "Gráfica de barras Z-Score"
  }
]
```

### Grupo 7: Interpretación → `results[]` con category "Interpretación"
```json
[
  {"name": "INTERPRETACION_SISTEMA", "value": "Espirometría Normal", "category": "Interpretación"},
  {"name": "PATRON_VENTILATORIO", "value": "NORMAL", "category": "Interpretación"}
]
```

---

## 3. GUARDADO EN BASE DE DATOS

### Regla fundamental: 1 PDF = 1 estudio clínico

```
estudios_clinicos:
  id: uuid
  paciente_id: uuid
  tipo_estudio: 'espirometria'
  fecha_estudio: '2025-11-28'
  medico_responsable: 'Dr. José Carlos Guido Pancardo'
  equipo: 'EasyOne Connect [3.7.0.2]'
  calidad: 'C'
  diagnostico: 'Espirometría Normal'
  interpretacion: 'PATRON RESPIRATORIO NORMAL'
  datos_extra: {
    criterio: 'GOLD(2008)/Hardie',
    ecuacion_predicho: 'Hankinson (NHANES III), 1999',
    seleccion: 'BTPS (INSP/ESP)',
    mejor_valor: '1.12/1.02',
    variabilidad_fev1: '0.14L (4.4%)',
    variabilidad_fvc: '0.19L (4.7%)',
    fuente: 'extraccion_ia',
    total_resultados: N
  }
```

```
resultados_estudio (N filas, una por resultado):
  - FVC: {pred:4.89, lln:4.03, mejor:3.96, pruebas:[3.96,3.76,3.78], pct_pred:81, z_score:-1.78}
  - FEV1: {pred:3.96, lln:3.24, mejor:3.28, pruebas:[3.28,3.13,3.12], pct_pred:83, z_score:-1.55}
  - FEV1/FVC: {...}
  - FEF25-75: {...}
  - PEF: {...}
  - FET: {...}
  - CURVA_FLUJO_VOLUMEN: {medido:[...], predicho:[...], pruebas:{...}}
  - CURVA_VOLUMEN_TIEMPO: {medido:[...], predicho:[...]}
  - ZSCORE_BARRAS: {FVC:-1.78, FEV1:-1.55, ...}
  - ALTURA: 172
  - PESO: 82
  - IMC: 27.7
  - FUMADOR: No
  - ASMA: No
  - EPOC: No
  - ETNIA: Hispano
  - CALIDAD_SESION: C
  - INTERPRETACION_SISTEMA: Espirometría Normal
  - PATRON_VENTILATORIO: NORMAL
  - MEDICO_RESPONSABLE: Dr. José Carlos Guido Pancardo
  - EQUIPO: EasyOne Connect [3.7.0.2]
  - FECHA_ESTUDIO: 28/11/2025
  - CRITERIO_INTERPRETACION: GOLD(2008)/Hardie
  - ECUACION_PREDICHO: Hankinson (NHANES III), 1999
```

---

## 4. VISUALIZACIÓN: Cómo se plasma en pantalla

### Tab "Vista Escáner" (réplica fiel del PDF)

```
┌─────────────────────────────────────────────────────────┐
│ 🫁 Espirometría                                         │
│ Dr. José Carlos Guido Pancardo — EasyOne Connect        │
│ 28/11/2025 10:06 a.m.                                   │
│                                                         │
│ Paciente: URIBE LOPEZ, FEDERICO  ID: #0571  Edad: 39   │
│ ┌─────────┐  ┌──────────────┐  ┌────────────────┐      │
│ │Calidad C│  │Normal        │  │FEV1/Pred: 83%  │      │
│ │ Dudosa  │  │PATRON NORMAL │  │                 │      │
│ └─────────┘  └──────────────┘  └────────────────┘      │
├─────────────────────────────────────────────────────────┤
│ TABLA DE PARÁMETROS ESPIROMÉTRICOS                      │
│ ┌────────┬──────┬──────┬───────┬─────┬─────┬─────┬────┐│
│ │Param   │ Pred │ LLN  │Mejor  │ P2  │ P6  │ P5  │%Pr ││
│ ├────────┼──────┼──────┼───────┼─────┼─────┼─────┼────┤│
│ │FVC  L  │ 4.89 │ 4.03 │3.96*  │3.96*│3.76*│3.78*│ 81 ││
│ │FEV1 L  │ 3.96 │ 3.24 │ 3.28  │3.28 │3.13*│3.12*│ 83 ││
│ │FEV1/FVC│0.814 │0.723 │ 0.827 │0.827│0.832│0.826│ 102││
│ │FEF25-75│ 4.07 │ 2.46 │ 3.63  │3.63 │3.57 │3.24 │ 89 ││
│ │PEF L/s │ 9.78 │ 7.29 │10.85  │9.90 │10.40│10.85│ 111││
│ │FET  s  │  —   │  —   │ 7.0   │ 7.0 │ 7.1 │ 7.2 │  — ││
│ └────────┴──────┴──────┴───────┴─────┴─────┴─────┴────┘│
│ * Valor fuera de rango normal                           │
│ Variabilidad: FEV1 0.14L (4.4%) | FVC 0.19L (4.7%)     │
├─────────────────────────────────────────────────────────┤
│ GRÁFICAS                                                │
│ ┌──────────────────────┐ ┌─────────────────────┐        │
│ │ Curva Flujo-Volumen  │ │ Curva Volumen-Tiempo│        │
│ │  [SVG animada con    │ │  [SVG animada con   │        │
│ │   medida, predicha,  │ │   marcador FEV1 a   │        │
│ │   y cada prueba]     │ │   1 segundo, FVC]   │        │
│ └──────────────────────┘ └─────────────────────┘        │
│ ┌──────────────────────────────────────────────┐        │
│ │ Gráfica Z-Score (barras horizontales)        │        │
│ │ FVC      ████████████▌ -1.78                 │        │
│ │ FEV1     █████████████▌ -1.55                │        │
│ │ FEF25-75 ██████████████████▌ -0.45           │        │
│ │ PEF      ██████████████████████████▌ 0.71    │        │
│ │ FEV1/FVC ████████████████████████▌ 0.23      │        │
│ └──────────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────────┤
│ ANTROPOMETRÍA                                           │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│ │172 cm  │ │82 kg   │ │27.7    │ │No      │ │Hispano │ │
│ │Altura  │ │Peso    │ │IMC     │ │Fumador │ │Etnia   │ │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │
│ Asma: No | EPOC: No                                     │
├─────────────────────────────────────────────────────────┤
│ CONFIGURACIÓN DEL ESTUDIO                               │
│ Criterio: GOLD(2008)/Hardie                             │
│ Ec. Predicho: Hankinson (NHANES III), 1999 * 1.00       │
│ Selección: BTPS (INSP/ESP)  Mejor valor: 1.12/1.02     │
│ 📎 Archivo Original: ESPIROMETRIA.pdf [Ver]             │
└─────────────────────────────────────────────────────────┘
```

### Tab "Análisis IA" (interpretación generada)

```
┌─────────────────────────────────────────────────────────┐
│ 🧠 ANÁLISIS NEUMOLÓGICO IA                              │
│                                                         │
│ ┌─ Patrón Ventilatorio ─────────────────────────────┐   │
│ │ NORMAL — Función pulmonar dentro de límites       │   │
│ │ normales. Sin restricción ni obstrucción.          │   │
│ └────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Gauges % del Predicho ────────────────────────────┐  │
│ │ FVC  ████████████████░░░░ 81%  (3.96 / 4.89 L)    │  │
│ │ FEV1 █████████████████░░░ 83%  (3.28 / 3.96 L)    │  │
│ │ PEF  ██████████████████████ 111% (10.85/9.78 L/s) │  │
│ └────────────────────────────────────────────────────┘  │
│                                                         │
│ ┌─ FEV1/FVC (Tiffeneau) ─────────────────────────────┐ │
│ │        82.7%   [████████████████████████▌]          │ │
│ │ Sin patrón obstructivo — relación normal (≥70%)    │ │
│ └────────────────────────────────────────────────────┘  │
│                                                         │
│ ┌─ Vías Aéreas Pequeñas ─────────────────────────────┐ │
│ │ FEF 25-75%: 3.63 L/s (89% del predicho)           │ │
│ │ Flujo en vías pequeñas conservado.                 │ │
│ └────────────────────────────────────────────────────┘  │
│                                                         │
│ ┌─ Hallazgos ────────────────────────────────────────┐ │
│ │ ⚠ FVC 81% — limítrofe bajo (LLN: 4.03 L)         │ │
│ │ ⚠ Calidad C — prueba dudosa, considerar repetir   │ │
│ │ Z-scores dentro de ±2 DE — sin hallazgos severos  │ │
│ └────────────────────────────────────────────────────┘  │
│                                                         │
│ ┌─ Aptitud Laboral Respiratoria ─────────────────────┐ │
│ │ ✅ Función pulmonar normal.                        │ │
│ │ Sin restricción laboral de origen respiratorio.    │ │
│ │ → Control espirométrico anual (NOM-047-SSA1)      │ │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 5. FLUJO DEL WIZARD (nuevo diseño)

```
[Subir Archivos]
    ↓
¿Paciente Nuevo o Existente?
    ├── Nuevo → Se extraen datos del paciente del PDF
    └── Existente → Se selecciona de lista (buscador por nombre/CURP)
    ↓
[Por cada archivo subido, se muestra UNA sección]
    ↓
Sección: ESPIROMETRIA.pdf
    ├── Tipo detectado: Espirometría (auto-detectado por nombre)
    ├── Extracción IA: [Procesando... → 95% confianza]
    ├── Vista previa: tabla de parámetros + curvas + nombre detectado
    └── ✅ Confirmar datos
    ↓
[Guardar Todo]
    ├── 1 registro en `estudios_clinicos` (tipo: espirometria)
    ├── N registros en `resultados_estudio` (todos los campos)
    └── Redirigir al perfil del paciente → pestaña Espirometría
```

---

## 6. ARCHIVOS A MODIFICAR

1. `documentExtractorService.ts` → Parseo de nombre con coma
2. `geminiDocumentService.ts` → Prompt mejorado pidiendo pruebas individuales y Z-scores
3. `ImportarExpedienteWizard.tsx` → Nuevo flujo (nuevo/existente) + guardado unificado
4. `EspirometriaTab.tsx` → Agregar tabla completa con pruebas + gráfica Z-Score
5. Crear `estudiosService.ts` → función para guardar 1 estudio con todos sus resultados

## 7. ORDEN DE IMPLEMENTACIÓN

1. Parseo de nombre (fix `adaptStructuredToFlat`)
2. Guardado unificado (1 PDF = 1 estudio_clinico)
3. Prompt de espirometría mejorado (pruebas individuales, variabilidad, Z-score)
4. Tabla completa en EspirometriaTab (con pruebas individuales)
5. Gráfica Z-Score SVG
6. Deploy y test con el PDF real de URIBE LOPEZ
