import { NextRequest, NextResponse } from 'next/server';
import { saveBudget } from '@/app/backend/database';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, monthlyIncome, categories, wantsSubcategories } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!monthlyIncome || monthlyIncome <= 0) {
      return NextResponse.json({ error: 'Valid monthlyIncome is required' }, { status: 400 });
    }

    if (!categories) {
      return NextResponse.json({ error: 'categories are required' }, { status: 400 });
    }

    // Save budget (saveBudget will update if userId already exists)
    const budget = await saveBudget({
      userId,
      name,
      monthlyIncome,
      categories,
      wantsSubcategories: wantsSubcategories || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}
