$ErrorActionPreference = "SilentlyContinue"

Get-CimInstance Win32_Process |
    Where-Object {
        ($_.Name -match "node|npm|powershell") -and
        ($_.CommandLine -match "livestreamlab.live") -and
        ($_.CommandLine -match "frontend|backend|next dev|app.js")
    } |
    ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force
        Write-Host "Stopped PID $($_.ProcessId)"
    }
