"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GetBudgetPage() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!userId.trim()) {
      setError('Enter a user id to search');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/budget/get?userId=${encodeURIComponent(userId.trim())}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || `Budget not found for ${userId}`);
        setLoading(false);
        return;
      }
      const budget = await res.json();
      // store budget in sessionStorage for budget page to pick up
      try { sessionStorage.setItem('lastBudget', JSON.stringify(budget)); } catch(_) {}
      // navigate to budget page with userId query
      router.push(`/budget?userId=${encodeURIComponent(userId.trim())}`);
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-xl font-bold mb-4 text-slate-800">Get a budget</h1>
        <p className="text-sm text-slate-700 mb-4">Enter the user id (username) used when creating the budget.</p>
        <form onSubmit={doSearch} className="space-y-3">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full border rounded p-2 placeholder:text-slate-400 focus:ring-1 focus:ring-sky-500 text-slate-900"
            style={{ color: 'var(--foreground)' }}
            placeholder="user123"
            aria-label="user id"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 btn-primary py-2" disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
            <button type="button" className="flex-1 btn-outline" onClick={() => { setUserId(''); setError(null); }}>Clear</button>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </form>
      </div>
    </div>
  );
}
