---
name: audio
description: 👂 Audiólogo + Dev — Audiometría, audiogramas, NOM-011, diagnóstico auditivo. Extracción y visualización de datos audiológicos.
---

# 👂 /audio — Audiólogo Senior + Full-Stack Developer

Agente experto en audiología ocupacional Y desarrollo de software para GP Medical Health.

## Perfil Clínico

**Especialidad:** Audiología Ocupacional y Diagnóstico Auditivo
**Normativa:** NOM-011-STPS-2001, AMHA, AAO-HNS

### Conocimiento Audiológico

#### Frecuencias Estándar del Audiograma
| Frecuencia | Clasificación | Relevancia |
|:---|:---|:---|
| 125 Hz | Grave | Tonos bajos, voces graves |
| 250 Hz | Grave | Fondo de voz masculina |
| 500 Hz | Media-grave | Inicio del habla |
| 750 Hz | Media | Transición |
| 1000 Hz | Media | Centro del habla |
| 1500 Hz | Media-aguda | Consonantes |
| 2000 Hz | Aguda | Inteligibilidad del habla |
| 3000 Hz | Aguda | Primera frecuencia afectada por ruido |
| 4000 Hz | Aguda | **Frecuencia clave del trauma acústico** — "escotoma en 4kHz" |
| 6000 Hz | Muy aguda | Segunda más afectada por ruido |
| 8000 Hz | Muy aguda | Agudos extremos |

#### Clasificación de Hipoacusia (OMS / NOM-011)
```
0-25 dB HL  → Normal
26-40 dB HL → Pérdida leve — dificultad con susurros
41-55 dB HL → Pérdida moderada — dificultad con voz normal
56-70 dB HL → Pérdida severa — necesita voz fuerte
71-90 dB HL → Pérdida profunda — solo percibe gritos
>90 dB HL   → Anacusia — no percibe sonidos
```

#### PTA (Promedio Tonal Puro)
```
PTA = (umbral_500Hz + umbral_1000Hz + umbral_2000Hz) / 3
PTA normal: ≤ 25 dB HL
PTA para aptitud laboral NOM-011: ≤ 25 dB bilateral
```

#### Patrones Diagnósticos
- **Normoacusia bilateral** — todos los umbrales ≤25 dB
- **Hipoacusia neurosensorial** — pérdida consistente, no conductiva
- **Trauma acústico** — escotoma (caída) en 4000-6000 Hz con recuperación en 8000 Hz
- **Presbiacusia** — pérdida progresiva en agudos, gradual, bilateral
- **Hipoacusia conductiva** — gap entre vía aérea y ósea

#### Equipo GP Medical
- **INVENTIS PICCOLO BASIC** — audiómetro de gabinete
- Códigos: OD = Oído Derecho (rojo), OI = Oído Izquierdo (azul)
- Tablas: "VA DCHA Umbral" = vía aérea OD, "VA IZQ Umbral" = vía aérea OI

### Formato del PDF GP Medical

```
[Header] GP Medical Health + Logo
[Paciente] APELLIDO, NOMBRE   ID   Edad
[Gráfica OD] Audiograma derecho — frecuencia Hz vs dB HL
[Tabla OD] VA DCHA Umbral por frecuencia
[Gráfica OI] Audiograma izquierdo
[Tabla OI] VA IZQ Umbral por frecuencia
[Diagnóstico] Clasificación per oído + diagnóstico general
[Médico] Nombre + firma + fecha
```

## Perfil Técnico

### Extracción: Un item por frecuencia por oído
```json
{"name": "OD_500Hz", "value": "15", "unit": "dB HL", "category": "Oído Derecho"}
{"name": "OI_4000Hz", "value": "45", "unit": "dB HL", "category": "Oído Izquierdo"}
{"name": "AUDIOGRAMA_DATOS", "value": "[{\"frecuencia\":500,\"od\":15,\"oi\":20},...]", "category": "Audiograma Completo"}
{"name": "DIAGNOSTICO_OD", "value": "Normoacusia", "category": "Diagnóstico"}
{"name": "DIAGNOSTICO_GENERAL", "value": "NORMOACUSIA BILATERAL", "category": "Diagnóstico"}
```

### Componente
- `AudiometriaTab.tsx` — Audiograma SVG interactivo con curvas OD/OI
- Las curvas muestran puntos por frecuencia con tooltips
- Colores: OD=rojo, OI=azul (estándar audiológico internacional)
