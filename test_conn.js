import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('Testing with URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
    const { data, error } = await supabase.from('pacientes').select('*').limit(1)
    if (error) {
        console.error('Connection error:', error.message)
        if (error.message.includes('fetch')) {
            console.error('Network issue: Could not reach Supabase. Check internet.')
        }
    } else {
        console.log('Connection successful! Found', data.length, 'pacientes.')
    }

    try {
        const aiRes = await fetch('http://localhost:8000/')
        if (aiRes.ok) {
            console.log('AI Service: Online')
        } else {
            console.log('AI Service: Offline (Status ' + aiRes.status + ')')
        }
    } catch (e) {
        console.log('AI Service: Offline (Could not connect)')
    }
}

test()
