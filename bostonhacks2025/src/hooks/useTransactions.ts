/**
 * Custom React Hook: useTransactions
 * 
 * Manages transaction state and operations for a user.
 * Provides transaction history, summary, and ability to add new transactions.
 * 
 * @example
 * ```tsx
 * function TransactionList() {
 *   const { transactions, summary, loading, addTransaction, refreshTransactions } = 
 *     useTransactions('user123', { limit: 50 });
 * 
 *   if (loading) return <div>Loading...</div>;
 * 
 *   return (
 *     <div>
 *       <h2>Total Spent: ${summary?.totalSpent?.toFixed(2)}</h2>
 *       {transactions.map(t => (
 *         <div key={t._id}>{t.description} - ${t.amount}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';

export interface Transaction {
  _id?: string;
  userId: string;
  budgetId?: string;
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  date: string | Date;
  createdAt?: string;
}

export interface TransactionSummary {
  totalSpent: number;
  byCategory: Record<string, number>;
}

export interface UseTransactionsOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  autoRefresh?: boolean;
}

export interface UseTransactionsReturn {
  transactions: Transaction[];
  summary: TransactionSummary | null;
  loading: boolean;
  error: string | null;
  addTransaction: (transaction: Omit<Transaction, '_id' | 'userId' | 'createdAt'>) => Promise<Transaction>;
  refreshTransactions: () => Promise<void>;
  generateSampleTransactions: (limit?: number) => Promise<void>;
}

export function useTransactions(
  userId: string,
  options?: UseTransactionsOptions
): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ userId });

      if (options?.startDate) {
        params.append('startDate', options.startDate.toISOString());
      }
      if (options?.endDate) {
        params.append('endDate', options.endDate.toISOString());
      }
      if (options?.limit) {
        params.append('limit', options.limit.toString());
      }

      const response = await fetch(`/api/transactions/history?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();

      setTransactions(data.transactions || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTransactions([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [userId, options?.startDate, options?.endDate, options?.limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (
    transaction: Omit<Transaction, '_id' | 'userId' | 'createdAt'>
  ): Promise<Transaction> => {
    try {
      setError(null);

      const response = await fetch('/api/transactions/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...transaction,
          date: transaction.date || new Date()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add transaction');
      }

      const data = await response.json();
      const newTransaction = data.transaction;

      // Update local state
      setTransactions(prev => [newTransaction, ...prev]);

      // Update summary
      if (summary) {
        setSummary(prev => ({
          totalSpent: (prev?.totalSpent || 0) + newTransaction.amount,
          byCategory: {
            ...prev?.byCategory,
            [newTransaction.category]: 
              ((prev?.byCategory?.[newTransaction.category] || 0) + newTransaction.amount)
          }
        }));
      }

      return newTransaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  const generateSampleTransactions = async (limit: number = 25): Promise<void> => {
    try {
      setError(null);

      const response = await fetch('/api/transactions/generate-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, limit })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate sample transactions');
      }

      // Refresh transactions to show the new ones
      await fetchTransactions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    transactions,
    summary,
    loading,
    error,
    addTransaction,
    refreshTransactions: fetchTransactions,
    generateSampleTransactions
  };
}
