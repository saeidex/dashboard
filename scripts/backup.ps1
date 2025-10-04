param(
  [string]$Source = (Join-Path $PSScriptRoot "../apps/api/dev.db"),
  [string]$Destination = $env:CRM_BACKUP_DIR,
  [int]$RetentionDays
)

$resolvedSource = [System.IO.Path]::GetFullPath($Source)

if (-not (Test-Path -LiteralPath $resolvedSource)) {
  Write-Error "SQLite database not found at '$resolvedSource'. Update the Source parameter to match your setup."
  exit 1
}

if (-not $Destination) {
  $Destination = Join-Path $PSScriptRoot "../backups"
}

$resolvedDestination = [System.IO.Path]::GetFullPath($Destination)

if (-not (Test-Path -LiteralPath $resolvedDestination)) {
  New-Item -ItemType Directory -Path $resolvedDestination -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$targetFile = Join-Path $resolvedDestination "dev-$timestamp.db"

Copy-Item -LiteralPath $resolvedSource -Destination $targetFile -Force

Write-Output "Backup created at $targetFile"

if (-not $PSBoundParameters.ContainsKey('RetentionDays')) {
  if ($env:CRM_BACKUP_RETENTION_DAYS) {
    $parsedRetention = 0
    if ([int]::TryParse($env:CRM_BACKUP_RETENTION_DAYS, [ref]$parsedRetention)) {
      $RetentionDays = $parsedRetention
    }
    else {
      Write-Warning "Unable to parse CRM_BACKUP_RETENTION_DAYS='$env:CRM_BACKUP_RETENTION_DAYS'. Using default (30 days)."
      $RetentionDays = 30
    }
  }
  else {
    $RetentionDays = 30
  }
}

if ($RetentionDays -gt 0) {
  $cutoff = (Get-Date).AddDays(-$RetentionDays)
  $oldBackups = Get-ChildItem -Path $resolvedDestination -Filter "dev-*.db" -File | Where-Object { $_.LastWriteTime -lt $cutoff }

  foreach ($file in $oldBackups) {
    Remove-Item -LiteralPath $file.FullName -Force
    Write-Output "Removed old backup $($file.Name)"
  }
}
