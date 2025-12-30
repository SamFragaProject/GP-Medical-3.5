import https from 'https';

const url = 'https://kftxftikoydldcexkady.supabase.co/rest/v1/';
console.log('Probando conexión a:', url);

const req = https.get(url, (res) => {
    console.log('✅ CONEXIÓN EXITOSA');
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', res.headers);
});

req.on('error', (e) => {
    console.error('❌ ERROR DE CONEXIÓN:', e);
});
