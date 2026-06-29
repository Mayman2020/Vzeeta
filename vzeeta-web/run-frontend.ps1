[CmdletBinding()]
param([switch]$SkipInstall)

$ErrorActionPreference = 'Stop'
$DefaultPort = 4200

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$ProjectRoot = $ScriptDir
$WorkspaceRoot = Split-Path -Parent $ProjectRoot
$RuntimeStateFile = Join-Path $WorkspaceRoot ".runtime\launcher-state.json"
$RuntimeConfigJs = Join-Path $ProjectRoot "src\assets\runtime-config.js"

function Write-Step { param([string]$Message, [string]$Color = "Cyan")
  Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

Set-Location $ProjectRoot
$env:NG_CLI_ANALYTICS = "false"
$env:CI = "true"

if (-not $SkipInstall -and -not (Test-Path (Join-Path $ProjectRoot "node_modules"))) {
  Write-Step "Installing dependencies..."
  npm install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$backendApiUrl = "http://localhost:8081/api/v1"
$backendFileUrl = "http://localhost:8081/api/v1/files"
if (Test-Path $RuntimeStateFile) {
  try {
    $runtimeState = Get-Content -Path $RuntimeStateFile -Raw | ConvertFrom-Json
    if ($runtimeState.backendBaseUrl) { $backendApiUrl = [string]$runtimeState.backendBaseUrl }
    if ($runtimeState.backendFileBaseUrl) { $backendFileUrl = [string]$runtimeState.backendFileBaseUrl }
  } catch { Write-Step "Runtime state unreadable; using defaults" "Yellow" }
}
@"
window.__TB_API_URL__ = '$backendApiUrl';
window.__TB_FILE_URL__ = '$backendFileUrl';
"@ | Set-Content -Path $RuntimeConfigJs -Encoding UTF8

Write-Step "Starting Tabeebi frontend on port $DefaultPort..." "Green"
Write-Step "URL: http://localhost:$DefaultPort" "Gray"
npx ng serve --project vzeeta-web --port=$DefaultPort --proxy-config proxy.conf.json
