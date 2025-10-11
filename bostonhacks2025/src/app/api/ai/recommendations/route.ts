/**
 * API Route: POST /api/ai/recommendations
 * Gets budget recommendations from Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBudgetRecommendations } from '@/app/backend/geminiAI';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.monthlyIncome || typeof body.monthlyIncome !== 'number') {
      return NextResponse.json(
        { error: 'Invalid or missing monthlyIncome' },
        { status: 400 }
      );
    }

    const recommendations = await getBudgetRecommendations(
      body.monthlyIncome,
      body.userGoals,
      body.currentBudget
    );

    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (error) {
    console.error('AI recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI recommendations' },
      { status: 500 }
    );
  }
}
