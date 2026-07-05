# restart.ps1 — stop paksa lalu start ulang dev server (port 3001).
$Root = $PSScriptRoot
& (Join-Path $Root 'stop.ps1')
Start-Sleep -Seconds 2
& (Join-Path $Root 'start.ps1')
