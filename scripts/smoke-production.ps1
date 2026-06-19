param(
    [Parameter(Mandatory = $true)]
    [string]$FrontendOrigin,

    [Parameter(Mandatory = $true)]
    [string]$BackendOrigin,

    [string]$Provider = "google",
    [string]$ProviderId = "prod-smoke-user",
    [string]$DisplayName = "Production Smoke User",

    [switch]$RunMutatingTests
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
    param(
        [string]$Title,
        [scriptblock]$Action
    )

    Write-Host "`n=== $Title ==="
    & $Action
}

function Assert-Status {
    param(
        [string]$Url,
        [int]$ExpectedStatus,
        [hashtable]$Headers = @{}
    )

    try {
        $res = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 25 -Headers $Headers
        if ($res.StatusCode -ne $ExpectedStatus) {
            throw "Expected $ExpectedStatus but got $($res.StatusCode) for $Url"
        }
        Write-Host "PASS $Url => $($res.StatusCode)"
        return $res
    }
    catch {
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
            if ($status -ne $ExpectedStatus) {
                throw "Expected $ExpectedStatus but got $status for $Url"
            }
            Write-Host "PASS $Url => $status"
            return $_.Exception.Response
        }

        throw $_
    }
}

function Invoke-Json {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body,
        [hashtable]$Headers = @{}
    )

    $requestHeaders = @{}
    foreach ($key in $Headers.Keys) {
        $requestHeaders[$key] = $Headers[$key]
    }

    if ($Method -eq "GET") {
        return Invoke-RestMethod -Method Get -Uri $Url -Headers $requestHeaders -TimeoutSec 25
    }

    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $requestHeaders -Body (ConvertTo-Json $Body) -ContentType "application/json" -TimeoutSec 25
}

$frontend = $FrontendOrigin.TrimEnd('/')
$backend = $BackendOrigin.TrimEnd('/')

Invoke-Step "Public Reachability" {
    Assert-Status -Url "$frontend/" -ExpectedStatus 200 | Out-Null
    Assert-Status -Url "$frontend/login" -ExpectedStatus 200 | Out-Null
    Assert-Status -Url "$backend/" -ExpectedStatus 200 | Out-Null
}

Invoke-Step "Refresh Redirect Behavior" {
    $res = Assert-Status -Url "$backend/dashboard/home" -ExpectedStatus 302 -Headers @{ Accept = "text/html" }
    $location = $res.Headers["Location"]

    if (-not $location) {
        throw "Missing Location header for backend refresh redirect"
    }

    if ($location -notlike "$frontend/*") {
        throw "Refresh redirect location mismatch: expected prefix $frontend but got $location"
    }

    Write-Host "PASS redirect location => $location"
}

Invoke-Step "Session Login + Routing APIs" {
    $loginPayload = @{
        provider   = $Provider
        providerId = $ProviderId
        name       = $DisplayName
    }

    $login = Invoke-Json -Method "POST" -Url "$backend/auth/login" -Body $loginPayload
    if (-not $login.token) {
        throw "Login did not return token"
    }

    $headers = @{ Authorization = "Bearer $($login.token)" }

    $session = Invoke-Json -Method "GET" -Url "$backend/auth/session" -Body $null -Headers $headers
    if (-not $session.userId) {
        throw "Session endpoint missing userId"
    }

    Write-Host "PASS auth/session for user $($session.userId)"

    $myName = Invoke-Json -Method "GET" -Url "$backend/web3/name/my" -Body $null -Headers $headers
    Write-Host "PASS web3/name/my (hasName=$($myName.hasName))"

    $check = Invoke-Json -Method "GET" -Url "$backend/web3/name/check?name=anthony" -Body $null
    if ($null -eq $check.available) {
        throw "web3/name/check missing availability"
    }

    Write-Host "PASS web3/name/check"

    if ($RunMutatingTests) {
        $candidate = ("smoke" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds())
        $purchase = Invoke-Json -Method "POST" -Url "$backend/web3/name/purchase" -Body @{ name = $candidate } -Headers $headers
        Write-Host "MUTATING purchase status => $($purchase.status)"

        if ($purchase.status -eq "PURCHASED") {
            Assert-Status -Url "$frontend/u/$candidate" -ExpectedStatus 200 | Out-Null
            Write-Host "PASS viewer profile route for purchased name"
        }
    }
}

Write-Host "`nProduction smoke completed successfully."
