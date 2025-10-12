# AI Budgeting Web App

An intelligent budgeting application that helps users create, track, and analyze their budgets with AI-powered recommendations, streak tracking, and comprehensive spending insights.

## ✨ Features

### 🎯 **Budget Management**
- **Create Budget** - Multi-step wizard to create personalized budgets
  - Monthly income input
  - Six category budget allocation (rent, food, bills, savings, investments, wants)
  - Real-time percentage validation (must equal 100%)
  - Two-way sync: adjust percentages or dollar amounts
  - Wants subcategory breakdown
  - Budget naming for easy identification
  - Username assignment for multi-user support

- **Edit Budget** - Full budget editing capabilities
  - Modify all budget categories
  - Update wants subcategories
  - Real-time recalculation
  - Four-step wizard interface
  - Preview changes before saving

- **Budget Search** - Find budgets by name
  - Search by budget name (not username)
  - Quick access to saved budgets
  - SessionStorage persistence across pages

### � **Transaction Management**
- **Add Transactions** - Manual transaction entry
  - Category selection from budget categories
  - Subcategory/merchant name
  - Amount and date input
  - Description field
  - Automatic budget tracking
  
- **View Transactions** - Comprehensive transaction history
  - All transactions displayed in clean table
  - Filter by date range
  - Category tags with color coding
  - Sort by date (newest first)
  - Spending summary by category
  - Monthly spending totals

- **Delete Transactions** - Transaction removal
  - Delete button on each transaction
  - Confirmation dialog to prevent accidents
  - Immediate UI update
  - Success/error notifications

### � **Progress Tracking**
- **Weekly Progress** - Week-by-week budget analysis
  - Navigate between weeks (current, past, future)
  - Weekly budget calculation (monthly ÷ 4)
  - Overall budget status (Good/Warning/Over)
  - Category-by-category breakdown
  - Visual progress bars with color coding
  - Daily spending breakdown
  - Transaction count for the week
  - Quick link to view all transactions

- **Monthly Summary** - Current month overview
  - Total budget display
  - Amount spent this month
  - Remaining budget (green/red indicators)
  - Percentage used tracker
  - Auto-resets on the 1st of each month
  - Category spending breakdown

### 🔥 **Streak Counter**
- **Daily Streak Tracking** - Gamified budget adherence
  - 🔥 Fire emoji with streak number
  - Increments every day you stay within budget
  - Resets if you exceed daily budget
  - Daily budget = Monthly Income ÷ 30 days
  - Tracks personal best (longest streak)
  - Auto-updates at midnight
  - Three display sizes (small/medium/large)
  - Displayed prominently on budget page

### 🤖 **AI Features** (Backend Ready - Not Yet Integrated)
- Budget recommendations with Google Gemini AI
- Location-aware category advice
- Budget analysis and insights
- Subcategory suggestions
- *(API endpoints exist but not yet called from frontend)*

### 💾 **Data Persistence**
- MongoDB integration for all user data
- Per-user budget and transaction storage
- Client-side field-level encryption (CSFLE) support
- Automatic data synchronization
- SessionStorage for current session
- Budget versioning with createdAt/updatedAt timestamps

### 🎨 **User Experience**
- **Clean UI** - Modern gradient backgrounds and card layouts
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Color Coding** - Visual indicators for budget status
  - Green: Within budget / Good status
  - Yellow: Warning (80-100% used)
  - Red: Over budget
- **Real-time Validation** - Instant feedback on form inputs
- **Loading States** - Clear loading indicators
- **Error Handling** - User-friendly error messages
- **Success Notifications** - Confirmation messages for actions

## 📱 Application Pages

1. **Landing Page** (`/`) - Home page with "Get Budget" button
2. **Budget Page** (`/budget`) 
   - Budget search
   - Budget display with streak
   - Monthly summary
   - Action buttons (Edit, Transactions, Progress, Add Transaction)
3. **Create Budget** (`/create-budget`) - Multi-step budget creation wizard
4. **Edit Budget** (`/edit-budget`) - Budget editing interface
5. **Transactions** (`/transactions`) - Add and view all transactions
6. **Weekly Progress** (`/weekly-progress`) - Week-by-week spending analysis

## 🔧 Tech Stack

- **Framework:** Next.js 15.5.4 with App Router
- **Language:** TypeScript
- **Database:** MongoDB Atlas
- **AI:** Google Gemini (gemini-2.5-flash)
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Runtime:** Node.js v23.8.0
- **Dev Server:** Turbopack

## 🚀 Quick Start

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

# Google Gemini AI (optional for AI features)
GEMINI_API_KEY=your_gemini_api_key

# Encryption (optional - for production)
# CSFLE_LOCAL_MASTER_KEY=your_96_byte_base64_key
```

**Get API Keys:**
- **MongoDB**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Gemini AI**: [Google AI Studio](https://makersuite.google.com/app/apikey) (optional)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

### 4. Create Your First Budget

1. Navigate to the app
2. Click "Create Budget"
3. Enter your username and budget name
4. Input monthly income
5. Allocate percentages to categories (must total 100%)
6. Add wants subcategories (optional)
7. Review and save
8. Start tracking transactions and building your streak! 🔥

## 📚 Documentation

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
