"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StreakDisplay from "@/components/StreakDisplay";

type Budget = {
  _id?: string;
  userId: string;
  name?: string;
  monthlyIncome: number;
  categories: Record<string, number>;
  wantsSubcategories?: { name: string; percentage: number }[];
  createdAt?: string;
};

type MonthSummary = {
  totalSpent: number;
  budgetRemaining: number;
  percentUsed: number;
  categorySpending: Record<string, number>;
};

export default function BudgetHome() {
  const router = useRouter();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [monthSummary, setMonthSummary] = useState<MonthSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get budget from sessionStorage (set by create-budget)
    const storedBudget = sessionStorage.getItem('currentBudget');
    
    if (storedBudget) {
      try {
        const parsed = JSON.parse(storedBudget);
        setBudget(parsed);
        loadMonthSummary(parsed.userId);
      } catch (e) {
        console.error('Failed to parse stored budget:', e);
      }
    }
  }, []);

  const loadMonthSummary = async (userId: string) => {
    try {
      const response = await fetch(`/api/budget/month-summary?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMonthSummary(data.summary);
        }
      }
    } catch (err) {
      console.error("Error loading month summary:", err);
    }
  };

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    
    if (!searchName.trim()) {
      setError("Please enter a budget name");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/budget/get-by-name?name=${encodeURIComponent(searchName)}`);
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || 'Budget not found');
        setLoading(false);
        return;
      }
      
      const fetchedBudget = await res.json() as Budget;
      setBudget(fetchedBudget);
      
      // Store in sessionStorage for persistence
      sessionStorage.setItem('currentBudget', JSON.stringify(fetchedBudget));
      setSearchName("");
      setError(null);
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Search Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800 mb-4">Budget Manager</h1>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="budgetName" className="block text-sm font-medium text-slate-700 mb-2">
                Search Budget by Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="budgetName"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Enter budget name..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Budget Display */}
        {budget ? (
          <>
            {/* Header with Streak */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-slate-800 mb-1">
                    {budget.name || "Your Budget"}
                  </h2>
                  <p className="text-sm text-slate-600 mb-4">User: {budget.userId}</p>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-green-600">
                      ${budget.monthlyIncome.toLocaleString()}
                    </span>
                    <span className="text-slate-600">/ month</span>
                  </div>
                  
                  {budget.createdAt && (
                    <p className="text-xs text-slate-500 mt-2">
                      Created: {new Date(budget.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Streak Display */}
                <div className="ml-6">
                  <StreakDisplay userId={budget.userId} size="medium" />
                </div>
              </div>
            </div>

            {/* Monthly Summary */}
            {monthSummary && (
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">This Month's Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm text-slate-600">Total Budget</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${budget.monthlyIncome.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <p className="text-sm text-slate-600">Spent This Month</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${monthSummary.totalSpent.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {monthSummary.percentUsed.toFixed(1)}% used
                    </p>
                  </div>
                  <div className={`${monthSummary.budgetRemaining >= 0 ? 'bg-green-50' : 'bg-red-50'} p-4 rounded`}>
                    <p className="text-sm text-slate-600">Remaining</p>
                    <p className={`text-2xl font-bold ${monthSummary.budgetRemaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      ${Math.abs(monthSummary.budgetRemaining).toFixed(2)}
                      {monthSummary.budgetRemaining < 0 && ' over'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Resets on the 1st
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Budget Categories */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Budget Breakdown</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 font-semibold text-sm text-slate-600 pb-2 border-b">
                  <div>Category</div>
                  <div className="text-right">Percentage</div>
                  <div className="text-right">Amount</div>
                </div>
                
                {Object.entries(budget.categories).map(([category, percentage]) => {
                  const amount = (budget.monthlyIncome * percentage) / 100;
                  return (
                    <div key={category} className="grid grid-cols-3 gap-2 text-sm py-2 hover:bg-slate-50 rounded px-2">
                      <div className="font-medium capitalize text-slate-700">{category}</div>
                      <div className="text-right text-slate-600">{percentage}%</div>
                      <div className="text-right font-semibold text-slate-800">
                        ${amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wants Subcategories */}
            {budget.wantsSubcategories && budget.wantsSubcategories.length > 0 && (
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Wants Breakdown</h3>
                <div className="space-y-2">
                  {budget.wantsSubcategories.map((sub, idx) => {
                    const amount = (budget.monthlyIncome * sub.percentage) / 100;
                    return (
                      <div key={idx} className="flex justify-between items-center py-2 px-3 hover:bg-slate-50 rounded">
                        <span className="text-sm font-medium text-slate-700">{sub.name}</span>
                        <div className="text-right">
                          <span className="text-sm text-slate-600">{sub.percentage}%</span>
                          <span className="text-sm font-semibold text-slate-800 ml-4">
                            ${amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons - Features Placeholder */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Budget Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => router.push('/edit-budget')}
                  className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Edit Budget
                </button>
                <button 
                  onClick={() => router.push('/transactions')}
                  className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  View Transactions
                </button>
                <button 
                  onClick={() => router.push('/weekly-progress')}
                  className="px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium"
                >
                  Weekly Progress
                </button>
                <button 
                  onClick={() => router.push('/transactions')}
                  className="px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
                >
                  Add Transaction
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">No Budget Loaded</h2>
            <p className="text-slate-600 mb-6">Search for a budget by name above, or create a new one</p>
            <a
              href="/create-budget"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Create New Budget
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
