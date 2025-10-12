"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Transaction = {
  _id: string;
  userId: string;
  budgetId: string;
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
};

type Budget = {
  _id: string;
  userId: string;
  name: string;
  monthlyIncome: number;
  categories: {
    rent?: number;
    food?: number;
    bills?: number;
    savings?: number;
    investments?: number;
    wants?: number;
  };
};

type CategoryProgress = {
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: 'good' | 'warning' | 'over';
};

export default function WeeklyProgressPage() {
  const router = useRouter();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.

  // Load budget and transactions
  useEffect(() => {
    const budgetData = sessionStorage.getItem("currentBudget");
    if (budgetData) {
      try {
        const parsedBudget = JSON.parse(budgetData);
        setBudget(parsedBudget);
        if (parsedBudget.userId) {
          loadTransactions(parsedBudget.userId);
        } else {
          setLoading(false);
          setError("Budget is missing userId");
        }
      } catch (err) {
        console.error("Error parsing budget:", err);
        setLoading(false);
        setError("Invalid budget data");
      }
    } else {
      setLoading(false);
      setError("No budget found. Please create or select a budget first.");
    }
  }, [weekOffset]);

  const getWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Monday as start of week
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { start: monday, end: sunday };
  };

  const loadTransactions = async (userId: string) => {
    try {
      const { start, end } = getWeekDates();
      const response = await fetch(
        `/api/transactions/history?userId=${userId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      
      if (!response.ok) {
        console.error("API response not ok:", response.status, response.statusText);
        if (response.status === 404) {
          console.warn("Transactions API not found - showing empty list");
          setTransactions([]);
        } else {
          setError(`Failed to load transactions (${response.status})`);
        }
        setLoading(false);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", contentType);
        setError("Server returned an invalid response");
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.transactions || []);
      } else {
        setError(data.error || "Failed to load transactions");
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError("Failed to load transactions: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryProgress = (): CategoryProgress[] => {
    if (!budget) return [];

    const categorySpending: Record<string, number> = {};
    transactions.forEach(t => {
      const cat = t.category.toLowerCase();
      categorySpending[cat] = (categorySpending[cat] || 0) + t.amount;
    });

    const weeklyBudgetFactor = 1 / 4; // Assuming 4 weeks in a month

    return Object.entries(budget.categories).map(([category, percentage]) => {
      const monthlyBudget = (budget.monthlyIncome * percentage) / 100;
      const weeklyBudget = monthlyBudget * weeklyBudgetFactor;
      const spent = categorySpending[category] || 0;
      const remaining = weeklyBudget - spent;
      const percentUsed = weeklyBudget > 0 ? (spent / weeklyBudget) * 100 : 0;

      let status: 'good' | 'warning' | 'over' = 'good';
      if (percentUsed > 100) status = 'over';
      else if (percentUsed > 80) status = 'warning';

      return {
        name: category,
        budgeted: weeklyBudget,
        spent,
        remaining,
        percentUsed,
        status,
      };
    });
  };

  const getTotalSpent = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalWeeklyBudget = () => {
    if (!budget) return 0;
    return (budget.monthlyIncome / 4); // Weekly budget is 1/4 of monthly
  };

  const getOverallStatus = () => {
    const totalBudget = getTotalWeeklyBudget();
    const totalSpent = getTotalSpent();
    const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    if (percentUsed > 100) return { status: 'over', color: 'red' };
    if (percentUsed > 80) return { status: 'warning', color: 'yellow' };
    return { status: 'good', color: 'green' };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getWeekLabel = () => {
    if (weekOffset === 0) return "This Week";
    if (weekOffset === -1) return "Last Week";
    if (weekOffset === 1) return "Next Week";
    return `${Math.abs(weekOffset)} Weeks ${weekOffset < 0 ? 'Ago' : 'Ahead'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-900">Loading...</p>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">No Budget Found</h1>
          <p className="text-slate-700 mb-4">
            Please create or select a budget to view weekly progress.
          </p>
          <button
            onClick={() => router.push("/budget")}
            className="w-full px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
          >
            Go to Budget
          </button>
        </div>
      </div>
    );
  }

  const { start, end } = getWeekDates();
  const categoryProgress = getCategoryProgress();
  const overallStatus = getOverallStatus();
  const totalSpent = getTotalSpent();
  const totalBudget = getTotalWeeklyBudget();
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Weekly Progress</h1>
              <p className="text-slate-600 mt-1">Budget: {budget.name}</p>
            </div>
            <button
              onClick={() => router.push("/budget")}
              className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-100 text-slate-900"
            >
              Back to Budget
            </button>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mt-6 p-4 bg-slate-50 rounded-lg">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
            >
              ← Previous Week
            </button>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{getWeekLabel()}</p>
              <p className="text-sm text-slate-600">
                {formatDate(start)} - {formatDate(end)}
              </p>
            </div>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              disabled={weekOffset >= 0}
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Week →
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Overall Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Overall Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-slate-600">Weekly Budget</p>
              <p className="text-2xl font-bold text-slate-900">${totalBudget.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-slate-600">Total Spent</p>
              <p className="text-2xl font-bold text-slate-900">${totalSpent.toFixed(2)}</p>
            </div>
            <div className={`${totalRemaining >= 0 ? 'bg-green-50' : 'bg-red-50'} p-4 rounded`}>
              <p className="text-sm text-slate-600">Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ${Math.abs(totalRemaining).toFixed(2)}
                {totalRemaining < 0 && ' over'}
              </p>
            </div>
            <div className={`bg-${overallStatus.color}-50 p-4 rounded`}>
              <p className="text-sm text-slate-600">Status</p>
              <p className="text-2xl font-bold text-slate-900 capitalize">{overallStatus.status}</p>
              <p className="text-sm text-slate-600 mt-1">
                {((totalSpent / totalBudget) * 100).toFixed(1)}% used
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Transactions This Week</h2>
              <p className="text-slate-600 mt-1">{transactions.length} transactions recorded</p>
            </div>
            <button
              onClick={() => router.push("/transactions")}
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            >
              View All Transactions
            </button>
          </div>
        </div>

        {/* Category Progress */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Category Breakdown</h2>
          <div className="space-y-4">
            {categoryProgress.map((cat) => (
              <div key={cat.name} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 capitalize">{cat.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    cat.status === 'good' ? 'bg-green-100 text-green-800' :
                    cat.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {cat.status === 'good' ? '✓ On Track' :
                     cat.status === 'warning' ? '⚠ High Usage' :
                     '✗ Over Budget'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-slate-600">Budgeted</p>
                    <p className="font-semibold text-slate-900">${cat.budgeted.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Spent</p>
                    <p className="font-semibold text-slate-900">${cat.spent.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Remaining</p>
                    <p className={`font-semibold ${cat.remaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      ${Math.abs(cat.remaining).toFixed(2)}
                      {cat.remaining < 0 && ' over'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      cat.status === 'good' ? 'bg-green-500' :
                      cat.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(cat.percentUsed, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-600 mt-1 text-right">
                  {cat.percentUsed.toFixed(1)}% used
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Spending (if there are transactions) */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Daily Spending</h2>
            <div className="space-y-2">
              {(() => {
                const dailyTotals: Record<string, number> = {};
                transactions.forEach(t => {
                  const date = new Date(t.date).toLocaleDateString();
                  dailyTotals[date] = (dailyTotals[date] || 0) + t.amount;
                });

                return Object.entries(dailyTotals)
                  .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                  .map(([date, total]) => (
                    <div key={date} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded">
                      <span className="text-slate-900 font-medium">{date}</span>
                      <span className="text-slate-900 font-bold">${total.toFixed(2)}</span>
                    </div>
                  ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
