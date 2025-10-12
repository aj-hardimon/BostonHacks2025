/**
 * MongoDB Database Connection and Schema
 */

import { MongoClient, Db, Collection, Double } from 'mongodb';
const toDouble = (n: number) => new Double(Number(n));
const fromDouble = (x: any) => x instanceof Double ? x.valueOf() : x;
import { getEncryptedMongoClient } from './encryption';

let client: MongoClient | null = null;
let db: Db | null = null;

export interface UserBudget {
  _id?: string;
  userId: string;
  name?: string;
  monthlyIncome: number;
  categories: {
    rent?: { total: number; percentage: number } | number;
    food?: { total: number; percentage: number } | number;
    bills?: { total: number; percentage: number } | number;
    savings?: { total: number; percentage: number } | number;
    investments?: { total: number; percentage: number } | number;
    wants?: { total: number; percentage: number } | number;
  };
  wantsSubcategories?: {
    name?: string;
    subcategory?: string;
    amount?: number;
    percentage?: number;
  }[];
  streak?: {
    currentStreak: number;
    longestStreak: number;
    lastChecked: Date;
    monthlyResetDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetTransaction {
  _id?: string;
  userId: string;
  budgetId: string;
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
  monthPeriod?: string; // Format: "2025-01" to track which month
}

/**
 * Connect to MongoDB
 */
export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  const dbName = process.env.MONGODB_DB_NAME || 'budgeting_app';

  try {
    client = await getEncryptedMongoClient(dbName);
    db = client.db(dbName);
    
    // Ensure indexes
    await db.collection('budgets').createIndex({ userId: 1 });
    await db.collection('budgets').createIndex({ name: 1 });
    await db.collection('transactions').createIndex({ userId: 1 });
    await db.collection('transactions').createIndex({ userId: 1, date: -1 });
    await db.collection('transactions').createIndex({ budgetId: 1 });
    
    console.log(`Connected to MongoDB database (CSFLE): ${dbName}`);
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB (CSFLE):', error);
    throw error;
  }
}

/**
 * Get budgets collection
 */
export async function getBudgetsCollection(): Promise<Collection<UserBudget>> {
  const database = await connectToDatabase();
  return database.collection<UserBudget>('budgets');
}

/**
 * Get transactions collection
 */
export async function getTransactionsCollection(): Promise<Collection<BudgetTransaction>> {
  const database = await connectToDatabase();
  return database.collection<BudgetTransaction>('transactions');
}

/**
 * Save or update a user's budget
 */
export async function saveBudget(budget: Omit<UserBudget, '_id'>): Promise<UserBudget> {
  const collection = await getBudgetsCollection();
  
  // Helper function to convert category value to number for storage
  const convertCategoryValue = (value: number | { total: number; percentage: number } | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    return value.total || 0;
  };
  
  const docForWrite = {
    ...budget,
    monthlyIncome: toDouble(budget.monthlyIncome),
    categories: budget.categories, // Store as-is (can be objects or numbers)
    updatedAt: new Date(),
  };
  
  const existingBudget = await collection.findOne({ userId: budget.userId });
  if (existingBudget) {
    await collection.updateOne(
      { userId: budget.userId },
      { $set: docForWrite as any }
    );
    return { ...budget, _id: existingBudget._id.toString(), updatedAt: docForWrite.updatedAt };
  } else {
    const result = await collection.insertOne({
      ...docForWrite,
      createdAt: new Date(),
    } as any);
    return {
      ...budget,
      _id: result.insertedId.toString(),
      createdAt: new Date(),
      updatedAt: docForWrite.updatedAt,
    };
  }
}

/**
 * Get a user's budget
 */
export async function getBudget(userId: string): Promise<UserBudget | null> {
  const collection = await getBudgetsCollection();
  const doc = await collection.findOne({ userId });
  if (!doc) return null;
  return {
    ...doc,
    monthlyIncome: fromDouble(doc.monthlyIncome),
    categories: {
      rent: fromDouble(doc.categories?.rent),
      food: fromDouble(doc.categories?.food),
      bills: fromDouble(doc.categories?.bills),
      savings: fromDouble(doc.categories?.savings),
      investments: fromDouble(doc.categories?.investments),
      wants: fromDouble(doc.categories?.wants),
    },
  };
}

/**
 * Get a budget by name
 */
export async function getBudgetByName(name: string): Promise<UserBudget | null> {
  const collection = await getBudgetsCollection();
  const doc = await collection.findOne({ name });
  if (!doc) return null;
  return {
    ...doc,
    monthlyIncome: fromDouble(doc.monthlyIncome),
    categories: {
      rent: fromDouble(doc.categories?.rent),
      food: fromDouble(doc.categories?.food),
      bills: fromDouble(doc.categories?.bills),
      savings: fromDouble(doc.categories?.savings),
      investments: fromDouble(doc.categories?.investments),
      wants: fromDouble(doc.categories?.wants),
    },
  };
}

/**
 * Save a transaction
 */
export async function saveTransaction(
  transaction: Omit<BudgetTransaction, '_id' | 'createdAt'>
): Promise<BudgetTransaction> {
  const collection = await getTransactionsCollection();
  
  const result = await collection.insertOne({
    ...transaction,
    createdAt: new Date(),
  });
  
  return {
    ...transaction,
    _id: result.insertedId.toString(),
    createdAt: new Date(),
  };
}

/**
 * Save multiple transactions at once (for sample data generation)
 */
export async function saveTransactionsBulk(
  userId: string,
  budgetId: string,
  transactions: Array<{
    category: string;
    amount: number;
    description: string;
    merchantName: string;
    date: Date;
  }>
): Promise<BudgetTransaction[]> {
  const collection = await getTransactionsCollection();
  
  const docs = transactions.map(t => ({
    userId,
    budgetId,
    category: t.category,
    subcategory: t.merchantName,
    amount: t.amount,
    description: t.description,
    date: t.date,
    createdAt: new Date(),
  }));
  
  const result = await collection.insertMany(docs);
  
  return docs.map((doc, index) => ({
    ...doc,
    _id: result.insertedIds[index].toString(),
  }));
}

/**
 * Get transactions for a user
 */
export async function getTransactions(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<BudgetTransaction[]> {
  const collection = await getTransactionsCollection();
  
  const query: any = { userId };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  
  return await collection.find(query).sort({ date: -1 }).toArray();
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(transactionId: string): Promise<boolean> {
  const collection = await getTransactionsCollection();
  const result = await collection.deleteOne({ _id: transactionId as any });
  return result.deletedCount > 0;
}

/**
 * Check and update budget streak
 * Returns updated streak data
 */
export async function checkAndUpdateStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastChecked: Date;
  monthlyResetDate: Date;
}> {
  const budget = await getBudget(userId);
  if (!budget) {
    throw new Error('Budget not found');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Initialize streak if it doesn't exist
  if (!budget.streak) {
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    budget.streak = {
      currentStreak: 0,
      longestStreak: 0,
      lastChecked: today,
      monthlyResetDate: firstOfMonth,
    };
  }

  const lastChecked = new Date(budget.streak.lastChecked);
  const lastCheckedDate = new Date(lastChecked.getFullYear(), lastChecked.getMonth(), lastChecked.getDate());
  const monthlyResetDate = new Date(budget.streak.monthlyResetDate);
  
  // Check if we need to reset for new month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  if (currentMonthStart > monthlyResetDate) {
    // New month - reset monthly budget tracking
    budget.streak.monthlyResetDate = currentMonthStart;
  }

  // Check if this is a new day
  if (today > lastCheckedDate) {
    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if user stayed within budget yesterday
    const wasWithinBudget = await checkDailyBudgetAdherence(userId, yesterday);

    if (wasWithinBudget) {
      // Increment streak
      budget.streak.currentStreak += 1;
      if (budget.streak.currentStreak > budget.streak.longestStreak) {
        budget.streak.longestStreak = budget.streak.currentStreak;
      }
    } else if (lastCheckedDate < yesterday) {
      // Missed a day - reset streak
      budget.streak.currentStreak = 0;
    }

    budget.streak.lastChecked = today;
    
    // Save updated streak
    const collection = await getBudgetsCollection();
    await collection.updateOne(
      { userId },
      { 
        $set: { 
          streak: budget.streak,
          updatedAt: now 
        } 
      }
    );
  }

  return budget.streak;
}

/**
 * Check if spending was within budget for a specific day
 */
async function checkDailyBudgetAdherence(userId: string, date: Date): Promise<boolean> {
  const budget = await getBudget(userId);
  if (!budget) return false;

  // Get start and end of the day
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

  // Get transactions for that day
  const transactions = await getTransactions(userId, startOfDay, endOfDay);

  // Calculate daily budget (monthly income / 30 days)
  const dailyBudget = budget.monthlyIncome / 30;

  // Calculate total spent that day
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  // User is within budget if they spent less than daily budget
  return totalSpent <= dailyBudget;
}

/**
 * Get current month transactions with spending summary
 */
export async function getCurrentMonthSummary(userId: string): Promise<{
  totalSpent: number;
  budgetRemaining: number;
  percentUsed: number;
  categorySpending: Record<string, number>;
}> {
  const budget = await getBudget(userId);
  if (!budget) {
    throw new Error('Budget not found');
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await getTransactions(userId, startOfMonth, endOfMonth);

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const budgetRemaining = budget.monthlyIncome - totalSpent;
  const percentUsed = budget.monthlyIncome > 0 ? (totalSpent / budget.monthlyIncome) * 100 : 0;

  const categorySpending: Record<string, number> = {};
  transactions.forEach(t => {
    const cat = t.category.toLowerCase();
    categorySpending[cat] = (categorySpending[cat] || 0) + t.amount;
  });

  return {
    totalSpent,
    budgetRemaining,
    percentUsed,
    categorySpending,
  };
}

/**
 * Close database connection
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Disconnected from MongoDB');
  }
}
