# AI Budgeting App - Frontend Integration Guide

## Overview

This guide shows you how to integrate the backend API endpoints into your React/Next.js frontend components. All examples use TypeScript and modern React patterns.

## Table of Contents

1. [Setup](#setup)
2. [Budget Management](#budget-management)
3. [Transaction Management](#transaction-management)
4. [Spending Analysis](#spending-analysis)
5. [AI Features](#ai-features)
6. [React Hooks Examples](#react-hooks-examples)
7. [Complete Component Examples](#complete-component-examples)

---

## Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

The frontend automatically uses the backend API routes (no additional env vars needed for local dev).

---

## Budget Management

### 1. Calculate Budget (Without Saving)

**Endpoint:** `POST /api/budget/calculate`

**Purpose:** Validate budget percentages and get calculated amounts before saving.

**Frontend Usage:**

```typescript
// Calculate budget
async function calculateBudget(monthlyIncome: number, categories: Categories) {
  const response = await fetch('/api/budget/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      monthlyIncome,
      categories: {
        rent: 20,
        food: 15,
        bills: 10,
        savings: 20,
        investments: 10,
        wants: 25
      },
      wantsSubcategories: [
        { name: 'Entertainment', percentage: 40 },
        { name: 'Shopping', percentage: 30 },
        { name: 'Hobbies', percentage: 30 }
      ]
    })
  });

  const data = await response.json();
  return data; // { monthlyIncome, totalAllocated, categories, isValid, ... }
}
```

**Response:**
```json
{
  "monthlyIncome": 5000,
  "totalAllocated": 5000,
  "unallocated": 0,
  "categories": [
    { "name": "Rent/Mortgage", "percentage": 20, "amount": 1000 },
    { "name": "Food", "percentage": 15, "amount": 750 },
    {
      "name": "Wants",
      "percentage": 25,
      "amount": 1250,
      "subcategories": [
        { "name": "Entertainment", "percentage": 40, "amount": 500 },
        { "name": "Shopping", "percentage": 30, "amount": 375 },
        { "name": "Hobbies", "percentage": 30, "amount": 375 }
      ]
    }
  ],
  "isValid": true
}
```

### 2. Save Budget

**Endpoint:** `POST /api/budget/save`

**Purpose:** Save or update a user's budget in MongoDB.

**Frontend Usage:**

```typescript
async function saveBudget(userId: string, budget: BudgetInput) {
  const response = await fetch('/api/budget/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      monthlyIncome: 5000,
      categories: {
        rent: { total: 1000, percentage: 20 },
        food: { total: 750, percentage: 15 },
        bills: { total: 500, percentage: 10 },
        savings: { total: 1000, percentage: 20 },
        investments: { total: 500, percentage: 10 },
        wants: { total: 1250, percentage: 25 }
      },
      wantsSubcategories: [
        { subcategory: 'Entertainment', amount: 500 },
        { subcategory: 'Shopping', amount: 375 },
        { subcategory: 'Hobbies', amount: 375 }
      ]
    })
  });

  const savedBudget = await response.json();
  return savedBudget; // { _id, userId, monthlyIncome, categories, ... }
}
```

**Response:**
```json
{
  "_id": "68eb4954d6b58b018b063474",
  "userId": "user123",
  "monthlyIncome": 5000,
  "categories": {
    "rent": { "total": 1000, "percentage": 20 },
    "food": { "total": 750, "percentage": 15 },
    ...
  },
  "wantsSubcategories": [...],
  "createdAt": "2025-10-12T06:00:00.000Z",
  "updatedAt": "2025-10-12T06:00:00.000Z"
}
```

### 3. Get User Budget

**Endpoint:** `GET /api/budget/get?userId={userId}`

**Purpose:** Retrieve a user's saved budget.

**Frontend Usage:**

```typescript
async function getBudget(userId: string) {
  const response = await fetch(`/api/budget/get?userId=${userId}`);
  
  if (response.status === 404) {
    return null; // No budget found
  }
  
  const budget = await response.json();
  return budget;
}
```

---

## Transaction Management

### 1. Add Manual Transaction

**Endpoint:** `POST /api/transactions/add`

**Purpose:** Add a single transaction for a user.

**Frontend Usage:**

```typescript
async function addTransaction(
  userId: string,
  transaction: {
    category: string;
    amount: number;
    description: string;
    merchantName?: string;
    date?: Date;
  }
) {
  const response = await fetch('/api/transactions/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      category: transaction.category, // 'food', 'bills', 'wants', 'rent'
      amount: transaction.amount,
      description: transaction.description,
      merchantName: transaction.merchantName || transaction.description,
      date: transaction.date || new Date()
    })
  });

  const data = await response.json();
  return data.transaction;
}
```

**Example:**
```typescript
const transaction = await addTransaction('user123', {
  category: 'food',
  amount: 45.67,
  description: 'Grocery shopping',
  merchantName: 'Whole Foods'
});

console.log(transaction);
// {
//   _id: '68eb4545d6b58b018b063425',
//   userId: 'user123',
//   category: 'food',
//   subcategory: 'Whole Foods',
//   amount: 45.67,
//   description: 'Grocery shopping',
//   date: '2025-10-12T06:05:57.139Z'
// }
```

### 2. Get Transaction History

**Endpoint:** `GET /api/transactions/history?userId={userId}&startDate={date}&endDate={date}&limit={number}`

**Purpose:** Retrieve all transactions for a user with optional filters.

**Frontend Usage:**

```typescript
async function getTransactionHistory(
  userId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
) {
  const params = new URLSearchParams({ userId });
  
  if (options?.startDate) {
    params.append('startDate', options.startDate.toISOString());
  }
  if (options?.endDate) {
    params.append('endDate', options.endDate.toISOString());
  }
  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }

  const response = await fetch(`/api/transactions/history?${params}`);
  const data = await response.json();
  
  return data; // { success, count, transactions, summary, dateRange }
}
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "transactions": [
    {
      "_id": "...",
      "userId": "user123",
      "category": "food",
      "subcategory": "Whole Foods",
      "amount": 45.67,
      "description": "Grocery shopping",
      "date": "2025-10-12T06:05:57.139Z"
    },
    ...
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
    "start": "2025-09-01",
    "end": "2025-10-12"
  }
}
```

**Example - Get last 30 days:**
```typescript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const history = await getTransactionHistory('user123', {
  startDate: thirtyDaysAgo,
  endDate: new Date()
});

console.log(`Total spent: $${history.summary.totalSpent}`);
console.log(`Transactions: ${history.count}`);
```

### 3. Generate Sample Transactions

**Endpoint:** `POST /api/transactions/generate-sample`

**Purpose:** Generate realistic example transactions (useful for demos/onboarding).

**Frontend Usage:**

```typescript
async function generateSampleTransactions(userId: string, limit: number = 25) {
  const response = await fetch('/api/transactions/generate-sample', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, limit })
  });

  const data = await response.json();
  return data; // { success, message, count, transactions }
}
```

**Example:**
```typescript
// Generate 25 sample transactions for onboarding
const samples = await generateSampleTransactions('user123', 25);

console.log(`Generated ${samples.count} transactions`);
// Includes realistic merchants like Whole Foods, Starbucks, Netflix, etc.
```

---

## Spending Analysis

### Analyze Spending vs Budget

**Endpoint:** `GET /api/transactions/analyze?userId={userId}&startDate={date}&endDate={date}`

**Purpose:** Compare actual spending against budget by category.

**Frontend Usage:**

```typescript
async function analyzeSpending(
  userId: string,
  dateRange?: { startDate?: Date; endDate?: Date }
) {
  const params = new URLSearchParams({ userId });
  
  if (dateRange?.startDate) {
    params.append('startDate', dateRange.startDate.toISOString());
  }
  if (dateRange?.endDate) {
    params.append('endDate', dateRange.endDate.toISOString());
  }

  const response = await fetch(`/api/transactions/analyze?${params}`);
  const data = await response.json();
  
  return data;
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "totalSpent": 5276.52,
    "totalBudget": 5000,
    "percentageOfBudgetUsed": 105.53,
    "categories": [
      {
        "category": "Food",
        "spent": 391.48,
        "budget": 1000,
        "remaining": 608.52,
        "percentageUsed": 39.15,
        "status": "under"
      },
      {
        "category": "Rent",
        "spent": 2665.40,
        "budget": 1000,
        "remaining": -1665.40,
        "percentageUsed": 266.54,
        "status": "over"
      }
    ],
    "overBudgetCategories": ["Rent", "Bills"]
  },
  "formattedAnalysis": "📊 Spending Analysis\n...",
  "transactionCount": 25
}
```

**Example - Display spending progress:**
```typescript
const analysis = await analyzeSpending('user123');

// Show overall budget usage
console.log(`Budget Used: ${analysis.analysis.percentageOfBudgetUsed}%`);

// Display each category
analysis.analysis.categories.forEach(cat => {
  const progress = (cat.spent / cat.budget) * 100;
  console.log(`${cat.category}: $${cat.spent} / $${cat.budget} (${progress.toFixed(1)}%)`);
  
  if (cat.status === 'over') {
    console.warn(`⚠️ Over budget by $${Math.abs(cat.remaining)}`);
  }
});
```

---

## AI Features

### 1. Get Budget Recommendations

**Endpoint:** `POST /api/ai/recommendations`

**Purpose:** Get AI-powered budget recommendations based on income and goals.

**Frontend Usage:**

```typescript
async function getBudgetRecommendations(
  monthlyIncome: number,
  userGoals?: string,
  currentBudget?: any
) {
  const response = await fetch('/api/ai/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      monthlyIncome,
      userGoals,
      currentBudget
    })
  });

  const data = await response.json();
  return data.recommendations; // AI-generated text
}
```

**Example:**
```typescript
const recommendations = await getBudgetRecommendations(
  5000,
  'Save for a house down payment in 2 years',
  null
);

console.log(recommendations);
// "Based on your $5,000 monthly income and goal to save for a house..."
```

### 2. Analyze Budget with AI

**Endpoint:** `POST /api/ai/analyze`

**Purpose:** Get AI analysis and insights about your budget allocation.

**Frontend Usage:**

```typescript
async function getAIBudgetAnalysis(budgetResult: any) {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ budgetResult })
  });

  const data = await response.json();
  return data.analysis;
}
```

### 3. Get Wants Subcategory Recommendations

**Endpoint:** `POST /api/ai/wants-subcategories`

**Purpose:** Get AI suggestions for breaking down "wants" category.

**Frontend Usage:**

```typescript
async function getWantsSubcategories(wantsAmount: number, preferences?: string[]) {
  const response = await fetch('/api/ai/wants-subcategories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wantsAmount,
      userPreferences: preferences
    })
  });

  const data = await response.json();
  return data.recommendations;
}
```

**Example:**
```typescript
const suggestions = await getWantsSubcategories(1250, [
  'gaming',
  'streaming services',
  'dining out'
]);

console.log(suggestions);
// AI suggests breakdown like: "Gaming (30%), Streaming (20%), Dining Out (50%)"
```

### 4. Ask Category-Specific Questions

**Endpoint:** `POST /api/ai/category-question`

**Purpose:** Get location-aware advice about spending in specific categories (NO EXACT PRICES).

**Frontend Usage:**

```typescript
async function askCategoryQuestion(
  category: string,
  question: string,
  userLocation?: string,
  budgetAmount?: number
) {
  const response = await fetch('/api/ai/category-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category,
      question,
      userLocation,
      budgetAmount
    })
  });

  const data = await response.json();
  return data.answer;
}
```

**Example:**
```typescript
const answer = await askCategoryQuestion(
  'food',
  'Where can I find affordable groceries?',
  'Boston, MA',
  750
);

console.log(answer);
// "In Boston, you can find affordable groceries at stores like Market Basket, 
//  Aldi, and Trader Joe's. Consider shopping at ethnic markets..."
// NOTE: Will NOT provide exact prices or direct purchase links
```

---

## React Hooks Examples

### Custom Hook: useBudget

```typescript
// hooks/useBudget.ts
import { useState, useEffect } from 'react';

export function useBudget(userId: string) {
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBudget() {
      try {
        setLoading(true);
        const response = await fetch(`/api/budget/get?userId=${userId}`);
        
        if (response.status === 404) {
          setBudget(null);
        } else if (response.ok) {
          const data = await response.json();
          setBudget(data);
        } else {
          throw new Error('Failed to fetch budget');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchBudget();
    }
  }, [userId]);

  const saveBudget = async (budgetData: any) => {
    const response = await fetch('/api/budget/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...budgetData })
    });

    const saved = await response.json();
    setBudget(saved);
    return saved;
  };

  return { budget, loading, error, saveBudget };
}
```

**Usage:**
```typescript
function BudgetDashboard() {
  const { budget, loading, error, saveBudget } = useBudget('user123');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!budget) return <div>No budget found. Create one!</div>;

  return (
    <div>
      <h1>Monthly Income: ${budget.monthlyIncome}</h1>
      {/* Display budget categories */}
    </div>
  );
}
```

### Custom Hook: useTransactions

```typescript
// hooks/useTransactions.ts
import { useState, useEffect } from 'react';

export function useTransactions(userId: string, options?: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      const params = new URLSearchParams({ userId });
      if (options?.startDate) params.append('startDate', options.startDate.toISOString());
      if (options?.endDate) params.append('endDate', options.endDate.toISOString());
      if (options?.limit) params.append('limit', options.limit.toString());

      const response = await fetch(`/api/transactions/history?${params}`);
      const data = await response.json();

      setTransactions(data.transactions || []);
      setSummary(data.summary);
      setLoading(false);
    }

    fetchTransactions();
  }, [userId, options?.startDate, options?.endDate, options?.limit]);

  const addTransaction = async (transaction: any) => {
    const response = await fetch('/api/transactions/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...transaction })
    });

    const data = await response.json();
    setTransactions(prev => [data.transaction, ...prev]);
    return data.transaction;
  };

  return { transactions, summary, loading, addTransaction };
}
```

**Usage:**
```typescript
function TransactionList() {
  const { transactions, summary, loading, addTransaction } = useTransactions('user123', {
    limit: 50
  });

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div>
      <h2>Total Spent: ${summary?.totalSpent?.toFixed(2)}</h2>
      <ul>
        {transactions.map(t => (
          <li key={t._id}>
            {t.subcategory} - ${t.amount} ({t.category})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Custom Hook: useSpendingAnalysis

```typescript
// hooks/useSpendingAnalysis.ts
import { useState, useEffect } from 'react';

export function useSpendingAnalysis(userId: string) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalysis() {
      const response = await fetch(`/api/transactions/analyze?userId=${userId}`);
      const data = await response.json();
      setAnalysis(data.analysis);
      setLoading(false);
    }

    fetchAnalysis();
  }, [userId]);

  return { analysis, loading };
}
```

---

## Complete Component Examples

### 1. Budget Creation Form

```typescript
'use client';

import { useState } from 'react';

export function BudgetCreationForm({ userId }: { userId: string }) {
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [categories, setCategories] = useState({
    rent: 20,
    food: 15,
    bills: 10,
    savings: 20,
    investments: 10,
    wants: 25
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate first to validate
    const calcResponse = await fetch('/api/budget/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthlyIncome, categories })
    });

    const calculated = await calcResponse.json();

    if (!calculated.isValid) {
      alert('Invalid budget: ' + calculated.errors.join(', '));
      return;
    }

    // Convert to save format
    const budgetToSave = {
      userId,
      monthlyIncome,
      categories: Object.entries(categories).reduce((acc, [key, percentage]) => {
        const amount = (monthlyIncome * percentage) / 100;
        acc[key] = { total: amount, percentage };
        return acc;
      }, {} as any)
    };

    // Save to database
    const saveResponse = await fetch('/api/budget/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budgetToSave)
    });

    const saved = await saveResponse.json();
    alert('Budget saved! ID: ' + saved._id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Monthly Income:</label>
        <input
          type="number"
          value={monthlyIncome}
          onChange={(e) => setMonthlyIncome(Number(e.target.value))}
          className="border px-4 py-2"
        />
      </div>

      {Object.entries(categories).map(([category, percentage]) => (
        <div key={category}>
          <label>{category.charAt(0).toUpperCase() + category.slice(1)} (%):</label>
          <input
            type="number"
            value={percentage}
            onChange={(e) => setCategories(prev => ({
              ...prev,
              [category]: Number(e.target.value)
            }))}
            className="border px-4 py-2"
          />
          <span className="ml-2">
            ${((monthlyIncome * percentage) / 100).toFixed(2)}
          </span>
        </div>
      ))}

      <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded">
        Save Budget
      </button>
    </form>
  );
}
```

### 2. Transaction History Component

```typescript
'use client';

import { useTransactions } from '@/hooks/useTransactions';

export function TransactionHistory({ userId }: { userId: string }) {
  const { transactions, summary, loading } = useTransactions(userId);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          Total Spent: ${summary?.totalSpent?.toFixed(2)}
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(summary?.byCategory || {}).map(([category, amount]) => (
            <div key={category} className="bg-white p-4 rounded">
              <div className="text-sm text-gray-600">{category}</div>
              <div className="text-lg font-semibold">${(amount as number).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div>
        <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {transactions.map(t => (
            <div key={t._id} className="flex justify-between border-b pb-2">
              <div>
                <div className="font-medium">{t.subcategory || t.description}</div>
                <div className="text-sm text-gray-600">
                  {new Date(t.date).toLocaleDateString()} · {t.category}
                </div>
              </div>
              <div className="text-lg font-semibold">
                ${t.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 3. Spending Analysis Dashboard

```typescript
'use client';

import { useSpendingAnalysis } from '@/hooks/useSpendingAnalysis';

export function SpendingDashboard({ userId }: { userId: string }) {
  const { analysis, loading } = useSpendingAnalysis(userId);

  if (loading) return <div>Loading analysis...</div>;
  if (!analysis) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Budget Overview</h2>
        <div className="text-4xl font-bold">
          ${analysis.totalSpent.toFixed(2)} / ${analysis.totalBudget.toFixed(2)}
        </div>
        <div className="text-lg mt-2">
          {analysis.percentageOfBudgetUsed.toFixed(1)}% of budget used
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Categories</h3>
        {analysis.categories.map((cat: any) => {
          const isOver = cat.status === 'over';
          const progress = Math.min((cat.spent / cat.budget) * 100, 100);

          return (
            <div key={cat.category} className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{cat.category}</span>
                <span className={isOver ? 'text-red-600' : 'text-green-600'}>
                  ${cat.spent.toFixed(2)} / ${cat.budget.toFixed(2)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    isOver ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="text-sm mt-2 text-gray-600">
                {cat.percentageUsed.toFixed(1)}% used · 
                {isOver ? (
                  <span className="text-red-600"> Over by ${Math.abs(cat.remaining).toFixed(2)}</span>
                ) : (
                  <span className="text-green-600"> Remaining: ${cat.remaining.toFixed(2)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {analysis.overBudgetCategories.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-bold text-red-800 mb-2">⚠️ Over Budget</h4>
          <ul className="list-disc list-inside text-red-700">
            {analysis.overBudgetCategories.map((cat: string) => (
              <li key={cat}>{cat}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 4. Add Transaction Form

```typescript
'use client';

import { useState } from 'react';

export function AddTransactionForm({ 
  userId, 
  onAdded 
}: { 
  userId: string;
  onAdded?: (transaction: any) => void;
}) {
  const [category, setCategory] = useState('food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [merchantName, setMerchantName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/transactions/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        category,
        amount: parseFloat(amount),
        description,
        merchantName: merchantName || description
      })
    });

    const data = await response.json();
    
    if (data.success) {
      onAdded?.(data.transaction);
      // Reset form
      setAmount('');
      setDescription('');
      setMerchantName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Category:</label>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="border px-4 py-2 w-full"
        >
          <option value="food">Food</option>
          <option value="bills">Bills</option>
          <option value="wants">Wants</option>
          <option value="rent">Rent</option>
          <option value="savings">Savings</option>
          <option value="investments">Investments</option>
        </select>
      </div>

      <div>
        <label>Amount:</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border px-4 py-2 w-full"
          required
        />
      </div>

      <div>
        <label>Merchant/Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border px-4 py-2 w-full"
          required
        />
      </div>

      <button 
        type="submit" 
        className="bg-green-500 text-white px-6 py-2 rounded w-full"
      >
        Add Transaction
      </button>
    </form>
  );
}
```

---

## TypeScript Types

```typescript
// types/budget.ts

export interface Categories {
  rent?: { total: number; percentage: number };
  food?: { total: number; percentage: number };
  bills?: { total: number; percentage: number };
  savings?: { total: number; percentage: number };
  investments?: { total: number; percentage: number };
  wants?: { total: number; percentage: number };
}

export interface Budget {
  _id?: string;
  userId: string;
  monthlyIncome: number;
  categories: Categories;
  wantsSubcategories?: Array<{
    subcategory: string;
    amount: number;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Transaction {
  _id?: string;
  userId: string;
  budgetId: string;
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  date: Date;
  createdAt?: Date;
}

export interface SpendingAnalysis {
  totalSpent: number;
  totalBudget: number;
  percentageOfBudgetUsed: number;
  categories: Array<{
    category: string;
    spent: number;
    budget: number;
    remaining: number;
    percentageUsed: number;
    status: 'under' | 'at' | 'over';
  }>;
  overBudgetCategories: string[];
}
```

---

## Quick Start Checklist

- [ ] Copy custom hooks to `src/hooks/`
- [ ] Copy TypeScript types to `src/types/`
- [ ] Create budget creation form
- [ ] Create transaction list component
- [ ] Create spending analysis dashboard
- [ ] Add transaction input form
- [ ] Test with sample data (use `/api/transactions/generate-sample`)
- [ ] Integrate AI recommendations

---

## Best Practices

1. **Always validate on the backend** - Use `/api/budget/calculate` before saving
2. **Handle loading states** - All API calls are async
3. **Error handling** - Check response status codes
4. **Optimistic updates** - Update UI immediately, sync with backend
5. **Date handling** - Use ISO format for API calls
6. **User sessions** - Implement authentication and use real user IDs
7. **Refresh data** - Re-fetch after adding transactions

---

## Testing Your Integration

### 1. Test Budget Flow
```typescript
// 1. Create budget
const budget = await saveBudget('user123', { ... });

// 2. Get budget
const retrieved = await getBudget('user123');

// 3. Verify match
console.assert(budget._id === retrieved._id);
```

### 2. Test Transaction Flow
```typescript
// 1. Add transaction
const txn = await addTransaction('user123', { ... });

// 2. Get history
const history = await getTransactionHistory('user123');

// 3. Verify it appears
console.assert(history.transactions.some(t => t._id === txn._id));
```

### 3. Test Analysis Flow
```typescript
// 1. Create budget + transactions
await saveBudget('user123', { ... });
await generateSampleTransactions('user123', 25);

// 2. Get analysis
const analysis = await analyzeSpending('user123');

// 3. Verify calculations
console.assert(analysis.analysis.totalBudget > 0);
console.assert(analysis.analysis.categories.length > 0);
```

---

## Need Help?

- Check `README_BACKEND.md` for backend API details
- See `TRANSACTION_HISTORY_GUIDE.md` for transaction specifics
- See `EXAMPLE_TRANSACTIONS_GUIDE.md` for sample data generation
- See `SPENDING_ANALYSIS_FIX.md` for spending analysis details

---

## Example Full Page Component

```typescript
'use client';

import { useState } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { useTransactions } from '@/hooks/useTransactions';
import { useSpendingAnalysis } from '@/hooks/useSpendingAnalysis';

export default function DashboardPage() {
  const userId = 'user123'; // Get from auth
  
  const { budget, loading: budgetLoading } = useBudget(userId);
  const { transactions, addTransaction } = useTransactions(userId, { limit: 10 });
  const { analysis, loading: analysisLoading } = useSpendingAnalysis(userId);

  if (budgetLoading || analysisLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (!budget) {
    return <div>Please create a budget first!</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Budget Dashboard</h1>

      {/* Budget Overview */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Budget</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>Monthly Income: ${budget.monthlyIncome}</p>
          {/* Display budget details */}
        </div>
      </section>

      {/* Spending Analysis */}
      {analysis && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Spending Analysis</h2>
          <SpendingDashboard userId={userId} />
        </section>
      )}

      {/* Recent Transactions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
        <TransactionHistory userId={userId} />
      </section>

      {/* Add Transaction */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Add Transaction</h2>
        <AddTransactionForm 
          userId={userId} 
          onAdded={(txn) => console.log('Added:', txn)} 
        />
      </section>
    </div>
  );
}
```

---

**🎉 You're all set!** Start building your budget app frontend with these examples.
