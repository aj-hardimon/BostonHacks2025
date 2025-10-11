## Testing CSFLE with /api/seed

To test that Client-Side Field Level Encryption (CSFLE) is working:

1. **Set up your secrets in `bostonhacks2025/.env.local`:**

  ```env
  MONGODB_URI=your-mongodb-uri
  MONGODB_DB_NAME=budgeting_app
  CSFLE_LOCAL_MASTER_KEY=... # 96-byte base64 string
  ```

2. **Start the dev server from the project root:**

  ```bash
  npm run dev
  ```

3. **Seed and test via browser or curl:**

  - Open: [http://localhost:3000/api/seed](http://localhost:3000/api/seed)
  - Or run:

    ```bash
    curl -s http://localhost:3000/api/seed | jq
    ```

  You should see a response like:

  ```json
  {
    "ok": true,
    "doc": {
     "userId": "USER-12345",
     "monthlyIncome": 5000,
     "categories": {
      "rent": 2000,
      "food": 400,
      "bills": 250,
      "savings": 800,
      "investments": 350,
      "wants": 1200
     },
     "createdAt": "...",
     "updatedAt": "..."
    }
  }
  ```

4. **Verify encryption in Atlas/Compass:**

  - In the `budgets` collection, the fields `userId`, `monthlyIncome`, and all `categories.*` should appear as ciphertext (Binary data).
  - The API response will show these fields as plaintext (decrypted by CSFLE driver).

5. **No Edge runtime warnings:**
  - The `/api/seed` route enforces Node.js runtime for CSFLE compatibility.
# AI Budgeting App - Backend Documentation

## Overview

This backend provides budget calculation logic, MongoDB integration, and Google Gemini AI assistance for your budgeting application.

## Framework

**Next.js API Routes** - Using the App Router pattern (`src/app/api`)

## Core Components

### 1. Budget Calculator (`src/app/backend/budgetCalculator.ts`)

Core logic for budget calculations:

- **`calculateBudget(input: BudgetInput)`** - Main calculation function
- **`validateBudgetPercentages()`** - Validates category percentages
- **`validateWantsSubcategories()`** - Validates wants subcategory percentages
- **`calculateSubcategories()`** - Calculates subcategory amounts
- **`formatBudgetSummary()`** - Formats budget for display

#### Budget Calculation Logic

```typescript
// Input structure
{
  monthlyIncome: 5000,
  categories: {
    rent: 30,        // 30% of income
    food: 15,        // 15% of income
    bills: 10,       // 10% of income
    savings: 20,     // 20% of income
    investments: 10, // 10% of income
    wants: 15        // 15% of income
  },
  wantsSubcategories: [
    { name: "Streaming Services", percentage: 20 },  // 20% of wants
    { name: "Gaming", percentage: 30 },              // 30% of wants
    { name: "Dining Out", percentage: 50 }           // 50% of wants
  ]
}

// Output structure
{
  monthlyIncome: 5000,
  totalAllocated: 5000,
  unallocated: 0,
  categories: [
    { name: "Rent/Mortgage", percentage: 30, amount: 1500 },
    { name: "Food", percentage: 15, amount: 750 },
    { name: "Bills", percentage: 10, amount: 500 },
    { name: "Savings", percentage: 20, amount: 1000 },
    { name: "Investments", percentage: 10, amount: 500 },
    {
      name: "Wants",
      percentage: 15,
      amount: 750,
      subcategories: [
        { name: "Streaming Services", percentage: 20, amount: 150 },
        { name: "Gaming", percentage: 30, amount: 225 },
        { name: "Dining Out", percentage: 50, amount: 375 }
      ]
    }
  ],
  isValid: true
}
```

### 2. Database (`src/app/backend/database.ts`)

MongoDB integration with functions:

- **`connectToDatabase()`** - Establishes MongoDB connection
- **`saveBudget(budget)`** - Saves/updates user budget
- **`getBudget(userId)`** - Retrieves user budget
- **`saveTransaction(transaction)`** - Saves budget transaction
- **`getTransactions(userId, startDate?, endDate?)`** - Retrieves transactions

### 3. Gemini AI (`src/app/backend/geminiAI.ts`)

AI-powered budget assistance:

- **`getBudgetRecommendations(monthlyIncome, userGoals?, currentBudget?)`** - Get AI budget suggestions
- **`getWantsSubcategoryRecommendations(wantsAmount, userPreferences?)`** - Get subcategory suggestions
- **`analyzeBudget(budgetResult)`** - Get AI analysis of budget
- **`askBudgetQuestion(question, budgetContext?)`** - Ask budget-related questions

## API Routes

### Budget Endpoints

#### `POST /api/budget/calculate`
Calculate budget without saving

**Request:**
```json
{
  "monthlyIncome": 5000,
  "categories": {
    "rent": 30,
    "food": 15,
    "bills": 10,
    "savings": 20,
    "investments": 10,
    "wants": 15
  },
  "wantsSubcategories": [
    { "name": "Streaming Services", "percentage": 20 },
    { "name": "Gaming", "percentage": 30 }
  ]
}
```

#### `POST /api/budget/save`
Save budget to database

**Request:**
```json
{
  "userId": "user123",
  "monthlyIncome": 5000,
  "categories": { ... },
  "wantsSubcategories": [ ... ]
}
```

#### `GET /api/budget/get?userId=user123`
Retrieve user's budget

### AI Endpoints

#### `POST /api/ai/recommendations`
Get AI budget recommendations

**Request:**
```json
{
  "monthlyIncome": 5000,
  "userGoals": "Save for a house",
  "currentBudget": { ... }
}
```

#### `POST /api/ai/analyze`
Analyze budget with AI

**Request:**
```json
{
  "budgetResult": { ... }
}
```

#### `POST /api/ai/wants-subcategories`
Get AI subcategory recommendations

**Request:**
```json
{
  "wantsAmount": 750,
  "userPreferences": ["gaming", "streaming", "dining"]
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install mongodb @google/generative-ai
npm install --save-dev @types/node
```

### 2. Environment Variables

Create `.env.local` file (copy from `.env.local.example`):


```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=budgeting_app
CSFLE_LOCAL_MASTER_KEY=<96-byte-base64>
GEMINI_API_KEY=your_gemini_api_key_here
```

### CSFLE (Client-Side Field Level Encryption)

Install dependencies:
```bash
npm i mongodb mongodb-client-encryption
```

Generate a 96-byte base64 key for CSFLE_LOCAL_MASTER_KEY:
```bash
openssl rand -base64 96 | tr -d '\n'
```

- Never commit `.env.local`!
- Key vault: `encryption.__keyVault` (unique index on keyAltNames)
- DEK: keyAltNames: `["pii-key"]`
- Only `budgets` collection is encrypted (see `src/app/backend/encryption.ts`).
- For testing, use `/api/seed` (Node runtime enforced, returns plaintext JSON if CSFLE works).

### 3. Get API Keys

**MongoDB:**
- Local: Install MongoDB locally or use Docker
- Cloud: Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

**Google Gemini:**
- Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 4. Test the Backend

```bash
# Start development server
npm run dev

# Test budget calculation
curl -X POST http://localhost:3000/api/budget/calculate \
  -H "Content-Type: application/json" \
  -d '{"monthlyIncome": 5000, "categories": {"rent": 30, "food": 15, "bills": 10, "savings": 20, "investments": 10, "wants": 15}}'
```

## Math Logic Explained

### Category Calculation
```
Category Amount = (Monthly Income × Category Percentage) / 100
```

Example:
- Monthly Income: $5,000
- Rent Percentage: 30%
- Rent Amount = ($5,000 × 30) / 100 = $1,500

### Subcategory Calculation
```
Subcategory Amount = (Parent Category Amount × Subcategory Percentage) / 100
```

Example:
- Wants Amount: $750
- Streaming Services Percentage: 20%
- Streaming Services Amount = ($750 × 20) / 100 = $150

### Validation Rules

1. **Total percentage ≤ 100%**: All category percentages must not exceed 100%
2. **No negative values**: All percentages and amounts must be ≥ 0
3. **Subcategory percentages ≤ 100%**: Wants subcategories must not exceed 100%
4. **Income > 0**: Monthly income must be positive

## Next Steps

1. Set up authentication (e.g., NextAuth.js, Clerk, or Auth0)
2. Add user ID management
3. Implement transaction tracking
4. Create frontend components to interact with these APIs
5. Add data visualization for budget breakdown
6. Implement budget alerts and notifications

## Technologies Used

- **Next.js 14+** - Framework with App Router
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Google Gemini AI** - AI assistance
- **Next.js API Routes** - Backend endpoints
