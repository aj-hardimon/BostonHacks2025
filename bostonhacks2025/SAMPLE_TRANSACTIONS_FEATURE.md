# Sample Transaction Generation Feature

## Overview

Added a "Generate Sample Transactions" button on the transactions page that creates realistic sample transactions using the Nessie API or fallback example data.

## Features

### 🎲 Smart Transaction Generation

1. **Budget-Aware Amounts**
   - Scales transaction amounts based on user's monthly income
   - If user has $10,000/month income, transactions are scaled 2x
   - If user has $2,500/month income, transactions are scaled 0.5x
   - Prevents unrealistic amounts (capped between 0.5x - 3x)

2. **Spread Over Time**
   - Transactions are distributed over the last 30 days
   - Includes random hours and minutes for realistic timestamps
   - Shows purchases over time, not all on the same day

3. **Category Variety**
   - Food: Whole Foods, Trader Joe's, Starbucks, Chipotle, etc.
   - Bills: Comcast, Verizon, PG&E, Insurance, etc.
   - Wants: Amazon, Netflix, Best Buy, Nike, etc.
   - Rent: Monthly rent payments

4. **Realistic Amounts**
   - Each merchant has min/max ranges
   - Coffee shops: $5-$15
   - Grocery stores: $40-$150
   - Rent: $1,000-$2,500
   - Electronics: $30-$500

## How It Works

### Frontend (Transactions Page)

**Button Location**: Next to "Add Transaction" button

```typescript
<button
  onClick={handleGenerateSampleTransactions}
  disabled={generatingTransactions}
  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:bg-gray-400"
>
  {generatingTransactions ? "Generating..." : "🎲 Generate Sample Transactions"}
</button>
```

**Functionality**:
- Prompts user for confirmation
- Generates 25 sample transactions
- Shows loading state while generating
- Refreshes transaction list automatically
- Displays success message

### Backend API

**Endpoint**: `POST /api/transactions/generate-sample`

**Request Body**:
```json
{
  "userId": "user123",
  "limit": 25
}
```

**Response**:
```json
{
  "success": true,
  "message": "Generated 25 sample transactions",
  "count": 25,
  "transactions": [...],
  "note": "Transactions may include example data if Nessie API is unavailable"
}
```

### Data Generation Logic

**Step 1**: Try Nessie API
- Fetch real purchases from Nessie customers
- Get merchant information for accurate categorization
- Spread dates over 30 days (override Nessie timestamps)

**Step 2**: Fallback to Examples
- If Nessie API unavailable or no data
- Use curated list of realistic merchants
- Scale amounts based on monthly income
- Generate random dates spread over 30 days

**Income Scaling Formula**:
```typescript
const incomeScale = monthlyIncome / 5000; // Base on $5,000 income
const cappedScale = Math.min(Math.max(incomeScale, 0.5), 3); // Cap 0.5x - 3x
const scaledAmount = baseAmount * cappedScale;
```

**Example**:
- User with $10,000/month income: Coffee = $10-$30 (2x scaled)
- User with $5,000/month income: Coffee = $5-$15 (1x base)
- User with $2,500/month income: Coffee = $2.50-$7.50 (0.5x scaled)

## User Experience

### Before Clicking Button
```
┌─────────────────────────────────────────┐
│  + Add Transaction  🎲 Generate Sample  │
└─────────────────────────────────────────┘

Total Transactions: 0
Total Spent: $0.00
```

### After Clicking Button
```
✓ Successfully generated 25 sample transactions!

Total Transactions: 25
Total Spent: $4,234.56

Transactions (sorted by date):
- 2 hours ago: Starbucks - $8.45
- 5 hours ago: Whole Foods - $124.67
- 1 day ago: Netflix - $15.99
- 2 days ago: Chipotle - $14.23
... (spread over 30 days)
```

## Files Modified

### 1. `/src/app/transactions/page.tsx`
**Changes**:
- Added `generatingTransactions` state
- Added `handleGenerateSampleTransactions()` function
- Added "Generate Sample Transactions" button
- Button shows loading state while generating

### 2. `/src/app/api/transactions/generate-sample/route.ts`
**Changes**:
- Pass `monthlyIncome` to generation function
- Scale transactions based on budget

### 3. `/src/app/backend/nessieAPI.ts`
**Changes**:
- Added `monthlyIncome` parameter to functions
- Implemented income-based scaling
- Enhanced date spreading (hours + minutes variance)
- Better fallback example merchant list

## Testing

### Manual Test
1. Navigate to transactions page
2. Click "🎲 Generate Sample Transactions"
3. Confirm the prompt
4. Wait for generation (2-5 seconds)
5. Verify transactions appear with:
   - ✅ Spread over different dates
   - ✅ Reasonable amounts for your income
   - ✅ Different categories (food, bills, wants, rent)
   - ✅ Sorted by most recent first

### API Test (PowerShell)
```powershell
# Generate sample transactions
$body = @{
    userId = "user123"
    limit = 25
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/transactions/generate-sample" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

## Benefits

✅ **Quick Demo Data** - Instantly populate transaction history
✅ **Budget Realistic** - Amounts scale with user's income
✅ **Time Distributed** - See spending patterns over time
✅ **Category Variety** - All budget categories represented
✅ **User Friendly** - One-click operation with confirmation
✅ **Error Handling** - Falls back gracefully if Nessie unavailable

## Future Enhancements

- [ ] Allow user to specify number of transactions
- [ ] Add option to generate for specific date range
- [ ] Generate based on specific categories only
- [ ] Import transactions from CSV/JSON
- [ ] Recurring transaction simulation (monthly bills)
- [ ] Seasonal spending patterns (holidays, summer)

## Notes

- Transactions are permanently saved to database
- User can delete individual generated transactions
- Works offline (uses example data)
- Safe to run multiple times (adds more transactions)
- Does not delete existing transactions

---

**Implementation Date**: October 12, 2025
**Status**: ✅ Complete and Tested
