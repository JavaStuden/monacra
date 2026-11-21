#requires -Version 7.2
<# Copy one selected GitHub Actions Secret value locally without printing it. #>
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('Certificate', 'Password', 'Profile', 'ApiPrivateKey')]
    [string]$Kind,
    [string]$Path,
    [string]$SigningDirectory
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if (-not [OperatingSystem]::IsWindows()) { throw 'This script requires Windows.' }
if (-not $SigningDirectory) { $SigningDirectory = Join-Path $PSScriptRoot '../../.ios-signing' }
$SigningDirectory = (Resolve-Path -LiteralPath $SigningDirectory).Path
$defaults = @{
    Certificate = 'distribution.p12'
    Password = 'distribution-p12-password.dpapi'
    Profile = 'Monarca.mobileprovision'
}
$secretNames = @{
    Certificate = 'MONARCA_IOS_CERTIFICATE_P12_BASE64'
    Password = 'MONARCA_IOS_CERTIFICATE_PASSWORD'
    Profile = 'MONARCA_IOS_PROVISIONING_PROFILE_BASE64'
    ApiPrivateKey = 'MONARCA_APPSTORE_API_PRIVATE_KEY'
}
if (-not $Path) {
    if ($Kind -eq 'ApiPrivateKey') { throw 'Specify -Path with the AuthKey_*.p8 file downloaded from Apple.' }
    $Path = Join-Path $SigningDirectory $defaults[$Kind]
}
$Path = (Resolve-Path -LiteralPath $Path).Path
$value = $null
try {
    switch ($Kind) {
        'Password' {
            $secureValue = (Get-Content -LiteralPath $Path -Raw).Trim() | ConvertTo-SecureString
            $value = [Net.NetworkCredential]::new('', $secureValue).Password
        }
        'ApiPrivateKey' {
            $value = Get-Content -LiteralPath $Path -Raw
            if ($value -notmatch '-----BEGIN PRIVATE KEY-----') { throw 'The selected file is not an Apple API private key.' }
        }
        default { $value = [Convert]::ToBase64String([IO.File]::ReadAllBytes($Path)) }
    }
    Set-Clipboard -Value $value
    Write-Output ('Copied the value for ' + $secretNames[$Kind] + '. Paste it only into that GitHub Actions Secret.')
} finally { $value = $null }
