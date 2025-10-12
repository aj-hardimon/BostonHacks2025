import { NextRequest, NextResponse } from 'next/server';
import { generateSampleTransactionsFromAllCustomers } from '@/app/backend/nessieAPI';
import { saveTransactionsBulk, getBudget } from '@/app/backend/database';

/**
 * POST /api/transactions/generate-sample
 * Generate sample transactions from Nessie API and save to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, limit = 20 } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if NESSIE_API_KEY is configured
    const nessieKey = process.env.NESSIE_API_KEY;
    if (!nessieKey || nessieKey === 'your_nessie_api_key_here') {
      return NextResponse.json(
        { 
          error: 'Nessie API key is not configured',
          details: 'Please add your Nessie API key to .env.local as NESSIE_API_KEY=your_actual_key',
          help: 'You can get an API key from http://api.nessieisreal.com/'
        },
        { status: 500 }
      );
    }

    // Get user's budget to get the budget ID
    const userBudget = await getBudget(userId);
    if (!userBudget) {
      return NextResponse.json(
        { error: 'User budget not found. Please create a budget first.' },
        { status: 404 }
      );
    }

    // Generate sample transactions from Nessie API
    console.log(`Generating ${limit} sample transactions for user ${userId}...`);
    const sampleTransactions = await generateSampleTransactionsFromAllCustomers(limit);

    if (!sampleTransactions || sampleTransactions.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate sample transactions. Please try again or add transactions manually.' },
        { status: 500 }
      );
    }

    console.log(`Generated ${sampleTransactions.length} sample transactions (may include example data if Nessie API is unavailable)`);

    // Save transactions to database
    const savedTransactions = await saveTransactionsBulk(
      userId,
      userBudget._id!,
      sampleTransactions.map(t => ({
        category: t.category,
        amount: t.amount,
        description: t.description,
        merchantName: t.merchantName,
        date: t.date,
      }))
    );

    return NextResponse.json({
      success: true,
      message: `Generated ${savedTransactions.length} sample transactions`,
      count: savedTransactions.length,
      transactions: savedTransactions,
      note: 'Transactions may include example data if Nessie API is unavailable or has no data'
    });
  } catch (error) {
    console.error('Generate sample transactions error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate sample transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
