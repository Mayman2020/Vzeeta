[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [int]$Port = 4202
)
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
& (Join-Path $ScriptDir "vzeeta-web\run-frontend.ps1") @PSBoundParameters
