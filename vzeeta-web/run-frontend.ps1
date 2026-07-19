[CmdletBinding()]
param(
  [switch]$SkipInstall,
  [int]$Port = 4202
)

$ErrorActionPreference = 'Stop'

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$ProjectRoot = $ScriptDir
$WorkspaceRoot = Split-Path -Parent $ProjectRoot
$RuntimeStateFile = Join-Path $WorkspaceRoot ".runtime\launcher-state.json"
$RuntimeConfigJs = Join-Path $ProjectRoot "src\assets\runtime-config.js"

function Write-Step { param([string]$Message, [string]$Color = "Cyan")
  Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

function Restart-PortOwner {
  param([int]$Port)

  $owners = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
    Where-Object { $_.OwningProcess -and $_.OwningProcess -ne 0 -and $_.OwningProcess -ne $PID } |
    Select-Object -ExpandProperty OwningProcess -Unique

  if (-not $owners) { return }

  foreach ($owner in $owners) {
    try {
      $process = Get-Process -Id $owner -ErrorAction Stop
      Write-Step "Port $Port is busy by PID $owner ($($process.ProcessName)); restarting it..." "Yellow"
      Stop-Process -Id $owner -Force -ErrorAction Stop
    } catch {
      Write-Step "Could not stop PID $owner on port ${Port}: $($_.Exception.Message)" "Yellow"
    }
  }

  for ($i = 0; $i -lt 20; $i++) {
    $stillBusy = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $stillBusy) { return }
    Start-Sleep -Milliseconds 300
  }

  Write-Step "Port $Port is still busy after restart attempt." "Red"
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

Restart-PortOwner -Port $Port

Write-Step "Starting NABD frontend on port $Port..." "Green"
Write-Step "URL: http://localhost:$Port" "Gray"

$maxAttempts = 3
for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    npx ng serve --project vzeeta-web --port=$Port --proxy-config proxy.conf.json
    if ($LASTEXITCODE -eq 0) { exit 0 }

    if ($attempt -lt $maxAttempts) {
        Write-Step "Frontend exited with code $LASTEXITCODE (attempt $attempt/$maxAttempts) - another process may have grabbed port $Port meanwhile. Reclaiming it and retrying..." "Yellow"
        Restart-PortOwner -Port $Port
    }
}
exit $LASTEXITCODE
