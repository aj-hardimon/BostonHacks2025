"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Budget = {
  _id?: string;
  userId: string;
  name?: string;
  monthlyIncome: number;
  categories: Record<string, number>;
  wantsSubcategories?: { name: string; percentage: number }[];
  createdAt?: string;
};

export default function GetBudgetPage() {
  const router = useRouter();
  const [budgetName, setBudgetName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    
    if (!budgetName.trim()) {
      setError("Please enter a budget name");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/budget/get-by-name?name=${encodeURIComponent(budgetName)}`);
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || 'Budget not found');
        setLoading(false);
        return;
      }
      
      const budget = await res.json() as Budget;
      
      // Store the budget in sessionStorage so the budget page can display it
      sessionStorage.setItem('currentBudget', JSON.stringify(budget));
      
      // Navigate to budget page
      router.push('/budget');
    } catch (e) {
      setError('Network error');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Get Budget</h1>
        <p className="text-sm text-slate-600 mb-6">Search for a budget by name to view and manage it</p>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="budgetName" className="block text-sm font-medium text-slate-700 mb-2">
              Budget Name
            </label>
            <input
              type="text"
              id="budgetName"
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              placeholder="Enter budget name..."
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Searching..." : "Search Budget"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-slate-500">
            Don't have a budget yet?{" "}
            <a href="/create-budget" className="text-blue-600 hover:underline">
              Create one now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
