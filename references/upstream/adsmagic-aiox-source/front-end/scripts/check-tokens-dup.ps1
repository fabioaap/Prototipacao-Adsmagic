# Token Deduplication Check (PowerShell)
# Validates SC-001: 0 duplicate CSS variables between main.css and tokens.css

$MainCss = "front-end\src\assets\styles\main.css"
$TokensCss = "front-end\src\assets\styles\tokens.css"

if (-not (Test-Path $MainCss)) {
    Write-Host "Error: $MainCss not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $TokensCss)) {
    Write-Host "Error: $TokensCss not found" -ForegroundColor Red
    exit 1
}

Write-Host "Checking duplicated CSS variables..."
Write-Host ""

# Extract variable names from main.css
$MainContent = Get-Content $MainCss -Raw
$MainVars = [regex]::Matches($MainContent, '--[a-zA-Z0-9_-]+(?=\s*:)') | ForEach-Object { $_.Value } | Sort-Object -Unique

# Extract variable names from tokens.css
$TokensContent = Get-Content $TokensCss -Raw
$TokensVars = [regex]::Matches($TokensContent, '--[a-zA-Z0-9_-]+(?=\s*:)') | ForEach-Object { $_.Value } | Sort-Object -Unique

Write-Host "Found variables:"
Write-Host "  main.css:   $($MainVars.Count) unique variables"
Write-Host "  tokens.css: $($TokensVars.Count) unique variables"
Write-Host ""

# Find common variables (duplicates)
$Duplicates = @()
foreach ($var in $MainVars) {
    if ($TokensVars -contains $var) {
        $Duplicates += $var
    }
}

if ($Duplicates.Count -gt 0) {
    Write-Host "❌ Found $($Duplicates.Count) duplicated variables:" -ForegroundColor Red
    Write-Host ""
    foreach ($dup in $Duplicates) {
        Write-Host "  $dup" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Fix: Remove duplicates from tokens.css or main.css" -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "✅ No duplicates found." -ForegroundColor Green
    exit 0
}
