# ✅ ERP Pro - Checklist de Implementación

## FASE 1: FUNDAMENTOS CLÍNICOS 🔴 CRÍTICA

### Agente 1: Clinical Core Specialist

#### Expediente Clínico Electrónico (ECE)
- [ ] **Schema de BD**: Tabla `expedientes_clinicos`
  - [ ] id, paciente_id, empresa_id, sede_id
  - [ ] fecha_apertura, fecha_cierre
  - [ ] estado (activo, cerrado, archivado)
  - [ ] created_by, updated_by, timestamps

- [ ] **Historia Clínica Laboral**
  - [ ] APNP (Antecedentes Personales No Patológicos)
    - [ ] Tabaco, alcohol, drogas, medicamentos
    - [ ] Ejercicio, alimentación, sueño
  - [ ] AHF (Antecedentes Heredofamiliares)
    - [ ] DM, HTA, cáncer, cardiopatías
  - [ ] Historia Ocupacional
    - [ ] Empresas anteriores
    - [ ] Puestos y riesgos
    - [ ] Exposiciones (químicos, físicos, biológicos)
  - [ ] Alergias y reacciones adversas

- [ ] **Exploración Física Estructurada**
  - [ ] Signos Vitales (FC, FR, TA, Temp, SpO2, Glucosa)
  - [ ] IMC (peso, talla, IMC, cintura)
  - [ ] Exploración Neurológica
  - [ ] Exploración Musculoesquelética
  - [ ] Exploración Cardiopulmonar
  - [ ] Exploración Dermatológica

- [ ] **Consentimientos Informados**
  - [ ] Schema: `consentimientos_informados`
  - [ ] Plantillas por tipo (prestación servicios, manejo datos)
  - [ ] Firma digital integrada
  - [ ] PDF generado y almacenado

- [ ] **Antecedentes por Empresa/Puesto**
  - [ ] Riesgos específicos del puesto actual
  - [ ] Episodios anteriores en la misma empresa
  - [ ] Restricciones históricas

- [ ] **Versionado de Notas Médicas**
  - [ ] Schema: `notas_medicas_versiones`
  - [ ] Cada edición crea nueva versión
  - [ ] Auditoría: quién, cuándo, qué cambió

#### Módulo de Consultas
- [ ] **Consulta Clínica General**
  - [ ] SOAP completo (Subjetivo, Objetivo, Análisis, Plan)
  - [ ] Diagnóstico diferencial
  - [ ] Plan de tratamiento

- [ ] **Consulta Ocupacional**
  - [ ] Tipo: Ingreso, Periódico, Retorno, Egreso, Reubicación
  - [ ] Plantillas por tipo
  - [ ] Validaciones específicas por tipo

- [ ] **Catálogo CIE-10/CIE-11**
  - [ ] Tabla: `catalogo_cie`
  - [ ] Buscador con autocomplete
  - [ ] Favoritos/frecuentes por médico

- [ ] **Recetas Electrónicas**
  - [ ] Schema: `recetas`
  - [ ] Medicamentos, presentación, dosis, frecuencia, duración
  - [ ] Control de dispensación (si se surtió o no)
  - [ ] Impresión PDF receta

#### Estudios Paraclínicos
- [ ] **Schema general: `estudios_paraclinicos`**
  - [ ] tipo (audiometría, espirometría, rx, etc.)
  - [ ] resultado, interpretación, observaciones
  - [ ] archivo_url (PDF/imagen)
  - [ ] medico_interpreta_id

- [ ] **Audiometría**
  - [ ] Schema específico: `audiometrias`
  - [ ] OIDO: 500Hz, 1000Hz, 2000Hz, 3000Hz, 4000Hz, 6000Hz, 8000Hz
  - [ ] Interpretación automática (semáforo NOM-011)
  - [ ] Gráfica de audiograma

- [ ] **Espirometría**
  - [ ] Schema: `espirometrias`
  - [ ] FVC, FEV1, FEV1/FVC, PEF
  - [ ] % predicho vs referencia
  - [ ] Interpretación (normal, restrictivo, obstructivo, mixto)

- [ ] **ECG**
  - [ ] Carga de PDF
  - [ ] Interpretación médica
  - [ ] Clasificación (normal, anormal leve, anormal grave)

- [ ] **Agudeza Visual**
  - [ ] Schema: `agudeza_visual`
  - [ ] Ojo derecho/izquierdo (sin corrección, con corrección)
  - [ ] Test de Ishihara
  - [ ] Campimetría por confrontación

- [ ] **RX**
  - [ ] Carga DICOM o PDF
  - [ ] Informe radiológico estructurado
  - [ ] Hallazgos y conclusión

- [ ] **Laboratorio**
  - [ ] Schema: `laboratorios`
  - [ ] Grupos: Hematológico, Química Sanguínea, Urinálisis, etc.
  - [ ] Rangos de referencia por sexo/edad
  - [ ] Banderas: normal, alto, bajo, crítico

---

## FASE 2: MOTOR DE FLUJOS 🔴 CRÍTICA

### Agente 2: Workflow Engine Architect

#### Episodio de Atención
- [ ] **Schema: `episodios`**
  - [ ] id, paciente_id, empresa_id, campana_id
  - [ ] tipo: preempleo, periodico, retorno, egreso, reubicacion
  - [ ] estado: registrado, triage, evaluacion, labs, imagen, integracion, dictamen, cerrado
  - [ ] fechas de cada etapa
  - [ ] medico_responsable_id

- [ ] **Pipeline Visual**
  - [ ] Componente React mostrando pasos
  - [ ] Paso actual resaltado
  - [ ] Pasos completados marcados
  - [ ] Pasos pendientes grises

- [ ] **Reglas de Bloqueo**
  - [ ] No permitir cerrar episodio si:
    - [ ] Faltan estudios críticos marcados
    - [ ] No hay dictamen emitido
    - [ ] Faltan consentimientos firmados

- [ ] **Next Best Action**
  - [ ] Algoritmo que sugiere:
    - [ ] Qué estudio falta según riesgo del puesto
    - [ ] Qué consulta sigue según tipo de evaluación
    - [ ] Alertas de tiempos (SLA)

#### Campañas Masivas
- [ ] **Schema: `campanas`**
  - [ ] id, empresa_id, nombre, tipo
  - [ ] fecha_inicio, fecha_fin
  - [ ] estado: planeacion, activa, pausada, cerrada
  - [ ] meta_headcount, real_headcount

- [ ] **Carga Masiva de Padrón**
  - [ ] Upload Excel/CSV
  - [ ] Validación de datos (RFC, CURP, correo)
  - [ ] Preview antes de importar
  - [ ] Creación masiva de pacientes + episodios

- [ ] **Seguimiento por Estatus**
  - [ ] Dashboard de campaña
  - [ ] Filtros: pendiente, en_proceso, por_dictaminar, cerrado
  - [ ] Colores por estado

- [ ] **Métricas por Campaña**
  - [ ] Total evaluados
  - [ ] % Apto / Apto con restricciones / No apto
  - [ ] Hallazgos más frecuentes
  - [ ] Tiempo promedio por episodio

---

## FASE 3: DICTÁMENES 🔴 CRÍTICA

### Agente 4: Dictamen Engine Specialist

#### Schema: `dictamenes`
- [ ] id, episodio_id, paciente_id, empresa_id
- [ ] tipo_dictamen: apto, apto_restricciones, no_apto_temporal
- [ ] restricciones (JSON array)
- [ ] recomendaciones_medicas
- [ ] recomendaciones_epp
- [ ] vigencia_meses
- [ ] fecha_emision, fecha_vencimiento
- [ ] medico_id, firma_digital, cedula_profesional

#### Tipos de Dictamen
- [ ] **Apto**: Sin restricciones
- [ ] **Apto con Restricciones**:
  - [ ] No trabajar en alturas
  - [ ] No operar maquinaria pesada
  - [ ] No exponerse a ruido > 85dB
  - [ ] Horario modificado
  - [ ] Otras (personalizables)
- [ ] **No Apto Temporal**:
  - [ ] Causa (enfermedad, recuperación, etc.)
  - [ ] Fecha de reevaluación sugerida

#### Restricciones Codificadas por Puesto
- [ ] Tabla: `restricciones_puesto`
  - [ ] puesto_id, restriccion_codigo, descripcion
  - [ ] Operador montacargas: restricciones visuales, auditivas
  - [ ] Electricista: restricciones neurológicas
  - [ ] Químico: restricciones respiratorias

#### Firma Electrónica
- [ ] Validación de cédula profesional
- [ ] Certificado digital del médico
- [ ] QR de verificación
- [ ] PDF oficial del dictamen

---

## FASE 4: B2B WORKSPACE

### Agente 3: B2B Workspace Specialist

- [ ] Workspace por empresa con:
  - [ ] Dashboard propio
  - [ ] Sus pacientes (headcount)
  - [ ] Sus campañas activas
  - [ ] Sus reportes

- [ ] Contrato/SLA:
  - [ ] Fechas de vigencia
  - [ ] Servicios contratados
  - [ ] Headcount máximo
  - [ ] SLA de entrega

- [ ] Reportes por empresa:
  - [ ] Indicadores de aptitud
  - [ ] Hallazgos por riesgo
  - [ ] Entregables por periodo

---

## FASE 5: OPERACIONES

### Agente 5: Operations Scheduler

- [ ] Agenda por sede, empresa, rol
- [ ] Check-in / check-out de pacientes
- [ ] Colas de trabajo:
  - [ ] Enfermería (signos vitales)
  - [ ] Audiometría
  - [ ] Espirometría
  - [ ] Rayos X
  - [ ] Consulta médica
- [ ] Órdenes de servicio
- [ ] Control de SLA

---

## FASE 6: FARMACIA

### Agente 6: Pharmacy Inventory Pro

- [ ] Inventario de medicamentos con:
  - [ ] Lotes
  - [ ] Fechas de caducidad
  - [ ] Mínimos/máximos
- [ ] Dispensación ligada a receta
- [ ] Botiquines por empresa
- [ ] Alertas de reabasto
- [ ] Reporte de consumo

---

## FASE 7: FACTURACIÓN PRO

### Agente 7: Billing & Collection Pro

- [ ] Cotizaciones por empresa/campaña
- [ ] Facturación CFDI (mejorar existente)
- [ ] Estados de cuenta
- [ ] Cuentas por cobrar:
  - [ ] Aging: 0-30, 31-60, 61-90, 90+
  - [ ] Alertas de vencimiento
- [ ] Pagos y complementos
- [ ] Costeo por paciente
- [ ] Margen por empresa

---

## FASE 8: DASHBOARDS

### Agente 8: Executive Dashboard Designer

#### Dashboard Global (Admin)
- [ ] Empresas activas
- [ ] Campañas en curso
- [ ] Episodios en proceso
- [ ] Resultados retrasados
- [ ] Dictámenes por firmar
- [ ] Facturas vencidas
- [ ] Ingresos vs meta

#### Dashboard por Empresa
- [ ] Headcount evaluado
- [ ] % aptos/restricciones
- [ ] Hallazgos críticos
- [ ] SLA de entrega
- [ ] Saldo pendiente

---

## FASE 9: COMPLIANCE STPS

### Agente 9: Compliance STPS Specialist

- [ ] Programa Conservación Auditiva (NOM-011)
  - [ ] Registro de trabajadores expuestos
  - [ ] Evidencias de capacitación
  - [ ] Audiometrías anuales
  - [ ] Seguimiento de casos

- [ ] Programa Ergonomía (NOM-036)
  - [ ] Análisis de puestos
  - [ ] Cuestionarios ergonómicos
  - [ ] Hallazgos y acciones correctivas

- [ ] Reportes STPS listos para auditoría
- [ ] Bitácora de auditoría

---

## FASE 10: SEGURIDAD Y AUDITORÍA

### Agente 10: Security & Audit Specialist

- [ ] Trazabilidad completa:
  - [ ] Quién vio qué
  - [ ] Quién editó qué
  - [ ] Quién firmó qué
- [ ] Bitácora legal (auditoría)
- [ ] Respaldo automático
- [ ] Cumplimiento LFPDPPP

---

## FASE 11: INTEGRACIONES

### Agente 11: Integrations Specialist

- [ ] Importación/exportación Excel
- [ ] API para equipos médicos
- [ ] Carga de PDF/DICOM
- [ ] Firma electrónica avanzada
- [ ] Envío automático de reportes

---

## FASE 12: UX EXPERIENCE

### Agente 12: UX Experience Designer

- [ ] Menú por Empresa (workspace)
- [ ] Pipeline visual de episodios
- [ ] Semáforos clínicos:
  - [ ] 🟢 Normal
  - [ ] 🟡 Alerta
  - [ ] 🔴 Crítico
- [ ] Filtros avanzados
- [ ] Buscador global

---

## MÉTRICAS DE ÉXITO

- [ ] Tiempo de carga < 2 segundos
- [ ] 100% funcional en móvil
- [ ] 0 errores críticos
- [ ] Flujo completo < 5 minutos
- [ ] Satisfacción usuario > 8/10
