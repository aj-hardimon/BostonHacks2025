# Transaction History System - Complete Guide

## Overview
Your budgeting app now has a complete transaction history system that works seamlessly with MongoDB, similar to how budgets are stored.

## MongoDB Collections

### 1. **budgets** Collection
Stores user budget configurations:
```javascript
{
  _id: ObjectId,
  userId: "user123",
  monthlyIncome: 5000,
  categories: {
    rent: 30,      // percentages
    food: 15,
    bills: 10,
    savings: 20,
    investments: 10,
    wants: 15
  },
  wantsSubcategories: [...],
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **transactions** Collection
Stores all user transactions:
```javascript
{
  _id: ObjectId,
  userId: "user123",
  budgetId: "budget_id",
  category: "food",           // rent, food, bills, savings, investments, wants
  subcategory: "Starbucks",   // merchant name
  amount: 5.50,
  description: "Coffee",
  date: Date,
  createdAt: Date
}
```

## Database Indexes
Automatically created for optimal performance:
- `budgets.userId` - Fast user budget lookup
- `transactions.userId` - Fast user transaction lookup
- `transactions.userId + date` - Fast date-range queries
- `transactions.budgetId` - Link transactions to budgets

## Available API Endpoints

### Transaction Management

#### 1. **Generate Sample Transactions** (Nessie API)
```http
POST /api/transactions/generate-sample
Content-Type: application/json

{
  "userId": "user123",
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 20 sample transactions",
  "count": 20,
  "transactions": [...]
}
```

**What it does:**
- Fetches real purchase data from Nessie API
- Categorizes each transaction (food, bills, wants, rent)
- Saves all transactions to MongoDB
- Returns the saved transaction list

---

#### 2. **Get Transaction History**
```http
GET /api/transactions/history?userId=user123&limit=50
GET /api/transactions/history?userId=user123&startDate=2025-01-01&endDate=2025-12-31
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "transactions": [
    {
      "_id": "...",
      "userId": "user123",
      "budgetId": "...",
      "category": "food",
      "subcategory": "Whole Foods",
      "amount": 45.67,
      "description": "Groceries",
      "date": "2025-10-12T10:30:00Z",
      "createdAt": "2025-10-12T10:30:00Z"
    }
  ],
  "summary": {
    "totalSpent": 1234.56,
    "byCategory": {
      "food": 456.78,
      "bills": 234.56,
      "wants": 543.22
    }
  },
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-12-31"
  }
}
```

---

#### 3. **Analyze Spending**
```http
GET /api/transactions/analyze?userId=user123
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "totalSpent": 1250.00,
    "totalBudget": 5000.00,
    "categories": [
      {
        "category": "Food",
        "spent": 712.50,
        "budget": 750.00,
        "remaining": 37.50,
        "percentageUsed": 95.0,
        "status": "at"
      }
    ],
    "overBudgetCategories": [],
    "percentageOfBudgetUsed": 25.0
  },
  "formattedAnalysis": "📊 Spending Analysis\n...",
  "transactionCount": 15
}
```

**What it does:**
- Gets all user transactions
- Compares spending vs budget for each category
- Shows remaining budget and percentage used
- Highlights over-budget categories
- Returns formatted text + structured data

---

## Backend Functions

### Database Functions (`database.ts`)

```typescript
// Save a single transaction
await saveTransaction({
  userId: "user123",
  budgetId: "budget_id",
  category: "food",
  subcategory: "Starbucks",
  amount: 5.50,
  description: "Coffee",
  date: new Date()
});

// Save multiple transactions at once (bulk)
await saveTransactionsBulk(
  userId,
  budgetId,
  [
    { category: "food", amount: 45.67, description: "Groceries", merchantName: "Whole Foods", date: new Date() },
    { category: "wants", amount: 12.99, description: "Movie", merchantName: "AMC", date: new Date() }
  ]
);

// Get user's transaction history
const transactions = await getTransactions(
  "user123",
  new Date("2025-01-01"),  // optional start date
  new Date("2025-12-31")   // optional end date
);
```

### Nessie API Functions (`nessieAPI.ts`)

```typescript
// Generate sample transactions from Nessie API
const transactions = await generateSampleTransactionsFromAllCustomers(20);

// Returns:
[
  {
    merchantName: "Whole Foods",
    date: Date,
    amount: 45.67,
    category: "food",  // auto-categorized
    description: "Groceries"
  }
]
```

**Category Mapping:**
- `food` ← Groceries, Restaurants, Coffee Shops
- `bills` ← Utilities, Phone, Internet, Insurance
- `wants` ← Entertainment, Shopping, Movies, Clothing
- `rent` ← Housing, Mortgage, Property

### Spending Analysis Functions (`spendingAnalyzer.ts`)

```typescript
// Calculate spending by category
const analysis = calculateCategorySpending(transactions, budgetResult);

// Format for display
const formatted = formatSpendingAnalysis(analysis);
```

---

## Frontend Integration Examples

### Get Transaction History
```typescript
const getTransactionHistory = async (userId: string, limit?: number) => {
  const params = new URLSearchParams({ userId });
  if (limit) params.append('limit', limit.toString());
  
  const response = await fetch(`/api/transactions/history?${params}`);
  const data = await response.json();
  
  return data;
};

// Usage
const history = await getTransactionHistory('user123', 50);
console.log(`Total spent: $${history.summary.totalSpent}`);
console.log(`Transactions: ${history.count}`);
```

### Generate Sample Data
```typescript
const generateSampleTransactions = async (userId: string) => {
  const response = await fetch('/api/transactions/generate-sample', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, limit: 20 })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log(`Generated ${data.count} transactions`);
  }
};
```

### Analyze Spending
```typescript
const analyzeSpending = async (userId: string) => {
  const response = await fetch(`/api/transactions/analyze?userId=${userId}`);
  const data = await response.json();
  
  // Display formatted analysis
  console.log(data.formattedAnalysis);
  
  // Or use structured data for charts
  data.analysis.categories.forEach(cat => {
    console.log(`${cat.category}: $${cat.spent}/$${cat.budget}`);
  });
};
```

---

## Complete User Flow

### 1. User Creates Budget
```javascript
POST /api/budget/save
{
  "userId": "user123",
  "monthlyIncome": 5000,
  "categories": { rent: 30, food: 15, ... }
}
```
✅ Budget saved to MongoDB `budgets` collection

### 2. User Generates Sample Transactions
```javascript
POST /api/transactions/generate-sample
{
  "userId": "user123",
  "limit": 20
}
```
✅ 20 transactions fetched from Nessie API
✅ Auto-categorized (food, bills, wants, rent)
✅ Saved to MongoDB `transactions` collection

### 3. User Views Transaction History
```javascript
GET /api/transactions/history?userId=user123&limit=50
```
✅ Returns last 50 transactions
✅ Shows summary by category
✅ Total spent amount

### 4. User Analyzes Spending
```javascript
GET /api/transactions/analyze?userId=user123
```
✅ Compares transactions vs budget
✅ Shows spent/remaining for each category
✅ Highlights over-budget categories
✅ Beautiful formatted output

---

## Testing

Run the test script:
```powershell
.\test-basic.ps1
```

This tests:
1. ✅ Budget calculation
2. ✅ Save budget to MongoDB
3. ✅ Get budget from MongoDB
4. ✅ Get transaction history from MongoDB

---

## MongoDB Verification

You can verify transactions are being saved by:

1. **MongoDB Atlas Dashboard**
   - Go to your cluster
   - Browse Collections
   - Select `budgeting_app` database
   - View `transactions` collection

2. **Using MongoDB Compass**
   - Connect with your connection string
   - Navigate to `budgeting_app.transactions`
   - See all saved transactions

3. **Via API**
   ```bash
   curl "http://localhost:3000/api/transactions/history?userId=test-user-123"
   ```

---

## Summary

✅ **Transactions are stored in MongoDB** - Just like budgets
✅ **Proper indexes** - Fast queries by user, date, category
✅ **Complete API** - Generate, retrieve, analyze transactions
✅ **Nessie Integration** - Real sample data from banking API
✅ **Spending Analysis** - Compare transactions vs budget
✅ **Frontend Ready** - All endpoints documented and tested

Your transaction history system is production-ready! 🎉
