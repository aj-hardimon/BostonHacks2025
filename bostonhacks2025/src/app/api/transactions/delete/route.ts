import { NextRequest, NextResponse } from 'next/server';
import { deleteTransaction } from '@/app/backend/database';

/**
 * DELETE /api/transactions/delete
 * Delete a transaction by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('id');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteTransaction(transactionId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Transaction not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
