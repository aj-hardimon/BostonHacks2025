# Quick test to see budget structure
$userId = "test-user-example-78392"
$baseUrl = "http://localhost:3000"

# Create a new budget
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
} | ConvertTo-Json -Depth 10

Write-Host "Creating budget..." -ForegroundColor Green
$result = Invoke-RestMethod -Uri "$baseUrl/api/budget/save" -Method POST -Body $budgetBody -ContentType "application/json"
Write-Host "Budget ID: $($result._id)" -ForegroundColor Cyan

Write-Host "`nRetrieving budget..." -ForegroundColor Green
$retrieved = Invoke-RestMethod -Uri "$baseUrl/api/budget/get?userId=$userId" -Method GET
Write-Host "Retrieved budget:" -ForegroundColor Cyan
$retrieved | ConvertTo-Json -Depth 10
