Write-Host "Testing Transaction System" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$userId = "test-user-123"

# Step 1: Save a budget first (required for transactions)
Write-Host "Step 1: Creating/Saving Budget..." -ForegroundColor Green
$budgetBody = @{
    userId = $userId
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
    $response = Invoke-RestMethod -Uri "$baseUrl/api/budget/save" -Method Post -ContentType "application/json" -Body $budgetBody
    Write-Host "[OK] Budget saved successfully" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error saving budget: $_" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# Step 2: Add a manual transaction
Write-Host "Step 2: Adding Manual Transaction..." -ForegroundColor Green
$transactionBody = @{
    userId = $userId
    category = "food"
    amount = 45.67
    description = "Grocery shopping"
    merchantName = "Whole Foods"
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/transactions/add" -Method Post -ContentType "application/json" -Body $transactionBody
    Write-Host "[OK] Transaction added successfully" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "[ERROR] Error adding transaction: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# Step 3: Get transaction history
Write-Host "Step 3: Fetching Transaction History..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/transactions/history?userId=$userId" -Method Get
    Write-Host "[OK] Transaction history retrieved" -ForegroundColor Green
    Write-Host "Count: $($response.count)" -ForegroundColor Cyan
    Write-Host "Total Spent: `$$($response.summary.totalSpent)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Full Response:" -ForegroundColor Yellow
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "[ERROR] Error getting transaction history: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# Step 4: Try generating Nessie transactions
Write-Host "Step 4: Generating Sample Transactions from Nessie API..." -ForegroundColor Green
$nessieBody = @{
    userId = $userId
    limit = 5
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/transactions/generate-sample" -Method Post -ContentType "application/json" -Body $nessieBody
    Write-Host "[OK] Nessie transactions generated" -ForegroundColor Green
    Write-Host "Count: $($response.count)" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
} catch {
    Write-Host "[ERROR] Error generating Nessie transactions: $_" -ForegroundColor Red
    Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# Step 5: Get updated transaction history
Write-Host "Step 5: Fetching Updated Transaction History..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/transactions/history?userId=$userId" -Method Get
    Write-Host "[OK] Updated transaction history retrieved" -ForegroundColor Green
    Write-Host "Total Transactions: $($response.count)" -ForegroundColor Cyan
    Write-Host "Total Spent: `$$($response.summary.totalSpent)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Spending by Category:" -ForegroundColor Yellow
    $response.summary.byCategory.PSObject.Properties | ForEach-Object {
        Write-Host "  $($_.Name): `$$($_.Value)" -ForegroundColor White
    }
} catch {
    Write-Host "[ERROR] Error getting transaction history: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check MongoDB Atlas budgeting_app transactions collection" -ForegroundColor White
Write-Host "2. You should see transactions saved there" -ForegroundColor White
