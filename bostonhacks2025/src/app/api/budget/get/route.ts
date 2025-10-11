/**
 * API Route: GET /api/budget/get?userId=xxx
 * Retrieves user's budget from MongoDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBudget } from '@/app/backend/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const budget = await getBudget(userId);

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(budget, { status: 200 });
  } catch (error) {
    console.error('Get budget error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve budget',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
