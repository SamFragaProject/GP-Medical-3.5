
// AgentTest.js - Agente de Diagnóstico y Conectividad Integrado
// Ejecutar con: node scripts/agent_test.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Configuración para cargar .env desde root
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envLocalPath = path.resolve(__dirname, '../.env.local')
const envPath = path.resolve(__dirname, '../.env')

console.log('\x1b[36m%s\x1b[0m', '🤖 INICIANDO AGENTE DE DIAGNÓSTICO MEDIFLOW...')
console.log('--------------------------------------------------')

// Cargar variables de entorno (prioridad .env.local)
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath })
    console.log(`✅ Variables de entorno (.env.local) cargadas.`)
} else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    console.log(`✅ Variables de entorno (.env) cargadas.`)
} else {
    console.error('❌ ERROR: No se encontró archivo .env ni .env.local en la raíz del frontend.')
    process.exit(1)
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ERROR: Faltan credenciales VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSupabase() {
    console.log('\n📡 DIAGNÓSTICO DE SUPABASE:')
    const start = Date.now()
    try {
        const { count, error } = await supabase.from('pacientes').select('*', { count: 'exact', head: true })
        const time = Date.now() - start

        if (error) {
            console.log(`❌ Conexión Fallida: ${error.message}`)
            return false
        } else {
            console.log(`✅ Conexión Exitosa (${time}ms)`)
            console.log(`📊 Tabla 'pacientes': ${count} registros encontrados.`)
            return true
        }
    } catch (e) {
        console.log(`❌ Error de red/excepción: ${e.message}`)
        return false
    }
}

async function checkLocalAI() {
    console.log('\n🧠 DIAGNÓSTICO DE IA LOCAL (CUDA):')
    const start = Date.now()
    try {
        // Intentar conectar al servicio Python en puerto 8000
        const response = await fetch('http://localhost:8000/')
        const time = Date.now() - start

        if (response.ok) {
            const data = await response.json()
            console.log(`✅ Servicio IA Online (${time}ms)`)
            console.log(`🖥️  Dispositivo: ${data.device}`)
            if (data.gpu_name) {
                console.log(`🚀 GPU Detectada: ${data.gpu_name} (${data.vram_total.toFixed(2)} GB VRAM)`)
            } else {
                console.log('⚠️  GPU no detectada (Corriendo en CPU)')
            }
            return true
        } else {
            console.log(`⚠️ Servicio IA respondió con error: ${response.status}`)
            return false
        }
    } catch (e) {
        console.log(`❌ No se pudo conectar al Servicio IA (localhost:8000).`)
        console.log(`   Sugerencia: Ejecuta el script Python 'predictive-service/main.py'`)
        return false
    }
}

async function runDiagnosis() {
    const sb = await checkSupabase()
    const ai = await checkLocalAI()

    console.log('\n--------------------------------------------------')
    console.log('📋 RESUMEN DE AGENTE:')

    if (sb && ai) {
        console.log('\x1b[32m%s\x1b[0m', '✅ SISTEMA COMPLETAMENTE OPERATIVO')
        console.log('   Visualización y Datos preparados para Features Avanzados.')
    } else if (sb && !ai) {
        console.log('\x1b[33m%s\x1b[0m', '⚠️  PARCIALMENTE OPERATIVO')
        console.log('   Base de datos OK, pero falta encender el cerebro IA local.')
    } else if (!sb && ai) {
        console.log('\x1b[33m%s\x1b[0m', '⚠️  PARCIALMENTE OPERATIVO')
        console.log('   IA Lista, pero sin conexión a Base de Datos.')
    } else {
        console.log('\x1b[31m%s\x1b[0m', '❌ SISTEMA DESCONECTADO')
        console.log('   Revisa conexión a internet y enciende el servicio Python.')
    }
}

runDiagnosis()
