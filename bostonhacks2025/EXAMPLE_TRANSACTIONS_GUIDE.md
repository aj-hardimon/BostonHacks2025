# Example Transaction Generation Guide

## Overview

The transaction system now includes automatic fallback to **realistic example transactions** when the Nessie API doesn't have data or is unavailable. This ensures users always get sample data to work with!

## How It Works

The system follows this priority order:

1. **Try Nessie API first** - Attempts to fetch real transaction data from Nessie
2. **Fallback to examples** - If Nessie has no data or errors, automatically generates realistic example transactions
3. **Never fails** - Always returns transactions, ensuring a smooth user experience

## Example Merchants

The system includes **35+ realistic merchants** across all budget categories:

### Food Category
- **Grocery Stores**: Whole Foods, Trader Joe's, Target, Safeway
- **Restaurants**: Chipotle, Panera Bread, Subway, McDonald's
- **Coffee Shops**: Starbucks, Dunkin' Donuts

### Bills Category
- **Utilities**: Pacific Gas & Electric, Water Company
- **Telecom**: Comcast, Verizon, AT&T
- **Insurance**: State Farm

### Wants Category
- **Shopping**: Amazon, Target, Best Buy, Nike, H&M, Zara
- **Entertainment**: AMC Theatres, Netflix, Spotify, Hulu
- **Electronics**: Apple Store, GameStop, Best Buy
- **Books & Hobbies**: Barnes & Noble, Steam

### Rent Category
- Property Management Co.
- Landlord Payment

## Transaction Features

### Realistic Amounts
Each merchant has appropriate spending ranges:
- **Coffee**: $5 - $15
- **Groceries**: $40 - $200
- **Utilities**: $40 - $200
- **Rent**: $1,000 - $3,000
- **Electronics**: $30 - $1,000

### Date Distribution
- Transactions are distributed randomly across the **last 30 days**
- Sorted by date (most recent first)
- Realistic temporal patterns

### Proper Categorization
All transactions are automatically assigned to the correct budget category:
- `food` - Groceries, restaurants, coffee shops
- `bills` - Utilities, phone, internet, insurance
- `wants` - Shopping, entertainment, hobbies, subscriptions
- `rent` - Housing payments

## API Endpoints

### Generate Sample Transactions

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
  "note": "Transactions may include example data if Nessie API is unavailable or has no data",
  "transactions": [
    {
      "_id": "...",
      "userId": "user123",
      "budgetId": "...",
      "category": "food",
      "subcategory": "Whole Foods",
      "amount": 98.83,
      "description": "Grocery shopping",
      "date": "2025-10-09T...",
      "createdAt": "2025-10-12T..."
    }
    // ... more transactions
  ]
}
```

## Testing

Run the comprehensive test script:

```powershell
.\test-example-transactions.ps1
```

### What the test does:
1. ✅ Creates a budget ($5,000/month)
2. ✅ Generates 25 sample transactions
3. ✅ Fetches transaction history with category breakdown
4. ✅ Analyzes spending vs budget

### Expected Output:
```
=== Testing Example Transaction Generation ===

Step 1: Creating Budget...
[OK] Budget saved successfully

Step 2: Generating Sample Transactions...
[OK] Sample transactions generated
Count: 25

Sample of generated transactions:
  - Subway: $10.08 [food] on 2025-10-10
  - AT&T: $96.26 [bills] on 2025-10-10
  - Whole Foods: $98.83 [food] on 2025-10-09
  - H&M: $78.51 [wants] on 2025-10-07

Step 3: Fetching Transaction History...
[OK] Transaction history retrieved
Total Transactions: 25
Total Spent: $5276.52

Spending by Category:
  food: $391.48
  bills: $582.84
  wants: $1636.80
  rent: $2665.40

=== Test Complete ===
```

## Code Architecture

### nessieAPI.ts

**New Function**: `generateExampleTransactions(limit: number)`
- Creates realistic example transactions
- Randomizes merchants, amounts, and dates
- Returns properly formatted transactions

**Updated Functions**:
- `generateSampleTransactions()` - Now falls back to examples
- `generateSampleTransactionsFromAllCustomers()` - Now falls back to examples

### Key Changes

```typescript
// Before: Would throw errors if Nessie API failed
if (!NESSIE_API_KEY) {
  throw new Error('NESSIE_API_KEY is not configured');
}

// After: Graceful fallback
if (!NESSIE_API_KEY) {
  console.warn('NESSIE_API_KEY is not configured, using example transactions');
  return generateExampleTransactions(limit);
}
```

## Benefits

✅ **No Setup Required** - Works immediately without Nessie API configuration
✅ **Always Available** - Never fails to generate sample data
✅ **Realistic Data** - Proper merchant names, amounts, and categories
✅ **Diverse Coverage** - All budget categories represented
✅ **Time-Based** - Realistic date distribution over 30 days
✅ **Production Ready** - Graceful degradation pattern

## MongoDB Storage

All example transactions are stored identically to real transactions:

```javascript
{
  _id: ObjectId("..."),
  userId: "user123",
  budgetId: "budget456",
  category: "food",
  subcategory: "Whole Foods",  // Merchant name
  amount: 98.83,
  description: "Grocery shopping",
  date: ISODate("2025-10-09T..."),
  createdAt: ISODate("2025-10-12T...")
}
```

## Integration Points

### Frontend Usage

```typescript
// Generate sample transactions for demo/onboarding
const response = await fetch('/api/transactions/generate-sample', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUser.id,
    limit: 25
  })
});

const { transactions } = await response.json();
// transactions now contains realistic example data!
```

### Spending Analysis

The generated transactions work seamlessly with all analysis features:
- Transaction history (`GET /api/transactions/history`)
- Spending analysis (`GET /api/transactions/analyze`)
- Category breakdowns
- Budget comparisons

## Future Enhancements

Potential improvements:
- [ ] User-customizable merchant lists
- [ ] Location-based merchant generation
- [ ] Seasonal spending patterns
- [ ] Recurring transaction simulation
- [ ] Income transaction examples

---

**Note**: The example transaction feature is designed as a fallback. When Nessie API has data available, it will be used preferentially. The system automatically chooses the best data source available.
