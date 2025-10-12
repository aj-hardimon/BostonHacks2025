# AI Budgeting Web App

An intelligent budgeting application that helps users create, track, and analyze their budgets using AI-powered recommendations and insights.

## Features

✨ **Smart Budget Creation**
- AI-powered budget recommendations based on income and goals
- Automatic percentage validation and calculation
- Subcategory breakdown for "wants" spending

📊 **Transaction Tracking**
- Manual transaction entry
- Automatic sample transaction generation
- Transaction history with filtering by date
- Category-based spending summaries

📈 **Spending Analysis**
- Real-time budget vs. actual spending comparison
- Visual progress indicators for each category
- Over-budget alerts and warnings
- Detailed category breakdowns

🤖 **AI Features**
- Budget recommendations with Google Gemini AI
- Location-aware category advice
- Budget analysis and insights
- Subcategory suggestions

💾 **Data Persistence**
- MongoDB integration for user data
- Per-user budget and transaction storage
- Client-side field-level encryption (CSFLE) support

## Tech Stack

- **Framework:** Next.js 15.5.4 with App Router
- **Language:** TypeScript
- **Database:** MongoDB Atlas
- **AI:** Google Gemini (gemini-2.5-flash)
- **Banking API:** Nessie API (for sample transactions)
- **Runtime:** Node.js v23.8.0

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` in the project root:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=budgeting_app

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Nessie API (optional - for sample transactions)
NESSIE_API_KEY=your_nessie_api_key

# Encryption (optional - for production)
# CSFLE_LOCAL_MASTER_KEY=your_96_byte_base64_key
```

**Get API Keys:**
- **MongoDB**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Gemini AI**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Nessie API**: [Nessie API](http://api.nessieisreal.com/) (optional)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

### 4. Test the Backend

```bash
# Test budget creation
.\test-example-transactions.ps1

# Or manually test an endpoint
curl -X POST http://localhost:3000/api/budget/calculate \
  -H "Content-Type: application/json" \
  -d '{"monthlyIncome": 5000, "categories": {"rent": 20, "food": 15, "bills": 10, "savings": 20, "investments": 10, "wants": 25}}'
```

## Documentation

### 📚 Comprehensive Guides

- **[Frontend Integration Guide](./README_FRONTEND.md)** ⭐ **START HERE**
  - Complete API reference with code examples
  - React hooks and components
  - TypeScript types
  - Full page examples

- **[Backend API Documentation](./README_BACKEND.md)**
  - API endpoint details
  - Database schemas
  - Budget calculation logic
  - AI integration

- **[Transaction History Guide](./TRANSACTION_HISTORY_GUIDE.md)**
  - Transaction management
  - History retrieval
  - Date filtering

- **[Example Transactions Guide](./EXAMPLE_TRANSACTIONS_GUIDE.md)**
  - Sample data generation
  - Realistic merchant examples
  - Testing workflows

- **[Spending Analysis Fix](./SPENDING_ANALYSIS_FIX.md)**
  - Analysis endpoint usage
  - Budget comparison
  - Troubleshooting

## API Endpoints

### Budget Management
- `POST /api/budget/calculate` - Calculate budget (validation only)
- `POST /api/budget/save` - Save budget to database
- `GET /api/budget/get?userId={id}` - Retrieve user budget

### Transaction Management
- `POST /api/transactions/add` - Add single transaction
- `GET /api/transactions/history` - Get transaction history
- `POST /api/transactions/generate-sample` - Generate example transactions
- `GET /api/transactions/analyze` - Analyze spending vs budget

### AI Features
- `POST /api/ai/recommendations` - Get budget recommendations
- `POST /api/ai/analyze` - AI budget analysis
- `POST /api/ai/wants-subcategories` - Subcategory suggestions
- `POST /api/ai/category-question` - Category-specific advice

## Project Structure

```
bostonhacks2025/
├── src/
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── budget/          # Budget endpoints
│   │   │   ├── transactions/    # Transaction endpoints
│   │   │   └── ai/              # AI endpoints
│   │   ├── backend/             # Backend logic
│   │   │   ├── budgetCalculator.ts
│   │   │   ├── database.ts
│   │   │   ├── geminiAI.ts
│   │   │   ├── nessieAPI.ts
│   │   │   └── spendingAnalyzer.ts
│   │   ├── budget/              # Budget pages
│   │   ├── create-budget/       # Budget creation
│   │   └── page.tsx             # Home page
│   └── context/
│       └── BudgetContext.tsx    # React context
├── test-*.ps1                   # PowerShell test scripts
├── README_FRONTEND.md           # Frontend guide ⭐
├── README_BACKEND.md            # Backend reference
└── .env.local                   # Environment variables (create this)
```

## Example Usage

### Create a Budget (Frontend)

```typescript
async function saveBudget(userId: string) {
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
      }
    })
  });

  return await response.json();
}
```

### Add a Transaction

```typescript
async function addTransaction(userId: string) {
  const response = await fetch('/api/transactions/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      category: 'food',
      amount: 45.67,
      description: 'Grocery shopping',
      merchantName: 'Whole Foods'
    })
  });

  return await response.json();
}
```

### Analyze Spending

```typescript
async function analyzeSpending(userId: string) {
  const response = await fetch(`/api/transactions/analyze?userId=${userId}`);
  const data = await response.json();
  
  console.log(`Total Spent: $${data.analysis.totalSpent}`);
  console.log(`Budget Used: ${data.analysis.percentageOfBudgetUsed}%`);
  
  return data.analysis;
}
```

## Testing

### PowerShell Test Scripts

```powershell
# Test complete transaction flow with example data
.\test-example-transactions.ps1

# Test transaction history
.\test-transactions.ps1

# Test backend API
.\test-backend.ps1

# Debug spending analysis
.\test-debug-analyze.ps1
```

### Expected Output

```
=== Testing Example Transaction Generation ===

Step 1: Creating Budget...
[OK] Budget saved successfully

Step 2: Generating Sample Transactions...
[OK] Sample transactions generated
Count: 25

Step 3: Fetching Transaction History...
[OK] Transaction history retrieved
Total Transactions: 25
Total Spent: $5276.52

Step 4: Analyzing Spending vs Budget...
[OK] Spending analysis complete
Total Spent: $7866.67
Total Budget: $5000
Budget Used: 157.33%

Category Breakdown:
  Rent: $5798.14 / $1000 (579.8%) ← Over budget!
  Food: $278.85 / $1000 (27.9%)
  Bills: $829.25 / $1500 (55.3%)
  Wants: $960.43 / $1500 (64.0%)
```

## Database Structure

### budgets Collection

```javascript
{
  _id: ObjectId("..."),
  userId: "user123",
  monthlyIncome: 5000,
  categories: {
    rent: { total: 1000, percentage: 20 },
    food: { total: 750, percentage: 15 },
    // ...
  },
  wantsSubcategories: [...],
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### transactions Collection

```javascript
{
  _id: ObjectId("..."),
  userId: "user123",
  budgetId: "budget_id",
  category: "food",
  subcategory: "Whole Foods",
  amount: 45.67,
  description: "Grocery shopping",
  date: ISODate("..."),
  createdAt: ISODate("...")
}
```

## Features in Detail

### Smart Budget Calculation

The app validates that:
- Total percentages ≤ 100%
- All values are non-negative
- Subcategory percentages ≤ 100%
- Income > 0

### Transaction Generation

Includes 35+ realistic merchants:
- **Food**: Whole Foods, Trader Joe's, Starbucks, Chipotle
- **Bills**: Comcast, Verizon, PG&E, State Farm
- **Wants**: Amazon, Netflix, Nike, Best Buy
- **Rent**: Property Management, Landlord Payment

### AI-Powered Insights

- Personalized budget recommendations
- Category-specific advice (location-aware)
- Budget analysis and optimization tips
- Subcategory breakdown suggestions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Google Gemini AI](https://ai.google.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aj-hardimon/BostonHacks2025)

## License

MIT License - see LICENSE file for details

---

**Built for BostonHacks 2025** 🚀
