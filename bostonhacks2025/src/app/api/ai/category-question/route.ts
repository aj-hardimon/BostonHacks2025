/**
 * API Route: POST /api/ai/category-question
 * Answers budget questions specific to a category with detailed advice
 */

import { NextRequest, NextResponse } from 'next/server';
import { askCategoryQuestion } from '@/app/backend/geminiAI';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.category || typeof body.category !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid category' },
        { status: 400 }
      );
    }

    if (!body.question || typeof body.question !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid question' },
        { status: 400 }
      );
    }

    const answer = await askCategoryQuestion(
      body.category,
      body.question,
      body.categoryBudget,
      body.location
    );

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error('Category question error:', error);
    return NextResponse.json(
      { error: 'Failed to answer category question' },
      { status: 500 }
    );
  }
}
