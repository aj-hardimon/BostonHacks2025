import { NextRequest, NextResponse } from 'next/server';
import { checkAndUpdateStreak } from '@/app/backend/database';

/**
 * GET /api/streak/check
 * Check and update user's budget adherence streak
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const streak = await checkAndUpdateStreak(userId);

    return NextResponse.json({
      success: true,
      streak,
    });
  } catch (error) {
    console.error('Check streak error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check streak',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
