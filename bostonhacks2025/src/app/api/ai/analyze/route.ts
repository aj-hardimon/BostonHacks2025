/**
 * API Route: POST /api/ai/analyze
 * Analyzes budget using Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeBudget } from '@/app/backend/geminiAI';
import { BudgetResult } from '@/app/backend/budgetCalculator';

export async function POST(request: NextRequest) {
  try {
    const body: { budgetResult: BudgetResult } = await request.json();

    if (!body.budgetResult) {
      return NextResponse.json(
        { error: 'Missing budgetResult' },
        { status: 400 }
      );
    }

    const analysis = await analyzeBudget(body.budgetResult);

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    console.error('AI analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Failed to analyze budget',
        details: errorMessage,
        hasApiKey: !!process.env.GEMINI_API_KEY 
      },
      { status: 500 }
    );
  }
}
