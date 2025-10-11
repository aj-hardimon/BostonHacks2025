/**
 * API Route: POST /api/budget/save
 * Saves budget to MongoDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveBudget, UserBudget } from '@/app/backend/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

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

    // Save budget
    const savedBudget = await saveBudget({
      userId: body.userId,
      monthlyIncome: body.monthlyIncome,
      categories: body.categories,
      wantsSubcategories: body.wantsSubcategories,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(savedBudget, { status: 200 });
  } catch (error) {
    console.error('Save budget error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save budget',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
