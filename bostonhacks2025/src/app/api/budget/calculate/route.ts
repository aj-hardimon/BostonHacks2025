/**
 * API Route: POST /api/budget/calculate
 * Calculates budget based on user input
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateBudget, BudgetInput } from '@/app/backend/budgetCalculator';

export async function POST(request: NextRequest) {
  try {
    const body: BudgetInput = await request.json();

    // Validate required fields
    if (!body.monthlyIncome || typeof body.monthlyIncome !== 'number') {
      return NextResponse.json(
        { error: 'Invalid or missing monthlyIncome' },
        { status: 400 }
      );
    }

    if (!body.categories) {
      return NextResponse.json(
        { error: 'Missing categories' },
        { status: 400 }
      );
    }

    // Calculate budget
    const result = calculateBudget(body);

    if (!result.isValid) {
      return NextResponse.json(
        { error: 'Budget validation failed', details: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Budget calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
