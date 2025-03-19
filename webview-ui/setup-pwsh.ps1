# Create a PowerShell script to set up the symlink
# filepath: c:\Users\karol\Documents\cua-agent\Roo-Code\cline\setup-pwsh.ps1

# Ensure the PowerShell 7 directory exists
if (-not (Test-Path "C:\Program Files\PowerShell\7")) {
    Write-Host "Creating PowerShell 7 directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "C:\Program Files\PowerShell\7" -Force
}

# Create the symlink to regular PowerShell if pwsh.exe doesn't exist
if (-not (Test-Path "C:\Program Files\PowerShell\7\pwsh.exe")) {
    Write-Host "Creating symlink to PowerShell..." -ForegroundColor Yellow

    # First try to use Windows PowerShell as fallback
    New-Item -ItemType SymbolicLink -Path "C:\Program Files\PowerShell\7\pwsh.exe" -Target "C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe" -Force

    Write-Host "Created symlink to regular Windows PowerShell" -ForegroundColor Green
}

# Add Git to PATH if it's installed but not in PATH
$gitPaths = @(
    "C:\Program Files\Git\bin",
    "C:\Program Files (x86)\Git\bin",
    "$env:ProgramFiles\Git\bin",
    "$env:LocalAppData\Programs\Git\bin"
)

$gitFound = $false
foreach ($path in $gitPaths) {
    if (Test-Path "$path\git.exe") {
        Write-Host "Found Git at $path" -ForegroundColor Green
        $env:Path += ";$path"
        $gitFound = $true
        break
    }
}

if (-not $gitFound) {
    Write-Host "Git not found. Would you like to install it? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host "Installing Git..." -ForegroundColor Yellow
        # Use WinGet to install Git
        winget install --id Git.Git -e --source winget
        $env:Path += ";C:\Program Files\Git\bin"
    } else {
        Write-Host "Git installation skipped. Some npm operations might fail." -ForegroundColor Red
    }
}

# Configure npm to use regular PowerShell to avoid issues
Write-Host "Configuring npm to use regular PowerShell..." -ForegroundColor Yellow
npm config set script-shell "C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"

Write-Host "Setup complete! Your environment should now be ready." -ForegroundColor Green
Write-Host "Try running 'git --version' to verify Git is accessible" -ForegroundColor Cyan
