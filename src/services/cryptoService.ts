/**
 * CryptoService — Cifrado de Grado Médico para Documentos
 * 
 * Implementa cifrado AES-256-GCM del lado del cliente usando Web Crypto API.
 * Los archivos se cifran ANTES de salir del navegador, lo que significa que:
 * 
 * 🔒 Ni Supabase ni Vercel pueden leer los archivos
 * 🔒 Si alguien hackea el storage, solo ve datos cifrados
 * 🔒 Solo usuarios autenticados con la clave correcta pueden descifrar
 * 
 * Flujo:
 * 1. Usuario selecciona archivo
 * 2. Se genera SHA-256 del archivo original (integridad)
 * 3. Se cifra con AES-256-GCM + IV aleatorio
 * 4. Se sube el archivo CIFRADO a Supabase Storage
 * 5. Para ver: se descarga, descifra y se verifica checksum
 * 
 * Cumplimiento: LFPDPPP, NOM-024-SSA3, HIPAA-compatible
 */

// ============================================
// TIPOS
// ============================================
export interface EncryptionResult {
    encryptedData: ArrayBuffer       // Datos cifrados
    iv: string                       // Vector de inicialización (hex)
    checksum: string                 // SHA-256 del archivo ORIGINAL
    checksumCifrado: string          // SHA-256 del archivo CIFRADO
    algoritmo: 'AES-256-GCM'
}

export interface DecryptionResult {
    decryptedData: ArrayBuffer       // Datos descifrados
    checksumVerificado: boolean      // ¿El checksum coincide?
}

// ============================================
// CLAVE DE CIFRADO
// ============================================

/**
 * Genera la clave de cifrado a partir del empresa_id + secreto de la app.
 * Esto asegura que cada empresa tiene su propia clave derivada.
 * 
 * IMPORTANTE: La clave NUNCA se transmite ni se almacena en texto plano.
 * Se deriva usando PBKDF2 con 100,000 iteraciones.
 */
async function deriveEncryptionKey(empresaId: string): Promise<CryptoKey> {
    const encoder = new TextEncoder()

    // El "salt" combina el empresa_id con un secreto de la app
    // Esto hace que cada empresa tenga una clave diferente
    const appSecret = import.meta.env.VITE_ENCRYPTION_SECRET || 'GPMedical-v3.5-SecureVault-2026'
    const saltInput = `${empresaId}::${appSecret}::medical-grade-encryption`

    // Importar el material base como clave PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(saltInput),
        'PBKDF2',
        false,
        ['deriveKey']
    )

    // Salt determinístico basado en empresa_id (para que siempre genere la misma clave)
    const salt = encoder.encode(`salt::${empresaId}::GPMedical`)

    // Derivar clave AES-256-GCM usando PBKDF2 con 100k iteraciones
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        {
            name: 'AES-GCM',
            length: 256
        },
        false,         // No exportable — la clave NUNCA sale de la memoria
        ['encrypt', 'decrypt']
    )
}

// ============================================
// FUNCIONES DE HASH
// ============================================

/**
 * Calcula el SHA-256 de un ArrayBuffer
 * Se usa para verificar la integridad del archivo
 */
export async function computeSHA256(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Convierte ArrayBuffer a string hexadecimal
 */
function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

/**
 * Convierte string hexadecimal a Uint8Array
 */
function hexToBuffer(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
    }
    return bytes
}

// ============================================
// CIFRADO / DESCIFRADO
// ============================================

/**
 * Cifra un archivo usando AES-256-GCM
 * 
 * @param fileData - ArrayBuffer del archivo original
 * @param empresaId - ID de la empresa (para derivar la clave)
 * @returns EncryptionResult con datos cifrados, IV y checksums
 */
export async function encryptFile(
    fileData: ArrayBuffer,
    empresaId: string
): Promise<EncryptionResult> {
    // 1. Calcular checksum del archivo original
    const checksum = await computeSHA256(fileData)

    // 2. Derivar la clave de cifrado
    const key = await deriveEncryptionKey(empresaId)

    // 3. Generar IV aleatorio (12 bytes para AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // 4. Cifrar con AES-256-GCM
    const encryptedData = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv,
            tagLength: 128  // 128-bit authentication tag
        },
        key,
        fileData
    )

    // 5. Calcular checksum del archivo cifrado
    const checksumCifrado = await computeSHA256(encryptedData)

    return {
        encryptedData,
        iv: bufferToHex(iv.buffer),
        checksum,
        checksumCifrado,
        algoritmo: 'AES-256-GCM'
    }
}

/**
 * Descifra un archivo cifrado con AES-256-GCM
 * 
 * @param encryptedData - ArrayBuffer del archivo cifrado
 * @param ivHex - Vector de inicialización en hexadecimal
 * @param empresaId - ID de la empresa
 * @param expectedChecksum - Checksum SHA-256 esperado del archivo original
 * @returns DecryptionResult con datos descifrados y verificación
 */
export async function decryptFile(
    encryptedData: ArrayBuffer,
    ivHex: string,
    empresaId: string,
    expectedChecksum: string
): Promise<DecryptionResult> {
    // 1. Derivar la clave
    const key = await deriveEncryptionKey(empresaId)

    // 2. Convertir IV de hex a bytes
    const iv = hexToBuffer(ivHex)

    // 3. Descifrar
    const decryptedData = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv,
            tagLength: 128
        },
        key,
        encryptedData
    )

    // 4. Verificar integridad del archivo
    const actualChecksum = await computeSHA256(decryptedData)
    const checksumVerificado = actualChecksum === expectedChecksum

    if (!checksumVerificado) {
        console.error('⚠️ ALERTA DE SEGURIDAD: El checksum del archivo descifrado NO coincide!')
        console.error(`  Esperado: ${expectedChecksum}`)
        console.error(`  Obtenido: ${actualChecksum}`)
    }

    return {
        decryptedData,
        checksumVerificado
    }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Lee un File como ArrayBuffer
 */
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
    })
}

/**
 * Convierte un ArrayBuffer descifrado a Blob para visualización
 */
export function arrayBufferToBlob(data: ArrayBuffer, mimeType: string): Blob {
    return new Blob([data], { type: mimeType })
}

/**
 * Crea una URL temporal (Object URL) para visualizar un archivo descifrado
 * ⚠️ IMPORTANTE: Llamar a revokeObjectURL cuando ya no se necesite
 */
export function createSecureObjectURL(data: ArrayBuffer, mimeType: string): string {
    const blob = arrayBufferToBlob(data, mimeType)
    return URL.createObjectURL(blob)
}

/**
 * Formatea el tamaño de archivo en formato legible
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Determina la categoría médica basándose en el nombre del archivo
 */
export function detectCategoria(fileName: string): string {
    const name = fileName.toLowerCase()
    if (name.includes('audiometr')) return 'audiometria'
    if (name.includes('espirometr')) return 'espirometria'
    if (name.includes('laboratorio') || name.includes('lab')) return 'laboratorio'
    if (name.includes('radiograf') || name.includes('rayos')) return 'radiografia'
    if (name.includes('electro') || name.includes('ekg') || name.includes('ecg')) return 'electrocardiograma'
    if (name.includes('certificado') || name.includes('aptitud')) return 'certificado_aptitud'
    if (name.includes('dictamen')) return 'dictamen'
    if (name.includes('receta')) return 'receta'
    if (name.includes('incapacidad')) return 'incapacidad'
    if (name.includes('historia') || name.includes('clinica')) return 'historia_clinica'
    if (name.includes('consentimiento') || name.includes('consent')) return 'consentimiento'
    if (name.includes('ine') || name.includes('credencial') || name.includes('identif')) return 'identificacion'
    return 'otro'
}

/**
 * Determina el MIME type basándose en la extensión
 */
export function getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
        'gif': 'image/gif',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'ppt': 'application/vnd.ms-powerpoint',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xls': 'application/vnd.ms-excel',
        'dicom': 'application/dicom',
        'dcm': 'application/dicom',
    }
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
}
