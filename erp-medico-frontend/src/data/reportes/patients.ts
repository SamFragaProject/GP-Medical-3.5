export interface Patient {
    id: string | number;
    fullName: string;
    dob: string;
    physicalExamSummary: string;
    vitals: {
        height: string;
        weight: string;
        satO2: string;
        fc: string;
        ta: string;
        fr: string;
        temp: string;
    };
    personalInfo: {
        birthPlace: string;
        civilStatus: string;
        education: string;
        phone: string;
        gender: string;
    };
    employmentInfo: {
        position: string;
        startDate: string;
        jobAnalysis: {
            description: string;
            riskFactors: { factor: string; exposure: string }[];
        };
        evaluationType: string;
    };
    medicalHistory: {
        hereditary: string;
        pathological: string;
        surgeries: string;
        epp: string;
        treatments?: string;
        allergies?: string;
        toxicHabits: string;
        gynecological?: string;
        others: string;
    };
    labResults: {
        hematology: {
            biometria: string;
            quimica: string;
            perfilHepatico: string;
            ego: string;
            audiometria: string;
        };
        renal: {
            electrolitos: string;
            microalbuminuria: string;
            creatininaOrina: string;
            acr: string;
            tfg: string;
        };
    };
    diagnoses: {
        diagnosis: string;
        basis: string;
    }[];
    professionalDiseaseSuspicion: string;
    aptitudeConcept: string;
    recommendations: {
        area: string;
        recommendation: string;
    }[];
}

export const patients: Patient[] = [
    {
        id: 1,
        fullName: 'ANTONIO ALEXANDRO ESPINOSA OLVERA',
        dob: '',
        physicalExamSummary: 'SIGNOS VITALES DENTRO DE LO NORMAL. TODO NORMAL CON EL.',
        vitals: { height: '1.68 m', weight: '79 kg', satO2: '', fc: '', ta: '', fr: '', temp: '' },
        personalInfo: { birthPlace: 'QUERETARO, QUERETARO', civilStatus: '', education: '', phone: '', gender: 'Masculino' },
        employmentInfo: { position: 'TECNICO DE MOLDES', startDate: 'OCTUBRE 2020', evaluationType: 'Periódica', jobAnalysis: { description: '', riskFactors: [] } },
        medicalHistory: { hereditary: 'NIEGO AHF', pathological: 'NIEGO APP', surgeries: 'Cirugías negadas', epp: '', toxicHabits: 'NO FUMA, NO TOMA', others: 'VACUNAS COMPLETAS.', allergies: 'Alergias negadas' },
        labResults: { hematology: { biometria: '', quimica: '', perfilHepatico: '', ego: '', audiometria: '' }, renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' } },
        diagnoses: [], professionalDiseaseSuspicion: '', aptitudeConcept: '', recommendations: []
    },
    {
        id: 2,
        fullName: 'GERARDO FLORES OSORIO',
        dob: '',
        physicalExamSummary: '',
        vitals: { height: '1.72 m', weight: '89 KG', satO2: '', fc: '', ta: '', fr: '', temp: '' },
        personalInfo: { birthPlace: 'CHICONTEPEC, VERACRUZ', civilStatus: 'CASADO', education: 'LICENCIATURA', phone: '4426103996', gender: 'Masculino' },
        employmentInfo: { position: 'TECNICO DE METAL', startDate: 'NOVIEMBRE 2019', evaluationType: 'Periódica', jobAnalysis: { description: '', riskFactors: [] } },
        medicalHistory: { hereditary: 'DM2: AMBAS ABUELAS, HAS: AMBAS ABUELAS', pathological: 'SUFRIO ACCIDENTE DE TRABAJO HACE 3 AÑOS, EN IMS:GEAR, FUE DE TRAYECTO, 2 MESES, OCASIONANDO FRACTURA DE CLAVICULA IZQUIERDA, SIN SECUELAS. FRACTURA IGUAL, UNICA FRACTURA.', surgeries: 'REPARACION DE FRACTURA CLAVICULAR IZQUIERDA (2022)', epp: '', toxicHabits: 'ALCOHOLISMO QUINCENAL', others: 'NO USA LENTES', allergies: 'ALERGIAS NEGADAS' },
        labResults: { hematology: { biometria: '', quimica: '', perfilHepatico: '', ego: '', audiometria: '' }, renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' } },
        diagnoses: [], professionalDiseaseSuspicion: '', aptitudeConcept: '', recommendations: []
    },
    {
        id: 3,
        fullName: 'EMANUEL HERNANDEZ TAVAREZ',
        dob: '',
        physicalExamSummary: '',
        vitals: { height: '1.75 m', weight: '105 KG', satO2: '', fc: '', ta: '', fr: '', temp: '' },
        personalInfo: { birthPlace: 'EL MARQUES, QUERETARO', civilStatus: 'CASADO', education: 'TECNICO', phone: '4428182265', gender: 'Masculino' },
        employmentInfo: { position: 'TECNICO DE METAL', startDate: 'SEPTIEMBRE, 2019', evaluationType: 'Periódica', jobAnalysis: { description: '', riskFactors: [] } },
        medicalHistory: { hereditary: 'DM2: ABUELA PATERNA, HAS: NADIE', pathological: 'NINGUN ACCIDENTE LABORAL PRESENTADO. FRACTURAS NEGADAS.', surgeries: 'CIRUGIAS NEGADAS', epp: 'ZAPATO DE SEGURIDAD, MANGAS ANTICORTE, GUANTES, LENTES.', toxicHabits: 'ALCOHOLISMO OCASIONAL, FUMA: 5 CIG/DIA, LLEVA 20 AÑOS', others: 'NO USA LENTES', allergies: 'PENICILINA' },
        labResults: { hematology: { biometria: '', quimica: '', perfilHepatico: '', ego: '', audiometria: '' }, renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' } },
        diagnoses: [], professionalDiseaseSuspicion: '', aptitudeConcept: '', recommendations: []
    },
    {
        id: 4,
        fullName: 'CESAR ISMAEL REYES MARTINEZ',
        dob: '',
        physicalExamSummary: '',
        vitals: { height: '1.75 m', weight: '75 KG', satO2: '', fc: '', ta: '', fr: '', temp: '' },
        personalInfo: { birthPlace: 'CIUDAD DE MEXICO', civilStatus: 'CASADO', education: 'BACHILLERATO', phone: '4428088094', gender: 'Masculino' },
        employmentInfo: { position: 'TECNICO DE METAL', startDate: 'NOVIEMBRE 2019', evaluationType: 'Periódica', jobAnalysis: { description: '', riskFactors: [] } },
        medicalHistory: { hereditary: 'NIEGA AHF', pathological: 'NINGUN ACCIDENTE LABORAL PRESENTADO. CIRUGIAS Y FRACTURAS NEGADAS.', surgeries: 'Cirugías negadas', epp: '', toxicHabits: 'ALCOHOLISMO QUINCENAL', others: 'NO USA LENTES', allergies: 'ALERGIAS NEGADAS' },
        labResults: { hematology: { biometria: '', quimica: '', perfilHepatico: '', ego: '', audiometria: '' }, renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' } },
        diagnoses: [], professionalDiseaseSuspicion: '', aptitudeConcept: '', recommendations: []
    },
    {
        id: 5,
        fullName: 'IRMA PATRICIA JUAREZ VARGAS',
        dob: '05/02/1974',
        physicalExamSummary: 'TODO NORMAL CON ELLA',
        vitals: { height: '', weight: '', satO2: '', fc: '', ta: '', fr: '', temp: '' },
        personalInfo: { birthPlace: 'QUERETARO, QUERETARO', civilStatus: 'Casada', education: '', phone: '', gender: 'Femenino' },
        employmentInfo: { position: 'OPERATIVO', startDate: '', evaluationType: 'Periódica', jobAnalysis: { description: '', riskFactors: [] } },
        medicalHistory: { hereditary: '', pathological: '', surgeries: '', epp: '', toxicHabits: '', others: 'Tiene 2 hijos de parto normal.', allergies: '' },
        labResults: { hematology: { biometria: 'AGREGAR RESULTADOS', quimica: 'AGREGAR RESULTADOS', perfilHepatico: 'AGREGAR RESULTADOS', ego: 'AGREGAR RESULTADOS', audiometria: 'AGREGAR RESULTADOS' }, renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' } },
        diagnoses: [], professionalDiseaseSuspicion: '', aptitudeConcept: '', recommendations: []
    },
    {
        id: 6,
        fullName: 'JESUS MANDUJANO CENTENO',
        dob: '20/02/2004',
        physicalExamSummary: '',
        vitals: { height: '1.74 M', weight: '80.2 KG', satO2: '94%', fc: '80 LPM', ta: '122/72 MMHG', fr: '21 RPM', temp: '' },
        personalInfo: { birthPlace: 'SAN JUAN DEL RIO, QUERETARO', civilStatus: 'SOLTERO', education: '', phone: '', gender: 'Masculino' },
        employmentInfo: { position: 'TECNICO DE METAL', startDate: '', evaluationType: 'Periódica', jobAnalysis: { description: '', riskFactors: [] } },
        medicalHistory: { hereditary: '', pathological: '', surgeries: '', epp: '', toxicHabits: '', others: '', allergies: '' },
        labResults: { hematology: { biometria: 'AGREGAR RESULTADOS', quimica: 'AGREGAR RESULTADOS', perfilHepatico: 'AGREGAR RESULTADOS', ego: 'AGREGAR RESULTADOS', audiometria: 'AGREGAR RESULTADOS' }, renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' } },
        diagnoses: [], professionalDiseaseSuspicion: '', aptitudeConcept: '', recommendations: []
    },
    {
        id: 7,
        fullName: 'JOSE ARMANDO NOLASCO TRUJILLO',
        dob: '',
        physicalExamSummary: '',
        vitals: { height: '1.72 m', weight: '76 KG', satO2: '', fc: '', ta: '', fr: '', temp: '' },
        personalInfo: { birthPlace: 'TUXTEPEC, OAXACA', civilStatus: 'UNION LIBRE', education: 'BACHILLERATO', phone: '4481259634', gender: 'Masculino' },
        employmentInfo: { position: 'TECNICO DE METAL', startDate: 'SEPTIEMBRE, 2025', evaluationType: 'Periódica', jobAnalysis: { description: '', riskFactors: [] } },
        medicalHistory: { hereditary: 'NIEGA AHF', pathological: 'NINGUN ACCIDENTE LABORAL PRESENTADO. CIRUGIAS Y FRACTURAS NEGADAS.', surgeries: 'Cirugías negadas', epp: '', toxicHabits: 'ALCOHOLISMO OCASIONAL', others: 'NO USA LENTES', allergies: 'ALERGIAS NEGADAS' },
        labResults: { hematology: { biometria: '', quimica: '', perfilHepatico: '', ego: '', audiometria: '' }, renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' } },
        diagnoses: [], professionalDiseaseSuspicion: '', aptitudeConcept: '', recommendations: []
    },
    {
        id: 8,
        fullName: 'JOSE ROLANDO CUELLAR VEGA',
        dob: '03/09/1974',
        physicalExamSummary: '',
        vitals: { height: '1.66 M', weight: '96 KG', satO2: '98%', fc: '64 LPM', ta: '188/104 MMHG', fr: '21 RPM', temp: '' },
        personalInfo: { birthPlace: 'amealco, QUERETARO', civilStatus: 'CASADO', education: '', phone: '', gender: 'Masculino' },
        employmentInfo: { position: 'TECNICO CNC', startDate: '', evaluationType: 'Periódica', jobAnalysis: { description: '', riskFactors: [] } },
        medicalHistory: { hereditary: '', pathological: 'Refiere ser hipertenso, no recuerda medicacion (suponemos que no es continuo).', surgeries: '', epp: '', toxicHabits: '', others: '', allergies: '' },
        labResults: { hematology: { biometria: 'AGREGAR RESULTADOS', quimica: 'AGREGAR RESULTADOS', perfilHepatico: 'AGREGAR RESULTADOS', ego: 'AGREGAR RESULTADOS', audiometria: 'AGREGAR RESULTADOS' }, renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' } },
        diagnoses: [], professionalDiseaseSuspicion: '', aptitudeConcept: '', recommendations: []
    },
    {
        id: 9,
        fullName: 'JUAN MANUEL GUTIÉRREZ RANGEL',
        dob: '17/03/1995',
        physicalExamSummary: '',
        vitals: { height: '1.70 m', weight: '57 kg', satO2: '100%', fc: '62lpm', ta: '113/74 mmHg', fr: '20 rpm', temp: '36.3' },
        personalInfo: { birthPlace: 'Querétaro, Qro', civilStatus: 'unión libre', education: 'secundaria', phone: '4424051410', gender: 'Masculino' },
        employmentInfo: { position: 'técnico de metal', startDate: 'julio, 2016', evaluationType: 'Periódica', jobAnalysis: { description: '', riskFactors: [] } },
        medicalHistory: { hereditary: 'Todos los abuelos – DM2, Abuela materna – HAS', pathological: 'Accidente de trabajo: negados. Fracturas: fractura de ambos codos (2003).', surgeries: 'Cirugías negadas.', epp: 'Zapatos, guantes, lentes, tapones auditivos, mascarillas.', toxicHabits: 'Fuma 5 cig/semana, 9 años, alcohol ocasional', others: 'Vacunas completas. Mano derecha dominante.', allergies: 'Alergias negadas' },
        labResults: { hematology: { biometria: '', quimica: '', perfilHepatico: '', ego: '', audiometria: '' }, renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' } },
        diagnoses: [], professionalDiseaseSuspicion: '', aptitudeConcept: '', recommendations: []
    },
    {
        id: 10,
        fullName: 'LEONARDO PITAYA MAURICIO',
        dob: '',
        physicalExamSummary: '',
        vitals: { height: '1.63 m', weight: '68 KG', satO2: '', fc: '', ta: '', fr: '', temp: '' },
        personalInfo: { birthPlace: 'QUERETARO, QUERETARO', civilStatus: 'CASADO', education: 'SECUNDARIA', phone: '4481214554', gender: 'Masculino' },
        employmentInfo: { position: 'OPERADOR NIVEL 2 DE METAL', startDate: 'OCTUBRE, 2015', evaluationType: 'Periódica', jobAnalysis: { description: '', riskFactors: [] } },
        medicalHistory: { hereditary: 'DM2: ABUELOS MATERNOS', pathological: 'NINGUN ACCIDENTE LABORAL PRESENTADO. CIRUGIAS Y FRACTURAS NEGADAS.', surgeries: 'Cirugías negadas', epp: '', toxicHabits: 'ALCOHOLISMO SEMANAL, TABAQUISMO OCASIONAL 3-4 CIG/SEMANA, 20 AÑOS', others: 'NO USA LENTES', allergies: 'ALERGIAS NEGADAS' },
        labResults: { hematology: { biometria: '', quimica: '', perfilHepatico: '', ego: '', audiometria: '' }, renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' } },
        diagnoses: [], professionalDiseaseSuspicion: '', aptitudeConcept: '', recommendations: []
    },
    {
        id: 11,
        fullName: 'MATEO SANCHEZ ORTEGA',
        dob: '28/05/2003',
        physicalExamSummary: '',
        vitals: { height: '1.75m', weight: '75 kg', satO2: '98%', fc: '88lpm', ta: '128/80', fr: '21 rpm', temp: '' },
        personalInfo: { birthPlace: 'celaya, guanajuato', civilStatus: '', education: '', phone: '', gender: 'Masculino' },
        employmentInfo: { position: 'TECNICO DE MOLDES', startDate: 'hace 7 meses', evaluationType: 'Periódica', jobAnalysis: { description: '', riskFactors: [] } },
        medicalHistory: { hereditary: 'Abuelos maternos con diabetes mellitus tipo 2, padre con hipertensión arterial.', pathological: 'Fractura de codo derecho (2018), ruptura de ligamento cruzado anterior, rodilla derecha, meniscos (2023).', surgeries: 'Reparacion de ruptura de ligamento cruzado anterior, rodilla derecha, meniscos (2023), septumplastia (2025).', epp: '', toxicHabits: 'No fuma, consume alcohol semanalmente.', others: '', allergies: '' },
        labResults: { hematology: { biometria: '', quimica: '', perfilHepatico: '', ego: '', audiometria: '' }, renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' } },
        diagnoses: [], professionalDiseaseSuspicion: '', aptitudeConcept: '', recommendations: []
    },
    {
        id: 12,
        fullName: 'GUSTAVO SANCHEZ RAMIREZ',
        dob: '',
        physicalExamSummary: '',
        vitals: { height: '1.65 m', weight: '60 KG', satO2: '', fc: '', ta: '', fr: '', temp: '' },
        personalInfo: { birthPlace: 'LOS REYES LA PAZ, ESTADO DE MEXICO', civilStatus: 'SOLTERO', education: 'BACHILLERATO', phone: '5616507355', gender: 'Masculino' },
        employmentInfo: { position: 'TECNICO DE METAL', startDate: 'SEPTIEMBRE, 2025', evaluationType: 'Periódica', jobAnalysis: { description: '', riskFactors: [] } },
        medicalHistory: { hereditary: 'DM2: AMBAS ABUELAS, HAS: ABUELA MATERNA. CANCER: ABUELO MATERNO – CANCER DE PROSTATA', pathological: 'NINGUN ACCIDENTE LABORAL PRESENTADO. CIRUGIAS Y FRACTURAS NEGADAS.', surgeries: 'Cirugías negadas', epp: '', toxicHabits: 'ALCOHOLISMO Y TABAQUISMO NEGADO', others: 'NO USA LENTES', allergies: 'ALERGIAS NEGADAS' },
        labResults: { hematology: { biometria: '', quimica: '', perfilHepatico: '', ego: '', audiometria: '' }, renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' } },
        diagnoses: [], professionalDiseaseSuspicion: '', aptitudeConcept: '', recommendations: []
    },
];
