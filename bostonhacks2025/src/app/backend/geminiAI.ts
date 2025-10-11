/**
 * Google Gemini AI Integration for Budget Assistance
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BudgetInput, BudgetResult, formatBudgetSummary } from './budgetCalculator';

let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize Gemini AI
 */
export function initializeGemini(): GoogleGenerativeAI {
  if (genAI) {
    return genAI;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not defined');
  }

  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

/**
 * Get budget recommendations from Gemini
 */
export async function getBudgetRecommendations(
  monthlyIncome: number,
  userGoals?: string,
  currentBudget?: BudgetInput
): Promise<string> {
  const ai = initializeGemini();
  const model = ai.getGenerativeModel({ model: 'gemini-pro' });

  let prompt = `You are a financial advisor helping someone create a budget. 
Monthly Income: $${monthlyIncome}

Please suggest a budget breakdown with percentages for the following categories:
- Rent/Mortgage
- Food
- Bills (phone, insurance, utilities, etc.)
- Savings
- Investments
- Wants (entertainment, shopping, hobbies, etc.)

The percentages should add up to 100% or less.`;

  if (userGoals) {
    prompt += `\n\nUser's financial goals: ${userGoals}`;
  }

  if (currentBudget) {
    prompt += `\n\nCurrent budget allocation:
- Rent: ${currentBudget.categories.rent}%
- Food: ${currentBudget.categories.food}%
- Bills: ${currentBudget.categories.bills}%
- Savings: ${currentBudget.categories.savings}%
- Investments: ${currentBudget.categories.investments}%
- Wants: ${currentBudget.categories.wants}%

Please review this budget and provide suggestions for improvement.`;
  }

  prompt += `\n\nProvide your recommendations in a clear, helpful manner with explanations for each category.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Get subcategory suggestions for the "Wants" category
 */
export async function getWantsSubcategoryRecommendations(
  wantsAmount: number,
  userPreferences?: string[]
): Promise<string> {
  const ai = initializeGemini();
  const model = ai.getGenerativeModel({ model: 'gemini-pro' });

  let prompt = `You are helping someone organize their discretionary spending budget.
They have allocated $${wantsAmount.toFixed(2)} per month for "Wants" (entertainment, hobbies, etc.).

Please suggest subcategories and percentage breakdowns for this "Wants" budget.
Common subcategories might include:
- Streaming services (Netflix, Spotify, etc.)
- Gaming (games, subscriptions, in-game purchases)
- Dining out
- Shopping (clothes, gadgets, etc.)
- Hobbies
- Social activities

The percentages should add up to 100% or less.`;

  if (userPreferences && userPreferences.length > 0) {
    prompt += `\n\nUser's interests: ${userPreferences.join(', ')}`;
  }

  prompt += `\n\nProvide specific subcategories with recommended percentages and brief explanations.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Analyze budget and provide insights
 */
export async function analyzeBudget(budgetResult: BudgetResult): Promise<string> {
  const ai = initializeGemini();
  const model = ai.getGenerativeModel({ model: 'gemini-pro' });

  const budgetSummary = formatBudgetSummary(budgetResult);

  const prompt = `You are a financial advisor analyzing a user's budget. Here is their budget:

${budgetSummary}

Please provide:
1. An overall assessment of the budget
2. Strengths of this budget allocation
3. Areas for improvement
4. Specific actionable recommendations
5. Any warnings or concerns

Be encouraging but honest in your analysis.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Answer budget-related questions
 */
export async function askBudgetQuestion(
  question: string,
  budgetContext?: BudgetResult
): Promise<string> {
  const ai = initializeGemini();
  const model = ai.getGenerativeModel({ model: 'gemini-pro' });

  let prompt = `You are a helpful financial advisor assistant. Answer the following question about budgeting:

Question: ${question}`;

  if (budgetContext) {
    const budgetSummary = formatBudgetSummary(budgetContext);
    prompt += `\n\nUser's current budget:\n${budgetSummary}`;
  }

  prompt += `\n\nProvide a clear, helpful answer that is practical and actionable.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
