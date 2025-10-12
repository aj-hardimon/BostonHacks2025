import { NextRequest, NextResponse } from 'next/server';
import { getTransactions } from '@/app/backend/database';

/**
 * GET /api/transactions/history
 * Get transaction history for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get transactions
    let transactions = await getTransactions(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    // Apply limit if provided
    if (limit) {
      transactions = transactions.slice(0, parseInt(limit));
    }

    // Group transactions by category for summary
    const categoryTotals: Record<string, number> = {};
    transactions.forEach(t => {
      const category = t.category.toLowerCase();
      categoryTotals[category] = (categoryTotals[category] || 0) + t.amount;
    });

    return NextResponse.json({
      success: true,
      count: transactions.length,
      transactions,
      summary: {
        totalSpent: transactions.reduce((sum, t) => sum + t.amount, 0),
        byCategory: categoryTotals,
      },
      dateRange: {
        start: startDate || 'beginning',
        end: endDate || 'now',
      },
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get transaction history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
