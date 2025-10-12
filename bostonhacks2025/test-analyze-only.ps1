# Test analyze endpoint with the budget we just created
$userId = "test-user-example-78392"
$baseUrl = "http://localhost:3000"

Write-Host "Calling analyze endpoint for user: $userId" -ForegroundColor Cyan

try {
    $analysis = Invoke-RestMethod -Uri "$baseUrl/api/transactions/analyze?userId=$userId" -Method GET
    Write-Host "`nAnalysis Result:" -ForegroundColor Green
    $analysis.analysis | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
