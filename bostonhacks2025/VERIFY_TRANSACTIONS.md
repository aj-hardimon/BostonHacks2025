# How to Verify Transactions in MongoDB

## Quick Test

1. **Make sure the server is NOT running on port 3000**
   ```powershell
   netstat -ano | findstr :3000
   # If you see output, kill the process:
   Stop-Process -Id <process_id> -Force
   ```

2. **Start the development server**
   ```powershell
   npm run dev
   ```
   Wait until you see "Ready in XXXms"

3. **Run the transaction test script** (in a NEW terminal)
   ```powershell
   .\test-transactions.ps1
   ```

## What the Test Does

1. ✅ Creates a budget for test-user-123
2. ✅ Adds a manual transaction ($45.67 at Whole Foods)
3. ✅ Fetches transaction history from MongoDB
4. ✅ Tries to generate 5 sample transactions from Nessie API
5. ✅ Shows final transaction count and spending by category

## Expected Output

```
Step 1: Creating/Saving Budget...
✓ Budget saved successfully

Step 2: Adding Manual Transaction...
✓ Transaction added successfully
{
  "success": true,
  "message": "Transaction added successfully",
  "transaction": {
    "_id": "...",
    "userId": "test-user-123",
    "category": "food",
    "amount": 45.67,
    "description": "Grocery shopping"
  }
}

Step 3: Fetching Transaction History...
✓ Transaction history retrieved
Count: 1
Total Spent: $45.67

Step 5: Updated Transaction History...
Total Transactions: 6  (1 manual + 5 from Nessie)
Total Spent: $XXX.XX
```

## Verify in MongoDB Atlas

1. Go to https://cloud.mongodb.com/
2. Login with your credentials
3. Click on your cluster "budgetingapp"
4. Click "Browse Collections"
5. Select database: `budgeting_app`
6. Select collection: `transactions`
7. You should see all transactions saved there!

## If No Transactions Appear

### Check 1: Budget exists
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/budget/get?userId=test-user-123"
```
Should return a budget. If not, the save budget step failed.

### Check 2: Add transaction manually works
```powershell
$body = @{
    userId = "test-user-123"
    category = "food"
    amount = 25.50
    description = "Test transaction"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/transactions/add" -Method Post -ContentType "application/json" -Body $body
```

### Check 3: Get transaction history
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/transactions/history?userId=test-user-123"
```

Should show the transaction you just added.

### Check 4: Server logs
Look at the terminal where `npm run dev` is running. You should see:
- `Connected to MongoDB database (CSFLE): budgeting_app`
- `POST /api/transactions/add 200 in XXXms`
- `GET /api/transactions/history 200 in XXXms`

## Common Issues

### Issue: "User budget not found"
**Solution:** Run Step 1 first (save budget)

### Issue: "NESSIE_API_KEY is not configured"
**Solution:** This is fine! Manual transactions still work. Nessie is optional.

### Issue: Encryption errors (mongodb-client-encryption)
**Solution:** Make sure encryption key is commented out in `.env.local`:
```env
# CSFLE_LOCAL_MASTER_KEY=...
```

### Issue: Port 3000 in use
**Solution:** 
```powershell
# Find the process
netstat -ano | findstr :3000
# Kill it
Stop-Process -Id <PID> -Force
```

## Success Indicators

✅ Test script shows "Transaction added successfully"
✅ Transaction history returns count > 0
✅ MongoDB Atlas shows documents in `transactions` collection
✅ Total spent amount is correct

## MongoDB Collection Structure

Your `transactions` collection should look like this:

```json
{
  "_id": ObjectId("..."),
  "userId": "test-user-123",
  "budgetId": "...",
  "category": "food",
  "subcategory": "Whole Foods",
  "amount": 45.67,
  "description": "Grocery shopping",
  "date": ISODate("2025-10-12T..."),
  "createdAt": ISODate("2025-10-12T...")
}
```

Each transaction is a separate document in MongoDB!
