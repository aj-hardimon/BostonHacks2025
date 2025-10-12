/**
 * Custom Hooks - Index
 * 
 * Export all custom hooks for easy importing
 */

export { useBudget } from './useBudget';
export type { Budget, BudgetCategory, UseBudgetReturn } from './useBudget';

export { useTransactions } from './useTransactions';
export type { 
  Transaction, 
  TransactionSummary, 
  UseTransactionsOptions, 
  UseTransactionsReturn 
} from './useTransactions';

export { useSpendingAnalysis } from './useSpendingAnalysis';
export type { 
  CategoryAnalysis, 
  SpendingAnalysis, 
  UseSpendingAnalysisOptions, 
  UseSpendingAnalysisReturn 
} from './useSpendingAnalysis';

export { 
  useAIRecommendations,
  useAIAnalysis,
  useAIWantsSuggestions,
  useCategoryQuestion
} from './useAI';
