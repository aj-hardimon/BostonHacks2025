"use client";

import React, { createContext, useContext, useState } from "react";

export type Categories = {
  rent: number;
  food: number;
  bills: number;
  savings: number;
  investments: number;
  wants: number;
};

export type WantsSub = { name: string; percentage: number };

export type Budget = {
  id?: string;
  userId: string;
  name?: string;
  monthlyIncome: number;
  categories: Categories;
  wantsSubcategories?: WantsSub[];
  notes?: string;
};

type CreateBudgetOpts = Partial<Pick<Budget, 'userId' | 'name' | 'notes'>> & {
  monthlyIncome: number;
  categories: Categories;
  wantsSubcategories?: WantsSub[];
};

type BudgetContextType = {
  budgets: Budget[];
  createBudget: (opts: CreateBudgetOpts) => Promise<{ budget: Budget; savedToBackend: boolean }>;
  getLatest: () => Budget | undefined;
  reset: () => void;
};

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  async function createBudget(opts: CreateBudgetOpts) {
    const userId = opts.userId || "demo-user";

    const b: Budget = {
      id: undefined,
      userId,
      name: opts.name,
      monthlyIncome: opts.monthlyIncome,
      categories: opts.categories,
      wantsSubcategories: opts.wantsSubcategories || [],
      notes: opts.notes,
    };

    // Optimistically add locally
    setBudgets((s) => [b, ...s]);

    // Validate server-side via /api/budget/calculate
    try {
      const calcRes = await fetch("/api/budget/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyIncome: opts.monthlyIncome,
          categories: opts.categories,
          wantsSubcategories: opts.wantsSubcategories || [],
        }),
      });

      if (!calcRes.ok) {
        // validation failed, remove optimistic and return
        setBudgets((s) => s.filter((x) => x !== b));
        const err = await calcRes.json().catch(() => ({}));
        return { budget: b, savedToBackend: false };
      }

      const calcJson = await calcRes.json();

      // if valid, save to backend
      const payload = {
        userId,
        monthlyIncome: opts.monthlyIncome,
        categories: opts.categories,
        wantsSubcategories: opts.wantsSubcategories || [],
        name: opts.name,
        notes: opts.notes,
      };

      try {
        const saveRes = await fetch("/api/budget/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (saveRes.ok) {
          const saved = await saveRes.json();
          const reconciled: Budget = { ...b, id: saved._id || saved.id };
          setBudgets((s) => [reconciled, ...s.filter((x) => x !== b)]);

          // fire-and-forget notify POST so other services can react to the new budget
          (async () => {
            try {
              await fetch('/api/budget/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
              });
            } catch (err) {
              // ignore notify failures
            }
          })();

          return { budget: reconciled, savedToBackend: true };
        }
      } catch (e) {
        // ignore network error; fallback to local-only
      }
    } catch (e) {
      // ignore errors - keep local optimistic budget
    }

    return { budget: b, savedToBackend: false };
  }

  function getLatest() {
    return budgets.length ? budgets[0] : undefined;
  }

  function reset() {
    setBudgets([]);
  }

  const ctx: BudgetContextType = { budgets, createBudget, getLatest, reset };
  return <BudgetContext.Provider value={ctx}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const c = useContext(BudgetContext);
  if (!c) throw new Error("useBudget must be used inside BudgetProvider");
  return c;
}

export default BudgetContext;
