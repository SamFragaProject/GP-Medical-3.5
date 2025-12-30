# Script para mantener el servidor de desarrollo corriendo
Write-Host "=== Servidor ERP Médico ===" -ForegroundColor Green
Write-Host "Iniciando en http://localhost:5173/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Yellow
Write-Host ""

Set-Location "c:\Users\Marc XVII\Documents\GPMedical\ERP 3.0\GPMedical 3\GPMedical 3.5\erp-medico-frontend"

# Mantener el servidor corriendo
pnpm dev
