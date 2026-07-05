# stop.ps1 — tutup PAKSA apa pun yang memakai port 3001, plus proses server.ts sisa.
$Port = 3001
$Root = $PSScriptRoot
$killed = @()

# 1) Bunuh pemilik port 3001 (force).
$conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
foreach ($procId in ($conns.OwningProcess | Sort-Object -Unique)) {
  try { Stop-Process -Id $procId -Force -ErrorAction Stop; $killed += $procId } catch {}
}

# 2) Bersihkan node/tsx sisa yang masih menjalankan server.ts project ini.
Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='tsx.exe' OR Name='cmd.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -and $_.CommandLine -match 'server\.ts|npm run dev' } |
  ForEach-Object {
    try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop; $killed += $_.ProcessId } catch {}
  }

$killed = $killed | Sort-Object -Unique
if ($killed.Count) {
  Write-Host "STOP  Port $Port ditutup paksa. PID: $($killed -join ', ')" -ForegroundColor Green
} else {
  Write-Host "Tidak ada proses aktif di port $Port." -ForegroundColor Yellow
}
