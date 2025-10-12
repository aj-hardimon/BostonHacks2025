"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();

  useEffect(() => {
    async function load() {
      setLoading(true);
      // 1) Check sessionStorage for a budget set by the get-budget page
      try {
        const cached = typeof window !== 'undefined' ? sessionStorage.getItem('lastBudget') : null;
        if (cached) {
          setBudget(JSON.parse(cached));
          setLoading(false);
          return;
        }
      } catch (e) {
        // ignore
      }

      // 2) Check query param userId
      const qUser = searchParams?.get('userId') || null;
      const userToQuery = qUser || 'demo-user';
      try {
        const res = await fetch(`/api/budget/get?userId=${encodeURIComponent(userToQuery)}`);
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

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Budget | null>(null);

  if (loading) return <div className="p-8">Loading budget…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!budget) return <div className="p-8">No budget found.</div>;

  return (
    <div className="min-h-screen flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-4">Your Budget</h1>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-700">Monthly income: ${budget.monthlyIncome}</p>
          <div className="flex gap-2">
            {!editing && <button className="btn-outline px-3 py-1 text-sm" onClick={() => { setDraft(budget); setEditing(true); }}>Edit</button>}
            {editing && <button className="btn-muted px-3 py-1 text-sm" onClick={() => { setEditing(false); setDraft(null); }}>Cancel</button>}
          </div>
        </div>
        <div className="border rounded p-4 mb-4">
          <div className="grid grid-cols-3 gap-2 font-semibold text-sm mb-2 text-slate-800">
            <div>Category</div>
            <div className="text-right">%</div>
            <div className="text-right">$</div>
          </div>
          <div className="space-y-2">
            {Object.entries((editing && draft) ? draft.categories : budget.categories).map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2 text-sm text-slate-700 items-center">
                <div className="truncate">{k}</div>
                <div className="text-right">
                  {editing && draft ? (
                    <input
                      type="number"
                      className="w-20 text-right border rounded p-1"
                      value={(draft.categories as any)[k] ?? v}
                      onChange={(e) => {
                        const val = Number(e.target.value || 0);
                        setDraft((d) => d ? ({ ...d, categories: { ...d.categories, [k]: val } }) : d);
                      }}
                    />
                  ) : (
                    `${v}%`
                  )}
                </div>
                <div className="text-right">${(((editing && draft) ? draft.monthlyIncome : budget.monthlyIncome) * v / 100).toFixed(2)}</div>
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

        {editing && draft && (
          <div className="mt-4">
            <div className="flex gap-2">
              <button
                className="btn-primary px-4 py-2"
                onClick={async () => {
                  // basic validation
                  if (!draft) return;
                  try {
                    const res = await fetch('/api/budget/save', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(draft),
                    });
                    if (!res.ok) {
                      const j = await res.json().catch(() => ({}));
                      alert(j.error || 'Failed to save budget');
                      return;
                    }
                    const saved = await res.json();
                    // update UI and cache
                    setBudget(saved);
                    try { sessionStorage.setItem('lastBudget', JSON.stringify(saved)); } catch(_) {}
                    setEditing(false);
                    setDraft(null);
                  } catch (e) {
                    alert('Network error saving budget');
                  }
                }}
              >Save</button>
              <button className="btn-muted" onClick={() => { setEditing(false); setDraft(null); }}>Cancel</button>
            </div>
          </div>
        )}

        <div className="text-sm text-slate-600">Saved: {budget.createdAt ? new Date(budget.createdAt).toLocaleString() : '—'}</div>
      </div>
    </div>
  );
}
