const token = 'sbp_d375c56f4b684a79fd4a56089209a358713bec0a'
const API = 'https://api.supabase.com/v1/projects/kftxftikoydldcexkady/database/query'

async function q(sql) {
    const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ query: sql }),
    })
    return r.json()
}

const tables = await q("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")
console.log('All tables:', JSON.stringify(tables, null, 2))

const catalog = await q("SELECT COUNT(*) as total FROM parametros_catalogo")
console.log('Catalog count:', JSON.stringify(catalog))
