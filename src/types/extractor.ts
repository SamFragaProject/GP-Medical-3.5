export interface PatientData {
    id: string;
    // 1-11: Datos Personales y Antropometría
    nombreCompleto: string;
    fechaNacimiento?: string;
    edad?: string;
    genero?: string;
    peso?: string;
    talla?: string;
    imc?: string;
    clasificacionIMC?: string;
    porcentajeGrasaVisceral?: string;
    porcentajeGrasaCorporal?: string;
    porcentajeMusculo?: string;

    // 12-16: Signos Vitales
    ta_mmHg?: string;
    fc_lpm?: string;
    fr_rpm?: string;
    satO2?: string;
    temp_C?: string;

    // 17-27: Laboratorios y Estudios Específicos
    biometriaHematica?: string;
    quimicaSanguinea6?: string;
    tasaFiltracionGlomerular?: string;
    creatininaOrina?: string;
    microalbuminuriaOrina?: string;
    examenGeneralOrina?: string;
    relacionAlbuminaCreatinina?: string;
    perfilHepatico?: string;
    electrolitosSericos?: string;
    audiometria?: string;
    relacionCreatinina?: string;
    [key: string]: string | undefined; // Index signature for dynamic access
}

export enum AppStatus {
    IDLE = 'IDLE',
    PROCESSING = 'PROCESSING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}
