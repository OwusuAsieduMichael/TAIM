# Free TAIM dev resources on Windows:
# 1) Listeners on API (4000) and Vite (5173)
# 2) Node processes tied to this repo (so `npx prisma generate` can replace query_engine DLL — fixes EPERM)
foreach ($p in @(4000, 5173)) {
  Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
  Where-Object {
    $cmd = $_.CommandLine
    if (-not $cmd) { return $false }
    $inRepo = $cmd -match '[/\\]TAIM[/\\]'
    $looksLikeTaim = $cmd -match 'apps[/\\]api|@taim[/\\]api|prisma|tsx.*server\.ts|vite'
    return $inRepo -and $looksLikeTaim
  } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
