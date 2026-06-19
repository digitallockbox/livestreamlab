$ErrorActionPreference = "Stop"

param(
    [switch]$OpenCode
)

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"

if (-not (Test-Path $backendPath)) {
    throw "Backend path not found: $backendPath"
}

if (-not (Test-Path $frontendPath)) {
    throw "Frontend path not found: $frontendPath"
}

$backend = Start-Process powershell -PassThru -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backendPath'; node app.js"
)

$frontend = Start-Process powershell -PassThru -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontendPath'; npm run dev -- -p 3000"
)

Write-Host "Started backend PID: $($backend.Id)"
Write-Host "Started frontend PID: $($frontend.Id)"
Write-Host "Frontend URL: http://localhost:3000"
Write-Host "Backend URL:  http://localhost:4000"

if ($OpenCode) {
    code $root
}
