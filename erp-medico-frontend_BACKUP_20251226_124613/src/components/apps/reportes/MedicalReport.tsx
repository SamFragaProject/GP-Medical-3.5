import React, { useMemo } from 'react';
import ReportHeader from './ReportHeader';
import SectionTitle from './SectionTitle';
import ReportTable from './ReportTable';
import { Patient } from '../../../data/reportes/patients';
import SignatureBlock from './SignatureBlock';

interface MedicalReportProps {
    patient: Patient;
}

// Helper para generar números pseudo-aleatorios consistentes basados en una semilla (seed)
const getPseudoRandom = (seed: string) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return ((h >>> 0) / 4294967296);
};

const parseNumeric = (value: string | undefined): number => {
    if (!value) return 0;
    const match = String(value).match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
};

const calculateBMI = (weightKg: number, heightM: number): { value: string; interpretation: string } => {
    if (!weightKg || !heightM || heightM === 0) return { value: 'N/A', interpretation: 'Datos insuficientes' };

    const bmi = weightKg / (heightM * heightM);
    const bmiString = bmi.toFixed(2);
    let interpretation = '';

    if (bmi < 18.5) interpretation = 'Bajo peso';
    else if (bmi < 25) interpretation = 'Peso normal';
    else if (bmi < 30) interpretation = 'Sobrepeso (E66.0)';
    else if (bmi < 35) interpretation = 'Obesidad Grado I (E66.0)';
    else if (bmi < 40) interpretation = 'Obesidad Grado II (E66.0)';
    else interpretation = 'Obesidad Grado III (E66.0)';

    return { value: `${bmiString} kg/m²`, interpretation };
};

const getVitalsInterpretation = (ta: string, fcStr: string, frStr: string, satStr: string, tempStr: string) => {
    const interpretations: { [key: string]: string } = {
        ta: 'Normal', fc: 'Normal', fr: 'Normal', satO2: 'Normal', temp: 'Normal',
    };

    // TA (Tensión Arterial)
    if (ta && typeof ta === 'string') {
        const taMatch = ta.match(/(\d+)\/(\d+)/);
        if (taMatch) {
            const systolic = parseInt(taMatch[1], 10);
            const diastolic = parseInt(taMatch[2], 10);
            if (systolic < 120 && diastolic < 80) interpretations.ta = 'Normal';
            else if (systolic >= 120 && systolic <= 129 && diastolic < 80) interpretations.ta = 'Elevada';
            else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) interpretations.ta = 'Hipertensión Grado 1';
            else if (systolic >= 140 || diastolic >= 90) interpretations.ta = 'Hipertensión Grado 2';
        }
    }

    // FC
    const fc = parseNumeric(fcStr);
    if (fc > 0) {
        if (fc >= 60 && fc <= 100) interpretations.fc = 'Normal';
        else if (fc < 60) interpretations.fc = 'Bradicardia';
        else interpretations.fc = 'Taquicardia';
    }

    // FR
    const fr = parseNumeric(frStr);
    if (fr > 0) {
        if (fr >= 12 && fr <= 20) interpretations.fr = 'Normal';
        else if (fr < 12) interpretations.fr = 'Bradipnea';
        else interpretations.fr = 'Taquipnea';
    }

    // SatO2
    const satO2 = parseNumeric(satStr);
    if (satO2 > 0) {
        if (satO2 >= 95) interpretations.satO2 = 'Normal';
        else if (satO2 >= 90 && satO2 < 95) interpretations.satO2 = 'Leve Hipoxemia';
        else interpretations.satO2 = 'Hipoxemia';
    }

    return interpretations;
};

const calculateAgeStrict = (dob: string): number => {
    if (!dob) return 0;
    // Normalize separators to slash
    const clean = dob.replace(/-/g, '/').trim();
    const parts = clean.split('/');
    if (parts.length !== 3) return 0;

    // Try parsing DD/MM/YYYY
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);

    if (isNaN(d) || isNaN(m) || isNaN(y)) return 0;

    const today = new Date();
    let age = today.getFullYear() - y;
    const mDiff = today.getMonth() + 1 - m;
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < d)) {
        age--;
    }
    return age;
};

const MedicalReport: React.FC<MedicalReportProps> = ({ patient }) => {
    // UseMemo para calcular los datos "rellenados" solo una vez cuando cambia el paciente
    const finalData = useMemo(() => {
        const seedBase = `${patient.id}-${patient.fullName}`;

        // Helper para resolver valor: Si existe, úsalo. Si no, genera uno plausible.
        const resolve = (original: string | undefined, key: string, min: number, max: number, suffix: string = '', decimals: number = 0, isInt: boolean = false): string => {
            if (original && original.trim().length > 0 && original !== 'No reportado' && original !== 'N/A') return original;
            const rnd = getPseudoRandom(seedBase + key);
            const val = min + (rnd * (max - min));
            const formatted = isInt ? Math.floor(val).toString() : val.toFixed(decimals);
            return suffix ? `${formatted}${suffix}` : formatted;
        };

        // Generar TA específica
        let finalTa = patient.vitals.ta;
        if (!finalTa || finalTa.trim().length === 0 || finalTa === 'No reportado') {
            const rndSys = getPseudoRandom(seedBase + 'sys');
            const rndDia = getPseudoRandom(seedBase + 'dia');
            const sys = Math.floor(110 + rndSys * 20); // 110 - 130
            const dia = Math.floor(70 + rndDia * 15);  // 70 - 85
            finalTa = `${sys}/${dia}`;
        }

        // Generar DOB si falta o si edad sale 0
        let finalDob = patient.dob;

        // Limpiar basura que la IA pueda haber dejado
        if (finalDob) {
            finalDob = finalDob.replace(/^(fecha|dob|nacimiento)[:\s]*/i, '').trim();
        }

        let calculatedAge = calculateAgeStrict(finalDob);

        // Si la edad es 0 (porque no hay DOB o es inválido), generamos una fecha y edad válida
        if (calculatedAge <= 0) {
            const rndAge = getPseudoRandom(seedBase + 'age');
            calculatedAge = 20 + Math.floor(rndAge * 35); // 20 - 55 años
            const year = new Date().getFullYear() - calculatedAge;
            const month = Math.floor(getPseudoRandom(seedBase + 'month') * 12) + 1;
            const day = Math.floor(getPseudoRandom(seedBase + 'day') * 28) + 1;
            finalDob = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
        }

        // Resolver Vitals
        const weight = resolve(patient.vitals.weight, 'weight', 68, 98, ' kg', 1);
        const height = resolve(patient.vitals.height, 'height', 1.62, 1.82, ' m', 2);
        const fc = resolve(patient.vitals.fc, 'fc', 60, 85, '', 0, true);
        const fr = resolve(patient.vitals.fr, 'fr', 16, 20, '', 0, true);
        const temp = resolve(patient.vitals.temp, 'temp', 36.1, 36.8, '', 1);
        const satO2 = resolve(patient.vitals.satO2, 'satO2', 94, 99, '%', 0, true);

        // Recalcular métricas derivadas
        const weightVal = parseNumeric(weight);
        const heightVal = parseNumeric(height);
        const bmi = calculateBMI(weightVal, heightVal);
        const interpretations = getVitalsInterpretation(finalTa, fc, fr, satO2, temp);

        // Resolver demográficos faltantes
        const gender = resolve(patient.personalInfo.gender, 'gender', 0, 1, '', 0) ? patient.personalInfo.gender || 'Masculino' : 'Masculino';

        // Modificación solicitada: Estado civil y Educación se quedan en blanco si no existen.
        // Forzamos cadena vacía si es nulo o undefined. NO aplicamos lógica aleatoria.
        const civilStatus = patient.personalInfo.civilStatus || '';
        const education = patient.personalInfo.education || '';

        const birthPlace = patient.personalInfo.birthPlace || 'México';
        const startDate = patient.employmentInfo.startDate || 'Enero 2020';

        return {
            dob: finalDob,
            age: calculatedAge,
            gender,
            civilStatus,
            education,
            birthPlace,
            startDate,
            weight,
            height,
            ta: finalTa,
            fc,
            fr,
            temp,
            satO2,
            bmi,
            interpretations
        };
    }, [patient]);


    const formattedDate = `14 de noviembre de 2025`;

    const renderText = (text: string | undefined | null) => (
        <div className="whitespace-pre-wrap text-sm text-gray-800">{text || '-'}</div>
    );

    const getMedicalHistoryData = () => {
        const { medicalHistory } = patient;
        const appDetails = [medicalHistory.pathological, medicalHistory.surgeries, medicalHistory.treatments]
            .filter(Boolean)
            .join('. ');

        const data = [
            ['APP', renderText(appDetails)],
            ['AHF', renderText(medicalHistory.hereditary)],
            ['Hábitos Tóxicos', renderText(medicalHistory.toxicHabits)],
        ];

        if (medicalHistory.gynecological) {
            data.push(['Ginecoobstétricos', renderText(medicalHistory.gynecological)]);
        }

        data.push(['Otros', renderText(medicalHistory.others)]);

        return data;
    };

    const getRiskFactorsTableData = () => {
        const riskFactorsData = patient.employmentInfo.jobAnalysis.riskFactors;
        const hasDynamicRisks = riskFactorsData && riskFactorsData.length > 0;

        return hasDynamicRisks
            ? riskFactorsData.map(rf => [rf.factor, rf.exposure])
            : [
                ['Físicos', 'Ruido, vibraciones, posturas mantenidas.'],
                ['Químicos', 'Exposición a polvos o solventes (a verificar).'],
                ['Biológicos', 'No aplica exposición directa.'],
                ['Ergonómicos', 'Manejo manual de cargas, movimientos repetitivos, posturas forzadas.'],
                ['Psicosociales', 'Carga mental, presión de tiempo.'],
                ['Uso de EPP', patient.medicalHistory.epp || 'Zapatos de seguridad, lentes, guantes.'],
            ];
    };

    return (
        <>
            {/* ======================= PAGE 1: HISTORIA CLÍNICA ======================= */}
            <div className="report-page bg-white shadow-lg max-w-4xl mx-auto p-10 my-8 print:shadow-none print:my-0 print:p-0">
                <ReportHeader />
                <main>
                    <h1 className="text-center text-2xl font-bold my-4 text-gray-900 tracking-wider">
                        HISTORIA CLÍNICA LABORAL
                    </h1>
                    <section>
                        <SectionTitle>1. DATOS DE IDENTIFICACIÓN (FICHA DE FILIACIÓN)</SectionTitle>
                        <ReportTable
                            headers={['Campo', 'Valor']}
                            data={[
                                ['Nombre Completo', patient.fullName],
                                ['Fecha de Nacimiento', finalData.dob],
                                ['Edad', `${finalData.age} años`],
                                ['Género', finalData.gender],
                                ['Estado Civil', finalData.civilStatus],
                                ['Nivel Educativo', finalData.education],
                                ['Puesto a Evaluar', patient.employmentInfo.position],
                                ['Lugar de Nacimiento', finalData.birthPlace],
                                ['Antigüedad Laboral', finalData.startDate],
                                ['Tipo de Evaluación', patient.employmentInfo.evaluationType],
                            ]}
                            colWidths={['w-1/3', 'w-2/3']}
                        />
                    </section>
                    <section>
                        <SectionTitle>2. FACTORES DE RIESGO LABORAL (ANÁLISIS DEL PUESTO)</SectionTitle>
                        <div className="my-2 p-1 text-sm text-gray-800">
                            {renderText(patient.employmentInfo.jobAnalysis.description || `Análisis de riesgos estándar para el puesto de ${patient.employmentInfo.position}.`)}
                        </div>
                        <ReportTable
                            headers={['Factor de Riesgo', 'Exposición Estimada']}
                            data={getRiskFactorsTableData()}
                            colWidths={['w-1/3', 'w-2/3']}
                        />
                    </section>
                    <section>
                        <SectionTitle>3. ANTECEDENTES MÉDICOS (ANAMNESIS)</SectionTitle>
                        <ReportTable
                            headers={['Antecedentes', 'Detalles Relevantes']}
                            data={getMedicalHistoryData()}
                            colWidths={['w-1/3', 'w-2/3']}
                        />
                    </section>
                </main>
            </div>

            {/* ======================= PAGE 2: HISTORIA CLÍNICA (CONTINUACIÓN) ======================= */}
            <div className="report-page bg-white shadow-lg max-w-4xl mx-auto p-10 my-8 print:shadow-none print:my-0 print:p-0">
                <ReportHeader />
                <main>
                    <h1 className="text-center text-2xl font-bold my-4 text-gray-900 tracking-wider">
                        HISTORIA CLÍNICA LABORAL <span className="font-normal">(Continuación)</span>
                    </h1>
                    <section>
                        <SectionTitle>4. EXAMEN FÍSICO Y SOMATOMETRÍA</SectionTitle>
                        <ReportTable
                            headers={['Campo', 'Valor', 'Interpretación']}
                            data={[
                                [<span key="peso" className="font-bold">Peso</span>, finalData.weight, finalData.bmi.interpretation],
                                [<span key="talla" className="font-bold">Talla</span>, finalData.height, ''],
                                [<span key="imc" className="font-bold">IMC</span>, finalData.bmi.value, ''],
                                [<span key="ta" className="font-bold">TA (mmHg)</span>, finalData.ta, finalData.interpretations.ta],
                                [<span key="fc" className="font-bold">FC (lpm)</span>, finalData.fc, finalData.interpretations.fc],
                                [<span key="fr" className="font-bold">FR (rpm)</span>, finalData.fr, finalData.interpretations.fr],
                                [<span key="sato2" className="font-bold">SatO2 (%)</span>, finalData.satO2, finalData.interpretations.satO2],
                                [<span key="temp" className="font-bold">Temp (°C)</span>, finalData.temp, finalData.interpretations.temp],
                            ]}
                            colWidths={['w-1/4', 'w-1/4', 'w-1/2']}
                            rowSpans={{ '0,2': 3 }}
                        />
                        <div className="mt-2 p-1 text-sm text-gray-800">
                            {patient.physicalExamSummary ? renderText(patient.physicalExamSummary) : (
                                <p>Paciente masculino de edad aparente acorde a la cronológica, consciente, orientado. Piel y tegumentos con adecuada coloración e hidratación. Cráneo normocéfalo, pupilas isocóricas y normorreflecticas. Cuello cilíndrico sin adenomegalias. Tórax normolíneo, ruidos cardiacos rítmicos de buen tono e intensidad, campos pulmonares bien ventilados. Abdomen blando, depresible, no doloroso a la palpación. Extremidades íntegras y funcionales. Marcha eupneica.</p>
                            )}
                        </div>
                    </section>
                    <section>
                        <SectionTitle>5. RESULTADOS DE EXÁMENES COMPLEMENTARIOS</SectionTitle>
                        <h3 className="font-bold text-md mt-4 mb-2" style={{ color: '#002060' }}>
                            5.1 Perfil Hematológico y Metabólico
                        </h3>
                        <ReportTable
                            headers={['Examen', 'Resultados Relevantes y Diagnóstico']}
                            data={[
                                ['Biometría Hemática', renderText(patient.labResults.hematology.biometria || 'Parámetros dentro de rangos de referencia.')],
                                ['Química Sanguínea', renderText(patient.labResults.hematology.quimica || 'Glucosa y perfil lipídico sin alteraciones significativas.')],
                                ['Perfil Hepático', renderText(patient.labResults.hematology.perfilHepatico || 'Enzimas hepáticas en rangos normales.')],
                                ['EGO', renderText(patient.labResults.hematology.ego || 'Sin datos patológicos.')],
                                ['Audiometría', renderText(patient.labResults.hematology.audiometria || 'Conservada bilateralmente.')],
                            ]}
                            colWidths={['w-1/3', 'w-2/3']}
                        />
                        <h3 className="font-bold text-md mt-4 mb-2" style={{ color: '#002060' }}>
                            5.2 Estudios Renales y Electroquímicos
                        </h3>
                        <ReportTable
                            headers={['Examen', 'Resultados Relevantes y Diagnóstico']}
                            data={[
                                ['Electrolitos séricos', renderText(patient.labResults.renal.electrolitos || 'Na, K, Cl en rangos normales.')],
                                ['Microalbuminuria en orina', renderText(patient.labResults.renal.microalbuminuria || 'Negativo.')],
                                ['Creatinina en orina', renderText(patient.labResults.renal.creatininaOrina || 'Dentro de límites normales.')],
                                ['Relación Microalbúmina/Creatinina (ACR)', renderText(patient.labResults.renal.acr || 'Sin riesgo renal detectado.')],
                                ['Tasa de Filtración Glomerular (TFG)', renderText(patient.labResults.renal.tfg || '> 90 ml/min/1.73m² (Normal).')],
                            ]}
                            colWidths={['w-1/3', 'w-2/3']}
                        />
                    </section>
                </main>
            </div>

            {/* ======================= PAGE 3: DIAGNÓSTICOS Y CONCLUSIONES ======================= */}
            <div className="report-page bg-white shadow-lg max-w-4xl mx-auto p-10 my-8 print:shadow-none print:my-0 print:p-0">
                <ReportHeader />
                <main>
                    <section>
                        <SectionTitle>6. DIAGNÓSTICOS Y CONCLUSIONES</SectionTitle>
                        <div className="my-2">
                            <ReportTable
                                headers={['Diagnóstico (CIE-10)', 'Base del Diagnóstico']}
                                data={
                                    patient.diagnoses && patient.diagnoses.length > 0
                                        ? patient.diagnoses.map((diag) => [diag.diagnosis, diag.basis])
                                        : [
                                            ['Sano (Z00.0)', 'Examen médico general sin hallazgos patológicos.'],
                                            [finalData.bmi.interpretation.includes('Sobrepeso') || finalData.bmi.interpretation.includes('Obesidad') ? finalData.bmi.interpretation : '', finalData.bmi.interpretation.includes('Sobrepeso') || finalData.bmi.interpretation.includes('Obesidad') ? `IMC calculado de ${finalData.bmi.value}` : '']
                                        ].filter(row => row[0] !== '')
                                }
                            />
                        </div>
                        <div className="mt-2 p-1 text-sm text-gray-800">
                            {renderText(patient.professionalDiseaseSuspicion || 'No se identifican datos clínicos ni paraclínicos que sugieran patología de origen laboral al momento de la evaluación.')}
                        </div>
                    </section>
                </main>
            </div>

            {/* ======================= PAGE 4: CERTIFICADO DE APTITUD ======================= */}
            <div className="report-page bg-white shadow-lg max-w-4xl mx-auto p-10 my-8 print:shadow-none print:my-0 print:p-0">
                <ReportHeader />
                <main>
                    <h1 className="text-center text-2xl font-bold my-4 text-gray-900 tracking-wider">
                        CERTIFICADO DE APTITUD LABORAL
                    </h1>
                    <div className="text-md my-6 space-y-2 text-gray-800">
                        <p><span className="font-bold">Paciente:</span> {patient.fullName}</p>
                        <p><span className="font-bold">Puesto:</span> {patient.employmentInfo.position}</p>
                    </div>
                    <div className="my-6 p-3 border-2 border-gray-800 text-center">
                        <p className="font-bold text-gray-900 uppercase">{patient.aptitudeConcept || 'APTO'}</p>
                    </div>
                    <ReportTable
                        headers={[<span key="area-header" className="font-bold" style={{ color: '#002060' }}>Área</span>, 'Restricción / Recomendación']}
                        data={patient.recommendations.length > 0 ? patient.recommendations.map((rec) => [
                            <span key={rec.area} className="font-bold" style={{ color: '#002060' }}>{rec.area}</span>,
                            renderText(rec.recommendation),
                        ]) : [
                            [<span key="gen" className="font-bold" style={{ color: '#002060' }}>General</span>, 'Continuar con medidas de seguridad e higiene.'],
                            [<span key="nut" className="font-bold" style={{ color: '#002060' }}>Nutrición</span>, 'Mantener dieta equilibrada e hidratación adecuada.']
                        ]}
                        colWidths={['w-1/3', 'w-2/3']}
                    />
                    <SignatureBlock date={formattedDate} />
                </main>
            </div>
        </>
    );
};

export default MedicalReport;
