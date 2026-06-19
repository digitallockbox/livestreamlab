$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"
$allProjectPaths = @($backendPath, $frontendPath)

function Invoke-Step {
    param(
        [string]$Title,
        [scriptblock]$Action
    )

    Write-Host "`n=== $Title ==="
    & $Action
}

function Wait-HttpReady {
    param(
        [string]$Url,
        [int]$Attempts = 40
    )

    for ($i = 0; $i -lt $Attempts; $i++) {
        try {
            $null = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
            return
        }
        catch {
            # Retry until endpoint is available.
        }
    }

    throw "Service did not become ready: $Url"
}

function Test-PortAvailable {
    param(
        [int]$Port
    )

    try {
        $null = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
        return $false
    }
    catch {
        return $true
    }
}

function Get-FrontendPort {
    $candidates = @(3000, 3001, 3100, 3200)
    foreach ($candidate in $candidates) {
        if (Test-PortAvailable -Port $candidate) {
            return $candidate
        }
    }

    throw "No available frontend port found in candidate list: $($candidates -join ', ')"
}

function Stop-ProcessTree {
    param(
        [System.Diagnostics.Process]$Proc
    )

    if (-not $Proc) {
        return
    }

    if (-not $Proc.HasExited) {
        taskkill /PID $Proc.Id /T /F | Out-Null
    }
}

Invoke-Step "Frontend TypeScript + import integrity build" {
    Set-Location $frontendPath
    npm run build
}

Invoke-Step "Dependency correctness" {
    Set-Location $frontendPath
    npm install
    npm ls --depth=0 | Out-Null

    Set-Location $backendPath
    if (Test-Path (Join-Path $backendPath "package.json")) {
        npm ls --depth=0 | Out-Null
    }
}

Invoke-Step "Frontend ESLint" {
    Set-Location $frontendPath
    npm run lint
}

Invoke-Step "Frontend Prettier check" {
    Set-Location $frontendPath
    npm run format:check
}

Invoke-Step "Backend JavaScript syntax" {
    $files = Get-ChildItem -Path $backendPath -Recurse -Filter *.js | Select-Object -ExpandProperty FullName
    foreach ($file in $files) {
        node --check $file
    }
}

Invoke-Step "Project file integrity" {
    $files = foreach ($path in $allProjectPaths) {
        Get-ChildItem -Path $path -Recurse -File |
        Where-Object {
            $_.FullName -notmatch "\\node_modules\\" -and
            $_.FullName -notmatch "\\\.next\\" -and
            $_.FullName -notmatch "\\\.git\\"
        }
    }

    $emptyFiles = $files | Where-Object {
        $_.Length -eq 0 -and
        $_.Name -ne ".gitkeep"
    }
    if ($emptyFiles) {
        throw "Empty files detected: $($emptyFiles.FullName -join ', ')"
    }

    $duplicates = $files |
    Group-Object Name |
    Where-Object { $_.Count -gt 1 }

    if ($duplicates) {
        $dupList = $duplicates | ForEach-Object { "$($_.Name) x$($_.Count)" }
        Write-Host "Duplicate filenames found across folders:"
        $dupList | ForEach-Object { Write-Host " - $_" }
    }
    else {
        Write-Host "No duplicate filenames detected."
    }
}

Invoke-Step "Backend API smoke" {
    Set-Location $backendPath
    $backendProc = Start-Process node -PassThru -ArgumentList @("app.js")

    try {
        Wait-HttpReady -Url "http://localhost:4000/"

        $routes = @(
            "http://localhost:4000/",
            "http://localhost:4000/system/health",
            "http://localhost:4000/system/enginesHealth",
            "http://localhost:4000/analytics/overview",
            "http://localhost:4000/feed?limit=2",
            "http://localhost:4000/stream/status"
        )

        foreach ($route in $routes) {
            $res = Invoke-WebRequest -Uri $route -UseBasicParsing -TimeoutSec 20
            if ($res.StatusCode -ne 200) {
                throw "Route failed: $route => $($res.StatusCode)"
            }
            Write-Host "PASS $route"
        }

        Write-Host "Backend API smoke passed."
    }
    finally {
        Stop-ProcessTree -Proc $backendProc
    }
}

Invoke-Step "Frontend proxied API smoke" {
    $frontendPort = Get-FrontendPort

    Set-Location $backendPath
    $backendProc = Start-Process node -PassThru -ArgumentList @("app.js") -Environment @{
        FRONTEND_ORIGIN = "http://localhost:$frontendPort"
    }

    Set-Location $frontendPath
    $frontendProc = Start-Process npm -PassThru -ArgumentList @("run", "dev", "--", "-p", "$frontendPort") -Environment @{
        NEXT_PUBLIC_BACKEND_ORIGIN = "http://localhost:4000"
    }

    try {
        Wait-HttpReady -Url "http://localhost:4000/"
        Wait-HttpReady -Url "http://localhost:$frontendPort/"

        $routes = @(
            "http://localhost:$frontendPort/api/dashboard/analytics/overview",
            "http://localhost:$frontendPort/api/dashboard/system/enginesHealth"
        )

        foreach ($route in $routes) {
            $res = Invoke-WebRequest -Uri $route -UseBasicParsing -TimeoutSec 30
            if ($res.StatusCode -ne 200) {
                throw "Route failed: $route => $($res.StatusCode)"
            }
            Write-Host "PASS $route"
        }

        Write-Host "Frontend proxy smoke passed."
    }
    finally {
        Stop-ProcessTree -Proc $frontendProc
        Stop-ProcessTree -Proc $backendProc
    }
}

Write-Host "`nValidation completed successfully."
