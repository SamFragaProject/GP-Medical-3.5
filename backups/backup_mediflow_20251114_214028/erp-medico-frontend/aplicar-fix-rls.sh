#!/bin/bash

# Script para aplicar fix de RLS usando Management API de Supabase

SUPABASE_PROJECT_ID="${SUPABASE_PROJECT_ID:-xajnfsanlijkdxevxwnx}"
SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN}"

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Error: SUPABASE_ACCESS_TOKEN no configurado"
    echo "   Usa: export SUPABASE_ACCESS_TOKEN='tu_token'"
    exit 1
fi

echo "🚀 Aplicando migración RLS..."
echo "   Proyecto: $SUPABASE_PROJECT_ID"

# Leer el SQL
SQL_CONTENT=$(cat supabase/fix_rls_policies.sql)

# Ejecutar con API de Management
curl -X POST \
  "https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/database/query" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Migración enviada. Verifica el resultado arriba."
