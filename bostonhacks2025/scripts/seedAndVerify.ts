// Usage:
//   npm i -D tsx
//   npx tsx scripts/seedAndVerify.ts

import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { saveBudget, getBudget } from '../src/app/backend/database';

async function main() {
  const sample = {
    userId: 'USER-' + Math.floor(Math.random() * 1000000),
    monthlyIncome: Math.floor(Math.random() * 9000) + 1000, // 1000-9999
    categories: {
      rent: Math.floor(Math.random() * 2000) + 500,         // 500-2499
      food: Math.floor(Math.random() * 800) + 100,         // 100-899
      bills: Math.floor(Math.random() * 600) + 100,        // 100-699
      savings: Math.floor(Math.random() * 3000) + 500,     // 500-3499
      investments: Math.floor(Math.random() * 2000) + 100, // 100-2099
      wants: Math.floor(Math.random() * 2000) + 100,       // 100-2099
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Save and read back using CSFLE-enabled DAO
  await saveBudget(sample as any);
  const doc = await getBudget('USER-TEST-123');
  console.log('\nPlaintext from app client:', doc);

  // Read raw from DB (no autoEncryption)
  const uri = process.env.MONGODB_URI!;
  const dbName = process.env.MONGODB_DB_NAME || 'budgeting_app';
  const client = new MongoClient(uri);
  await client.connect();
  const raw = await client
    .db(dbName)
    .collection('budgets')
    .findOne({ userId: doc?.userId });
  console.log('\nRaw from DB:', raw);

  // Aggregation to print BSON types
  const agg = [
    { $match: { userId: { $exists: true } } },
    { $limit: 1 },
    { $project: {
        _id: 0,
        userIdType: { $type: '$userId' },
        monthlyIncomeType: { $type: '$monthlyIncome' },
        rentType: { $type: '$categories.rent' },
        foodType: { $type: '$categories.food' },
        billsType: { $type: '$categories.bills' },
        savingsType: { $type: '$categories.savings' },
        investmentsType: { $type: '$categories.investments' },
        wantsType: { $type: '$categories.wants' },
      }
    }
  ];
  const types = await client
    .db(dbName)
    .collection('budgets')
    .aggregate(agg)
    .toArray();
  console.log('\nBSON types for encrypted fields:', types[0]);

  await client.close();
  process.exit(0);
}

main().then(() => {
  console.log('\nCSFLE verification complete.');
}).catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
