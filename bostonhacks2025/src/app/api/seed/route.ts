export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getBudgetsCollection } from '@/app/backend/database';

export async function GET() {
  try {
    const collection = await getBudgetsCollection();
    const userId = 'USER-12345';
    const doc = {
      userId,
      monthlyIncome: 5000,
      categories: {
        rent: 2000,
        food: 400,
        bills: 250,
        savings: 800,
        investments: 350,
        wants: 1200,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await collection.updateOne(
      { userId },
      { $set: doc },
      { upsert: true }
    );
    const result = await collection.findOne({ userId });
    return NextResponse.json({ ok: true, doc: result });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
