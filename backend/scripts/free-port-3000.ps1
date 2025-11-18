param(
    [int]$Port = 3000
)

$ErrorActionPreference = "SilentlyContinue"

$connections = @()
try {
    $connections = Get-NetTCPConnection -LocalPort $Port
} catch {}

if (-not $connections -or $connections.Count -eq 0) {
    $netstat = netstat -ano | Select-String ":$Port"
    $procIds = @()
    foreach ($line in $netstat) {
        $parts = ($line -replace '\s+', ' ').Trim().Split(' ')
        if ($parts.Length -ge 5) {
            $procId = [int]$parts[$parts.Length - 1]
            $procIds += $procId
        }
    }
    $procIds = $procIds | Sort-Object -Unique
    foreach ($procId in $procIds) {
        try { Stop-Process -Id $procId -Force } catch {}
    }
} else {
    $procIds = $connections | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
    foreach ($procId in $procIds) {
        try { Stop-Process -Id $procId -Force } catch {}
    }
}

Write-Output "Puerto $Port liberado"