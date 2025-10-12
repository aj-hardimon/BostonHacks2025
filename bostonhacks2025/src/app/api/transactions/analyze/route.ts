import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, getBudget } from '@/app/backend/database';
import { calculateCategorySpending, formatSpendingAnalysis } from '@/app/backend/spendingAnalyzer';
import { BudgetResult } from '@/app/backend/budgetCalculator';

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

    // Convert stored budget to BudgetResult format
    // Handle both old format (just percentages) and new format (objects with total/percentage)
    const budgetResult: BudgetResult = {
      monthlyIncome: userBudget.monthlyIncome,
      totalAllocated: 0,
      unallocated: 0,
      categories: [],
      isValid: true,
    };

    // Process categories - handle both number format and object format
    const categoryData: Record<string, { total: number; percentage: number }> = {};
    
    Object.entries(userBudget.categories).forEach(([key, value]) => {
      if (typeof value === 'number') {
        // Old format: just percentages
        categoryData[key] = {
          percentage: value,
          total: (value / 100) * userBudget.monthlyIncome
        };
      } else if (typeof value === 'object' && value !== null) {
        // New format: objects with total and percentage
        categoryData[key] = {
          total: (value as any).total || 0,
          percentage: (value as any).percentage || 0
        };
      }
    });

    // Build categories array for BudgetResult
    Object.entries(categoryData).forEach(([catName, data]) => {
      budgetResult.categories.push({
        name: catName.charAt(0).toUpperCase() + catName.slice(1),
        percentage: data.percentage,
        amount: data.total,
      });
      budgetResult.totalAllocated += data.total;
    });

    budgetResult.unallocated = budgetResult.monthlyIncome - budgetResult.totalAllocated;

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
