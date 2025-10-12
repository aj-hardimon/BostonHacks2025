/**
 * API Route: POST /api/budget/notify
 * Simple notification endpoint that accepts { userId }
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // For now, just log and return success. This can be expanded later.
    console.log('POST /api/budget/notify received for userId=', userId);

    return NextResponse.json({ status: 'ok', userId }, { status: 200 });
  } catch (err) {
    console.error('Notify error:', err);
    return NextResponse.json({ error: 'Notify failed' }, { status: 500 });
  }
}
