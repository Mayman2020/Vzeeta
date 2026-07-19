[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [int]$Port = 8081
)

$ErrorActionPreference = 'Stop'
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$MvnwPath = Join-Path $ScriptDir "mvnw.cmd"
$ContextPath = "/api/v1"
$WorkspaceRoot = Split-Path -Parent $ScriptDir
$RuntimeDir = Join-Path $WorkspaceRoot ".runtime"
$RuntimeStateFile = Join-Path $RuntimeDir "launcher-state.json"
$FrontendRuntimeConfigJs = Join-Path $WorkspaceRoot "vzeeta-web\src\assets\runtime-config.js"

function Write-Step { param([string]$Message, [string]$Color = "Cyan") Write-Host $Message -ForegroundColor $Color }

function Stop-ListenerOnPort {
    param([int]$TargetPort)
    $pattern = ':\s*' + $TargetPort + '\s+.*LISTENING\s+(\d+)\s*$'
    $pids = @()
    netstat -ano | ForEach-Object {
        if ($_ -match $pattern) {
            $pids += [int]$Matches[1]
        }
    }
    foreach ($procId in ($pids | Select-Object -Unique)) {
        if ($procId -le 0) { continue }
        Write-Step "Port $TargetPort in use by PID $procId - stopping it (whatever it is) to take over the port..." "Yellow"
        taskkill /PID $procId /F | Out-Null
    }

    # Freeing a port isn't instant (TIME_WAIT, slow process teardown) - wait until it's actually gone.
    for ($i = 0; $i -lt 20; $i++) {
        $stillBusy = netstat -ano | Select-String -Pattern (':\s*' + $TargetPort + '\s+.*LISTENING')
        if (-not $stillBusy) { return }
        Start-Sleep -Milliseconds 300
    }
    Write-Step "Port $TargetPort still reports busy after cleanup attempt; the startup below may retry." "Yellow"
}

$JavaCandidates = @($env:JAVA_HOME, "C:\Program Files\Java\jdk-17", "C:\Program Files\Eclipse Adoptium\jdk-17*")
$ResolvedJavaHome = $null
foreach ($candidate in $JavaCandidates) {
    if (-not $candidate) { continue }
    $path = if ($candidate -match '\*') { (Get-Item $candidate -ErrorAction SilentlyContinue | Select-Object -First 1).FullName } else { $candidate }
    if ($path -and (Test-Path (Join-Path $path "bin\java.exe"))) { $ResolvedJavaHome = $path; break }
}
if (-not $ResolvedJavaHome) { Write-Step "JAVA_HOME not found. Install JDK 17 or set JAVA_HOME." "Red"; exit 1 }
$env:JAVA_HOME = $ResolvedJavaHome
$env:Path = "$($env:JAVA_HOME)\bin;$env:Path"

Set-Location $ScriptDir
$env:SERVER_PORT = "$Port"
$env:FILE_BASE_URL = "http://localhost:$Port$ContextPath"
if (-not $env:JWT_SECRET) {
    $env:JWT_SECRET = "DevOnly-Vzeeta-Local-JWT-Secret-Min32Chars!"
    Write-Step "JWT_SECRET not set - using local dev secret (not for production)" "Yellow"
}
if (-not $env:SPRING_PROFILES_ACTIVE) {
    $env:SPRING_PROFILES_ACTIVE = "dev"
}
if (-not $env:UPLOAD_DIR) {
    $env:UPLOAD_DIR = Join-Path $env:USERPROFILE ".vzeeta-uploads"
}

Stop-ListenerOnPort -TargetPort $Port

if (-not $SkipBuild) {
    Write-Step "Maven compile..." "Cyan"
    & $MvnwPath compile -DskipTests
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$BaseUrl = "http://localhost:$Port$ContextPath"

if (-not (Test-Path $RuntimeDir)) { New-Item -ItemType Directory -Path $RuntimeDir | Out-Null }
@{
    backendPort = $Port
    backendBaseUrl = $BaseUrl
    backendFileBaseUrl = "$BaseUrl/files"
    updatedAt = (Get-Date).ToString("o")
} | ConvertTo-Json | Set-Content -Path $RuntimeStateFile -Encoding UTF8

if (Test-Path (Split-Path -Parent $FrontendRuntimeConfigJs)) {
@"
window.__TB_API_URL__ = '$BaseUrl';
window.__TB_FILE_URL__ = '$BaseUrl/files';
"@ | Set-Content -Path $FrontendRuntimeConfigJs -Encoding UTF8
}

Write-Step "Starting NABD backend on $BaseUrl" "Green"
Write-Step "Default login: superadmin@tabeebi.com / Dev@Local2026!" "Gray"
Write-Step "Stop with Ctrl+C" "Gray"

$maxAttempts = 3
for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    & $MvnwPath spring-boot:run "-Dspring-boot.run.arguments=--server.port=$Port"
    if ($LASTEXITCODE -eq 0) { exit 0 }

    if ($attempt -lt $maxAttempts) {
        Write-Step "Backend exited with code $LASTEXITCODE (attempt $attempt/$maxAttempts) - another process may have grabbed port $Port meanwhile. Reclaiming it and retrying..." "Yellow"
        Stop-ListenerOnPort -TargetPort $Port
    }
}
exit $LASTEXITCODE
