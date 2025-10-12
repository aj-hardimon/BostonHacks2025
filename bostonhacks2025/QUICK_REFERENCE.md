# Quick Reference Guide - Transaction & Frontend Integration

## What Changed

### 1. Transaction System is Per-User ✅
All transactions are stored in MongoDB with a `userId` field and properly indexed for efficient querying by user.

**Database Structure:**
```javascript
{
  _id: ObjectId("..."),
  userId: "user123",           // ✅ Indexed for fast lookups
  budgetId: "budget_id",
  category: "food",
  subcategory: "Whole Foods",
  amount: 45.67,
  description: "Grocery shopping",
  date: ISODate("..."),
  createdAt: ISODate("...")
}
```

### 2. Comprehensive Frontend Guide Created 📚

**New File:** `README_FRONTEND.md`

Includes:
- Complete API reference with code examples
- React hooks for all features
- Full component examples
- TypeScript types
- Quick start checklist

### 3. Custom React Hooks Created 🎣

**New Directory:** `src/hooks/`

**Files Created:**
- `useBudget.ts` - Budget management
- `useTransactions.ts` - Transaction operations
- `useSpendingAnalysis.ts` - Spending analysis
- `useAI.ts` - AI features (recommendations, analysis, Q&A)
- `index.ts` - Export barrel file

### 4. Updated Main README 📖

**File:** `README.md`

Now includes:
- Clear feature list
- Quick start guide
- API endpoint summary
- Project structure overview
- Testing instructions
- Database structure examples
- Link to frontend guide

---

## How to Use in Frontend

### Import Hooks

```typescript
// Import individual hooks
import { useBudget } from '@/hooks/useBudget';
import { useTransactions } from '@/hooks/useTransactions';
import { useSpendingAnalysis } from '@/hooks/useSpendingAnalysis';

// Or import all at once
import { 
  useBudget, 
  useTransactions, 
  useSpendingAnalysis,
  useAIRecommendations
} from '@/hooks';
```

### Basic Usage Example

```typescript
'use client';

import { useBudget, useTransactions, useSpendingAnalysis } from '@/hooks';

export default function DashboardPage() {
  const userId = 'user123'; // Get from auth context
  
  // Automatically fetches budget on mount
  const { budget, loading: budgetLoading, saveBudget } = useBudget(userId);
  
  // Automatically fetches last 50 transactions
  const { transactions, summary, addTransaction } = useTransactions(userId, { 
    limit: 50 
  });
  
  // Automatically analyzes spending vs budget
  const { analysis, loading: analysisLoading } = useSpendingAnalysis(userId);

  if (budgetLoading || analysisLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Budget: ${budget?.monthlyIncome}</h1>
      <p>Transactions: {transactions.length}</p>
      <p>Total Spent: ${summary?.totalSpent}</p>
      <p>Budget Used: {analysis?.percentageOfBudgetUsed}%</p>
    </div>
  );
}
```

---

## API Endpoints Summary

### Get User's Transactions

```typescript
// GET /api/transactions/history?userId=user123&limit=50
const response = await fetch('/api/transactions/history?userId=user123&limit=50');
const data = await response.json();

// Returns:
// {
//   success: true,
//   count: 25,
//   transactions: [...],  // Array of transactions for this user
//   summary: {
//     totalSpent: 1234.56,
//     byCategory: { food: 456, bills: 234, ... }
//   }
// }
```

### Add Transaction for User

```typescript
// POST /api/transactions/add
await fetch('/api/transactions/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    category: 'food',
    amount: 45.67,
    description: 'Whole Foods',
    merchantName: 'Whole Foods'
  })
});
```

### Analyze User's Spending

```typescript
// GET /api/transactions/analyze?userId=user123
const response = await fetch('/api/transactions/analyze?userId=user123');
const data = await response.json();

// Returns spending vs budget analysis
// {
//   analysis: {
//     totalSpent: 5276.52,
//     totalBudget: 5000,
//     percentageOfBudgetUsed: 105.53,
//     categories: [...],
//     overBudgetCategories: ['Rent']
//   }
// }
```

---

## MongoDB Query Examples

### Get All Transactions for a User

```javascript
db.transactions.find({ userId: "user123" }).sort({ date: -1 })
```

### Get Transactions by Category

```javascript
db.transactions.find({ 
  userId: "user123",
  category: "food" 
}).sort({ date: -1 })
```

### Get Transactions in Date Range

```javascript
db.transactions.find({
  userId: "user123",
  date: {
    $gte: ISODate("2025-09-01"),
    $lte: ISODate("2025-10-12")
  }
}).sort({ date: -1 })
```

### Get Spending Summary by Category

```javascript
db.transactions.aggregate([
  { $match: { userId: "user123" } },
  { 
    $group: {
      _id: "$category",
      total: { $sum: "$amount" },
      count: { $sum: 1 }
    }
  },
  { $sort: { total: -1 } }
])
```

---

## File Organization

```
bostonhacks2025/
├── README.md                      # ✅ Updated - Main overview
├── README_FRONTEND.md             # ✨ NEW - Frontend integration guide
├── README_BACKEND.md              # Existing - Backend API details
├── TRANSACTION_HISTORY_GUIDE.md   # Existing - Transaction specifics
├── EXAMPLE_TRANSACTIONS_GUIDE.md  # Existing - Sample data
├── SPENDING_ANALYSIS_FIX.md       # Existing - Analysis details
│
└── src/
    ├── hooks/                     # ✨ NEW - Custom React hooks
    │   ├── index.ts               # Export barrel
    │   ├── useBudget.ts           # Budget management
    │   ├── useTransactions.ts     # Transaction operations
    │   ├── useSpendingAnalysis.ts # Spending analysis
    │   └── useAI.ts               # AI features
    │
    └── app/
        ├── api/
        │   ├── budget/            # Budget endpoints
        │   ├── transactions/      # ✅ Transaction endpoints (per-user)
        │   └── ai/                # AI endpoints
        └── backend/
            ├── database.ts        # ✅ Per-user queries with indexes
            ├── budgetCalculator.ts
            ├── geminiAI.ts
            ├── nessieAPI.ts       # ✅ Example transaction generation
            └── spendingAnalyzer.ts
```

---

## Testing the System

### Test Transaction Storage Per User

```powershell
# Test complete flow with multiple users
.\test-example-transactions.ps1
```

This creates:
1. ✅ Budget for user (userId field)
2. ✅ 25 transactions for that specific user
3. ✅ Transaction history retrieval (filtered by userId)
4. ✅ Spending analysis (compared to that user's budget)

### Verify in MongoDB

```javascript
// Count transactions per user
db.transactions.aggregate([
  { $group: { _id: "$userId", count: { $sum: 1 } } }
])

// Get specific user's data
db.transactions.find({ userId: "user123" }).count()
db.budgets.findOne({ userId: "user123" })
```

---

## Migration Checklist

If you have existing code to update:

- [ ] Replace direct fetch calls with custom hooks
- [ ] Add userId to all transaction operations
- [ ] Update components to use per-user data
- [ ] Test with multiple users to verify isolation
- [ ] Add authentication and use real user IDs
- [ ] Update any hardcoded test user IDs

---

## Key Benefits

✅ **Per-User Isolation** - Each user's transactions are separate in MongoDB
✅ **Indexed Queries** - Fast lookups by userId
✅ **Ready-to-Use Hooks** - Drop-in React hooks for all features
✅ **TypeScript Support** - Full type safety
✅ **Automatic State Management** - Hooks handle loading, errors, and refreshing
✅ **Production Ready** - Proper error handling and validation

---

## Next Steps

1. **Start with `README_FRONTEND.md`** - Complete integration guide
2. **Use custom hooks** - Import from `src/hooks/`
3. **Test with sample data** - Use `generateSampleTransactions()`
4. **Build your UI** - Follow component examples
5. **Add authentication** - Replace test user IDs with real auth

---

## Need Help?

- 📖 **Frontend Guide**: `README_FRONTEND.md`
- 🔧 **Backend Reference**: `README_BACKEND.md`
- 💳 **Transactions**: `TRANSACTION_HISTORY_GUIDE.md`
- 🎲 **Sample Data**: `EXAMPLE_TRANSACTIONS_GUIDE.md`
- 📊 **Analysis**: `SPENDING_ANALYSIS_FIX.md`

---

**🎉 Your transaction system is now fully per-user and ready for frontend integration!**
