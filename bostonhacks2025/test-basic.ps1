Write-Host "Testing Basic Budget APIs (Tests 1-3)" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Base URL configuration
$baseUrl = "http://localhost:3000"

# 1. Test Budget Calculation
Write-Host "1. Testing Budget Calculation..." -ForegroundColor Green
$calculateBody = @{
    monthlyIncome = 5000
    categories = @{
        rent = 30
        food = 15
        bills = 10
        savings = 20
        investments = 10
        wants = 15
    }
    wantsSubcategories = @(
        @{ name = "Streaming Services"; percentage = 20 }
        @{ name = "Gaming"; percentage = 30 }
        @{ name = "Dining Out"; percentage = 50 }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/budget/calculate" -Method Post -ContentType "application/json" -Body $calculateBody
    
    Write-Host "Success! Budget Calculation" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 2. Test Save Budget
Write-Host "2. Testing Save Budget..." -ForegroundColor Green
$saveBody = @{
    userId = "test-user-123"
    monthlyIncome = 5000
    categories = @{
        rent = 30
        food = 15
        bills = 10
        savings = 20
        investments = 10
        wants = 15
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/budget/save" -Method Post -ContentType "application/json" -Body $saveBody
    
    Write-Host "Success! Save Budget" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 3. Test Get Budget
Write-Host "3. Testing Get Budget..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/budget/get?userId=test-user-123" -Method Get
    
    Write-Host "Success! Get Budget" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 4. Test Get Transaction History
Write-Host "4. Testing Get Transaction History..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/transactions/history?userId=test-user-123&limit=10" -Method Get
    
    Write-Host "Success! Transaction History" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
