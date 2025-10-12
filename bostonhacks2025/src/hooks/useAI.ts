/**
 * Custom Hooks for AI Features
 * 
 * Provides React hooks for all AI-powered features including:
 * - Budget recommendations
 * - Budget analysis
 * - Wants subcategory suggestions
 * - Category-specific Q&A
 */

import { useState } from 'react';

/**
 * Hook for getting AI budget recommendations
 * 
 * @example
 * ```tsx
 * function BudgetRecommendations() {
 *   const { getRecommendations, recommendations, loading } = useAIRecommendations();
 * 
 *   const handleClick = async () => {
 *     await getRecommendations(5000, 'Save for a house');
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleClick}>Get Recommendations</button>
 *       {recommendations && <p>{recommendations}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAIRecommendations() {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async (
    monthlyIncome: number,
    userGoals?: string,
    currentBudget?: any
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyIncome,
          userGoals,
          currentBudget
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      return data.recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getRecommendations, recommendations, loading, error };
}

/**
 * Hook for AI budget analysis
 * 
 * @example
 * ```tsx
 * function BudgetAnalysis({ budgetResult }: { budgetResult: any }) {
 *   const { analyzeWithAI, analysis, loading } = useAIAnalysis();
 * 
 *   useEffect(() => {
 *     analyzeWithAI(budgetResult);
 *   }, [budgetResult]);
 * 
 *   return <div>{analysis}</div>;
 * }
 * ```
 */
export function useAIAnalysis() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeWithAI = async (budgetResult: any): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetResult })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Failed to get AI analysis';
        const debugInfo = data.hasApiKey !== undefined ? `(API Key present: ${data.hasApiKey})` : '';
        throw new Error(`${errorMsg} ${debugInfo}`);
      }

      setAnalysis(data.analysis);
      return data.analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeWithAI, analysis, loading, error };
}

/**
 * Hook for AI wants subcategory suggestions
 * 
 * @example
 * ```tsx
 * function WantsBreakdown() {
 *   const { getSuggestions, suggestions, loading } = useAIWantsSuggestions();
 * 
 *   const handleClick = async () => {
 *     await getSuggestions(1250, ['gaming', 'streaming', 'dining']);
 *   };
 * 
 *   return <div>{suggestions}</div>;
 * }
 * ```
 */
export function useAIWantsSuggestions() {
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = async (
    wantsAmount: number,
    userPreferences?: string[]
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/wants-subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wantsAmount,
          userPreferences
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI subcategory suggestions');
      }

      const data = await response.json();
      setSuggestions(data.recommendations);
      return data.recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getSuggestions, suggestions, loading, error };
}

/**
 * Hook for category-specific questions
 * 
 * @example
 * ```tsx
 * function CategoryAdvice() {
 *   const { askQuestion, answer, loading } = useCategoryQuestion();
 * 
 *   const handleAsk = async () => {
 *     await askQuestion(
 *       'food',
 *       'Where can I find affordable groceries?',
 *       'Boston, MA',
 *       750
 *     );
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleAsk}>Ask</button>
 *       {answer && <p>{answer}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCategoryQuestion() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = async (
    category: string,
    question: string,
    userLocation?: string,
    budgetAmount?: number
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/category-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          question,
          userLocation,
          budgetAmount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      setAnswer(data.answer);
      return data.answer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { askQuestion, answer, loading, error };
}
