"use client";

import { useEffect, useState } from "react";

type Budget = {
  _id?: string;
  userId: string;
  monthlyIncome: number;
  categories: Record<string, number>;
  wantsSubcategories?: { name: string; percentage: number }[];
  createdAt?: string;
};

export default function BudgetHome() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/budget/get?userId=demo-user');
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError(j.error || 'Failed to load budget');
          setLoading(false);
          return;
        }
        const j = await res.json();
        setBudget(j as Budget);
      } catch (e) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="p-8">Loading budget…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!budget) return <div className="p-8">No budget found.</div>;

  return (
    <div className="min-h-screen flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-4">Your Budget</h1>
        <p className="text-sm text-slate-700 mb-4">Monthly income: ${budget.monthlyIncome}</p>
        <div className="border rounded p-4 mb-4">
          <div className="grid grid-cols-3 gap-2 font-semibold text-sm mb-2 text-slate-800">
            <div>Category</div>
            <div className="text-right">%</div>
            <div className="text-right">$</div>
          </div>
          <div className="space-y-2">
            {Object.entries(budget.categories).map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2 text-sm text-slate-700">
                <div className="truncate">{k}</div>
                <div className="text-right">{v}%</div>
                <div className="text-right">${((budget.monthlyIncome * v) / 100).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {budget.wantsSubcategories && budget.wantsSubcategories.length > 0 && (
          <div className="mb-4">
            <h2 className="font-medium text-slate-800">Wants breakdown</h2>
            <ul className="mt-2 text-sm text-slate-700">
              {budget.wantsSubcategories.map((w, i) => (
                <li key={i}>{w.name}: {w.percentage}% = ${(budget.monthlyIncome * w.percentage / 100).toFixed(2)}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-sm text-slate-600">Saved: {budget.createdAt ? new Date(budget.createdAt).toLocaleString() : '—'}</div>
      </div>
    </div>
  );
}
