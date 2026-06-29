[CmdletBinding()]
param(
    [string]$Device = "auto",
    [int]$WebPort = 3000,
    [string]$Flavor = ""
)

$ErrorActionPreference = 'Stop'
$ScriptDir   = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$MobileDir   = Join-Path $ScriptDir "vzeeta-mobile"
$RuntimeFile = Join-Path $ScriptDir ".runtime\launcher-state.json"

function Write-Step { param([string]$Message, [string]$Color = "Cyan")
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

# --- Resolve Flutter ---
$flutterFound = Get-Command flutter -ErrorAction SilentlyContinue
$FlutterCmd = if ($flutterFound) { $flutterFound.Source } else { $null }
if (-not $FlutterCmd) {
    Write-Step "flutter not found in PATH. Make sure Flutter SDK is installed." "Red"
    exit 1
}

# app_constants.dart uses kIsWeb at runtime to switch between localhost (web) and 10.0.2.2 (Android emulator)

Set-Location $MobileDir

# --- flutter pub get ---
Write-Step "Running flutter pub get..." "Cyan"
flutter pub get
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# --- Detect device ---
if ($Device -eq "auto") {
    Write-Step "Detecting available devices..." "Cyan"
    $devicesOutput = flutter devices 2>&1 | Out-String
    if ($devicesOutput -match 'chrome') { $Device = "chrome" }
    elseif ($devicesOutput -match 'emulator|android') { $Device = "android" }
    elseif ($devicesOutput -match 'windows') { $Device = "windows" }
    else { $Device = "chrome" }
    Write-Step "Selected device: $Device" "Green"
}

# --- Run ---
Write-Step "Starting Vzeeta Mobile on [$Device]..." "Green"
if ($Device -eq "chrome") {
    Write-Step "Web URL: http://localhost:$WebPort" "Gray"
    flutter run -d chrome --web-port $WebPort
} else {
    flutter run -d $Device
}

exit $LASTEXITCODE
