# Debug the analyze endpoint
Write-Host "=== Debug Analyze Endpoint ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$userId = "test-user-example-60378"  # Use the user from the last successful test

Write-Host "`nStep 1: Get budget for user..." -ForegroundColor Green
try {
    $budget = Invoke-RestMethod -Uri "$baseUrl/api/budget/get?userId=$userId" -Method GET
    Write-Host "Budget found:" -ForegroundColor Green
    Write-Host "Monthly Income: `$$($budget.monthlyIncome)" -ForegroundColor Gray
    Write-Host "Categories:" -ForegroundColor Gray
    $budget.categories | ConvertTo-Json -Depth 5
} catch {
    Write-Host "No budget found for user $userId" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`nStep 2: Get transactions for user..." -ForegroundColor Green
try {
    $transactions = Invoke-RestMethod -Uri "$baseUrl/api/transactions/history?userId=$userId" -Method GET
    Write-Host "Transactions found: $($transactions.count)" -ForegroundColor Green
    Write-Host "Total spent: `$$($transactions.summary.totalSpent)" -ForegroundColor Gray
} catch {
    Write-Host "No transactions found" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`nStep 3: Analyze spending..." -ForegroundColor Green
try {
    $analysis = Invoke-RestMethod -Uri "$baseUrl/api/transactions/analyze?userId=$userId" -Method GET
    Write-Host "Analysis result:" -ForegroundColor Green
    $analysis | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Analysis failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
