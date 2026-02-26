const sql = [
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS curp VARCHAR(18)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS rfc VARCHAR(13)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS nss VARCHAR(20)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(20)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS tipo_sangre VARCHAR(5)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS numero_empleado VARCHAR(50)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS area VARCHAR(100)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS departamento VARCHAR(100)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS turno VARCHAR(20)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS fecha_ingreso DATE",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS empresa_nombre VARCHAR(200)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS alergias TEXT",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS antecedentes_personales TEXT",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS antecedentes_familiares TEXT",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS padecimiento_actual TEXT",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre VARCHAR(200)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS contacto_emergencia_parentesco VARCHAR(50)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS contacto_emergencia_telefono VARCHAR(20)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS dictamen_aptitud VARCHAR(30)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS restricciones TEXT",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS recomendaciones TEXT",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS peso_kg DECIMAL(5,2)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS talla_cm DECIMAL(5,2)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS imc DECIMAL(4,1)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS presion_sistolica INTEGER",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS presion_diastolica INTEGER",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS frecuencia_cardiaca INTEGER",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS saturacion_o2 INTEGER",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS temperatura DECIMAL(4,1)",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS exploracion_fisica JSONB DEFAULT '{}'",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS audiometria JSONB DEFAULT '{}'",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS espirometria JSONB DEFAULT '{}'",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS laboratorio JSONB DEFAULT '{}'",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS radiografia JSONB DEFAULT '{}'",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS expediente_md TEXT",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS foto_url TEXT",
    "ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS firma_url TEXT",
];

const url = 'https://kftxftikoydldcexkady.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdHhmdGlrb3lkbGRjZXhrYWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY5NTY5MywiZXhwIjoyMDgyMjcxNjkzfQ.jWqFtJzFMXkGgn3frOC0ViRznKFX5RCb2C1I04FOqQ0';

async function run() {
    const fullSql = sql.join(';\n') + ';';

    const resp = await fetch(url + '/rest/v1/rpc/', {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });

    // Use the SQL editor endpoint instead
    const resp2 = await fetch(url + '/pg', {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: fullSql })
    });

    console.log('PG Status:', resp2.status);
    const text = await resp2.text();
    console.log('Response:', text.substring(0, 500));
}

run().catch(console.error);
