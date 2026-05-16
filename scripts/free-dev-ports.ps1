# DekoHome: API (3000), Vite ayrik gelistirme (5173/5174), eski Vite portlari.
$ports = 3000, 5173, 5174, 24678, 24679, 24680, 8081
foreach ($port in $ports) {
  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object {
      $procId = $_.OwningProcess
      Write-Host "Port $port -> PID $procId sonlandiriliyor..."
      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "Tamam."
