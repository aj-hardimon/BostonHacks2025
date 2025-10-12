import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, getBudget } from '@/app/backend/database';
import { calculateBudget } from '@/app/backend/budgetCalculator';
import { calculateCategorySpending, formatSpendingAnalysis } from '@/app/backend/spendingAnalyzer';

/**
 * GET /api/transactions/analyze
 * Analyze spending by category and compare against budget
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's budget
    const userBudget = await getBudget(userId);
    if (!userBudget) {
      return NextResponse.json(
        { error: 'User budget not found. Please create a budget first.' },
        { status: 404 }
      );
    }

    // Calculate budget breakdown
    const budgetResult = calculateBudget({
      monthlyIncome: userBudget.monthlyIncome,
      categories: userBudget.categories,
      wantsSubcategories: userBudget.wantsSubcategories,
    });

    // Get transactions
    const transactions = await getTransactions(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    // Calculate spending analysis
    const analysis = calculateCategorySpending(transactions, budgetResult);
    const formattedAnalysis = formatSpendingAnalysis(analysis);

    return NextResponse.json({
      success: true,
      analysis,
      formattedAnalysis,
      transactionCount: transactions.length,
      dateRange: {
        start: startDate || 'beginning',
        end: endDate || 'now',
      },
    });
  } catch (error) {
    console.error('Analyze spending error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze spending',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
