
// AgentTest.js - Agente de Diagnóstico y Conectividad Integrado v2.0
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

const DIVIDER = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

console.log('\x1b[36m%s\x1b[0m', '🤖 GPMEDICAL 3.5 — AGENTE DE DIAGNÓSTICO INTEGRAL v2.0')
console.log(DIVIDER)
console.log(`   Fecha: ${new Date().toLocaleString()}`)
console.log(DIVIDER)

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

// ============================================
// 1. Diagnóstico Supabase
// ============================================
async function checkSupabase() {
    console.log('\n📡 [1/3] DIAGNÓSTICO DE SUPABASE:')
    const start = Date.now()
    try {
        const { count, error } = await supabase.from('pacientes').select('*', { count: 'exact', head: true })
        const time = Date.now() - start

        if (error) {
            console.log(`   ❌ Conexión Fallida: ${error.message}`)
            return false
        } else {
            console.log(`   ✅ Conexión Exitosa (${time}ms)`)
            console.log(`   📊 Tabla 'pacientes': ${count} registros encontrados.`)

            // Check additional tables
            const tables = ['consultas', 'incapacidades', 'recetas', 'empresas']
            for (const table of tables) {
                try {
                    const { count: tCount } = await supabase.from(table).select('*', { count: 'exact', head: true })
                    console.log(`   📊 Tabla '${table}': ${tCount ?? 0} registros.`)
                } catch {
                    console.log(`   ⚠️  Tabla '${table}': No accesible (puede requerir migración).`)
                }
            }
            return true
        }
    } catch (e) {
        console.log(`   ❌ Error de red/excepción: ${e.message}`)
        return false
    }
}

// ============================================
// 2. Diagnóstico Motor IA CUDA (Puerto 8000)
// ============================================
async function checkLocalAI() {
    console.log('\n🧠 [2/3] DIAGNÓSTICO DE MOTOR PREDICTIVO (CUDA):')
    const start = Date.now()
    try {
        const response = await fetch('http://localhost:8000/')
        const time = Date.now() - start

        if (response.ok) {
            const data = await response.json()
            console.log(`   ✅ Servicio IA Online (${time}ms)`)
            console.log(`   🖥️  Dispositivo: ${data.device}`)
            if (data.gpu_name) {
                console.log(`   🚀 GPU Detectada: ${data.gpu_name} (${data.vram_total?.toFixed(2)} GB VRAM)`)
            } else {
                console.log('   ⚠️  GPU no detectada (Corriendo en CPU)')
            }
            return true
        } else {
            console.log(`   ⚠️  Servicio respondió con error: ${response.status}`)
            return false
        }
    } catch (e) {
        console.log(`   ❌ No disponible (localhost:8000)`)
        console.log(`   💡 Sugerencia: Ejecuta 'python predictive-service/main.py'`)
        return false
    }
}

// ============================================
// 3. Diagnóstico Ollama LLM (Puerto 11434)
// ============================================
async function checkOllama() {
    console.log('\n🦙 [3/3] DIAGNÓSTICO DE OLLAMA LLM:')
    const start = Date.now()
    try {
        const response = await fetch('http://localhost:11434/api/tags')
        const time = Date.now() - start

        if (response.ok) {
            const data = await response.json()
            const models = data.models || []
            console.log(`   ✅ Ollama Online (${time}ms)`)
            console.log(`   📦 Modelos instalados: ${models.length}`)

            if (models.length > 0) {
                models.forEach(m => {
                    const sizeGB = (m.size / (1024 * 1024 * 1024)).toFixed(1)
                    console.log(`      • ${m.name} (${sizeGB} GB)`)
                })
            } else {
                console.log(`   ⚠️  No hay modelos instalados.`)
                console.log(`   💡 Instala uno con: 'ollama pull llama3.2:3b'`)
            }

            // Test a quick generation
            try {
                const testStart = Date.now()
                const genResponse = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: models[0]?.name || 'llama3.2:3b',
                        prompt: 'Responde solo con "OK"',
                        stream: false,
                        options: { num_predict: 5 }
                    })
                })
                const testTime = Date.now() - testStart

                if (genResponse.ok) {
                    const genData = await genResponse.json()
                    console.log(`   🧪 Test de generación: OK (${testTime}ms)`)
                    console.log(`      Respuesta: "${genData.response?.trim()}"`)
                    const tokensPerSec = genData.eval_count && genData.eval_duration
                        ? (genData.eval_count / (genData.eval_duration / 1e9)).toFixed(1)
                        : 'N/A'
                    console.log(`      Velocidad: ${tokensPerSec} tokens/s`)
                }
            } catch {
                console.log(`   ⚠️  Test de generación falló (modelo podría no estar cargado)`)
            }

            return true
        } else {
            console.log(`   ⚠️  Ollama respondió con error: ${response.status}`)
            return false
        }
    } catch (e) {
        console.log(`   ❌ No disponible (localhost:11434)`)
        console.log(`   💡 Sugerencia: Ejecuta 'ollama serve'`)
        return false
    }
}

// ============================================
// Reporte Final
// ============================================
async function runDiagnosis() {
    const sb = await checkSupabase()
    const ai = await checkLocalAI()
    const ollama = await checkOllama()

    const total = [sb, ai, ollama].filter(Boolean).length

    console.log('\n' + DIVIDER)
    console.log('📋 REPORTE DEL SISTEMA:')
    console.log(DIVIDER)

    console.log(`   Supabase DB:      ${sb ? '🟢 ONLINE' : '🔴 OFFLINE'}`)
    console.log(`   Motor CUDA:       ${ai ? '🟢 ONLINE' : '🔴 OFFLINE'}`)
    console.log(`   Ollama LLM:       ${ollama ? '🟢 ONLINE' : '🔴 OFFLINE'}`)
    console.log(`   ─────────────────────────────`)
    console.log(`   Servicios activos: ${total}/3`)

    if (total === 3) {
        console.log('\n\x1b[32m%s\x1b[0m', '✅ SISTEMA COMPLETAMENTE OPERATIVO')
        console.log('   Todos los motores de IA y la base de datos están en línea.')
        console.log('   El Intelligence Bureau está listo para producción.')
    } else if (total >= 1) {
        console.log('\n\x1b[33m%s\x1b[0m', '⚠️  PARCIALMENTE OPERATIVO')
        console.log('   Algunas funcionalidades estarán limitadas.')
        console.log('   El sistema usará el Motor Heurístico de Fallback para IA.')
    } else {
        console.log('\n\x1b[31m%s\x1b[0m', '❌ SISTEMA DESCONECTADO')
        console.log('   Verifique conexión a internet y encienda los servicios locales.')
    }

    console.log('\n' + DIVIDER)
}

runDiagnosis()
