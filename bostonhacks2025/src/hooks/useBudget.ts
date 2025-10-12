/**
 * Custom React Hook: useBudget
 * 
 * Manages budget state and operations for a user.
 * Automatically fetches budget on mount and provides save functionality.
 * 
 * @example
 * ```tsx
 * function BudgetDashboard() {
 *   const { budget, loading, error, saveBudget, refreshBudget } = useBudget('user123');
 * 
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!budget) return <div>No budget found</div>;
 * 
 *   return <div>Monthly Income: ${budget.monthlyIncome}</div>;
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';

export interface BudgetCategory {
  total: number;
  percentage: number;
}

export interface Budget {
  _id?: string;
  userId: string;
  monthlyIncome: number;
  categories: {
    rent?: BudgetCategory;
    food?: BudgetCategory;
    bills?: BudgetCategory;
    savings?: BudgetCategory;
    investments?: BudgetCategory;
    wants?: BudgetCategory;
  };
  wantsSubcategories?: Array<{
    subcategory: string;
    amount: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface UseBudgetReturn {
  budget: Budget | null;
  loading: boolean;
  error: string | null;
  saveBudget: (budgetData: Partial<Budget>) => Promise<Budget>;
  refreshBudget: () => Promise<void>;
}

export function useBudget(userId: string): UseBudgetReturn {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/budget/get?userId=${userId}`);

      if (response.status === 404) {
        setBudget(null);
      } else if (response.ok) {
        const data = await response.json();
        setBudget(data);
      } else {
        throw new Error('Failed to fetch budget');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setBudget(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const saveBudget = async (budgetData: Partial<Budget>): Promise<Budget> => {
    try {
      setError(null);

      const response = await fetch('/api/budget/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...budgetData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save budget');
      }

      const saved = await response.json();
      setBudget(saved);
      return saved;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    budget,
    loading,
    error,
    saveBudget,
    refreshBudget: fetchBudget
  };
}
