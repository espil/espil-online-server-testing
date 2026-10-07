# Git realtime updater (Windows PowerShell)
# Run from the cctest folder: powershell -ExecutionPolicy Bypass -File .\git-watch.ps1

$branch = "local-testing"
$interval = 10

Write-Host "Git auto-update started (branch: $branch, every ${interval}s)" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

while ($true) {
    git fetch origin $branch --quiet
    $local = git rev-parse HEAD
    $remote = git rev-parse "origin/$branch"
    
    if ($local -ne $remote) {
        $ts = Get-Date -Format 'HH:mm:ss'
        Write-Host "[$ts] Update found! Pulling..." -ForegroundColor Cyan
        git pull origin $branch --quiet
        $ts2 = Get-Date -Format 'HH:mm:ss'
        Write-Host "[$ts2] Done!" -ForegroundColor Green
    }
    
    Start-Sleep -Seconds $interval
}
