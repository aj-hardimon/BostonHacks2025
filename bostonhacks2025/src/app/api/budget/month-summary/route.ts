import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMonthSummary } from '@/app/backend/database';

/**
 * GET /api/budget/month-summary
 * Get current month spending summary and budget remaining
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

    const summary = await getCurrentMonthSummary(userId);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('Get month summary error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get month summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
