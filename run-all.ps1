[CmdletBinding()]
param(
    [ValidateSet("all","back+front","back+mob")]
    [string]$Mode = "all",
    [string]$MobileDevice = "auto",
    [int]$BackendPort = 8081,
    [int]$FrontendPort = 4200,
    [int]$MobileWebPort = 3000
)

$ErrorActionPreference = 'Stop'
$Root = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }

function Write-Banner {
    param([string]$Text, [string]$Color = "Cyan")
    $line = "============================================================"
    Write-Host $line -ForegroundColor $Color
    Write-Host "  $Text" -ForegroundColor $Color
    Write-Host $line -ForegroundColor $Color
}

function Start-VzeetaService {
    param(
        [string]$Title,
        [string]$Script,
        [string]$ExtraArgs = "",
        [string]$Color = "White"
    )
    Write-Host "  >> Starting: $Title" -ForegroundColor $Color
    $cmd = "powershell -NoProfile -ExecutionPolicy Bypass -File '$Script' $ExtraArgs"
    Start-Process powershell -ArgumentList "-NoProfile", "-NoExit", "-Command", $cmd -WindowStyle Normal
    Start-Sleep -Seconds 2
}

Write-Banner "NABD - Starting All Services" "Cyan"
Write-Host ""
Write-Host "  Backend  -> http://localhost:$BackendPort/api/v1" -ForegroundColor Green
Write-Host "  Frontend -> http://localhost:$FrontendPort" -ForegroundColor Green
Write-Host "  Mobile   -> http://localhost:$MobileWebPort (web) / device" -ForegroundColor Green
Write-Host "  Swagger  -> http://localhost:$BackendPort/api/v1/swagger-ui.html" -ForegroundColor DarkGray
Write-Host "  Login    -> superadmin@tabeebi.com / Dev@Local2026!" -ForegroundColor DarkGray
Write-Host ""

# 1. Backend first so it writes runtime-config before frontend starts
Start-VzeetaService -Title "NABD Backend (port $BackendPort)" `
    -Script "$Root\run-backend.ps1" `
    -ExtraArgs "-Port $BackendPort" `
    -Color "Green"

Write-Host "  Waiting 8s for backend to initialise..." -ForegroundColor DarkGray
Start-Sleep -Seconds 8

# 2. Frontend
if ($Mode -eq "all" -or $Mode -eq "back+front") {
    Start-VzeetaService -Title "NABD Frontend (port $FrontendPort)" `
        -Script "$Root\run-frontend.ps1" `
        -ExtraArgs "-Port $FrontendPort" `
        -Color "Blue"
}

# 3. Mobile
if ($Mode -eq "all" -or $Mode -eq "back+mob") {
    Start-VzeetaService -Title "NABD Mobile (device: $MobileDevice)" `
        -Script "$Root\run-mobile.ps1" `
        -ExtraArgs "-Device $MobileDevice -WebPort $MobileWebPort" `
        -Color "Magenta"
}

Write-Host ""
Write-Banner "All services launched in separate windows" "Green"
