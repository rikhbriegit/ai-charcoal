# build-prod.ps1 — build + prerender (SEO) + jalankan production di port 3001.
# Pakai ini untuk deploy/produksi. Prerender WAJIB jalan tiap habis build
# (build me-reset dist/index.html jadi root kosong).
$ErrorActionPreference = 'Stop'
$Root = $PSScriptRoot
Set-Location $Root

Write-Host "1/4  Build (vite + server)..." -ForegroundColor Cyan
npm run build

# Hentikan server lama di port 3001.
$listen = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
if ($listen) { $listen.OwningProcess | Sort-Object -Unique | ForEach-Object { try { Stop-Process -Id $_ -Force -ErrorAction Stop } catch {} } }
Start-Sleep -Milliseconds 600

Write-Host "2/4  Start production server..." -ForegroundColor Cyan
if (-not (Test-Path "$Root\logs")) { New-Item -ItemType Directory -Path "$Root\logs" | Out-Null }
$env:NODE_ENV = 'production'
$proc = Start-Process -FilePath 'node' -ArgumentList 'build/server.cjs' -WorkingDirectory $Root -WindowStyle Hidden `
  -RedirectStandardOutput "$Root\logs\prod.out.log" -RedirectStandardError "$Root\logs\prod.err.log" -PassThru
for ($i = 0; $i -lt 20; $i++) { Start-Sleep -Milliseconds 500; if (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue) { break } }

Write-Host "3/4  Prerender (headless Chromium -> dist/index.html)..." -ForegroundColor Cyan
python scripts/prerender.py

Write-Host "4/4  DONE. Production live: http://localhost:3001  (PID $($proc.Id))" -ForegroundColor Green
