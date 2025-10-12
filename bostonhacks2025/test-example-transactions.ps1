# Test Example Transaction Generation
# This script tests the fallback example transaction generation

Write-Host "`n=== Testing Example Transaction Generation ===" -ForegroundColor Cyan
Write-Host "This will generate example transactions as a fallback when Nessie API has no data`n" -ForegroundColor Yellow

$baseUrl = "http://localhost:3000"
$userId = "test-user-example-" + (Get-Random -Maximum 99999)

# Step 1: Create a budget
Write-Host "Step 1: Creating Budget..." -ForegroundColor Green
$budgetBody = @{
    userId = $userId
    monthlyIncome = 5000
    categories = @{
        food = @{
            total = 1000
            percentage = 20
        }
        bills = @{
            total = 1500
            percentage = 30
        }
        wants = @{
            total = 1500
            percentage = 30
        }
        rent = @{
            total = 1000
            percentage = 20
        }
    }
    wantsSubcategories = @(
        @{ subcategory = "Entertainment"; amount = 600 }
        @{ subcategory = "Shopping"; amount = 450 }
        @{ subcategory = "Hobbies"; amount = 450 }
    )
} | ConvertTo-Json -Depth 10

try {
    $budgetResponse = Invoke-RestMethod -Uri "$baseUrl/api/budget/save" -Method POST -Body $budgetBody -ContentType "application/json"
    Write-Host "[OK] Budget saved successfully" -ForegroundColor Green
    Write-Host "Budget ID: $($budgetResponse._id)`n" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Failed to save budget: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Generate sample transactions (will use example data)
Write-Host "Step 2: Generating Sample Transactions..." -ForegroundColor Green
$transactionBody = @{
    userId = $userId
    limit = 25
} | ConvertTo-Json

try {
    $generateResponse = Invoke-RestMethod -Uri "$baseUrl/api/transactions/generate-sample" -Method POST -Body $transactionBody -ContentType "application/json"
    Write-Host "[OK] Sample transactions generated" -ForegroundColor Green
    Write-Host "Count: $($generateResponse.count)" -ForegroundColor Cyan
    Write-Host "Message: $($generateResponse.message)" -ForegroundColor Gray
    if ($generateResponse.note) {
        Write-Host "Note: $($generateResponse.note)" -ForegroundColor Yellow
    }
    Write-Host "`nSample of generated transactions:" -ForegroundColor Cyan
    $generateResponse.transactions | Select-Object -First 5 | ForEach-Object {
        $merchant = if ($_.merchantName) { $_.merchantName } elseif ($_.subcategory) { $_.subcategory } else { "Unknown" }
        $dateStr = if ($_.date) { ([DateTime]$_.date).ToString('yyyy-MM-dd') } else { "N/A" }
        Write-Host "  - ${merchant}: `$$($_.amount) [$($_.category)] on $dateStr" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to generate transactions: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Step 3: Get transaction history
Write-Host "Step 3: Fetching Transaction History..." -ForegroundColor Green
try {
    $historyResponse = Invoke-RestMethod -Uri "$baseUrl/api/transactions/history?userId=$userId" -Method GET
    Write-Host "[OK] Transaction history retrieved" -ForegroundColor Green
    Write-Host "Total Transactions: $($historyResponse.count)" -ForegroundColor Cyan
    Write-Host "Total Spent: `$$([math]::Round($historyResponse.summary.totalSpent, 2))" -ForegroundColor Cyan
    Write-Host "`nSpending by Category:" -ForegroundColor Cyan
    $historyResponse.summary.byCategory.PSObject.Properties | ForEach-Object {
        Write-Host "  $($_.Name): `$$([math]::Round($_.Value, 2))" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to get transaction history: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Analyze spending
Write-Host "Step 4: Analyzing Spending vs Budget..." -ForegroundColor Green
try {
    $analysisResponse = Invoke-RestMethod -Uri "$baseUrl/api/transactions/analyze?userId=$userId" -Method GET
    Write-Host "[OK] Spending analysis complete" -ForegroundColor Green
    
    $analysis = $analysisResponse.analysis
    
    Write-Host "`nTotal Spent: `$$([math]::Round($analysis.totalSpent, 2))" -ForegroundColor Cyan
    Write-Host "Total Budget: `$$([math]::Round($analysis.totalBudget, 2))" -ForegroundColor Cyan
    Write-Host "Budget Used: $([math]::Round($analysis.percentageOfBudgetUsed, 2))%" -ForegroundColor Cyan
    
    if ($analysis.categories -and $analysis.categories.Count -gt 0) {
        Write-Host "`nCategory Breakdown:" -ForegroundColor Cyan
        $analysis.categories | ForEach-Object {
            $pct = [math]::Round($_.percentageUsed, 1)
            $statusColor = if ($_.status -eq "over") { "Red" } elseif ($_.status -eq "at") { "Yellow" } else { "Green" }
            Write-Host "  $($_.category): `$$([math]::Round($_.spent, 2)) / `$$([math]::Round($_.budget, 2)) ($pct%)" -ForegroundColor $statusColor
        }
    }
    
    if ($analysis.overBudgetCategories -and $analysis.overBudgetCategories.Count -gt 0) {
        Write-Host "`nOver Budget Categories:" -ForegroundColor Red
        $analysis.overBudgetCategories | ForEach-Object {
            Write-Host "  - $($_)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "[ERROR] Failed to analyze spending: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "All example transactions were generated and saved successfully!" -ForegroundColor Green
Write-Host "User ID: $userId" -ForegroundColor Gray
