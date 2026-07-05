# status.ps1 — cek status dev server di port 3001.
$Port = 3001
$conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if ($conns) {
  $pids = ($conns.OwningProcess | Sort-Object -Unique)
  Write-Host "RUNNING  port $Port -- PID: $($pids -join ', ')" -ForegroundColor Green
  foreach ($procId in $pids) {
    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
    if ($proc) { Write-Host ("   {0} (PID {1})" -f $proc.ProcessName, $procId) }
  }
  try {
    $h = Invoke-RestMethod -Uri "http://localhost:$Port/api/health" -TimeoutSec 5
    Write-Host "   Health: $($h.status)   URL: http://localhost:$Port" -ForegroundColor Green
  } catch {
    Write-Host "   Health: belum merespons (mungkin masih booting)." -ForegroundColor Yellow
  }
} else {
  Write-Host "STOPPED  tidak ada proses listening di port $Port." -ForegroundColor Red
}
