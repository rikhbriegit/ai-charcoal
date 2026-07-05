# start.ps1 — jalankan dev server Nusantara Charcoal (port 3001).
$ErrorActionPreference = 'Stop'
$Port = 3001
$Root = $PSScriptRoot

$listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($listening) {
  $pids = ($listening.OwningProcess | Sort-Object -Unique) -join ', '
  Write-Host "Server sudah berjalan di port $Port (PID: $pids). Gunakan restart.ps1 untuk memulai ulang." -ForegroundColor Yellow
  return
}

$logDir = Join-Path $Root 'logs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$outLog = Join-Path $logDir 'server.out.log'
$errLog = Join-Path $logDir 'server.err.log'

Write-Host "Menjalankan 'npm run dev' di $Root ..." -ForegroundColor Cyan
$p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run dev' `
  -WorkingDirectory $Root -WindowStyle Hidden `
  -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru

Write-Host "Launcher PID $($p.Id). Menunggu port $Port siap..." -ForegroundColor Cyan
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Milliseconds 700
  if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
    Write-Host "OK  Server siap di http://localhost:$Port" -ForegroundColor Green
    return
  }
}
Write-Host "PERINGATAN: port $Port belum listening. Cek log:" -ForegroundColor Yellow
Write-Host "  $outLog"
Write-Host "  $errLog"
