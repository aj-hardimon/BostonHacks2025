/**
 * MongoDB Database Connection and Schema
 */

import { MongoClient, Db, Collection } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export interface UserBudget {
  _id?: string;
  userId: string;
  monthlyIncome: number;
  categories: {
    rent: number;
    food: number;
    bills: number;
    savings: number;
    investments: number;
    wants: number;
  };
  wantsSubcategories?: {
    name: string;
    percentage: number;
  }[];
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
}

/**
 * Connect to MongoDB
 */
export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  const dbName = process.env.MONGODB_DB_NAME || 'budgeting_app';

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to MongoDB database: ${dbName}`);
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    console.error('Connection URI (sanitized):', uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
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
  
  const existingBudget = await collection.findOne({ userId: budget.userId });
  
  if (existingBudget) {
    // Update existing budget
    await collection.updateOne(
      { userId: budget.userId },
      {
        $set: {
          ...budget,
          updatedAt: new Date(),
        },
      }
    );
    return { ...budget, _id: existingBudget._id.toString(), updatedAt: new Date() };
  } else {
    // Create new budget
    const result = await collection.insertOne({
      ...budget,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return {
      ...budget,
      _id: result.insertedId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

/**
 * Get a user's budget
 */
export async function getBudget(userId: string): Promise<UserBudget | null> {
  const collection = await getBudgetsCollection();
  return await collection.findOne({ userId });
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
