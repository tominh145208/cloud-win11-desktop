Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$keyPath = Join-Path $env:USERPROFILE ".ssh\\id_ed25519"

Write-Host "Dang tao SSH key: $keyPath"
& ssh-keygen -t ed25519 -f $keyPath -N "" | Out-Host
