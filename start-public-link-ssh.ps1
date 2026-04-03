Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$global:PSNativeCommandUseErrorActionPreference = $false

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$linkFile = Join-Path $root "public-links.txt"

function Test-LocalServer {
    try {
        $resp = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 3
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-LocalServer)) {
    Write-Host "Chua co server local, dang mo Win11 LAN Server..."
    Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd `"$root`"; node server.js"
    Start-Sleep -Seconds 2
}

$publicUrl = $null
$regex = "https://[A-Za-z0-9-]+\.lhr\.life|https://[A-Za-z0-9-]+\.loca\.lt|https://[A-Za-z0-9-]+\.localhost\.run"

if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "Khong tim thay ssh. Vui long cai OpenSSH Client trong Windows Optional Features."
    Write-Host "Sau do chay lai run-public-ssh.bat."
    exit 1
}

Write-Host "Dang tao public tunnel bang localhost.run..."
Write-Host "Giu cua so nay mo de link tiep tuc hoat dong."
Write-Host ""

& ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -R 80:localhost:3000 localhost.run 2>&1 | ForEach-Object {
    $line = $_
    if (-not $publicUrl) {
        $match = [regex]::Match($line, $regex)
        $candidateUrl = $match.Value
        if ($match.Success -and $candidateUrl -and $candidateUrl -notlike "https://admin.localhost.run*" -and $candidateUrl -notlike "https://localhost.run/docs*") {
            $publicUrl = $candidateUrl
            $adminUrl = "$publicUrl/admin.html"
            $content = @(
                "WEB CHINH: $publicUrl",
                "WEB ADMIN: $adminUrl"
            ) -join "`r`n"
            Set-Content -Path $linkFile -Value $content -Encoding UTF8
            Write-Host ""
            Write-Host "WEB CHINH: $publicUrl"
            Write-Host "WEB ADMIN: $adminUrl"
            Write-Host "Da luu vao: $linkFile"
            Write-Host ""
        }
    }
    Write-Host $line
}
