/**
 * Spending Analysis Functions
 */

import { BudgetTransaction } from './database';
import { BudgetResult } from './budgetCalculator';

export interface CategorySpending {
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
  categories: CategorySpending[];
  overBudgetCategories: string[];
  percentageOfBudgetUsed: number;
}

/**
 * Calculate spending by category from transactions
 */
export function calculateCategorySpending(
  transactions: BudgetTransaction[],
  budgetResult: BudgetResult
): SpendingAnalysis {
  // Initialize spending tracker for each category
  const spendingByCategory: Record<string, number> = {
    rent: 0,
    food: 0,
    bills: 0,
    savings: 0,
    investments: 0,
    wants: 0,
  };

  // Sum up spending by category
  transactions.forEach(transaction => {
    const category = transaction.category.toLowerCase();
    if (spendingByCategory.hasOwnProperty(category)) {
      spendingByCategory[category] += transaction.amount;
    } else {
      // If category doesn't match exactly, add to wants
      spendingByCategory.wants += transaction.amount;
    }
  });

  // Calculate total spent
  const totalSpent = Object.values(spendingByCategory).reduce((sum, val) => sum + val, 0);

  // Build category analysis
  const categories: CategorySpending[] = budgetResult.categories.map(cat => {
    const categoryKey = cat.name.toLowerCase().replace(/\/.*$/, ''); // Handle "Rent/Mortgage" -> "rent"
    const spent = spendingByCategory[categoryKey] || 0;
    const budget = cat.amount || 0;
    const remaining = budget - spent;
    const percentageUsed = budget > 0 ? (spent / budget) * 100 : 0;

    let status: 'under' | 'at' | 'over';
    if (percentageUsed >= 100) {
      status = 'over';
    } else if (percentageUsed >= 95) {
      status = 'at';
    } else {
      status = 'under';
    }

    return {
      category: cat.name,
      spent,
      budget,
      remaining,
      percentageUsed,
      status,
    };
  });

  // Find over-budget categories
  const overBudgetCategories = categories
    .filter(cat => cat.status === 'over')
    .map(cat => cat.category);

  return {
    totalSpent,
    totalBudget: budgetResult.totalAllocated,
    categories,
    overBudgetCategories,
    percentageOfBudgetUsed: budgetResult.totalAllocated > 0 
      ? (totalSpent / budgetResult.totalAllocated) * 100 
      : 0,
  };
}

/**
 * Format spending analysis for display
 */
export function formatSpendingAnalysis(analysis: SpendingAnalysis): string {
  let output = `📊 Spending Analysis\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  output += `💰 Overall: $${analysis.totalSpent.toFixed(2)} / $${analysis.totalBudget.toFixed(2)}\n`;
  output += `   (${analysis.percentageOfBudgetUsed.toFixed(1)}% of budget used)\n\n`;

  analysis.categories.forEach(cat => {
    const icon = cat.status === 'over' ? '🔴' : cat.status === 'at' ? '🟡' : '🟢';
    const progressBar = generateProgressBar(cat.percentageUsed);
    
    output += `${icon} ${cat.category}\n`;
    output += `   $${cat.spent.toFixed(2)} / $${cat.budget.toFixed(2)} ${progressBar}\n`;
    output += `   ${cat.remaining >= 0 ? 'Remaining' : 'Over'}: $${Math.abs(cat.remaining).toFixed(2)} `;
    output += `(${cat.percentageUsed.toFixed(1)}%)\n\n`;
  });

  if (analysis.overBudgetCategories.length > 0) {
    output += `⚠️  Over Budget: ${analysis.overBudgetCategories.join(', ')}\n`;
  }

  return output;
}

/**
 * Generate a simple progress bar
 */
function generateProgressBar(percentage: number, length: number = 20): string {
  const filled = Math.min(Math.floor((percentage / 100) * length), length);
  const empty = Math.max(0, length - filled);
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

/**
 * Get spending summary by category (simpler format)
 */
export function getSpendingSummary(analysis: SpendingAnalysis): Record<string, { spent: number; budget: number; remaining: number }> {
  const summary: Record<string, { spent: number; budget: number; remaining: number }> = {};
  
  analysis.categories.forEach(cat => {
    summary[cat.category] = {
      spent: cat.spent,
      budget: cat.budget,
      remaining: cat.remaining,
    };
  });
  
  return summary;
}
