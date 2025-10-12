Write-Host "Testing Budget Backend APIs" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
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

# 4. Test AI Recommendations
Write-Host "4. Testing AI Recommendations..." -ForegroundColor Green
$aiBody = @{
    monthlyIncome = 5000
    userGoals = "Save for retirement and build emergency fund"
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/ai/recommendations" -Method Post -ContentType "application/json" -Body $aiBody
    
    Write-Host "Success! AI Recommendations" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 5. Test AI Budget Analysis
Write-Host "5. Testing AI Budget Analysis..." -ForegroundColor Green
$analysisBody = @{
    budgetResult = @{
        monthlyIncome = 5000
        totalAllocated = 5000
        unallocated = 0
        categories = @(
            @{ name = "Rent/Mortgage"; percentage = 30; amount = 1500 }
            @{ name = "Food"; percentage = 15; amount = 750 }
            @{ name = "Savings"; percentage = 20; amount = 1000 }
        )
        isValid = $true
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/ai/analyze" -Method Post -ContentType "application/json" -Body $analysisBody
    
    Write-Host "Success! AI Analysis" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# 6. Test AI Category Question
Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""
Write-Host "6. Testing AI Category Question..." -ForegroundColor Green
$categoryQuestionBody = @{
    category = "Food"
    question = "How can I save money on groceries?"
    categoryBudget = 750
    location = "Boston, MA"
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/ai/category-question" -Method Post -ContentType "application/json" -Body $categoryQuestionBody
    
    Write-Host "Success! AI Category Question" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 7. Test Generate Sample Transactions
Write-Host "7. Testing Generate Sample Transactions..." -ForegroundColor Green
$generateTransactionsBody = @{
    userId = "test-user-123"
    limit = 15
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/transactions/generate-sample" -Method Post -ContentType "application/json" -Body $generateTransactionsBody
    
    Write-Host "Success! Generated Sample Transactions" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 8. Test Spending Analysis
Write-Host "8. Testing Spending Analysis..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/transactions/analyze?userId=test-user-123" -Method Get
    
    Write-Host "Success! Spending Analysis" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
    Write-Host ""
    Write-Host "Formatted Analysis:" -ForegroundColor Cyan
    Write-Host $response.formattedAnalysis -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan