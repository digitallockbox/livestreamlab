$ErrorActionPreference = "Stop"

param(
    [switch]$OpenCode,
    [int]$FrontendPort = 3000,
    [int]$BackendPort = 4000
)

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"

$frontendOrigin = "http://localhost:$FrontendPort"
$backendOrigin = "http://localhost:$BackendPort"

if (-not (Test-Path $backendPath)) {
    throw "Backend path not found: $backendPath"
}

if (-not (Test-Path $frontendPath)) {
    throw "Frontend path not found: $frontendPath"
}

$backend = Start-Process powershell -PassThru -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backendPath'; `$env:BACKEND_PORT='$BackendPort'; `$env:FRONTEND_ORIGIN='$frontendOrigin'; node app.js"
)

$frontend = Start-Process powershell -PassThru -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontendPath'; `$env:NEXT_PUBLIC_BACKEND_ORIGIN='$backendOrigin'; npm run dev -- -p $FrontendPort"
)

Write-Host "Started backend PID: $($backend.Id)"
Write-Host "Started frontend PID: $($frontend.Id)"
Write-Host "Frontend URL: $frontendOrigin"
Write-Host "Backend URL:  $backendOrigin"

if ($OpenCode) {
    code $root
}
