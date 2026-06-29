[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [int]$Port = 8081
)
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
& (Join-Path $ScriptDir "vzeeta-backend\run-backend.ps1") @PSBoundParameters
