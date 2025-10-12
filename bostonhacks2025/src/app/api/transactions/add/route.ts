import { NextRequest, NextResponse } from 'next/server';
import { saveTransaction, getBudget } from '@/app/backend/database';

/**
 * POST /api/transactions/add
 * Manually add a transaction (for testing)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, category, amount, description, merchantName } = body;

    if (!userId || !category || !amount) {
      return NextResponse.json(
        { error: 'userId, category, and amount are required' },
        { status: 400 }
      );
    }

    // Get user's budget to get the budget ID
    const userBudget = await getBudget(userId);
    if (!userBudget) {
      return NextResponse.json(
        { error: 'User budget not found. Please create a budget first.' },
        { status: 404 }
      );
    }

    // Save the transaction
    const transaction = await saveTransaction({
      userId,
      budgetId: userBudget._id!,
      category: category.toLowerCase(),
      subcategory: merchantName || 'Manual Entry',
      amount: parseFloat(amount),
      description: description || `${category} purchase`,
      date: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction added successfully',
      transaction,
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
