[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [int]$Port = 4200
)
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
& (Join-Path $ScriptDir "vzeeta-web\run-frontend.ps1") @PSBoundParameters
