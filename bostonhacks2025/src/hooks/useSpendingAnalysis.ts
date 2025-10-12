/**
 * Custom React Hook: useSpendingAnalysis
 * 
 * Analyzes spending compared to budget and provides insights.
 * Automatically fetches and updates when userId changes.
 * 
 * @example
 * ```tsx
 * function SpendingDashboard() {
 *   const { analysis, loading, error, refreshAnalysis } = useSpendingAnalysis('user123');
 * 
 *   if (loading) return <div>Loading analysis...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!analysis) return <div>No data</div>;
 * 
 *   return (
 *     <div>
 *       <h2>Budget Used: {analysis.percentageOfBudgetUsed.toFixed(1)}%</h2>
 *       {analysis.categories.map(cat => (
 *         <div key={cat.category}>
 *           {cat.category}: ${cat.spent} / ${cat.budget}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';

export interface CategoryAnalysis {
  category: string;
  spent: number;
  budget: number;
  remaining: number;
  percentageUsed: number;
  status: 'under' | 'at' | 'over';
}

export interface SpendingAnalysis {
  totalSpent: number;
  totalBudget: number;
  percentageOfBudgetUsed: number;
  categories: CategoryAnalysis[];
  overBudgetCategories: string[];
}

export interface UseSpendingAnalysisOptions {
  startDate?: Date;
  endDate?: Date;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UseSpendingAnalysisReturn {
  analysis: SpendingAnalysis | null;
  formattedAnalysis: string | null;
  transactionCount: number;
  loading: boolean;
  error: string | null;
  refreshAnalysis: () => Promise<void>;
}

export function useSpendingAnalysis(
  userId: string,
  options?: UseSpendingAnalysisOptions
): UseSpendingAnalysisReturn {
  const [analysis, setAnalysis] = useState<SpendingAnalysis | null>(null);
  const [formattedAnalysis, setFormattedAnalysis] = useState<string | null>(null);
  const [transactionCount, setTransactionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
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

      const response = await fetch(`/api/transactions/analyze?${params}`);

      if (response.status === 404) {
        setAnalysis(null);
        setFormattedAnalysis(null);
        setTransactionCount(0);
      } else if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis || null);
        setFormattedAnalysis(data.formattedAnalysis || null);
        setTransactionCount(data.transactionCount || 0);
      } else {
        throw new Error('Failed to fetch spending analysis');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAnalysis(null);
      setFormattedAnalysis(null);
      setTransactionCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId, options?.startDate, options?.endDate]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (options?.autoRefresh && options?.refreshInterval) {
      const interval = setInterval(fetchAnalysis, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAnalysis, options?.autoRefresh, options?.refreshInterval]);

  return {
    analysis,
    formattedAnalysis,
    transactionCount,
    loading,
    error,
    refreshAnalysis: fetchAnalysis
  };
}
