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

  const dbName = process.env.MONGODB_DB_NAME || 'budgeting_app';

  try {
    client = await getEncryptedMongoClient(dbName);
    db = client.db(dbName);
    // Ensure index on userId for budgets (deterministic encryption supports equality + index)
    await db.collection('budgets').createIndex({ userId: 1 });
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
  const docForWrite = {
    ...budget,
    monthlyIncome: toDouble(budget.monthlyIncome),
    categories: {
      rent: toDouble(budget.categories.rent),
      food: toDouble(budget.categories.food),
      bills: toDouble(budget.categories.bills),
      savings: toDouble(budget.categories.savings),
      investments: toDouble(budget.categories.investments),
      wants: toDouble(budget.categories.wants),
    },
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
