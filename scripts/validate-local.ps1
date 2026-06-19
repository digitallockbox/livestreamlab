$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"

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

Invoke-Step "Frontend TypeScript + import integrity build" {
    Set-Location $frontendPath
    npm run build
}

Invoke-Step "Backend JavaScript syntax" {
    $files = Get-ChildItem -Path $backendPath -Recurse -Filter *.js | Select-Object -ExpandProperty FullName
    foreach ($file in $files) {
        node --check $file
    }
}

Invoke-Step "Backend file integrity" {
    $emptyFiles = Get-ChildItem -Path $backendPath -Recurse -File | Where-Object { $_.Length -eq 0 }
    if ($emptyFiles) {
        throw "Empty files detected: $($emptyFiles.FullName -join ', ')"
    }

    $duplicates = Get-ChildItem -Path $backendPath -Recurse -File |
        Group-Object Name |
        Where-Object { $_.Count -gt 1 }

    if ($duplicates) {
        $dupList = $duplicates | ForEach-Object { "$($_.Name) x$($_.Count)" }
        Write-Host "Duplicate filenames found across folders:"
        $dupList | ForEach-Object { Write-Host " - $_" }
    } else {
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
        }

        Write-Host "Backend API smoke passed."
    }
    finally {
        if ($backendProc -and -not $backendProc.HasExited) {
            Stop-Process -Id $backendProc.Id -Force
        }
    }
}

Invoke-Step "Frontend proxied API smoke" {
    Set-Location $frontendPath
    $frontendProc = Start-Process npm -PassThru -ArgumentList @("run", "dev", "--", "-p", "3000")

    try {
        Wait-HttpReady -Url "http://localhost:3000/"

        $routes = @(
            "http://localhost:3000/api/dashboard/analytics/overview",
            "http://localhost:3000/api/dashboard/system/enginesHealth"
        )

        foreach ($route in $routes) {
            $res = Invoke-WebRequest -Uri $route -UseBasicParsing -TimeoutSec 30
            if ($res.StatusCode -ne 200) {
                throw "Route failed: $route => $($res.StatusCode)"
            }
        }

        Write-Host "Frontend proxy smoke passed."
    }
    finally {
        if ($frontendProc -and -not $frontendProc.HasExited) {
            Stop-Process -Id $frontendProc.Id -Force
        }
    }
}

Write-Host "`nValidation completed successfully."
