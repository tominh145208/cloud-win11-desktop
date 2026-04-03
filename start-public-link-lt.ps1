Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$global:PSNativeCommandUseErrorActionPreference = $false

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$linkFile = Join-Path $root "public-links.txt"
$tunnelPasswordUrl = "https://loca.lt/mytunnelpassword"

function Test-LocalServer {
    try {
        $null = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 3
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

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "Khong tim thay npx. Hay cai Node.js roi chay lai run-public-lt.bat."
    exit 1
}

Write-Host "Dang tao public tunnel bang localtunnel..."
Write-Host "Giu cua so nay mo de link tiep tuc hoat dong."
Write-Host ""

function Get-TunnelPassword {
    try {
        $response = Invoke-WebRequest -Uri $tunnelPasswordUrl -UseBasicParsing -TimeoutSec 8
        $password = ($response.Content | Out-String).Trim()
        if ([string]::IsNullOrWhiteSpace($password)) {
            return $null
        }
        return $password
    } catch {
        return $null
    }
}

$publicUrl = $null
$regex = "https://[A-Za-z0-9-]+\.loca\.lt"

& npx localtunnel --port 3000 2>&1 | ForEach-Object {
    $line = [string]$_
    if (-not $publicUrl) {
        $match = [regex]::Match($line, $regex)
        if ($match.Success) {
            $publicUrl = $match.Value
            $adminUrl = "$publicUrl/admin.html"
            $tunnelPassword = Get-TunnelPassword
            $contentLines = @(
                "WEB CHINH: $publicUrl",
                "WEB ADMIN: $adminUrl"
            )
            if ($tunnelPassword) {
                $contentLines += "TUNNEL PASSWORD: $tunnelPassword"
            } else {
                $contentLines += "TUNNEL PASSWORD: Mo https://loca.lt/mytunnelpassword de xem mat khau"
            }
            $content = $contentLines -join "`r`n"
            Set-Content -Path $linkFile -Value $content -Encoding UTF8
            Clear-Host
            Write-Host "Win11 PUBLIC LT run"
            Write-Host ""
            Write-Host "WEB CHINH: $publicUrl"
            Write-Host "WEB ADMIN: $adminUrl"
            if ($tunnelPassword) {
                Write-Host "TUNNEL PASSWORD: $tunnelPassword"
            } else {
                Write-Host "TUNNEL PASSWORD: Mo https://loca.lt/mytunnelpassword de xem mat khau"
            }
            Write-Host "Da luu vao: $linkFile"
            Write-Host ""
            Write-Host "Giu cua so nay mo de link tiep tuc hoat dong."
            Write-Host ""
        }
    }
    if (-not $publicUrl) {
        Write-Host $line
    }
}
