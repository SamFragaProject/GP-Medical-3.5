import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kftxftikoydldcexkady.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdHhmdGlrb3lkbGRjZXhrYWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTU2OTMsImV4cCI6MjA4MjI3MTY5M30.UvxYrETiFNil2eNKzJCVcgwOd-MCDBHABlql650y1NU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLS() {
    console.log("Testing insert with ANON_KEY...");
    const { data, error } = await supabase.from('empresas').insert([{
        nombre: 'Empresa Test RLS',
        plan: 'basico',
        activo: true
    }]).select();

    if (error) {
        console.error("❌ RLS blocked insertion or error occurred:", error.message);
    } else {
        console.log("✅ Insertion successful! RLS allows anon inserts.");
        console.log(data);
    }
}

testRLS();
