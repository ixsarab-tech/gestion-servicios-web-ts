$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$backupFile = "$backupDir\gestion-servicios-web-ts_MVP-fase4_$timestamp.tar.gz"

tar --exclude="node_modules" `
    --exclude=".next" `
    --exclude="backups" `
    --exclude="src/generated" `
    --exclude=".turbo" `
    --exclude=".env" `
    --exclude=".env.*" `
    -czf $backupFile .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Fallo al crear el backup" -ForegroundColor Red
    exit 1
}

# Verificar integridad
tar -tzf $backupFile | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backup corrupto: $backupFile" -ForegroundColor Red
    exit 1
}

# Tamaño
Get-Item $backupFile |
    Select-Object Name, @{N='Size (MB)';E={[math]::Round($_.Length/1MB,2)}} |
    Format-Table -AutoSize

Write-Host "✅ Backup OK: $backupFile" -ForegroundColor Green
