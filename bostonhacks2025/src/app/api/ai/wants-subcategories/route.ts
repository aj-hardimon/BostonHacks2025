/**
 * API Route: POST /api/ai/wants-subcategories
 * Gets subcategory recommendations for "Wants" category using Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWantsSubcategoryRecommendations } from '@/app/backend/geminiAI';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.wantsAmount || typeof body.wantsAmount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid or missing wantsAmount' },
        { status: 400 }
      );
    }

    const recommendations = await getWantsSubcategoryRecommendations(
      body.wantsAmount,
      body.userPreferences
    );

    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (error) {
    console.error('Wants subcategory recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get subcategory recommendations' },
      { status: 500 }
    );
  }
}
