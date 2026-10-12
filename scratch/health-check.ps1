$routes = @(
    '/',
    '/prospects',
    '/sequences',
    '/dialer',
    '/inbox',
    '/analytics',
    '/settings/branding',
    '/api/tenant',
    '/api/prospects',
    '/api/sequences',
    '/api/dialer',
    '/api/analytics',
    '/api/cadence/tick',
    '/api/webhooks/inbound'
)

Write-Host "=========================================="
Write-Host " AMS FULL-STACK SERVICE HEALTH AUDIT"
Write-Host "=========================================="

foreach ($r in $routes) {
    $url = "http://localhost:3000" + $r
    try {
        $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        Write-Host " [ONLINE 200 OK] $r" -ForegroundColor Green
    } catch {
        Write-Host " [FAILED] $r : $($_.Exception.Message)" -ForegroundColor Red
    }
}
