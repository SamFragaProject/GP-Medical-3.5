#!/usr/bin/env node

/**
 * Script para ejecutar la migración SQL de políticas RLS en Supabase
 * Corrige el problema de "Acceso Denegado" al iniciar sesión
 */

const fs = require('fs');
const https = require('https');

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'xajnfsanlijkdxevxwnx';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SQL_FILE = './supabase/fix_rls_policies.sql';

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN no está configurado');
  console.error('   Por favor exporta tu token de acceso:');
  console.error('   export SUPABASE_ACCESS_TOKEN="tu_token_aqui"');
  process.exit(1);
}

// Leer el archivo SQL
let sqlContent;
try {
  sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
  console.log('✅ Archivo SQL cargado correctamente');
  console.log(`   Tamaño: ${sqlContent.length} caracteres`);
} catch (error) {
  console.error(`❌ Error leyendo archivo: ${error.message}`);
  process.exit(1);
}

// Función para ejecutar SQL usando Supabase Management API
async function executeSQLMigration() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${SUPABASE_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ACCESS_TOKEN
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Migración ejecutada correctamente');
          resolve(JSON.parse(data));
        } else {
          console.error(`❌ Error HTTP ${res.statusCode}`);
          console.error('Respuesta:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error de conexión:', error.message);
      reject(error);
    });

    // Enviar el SQL como payload
    const payload = JSON.stringify({
      query: sqlContent
    });

    req.write(payload);
    req.end();
  });
}

// Ejecutar la migración
console.log('\n🚀 Ejecutando migración SQL...');
console.log(`   Proyecto: ${SUPABASE_PROJECT_ID}`);
console.log(`   Archivo: ${SQL_FILE}\n`);

executeSQLMigration()
  .then((result) => {
    console.log('\n✅ ¡Migración completada exitosamente!');
    console.log('\n📋 Políticas RLS creadas:');
    console.log('   - Usuarios pueden ver su propio perfil');
    console.log('   - Usuarios pueden actualizar su propio perfil');
    console.log('   - Super admin puede ver todos los perfiles');
    console.log('   - Admin empresa puede ver perfiles de su empresa');
    console.log('   - Usuarios pueden ver su empresa');
    console.log('   - Usuarios pueden ver sedes de su empresa');
    console.log('\n🧪 Prueba el login en: https://18gm5e2c7nsq.space.minimax.io');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando migración:', error.message);
    console.log('\n💡 Solución alternativa:');
    console.log('   1. Ve a https://supabase.com/dashboard/project/xajnfsanlijkdxevxwnx/sql/new');
    console.log('   2. Copia y pega el contenido de: supabase/fix_rls_policies.sql');
    console.log('   3. Haz clic en "Run"');
    console.log('\n📄 Ver instrucciones completas en: SOLUCION_ACCESO_DENEGADO.md');
    process.exit(1);
  });
