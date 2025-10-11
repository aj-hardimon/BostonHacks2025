/**
 * Budget Calculator - Core Logic
 * Handles all budget calculations and category management
 */

export interface BudgetCategory {
  name: string;
  percentage: number;
  amount?: number;
  subcategories?: BudgetSubcategory[];
}

export interface BudgetSubcategory {
  name: string;
  percentage: number; // Percentage of parent category
  amount?: number;
}

export interface BudgetInput {
  monthlyIncome: number;
  categories: {
    rent: number;
    food: number;
    bills: number;
    savings: number;
    investments: number;
    wants: number;
  };
  wantsSubcategories?: BudgetSubcategory[];
}

export interface BudgetResult {
  monthlyIncome: number;
  totalAllocated: number;
  unallocated: number;
  categories: BudgetCategory[];
  isValid: boolean;
  errors?: string[];
}

/**
 * Validates that budget percentages add up to 100% or less
 */
export function validateBudgetPercentages(categories: BudgetInput['categories']): {
  isValid: boolean;
  totalPercentage: number;
  errors: string[];
} {
  const errors: string[] = [];
  const totalPercentage = 
    categories.rent +
    categories.food +
    categories.bills +
    categories.savings +
    categories.investments +
    categories.wants;

  if (totalPercentage > 100) {
    errors.push(`Total percentage (${totalPercentage}%) exceeds 100%`);
  }

  if (totalPercentage < 0) {
    errors.push('Total percentage cannot be negative');
  }

  // Check individual categories
  Object.entries(categories).forEach(([key, value]) => {
    if (value < 0) {
      errors.push(`${key} percentage cannot be negative`);
    }
    if (value > 100) {
      errors.push(`${key} percentage cannot exceed 100%`);
    }
  });

  return {
    isValid: errors.length === 0,
    totalPercentage,
    errors,
  };
}

/**
 * Validates wants subcategories percentages
 */
export function validateWantsSubcategories(subcategories: BudgetSubcategory[]): {
  isValid: boolean;
  totalPercentage: number;
  errors: string[];
} {
  const errors: string[] = [];
  const totalPercentage = subcategories.reduce((sum, sub) => sum + sub.percentage, 0);

  if (totalPercentage > 100) {
    errors.push(`Wants subcategories total (${totalPercentage}%) exceeds 100%`);
  }

  subcategories.forEach((sub, index) => {
    if (sub.percentage < 0) {
      errors.push(`Subcategory "${sub.name}" has negative percentage`);
    }
    if (sub.percentage > 100) {
      errors.push(`Subcategory "${sub.name}" percentage exceeds 100%`);
    }
    if (!sub.name || sub.name.trim() === '') {
      errors.push(`Subcategory at index ${index} has no name`);
    }
  });

  return {
    isValid: errors.length === 0,
    totalPercentage,
    errors,
  };
}

/**
 * Calculate subcategory amounts based on parent category amount
 */
export function calculateSubcategories(
  parentAmount: number,
  subcategories: BudgetSubcategory[]
): BudgetSubcategory[] {
  return subcategories.map((sub) => ({
    ...sub,
    amount: parseFloat(((parentAmount * sub.percentage) / 100).toFixed(2)),
  }));
}

/**
 * Main budget calculation function
 */
export function calculateBudget(input: BudgetInput): BudgetResult {
  const errors: string[] = [];

  // Validate income
  if (input.monthlyIncome <= 0) {
    errors.push('Monthly income must be greater than 0');
  }

  // Validate main categories
  const categoryValidation = validateBudgetPercentages(input.categories);
  if (!categoryValidation.isValid) {
    errors.push(...categoryValidation.errors);
  }

  // Validate wants subcategories if provided
  if (input.wantsSubcategories && input.wantsSubcategories.length > 0) {
    const wantsValidation = validateWantsSubcategories(input.wantsSubcategories);
    if (!wantsValidation.isValid) {
      errors.push(...wantsValidation.errors);
    }
  }

  // If validation failed, return early with errors
  if (errors.length > 0) {
    return {
      monthlyIncome: input.monthlyIncome,
      totalAllocated: 0,
      unallocated: 0,
      categories: [],
      isValid: false,
      errors,
    };
  }

  // Calculate amounts for each category
  const categories: BudgetCategory[] = [
    {
      name: 'Rent/Mortgage',
      percentage: input.categories.rent,
      amount: parseFloat(((input.monthlyIncome * input.categories.rent) / 100).toFixed(2)),
    },
    {
      name: 'Food',
      percentage: input.categories.food,
      amount: parseFloat(((input.monthlyIncome * input.categories.food) / 100).toFixed(2)),
    },
    {
      name: 'Bills',
      percentage: input.categories.bills,
      amount: parseFloat(((input.monthlyIncome * input.categories.bills) / 100).toFixed(2)),
    },
    {
      name: 'Savings',
      percentage: input.categories.savings,
      amount: parseFloat(((input.monthlyIncome * input.categories.savings) / 100).toFixed(2)),
    },
    {
      name: 'Investments',
      percentage: input.categories.investments,
      amount: parseFloat(((input.monthlyIncome * input.categories.investments) / 100).toFixed(2)),
    },
  ];

  // Calculate wants category with subcategories
  const wantsAmount = parseFloat(((input.monthlyIncome * input.categories.wants) / 100).toFixed(2));
  const wantsCategory: BudgetCategory = {
    name: 'Wants',
    percentage: input.categories.wants,
    amount: wantsAmount,
  };

  if (input.wantsSubcategories && input.wantsSubcategories.length > 0) {
    wantsCategory.subcategories = calculateSubcategories(wantsAmount, input.wantsSubcategories);
  }

  categories.push(wantsCategory);

  // Calculate totals
  const totalAllocated = parseFloat(
    categories.reduce((sum, cat) => sum + (cat.amount || 0), 0).toFixed(2)
  );
  const unallocated = parseFloat((input.monthlyIncome - totalAllocated).toFixed(2));

  return {
    monthlyIncome: input.monthlyIncome,
    totalAllocated,
    unallocated,
    categories,
    isValid: true,
  };
}

/**
 * Format budget result for display
 */
export function formatBudgetSummary(result: BudgetResult): string {
  if (!result.isValid) {
    return `Budget calculation failed:\n${result.errors?.join('\n')}`;
  }

  let summary = `Monthly Income: $${result.monthlyIncome.toFixed(2)}\n`;
  summary += `Total Allocated: $${result.totalAllocated.toFixed(2)}\n`;
  summary += `Unallocated: $${result.unallocated.toFixed(2)}\n\n`;
  summary += 'Categories:\n';

  result.categories.forEach((cat) => {
    summary += `  ${cat.name}: ${cat.percentage}% = $${cat.amount?.toFixed(2)}\n`;
    if (cat.subcategories && cat.subcategories.length > 0) {
      cat.subcategories.forEach((sub) => {
        summary += `    - ${sub.name}: ${sub.percentage}% = $${sub.amount?.toFixed(2)}\n`;
      });
    }
  });

  return summary;
}
