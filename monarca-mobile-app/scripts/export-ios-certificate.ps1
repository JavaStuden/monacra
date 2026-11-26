#requires -Version 7.2
<#
.SYNOPSIS
Combine an Apple Distribution certificate with the previously generated local private key.
.DESCRIPTION
Run on the Windows user account that created distribution-password.dpapi.
Passwords stay in child-process environment variables and Windows DPAPI files.
No upload, clipboard access or Git operation is performed.
#>
[CmdletBinding()]
param(
    [string]$CertificatePath,
    [string]$SigningDirectory,
    [string]$OpenSslPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Invoke-SigningOpenSsl {
    param([string[]]$Arguments, [hashtable]$PrivateEnvironment = @{}, [switch]$AllowFailure)
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $OpenSslPath
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    # Git for Windows ships OpenSSL 3, while the locally protected RSA key may
    # use a legacy PKCS#12/PBE cipher. Load both providers for compatibility;
    # this does not weaken the key or expose its password.
    if ($Arguments.Count -gt 0) {
        # The first argument is the OpenSSL subcommand (x509/pkey/pkcs12).
        # Global provider flags must follow that subcommand.
        $startInfo.ArgumentList.Add($Arguments[0])
        foreach ($argument in @('-provider', 'default', '-provider', 'legacy')) { $startInfo.ArgumentList.Add($argument) }
        if ($Arguments.Count -gt 1) {
            foreach ($argument in $Arguments[1..($Arguments.Count - 1)]) { $startInfo.ArgumentList.Add($argument) }
        }
    }
    foreach ($name in $PrivateEnvironment.Keys) { $startInfo.Environment[$name] = $PrivateEnvironment[$name] }
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        $null = $process.Start()
        $outputTask = $process.StandardOutput.ReadToEndAsync()
        $errorTask = $process.StandardError.ReadToEndAsync()
        $process.WaitForExit()
        $result = [pscustomobject]@{
            ExitCode = $process.ExitCode
            Output = $outputTask.GetAwaiter().GetResult()
            Error = $errorTask.GetAwaiter().GetResult()
        }
        if ($result.ExitCode -ne 0 -and -not $AllowFailure) {
            $detail = $result.Error.Trim()
            if ($detail.Length -gt 500) { $detail = $detail.Substring(0, 500) }
            throw "OpenSSL validation/export failed. $detail"
        }
        return $result
    } finally {
        foreach ($name in $PrivateEnvironment.Keys) { $null = $startInfo.Environment.Remove($name) }
        $process.Dispose()
    }
}

if (-not [OperatingSystem]::IsWindows()) { throw 'This script requires Windows DPAPI.' }
if (-not $SigningDirectory) { $SigningDirectory = Join-Path $PSScriptRoot '../../.ios-signing' }
$SigningDirectory = (Resolve-Path -LiteralPath $SigningDirectory).Path
if (-not $CertificatePath) { $CertificatePath = Join-Path $SigningDirectory 'distribution.cer' }
if (-not (Test-Path -LiteralPath $CertificatePath -PathType Leaf)) {
    throw 'Download your Apple Distribution .cer to .ios-signing/distribution.cer first, or specify -CertificatePath.'
}
$CertificatePath = (Resolve-Path -LiteralPath $CertificatePath).Path
if (-not $OpenSslPath) {
    $gitOpenSsl = Join-Path (Split-Path (Split-Path (Get-Command git -ErrorAction Stop).Source)) 'usr/bin/openssl.exe'
    if (Test-Path -LiteralPath $gitOpenSsl) { $OpenSslPath = $gitOpenSsl }
    else { $OpenSslPath = (Get-Command openssl -ErrorAction Stop).Source }
}
$OpenSslPath = (Resolve-Path -LiteralPath $OpenSslPath).Path
$keyPath = Join-Path $SigningDirectory 'distribution.key'
$keyPasswordPath = Join-Path $SigningDirectory 'distribution-password.dpapi'
$p12Path = Join-Path $SigningDirectory 'distribution.p12'
$p12PasswordPath = Join-Path $SigningDirectory 'distribution-p12-password.dpapi'
foreach ($path in @($keyPath, $keyPasswordPath)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Required local signing file is missing: $path" }
}
foreach ($path in @($p12Path, $p12PasswordPath)) {
    if (Test-Path -LiteralPath $path) { throw 'Existing P12 material found. No existing files will be overwritten.' }
}

$temporaryPrefix = Join-Path $SigningDirectory ('.export-' + [guid]::NewGuid().ToString('N'))
$temporaryPem = $temporaryPrefix + '.pem'
$temporaryP12 = $temporaryPrefix + '.p12'
$temporaryPassword = $temporaryPrefix + '.dpapi'
$privateEnvironment = @{}
$keyPassword = $null
$p12Password = $null
try {
    # Normalize DER or PEM input before comparing the public keys.
    $converted = Invoke-SigningOpenSsl -Arguments @('x509', '-inform', 'DER', '-in', $CertificatePath, '-out', $temporaryPem) -AllowFailure
    if ($converted.ExitCode -ne 0) {
        $null = Invoke-SigningOpenSsl -Arguments @('x509', '-inform', 'PEM', '-in', $CertificatePath, '-out', $temporaryPem)
    }
    $null = Invoke-SigningOpenSsl -Arguments @('x509', '-in', $temporaryPem, '-checkend', '0', '-noout')
    $subject = Invoke-SigningOpenSsl -Arguments @('x509', '-in', $temporaryPem, '-noout', '-subject', '-nameopt', 'RFC2253')
    if ($subject.Output -notmatch '(?:^|,\s*)CN=Apple Distribution:') {
        # OpenSSL prefixes the first attribute with "subject=".
        if ($subject.Output -notmatch '^subject=\s*CN=Apple Distribution:') {
            throw 'Select an Apple Distribution certificate downloaded from your Apple Developer account.'
        }
    }
    $protectedPassword = (Get-Content -LiteralPath $keyPasswordPath -Raw).Trim() | ConvertTo-SecureString
    $keyPassword = [Net.NetworkCredential]::new('', $protectedPassword).Password
    $privateEnvironment['MONARCA_IOS_INPUT_PASSWORD'] = $keyPassword
    $keyPublic = Invoke-SigningOpenSsl -Arguments @('pkey', '-in', $keyPath, '-passin', 'env:MONARCA_IOS_INPUT_PASSWORD', '-pubout') -PrivateEnvironment $privateEnvironment
    $certificatePublic = Invoke-SigningOpenSsl -Arguments @('x509', '-in', $temporaryPem, '-pubkey', '-noout')
    if ($keyPublic.Output.Trim() -ne $certificatePublic.Output.Trim()) {
        throw 'The certificate does not match the local private key. Apply using the existing Monarca CSR.'
    }
    $p12Password = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
    $privateEnvironment['MONARCA_IOS_OUTPUT_PASSWORD'] = $p12Password
    $null = Invoke-SigningOpenSsl -Arguments @('pkcs12', '-export', '-in', $temporaryPem, '-inkey', $keyPath,
        '-passin', 'env:MONARCA_IOS_INPUT_PASSWORD', '-passout', 'env:MONARCA_IOS_OUTPUT_PASSWORD',
        '-name', 'Monarca Apple Distribution', '-out', $temporaryP12) -PrivateEnvironment $privateEnvironment
    $null = Invoke-SigningOpenSsl -Arguments @('pkcs12', '-in', $temporaryP12,
        '-passin', 'env:MONARCA_IOS_OUTPUT_PASSWORD', '-info', '-noout') -PrivateEnvironment $privateEnvironment
    $p12Password | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString |
        Set-Content -LiteralPath $temporaryPassword -Encoding ascii
    [IO.File]::Move($temporaryPassword, $p12PasswordPath)
    [IO.File]::Move($temporaryP12, $p12Path)
    Write-Output 'Created distribution.p12 and distribution-p12-password.dpapi.'
    Write-Output 'Certificate/private-key match and P12 password verification passed. No passwords were printed.'
} finally {
    $privateEnvironment.Clear()
    $keyPassword = $null
    $p12Password = $null
    foreach ($path in @($temporaryPem, $temporaryP12, $temporaryPassword)) {
        if ([IO.File]::Exists($path)) { [IO.File]::Delete($path) }
    }
}
