"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBudget } from "@/context/BudgetContext";

type Step = "income" | "categories" | "wants" | "review";

type Categories = {
  rent: number;
  food: number;
  bills: number;
  savings: number;
  investments: number;
  wants: number;
};

type CategoryAmounts = {
  rent: number;
  food: number;
  bills: number;
  savings: number;
  investments: number;
  wants: number;
};

type CalcResult = {
  monthlyIncome: number;
  totalAllocated: number;
  unallocated: number;
  categories: { name: string; percentage: number; amount?: number }[];
  isValid: boolean;
  errors?: string[];
};

export default function CreateBudgetWizard() {
  const router = useRouter();
  const { createBudget } = useBudget();

  const [step, setStep] = useState<Step>("income");
  const [monthlyIncome, setMonthlyIncome] = useState<number | "">("");
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<Categories>({
    rent: 30,
    food: 15,
    bills: 10,
    savings: 20,
    investments: 5,
    wants: 20,
  });

  // Keep a parallel state for dollar amounts for each main category. These
  // are kept in sync with percentages when possible.
  const [amounts, setAmounts] = useState<CategoryAmounts>({
    rent: 0,
    food: 0,
    bills: 0,
    savings: 0,
    investments: 0,
    wants: 0,
  });

  const [wantsSub, setWantsSub] = useState<Array<{ name: string; percentage: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [calc, setCalc] = useState<CalcResult | null>(null);

  function updateCategory(key: keyof Categories, value: number) {
    setCategories((c) => ({ ...c, [key]: value }));
  }

  function updateCategoryPercent(key: keyof Categories, percent: number) {
    // update percent, and compute dollar amount if income is present
    setCategories((c) => ({ ...c, [key]: percent }));
    setAmounts((a) => ({
      ...a,
      [key]: monthlyIncome && Number(monthlyIncome) > 0 ? Number(((percent / 100) * Number(monthlyIncome)).toFixed(2)) : a[key],
    }));
  }

  function updateCategoryAmount(key: keyof CategoryAmounts, amount: number) {
    setAmounts((a) => ({ ...a, [key]: Number.isFinite(Number(amount)) ? Number(amount) : 0 }));
    // update percentage if income exists
    if (monthlyIncome && Number(monthlyIncome) > 0) {
      const pct = (Number(amount) / Number(monthlyIncome)) * 100;
      setCategories((c) => ({ ...c, [key]: Number(pct.toFixed(2)) }));
    }
  }

  // Ensure amounts are recalculated whenever income or the category percentages change
  useEffect(() => {
    if (monthlyIncome !== "" && Number(monthlyIncome) > 0) {
      setAmounts(() => {
        const next: any = {};
        (Object.keys(categories) as (keyof Categories)[]).forEach((k) => {
          const pct = Number((categories as any)[k]) || 0;
          next[k] = Number(((pct / 100) * Number(monthlyIncome)).toFixed(2));
        });
        return next as CategoryAmounts;
      });
    }
  }, [monthlyIncome, categories]);

  function addWantsSub() {
    setWantsSub((s) => [...s, { name: "", percentage: 0 }]);
  }

  function updateWantsSub(idx: number, key: "name" | "percentage", value: string | number) {
    setWantsSub((s) => s.map((w, i) => (i === idx ? { ...w, [key]: value } : w)));
  }

  function removeWantsSub(idx: number) {
    setWantsSub((s) => s.filter((_, i) => i !== idx));
  }

  async function fetchCalculation() {
    setError(null);
    if (!monthlyIncome || Number(monthlyIncome) <= 0) {
      setError("Please enter a valid monthly income");
      setStep("income");
      return null;
    }

    try {
      const res = await fetch("/api/budget/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyIncome: Number(monthlyIncome),
          categories,
          wantsSubcategories: wantsSub,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Calculation failed");
        return null;
      }

      setCalc(json as CalcResult);
      return json as CalcResult;
    } catch (e) {
      setError("Calculation error");
      return null;
    }
  }

  async function handleCreate() {
    setError(null);
    setLoading(true);
    try {
      await createBudget({
        monthlyIncome: Number(monthlyIncome),
        categories,
        wantsSubcategories: wantsSub,
        name,
        userId: "demo-user",
      });
      router.push("/budget");
    } catch (e) {
      setError("Failed to save budget");
    } finally {
      setLoading(false);
    }
  }

  const percentTotal = Object.values(categories).reduce((s, v) => s + v, 0) + (wantsSub.reduce((s, w) => s + w.percentage, 0) - categories.wants);

  return (
    <div className="min-h-screen flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
  <div className="w-11/12 md:w-3/4 lg:w-2/3 bg-white shadow-md rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Create your budget</h1>
          <div className="text-sm text-slate-600">Step: {step}</div>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex gap-2 items-center">
            {(["income", "categories", "wants", "review"] as Step[]).map((s, i) => (
              <div key={s} className={`flex-1 text-center py-2 rounded ${step === s ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <span className={`font-medium ${step === s ? 'text-white' : 'text-slate-700'}`}>{i + 1}. {s}</span>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        {step === "income" && (
          <div>
            <label className="block text-sm font-medium text-slate-800">Name (optional)</label>
            <input className="mt-1 block w-full border rounded px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-sky-500" value={name} onChange={(e) => setName(e.target.value)} />

            <label className="block text-sm font-medium text-slate-800 mt-4">Monthly income</label>
            <input
              className="mt-1 block w-full border rounded px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-sky-500"
              type="number"
              value={monthlyIncome}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setMonthlyIncome(val);
                // if we have a numeric income, recalc amounts from current percentages
                if (val !== "" && Number(val) > 0) {
                  setAmounts((a) => {
                    const next: any = { ...a };
                    (Object.keys(categories) as (keyof Categories)[]).forEach((k) => {
                      next[k] = Number(((categories as any)[k] / 100) * Number(val));
                    });
                    return next as CategoryAmounts;
                  });
                }
              }}
            />

            <div className="mt-6 flex justify-end gap-2">
              <button className="px-4 py-2 rounded border text-slate-800" onClick={() => setStep("categories")}>Next</button>
            </div>
          </div>
        )}

        {step === "categories" && (
          <div>
            <p className="text-sm text-slate-700 mb-4">Allocate percentages for each category. Total should be ≤ 100%.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["rent", "food", "bills", "savings", "investments", "wants"] as (keyof Categories)[]).map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <label className="capitalize w-1/4 text-sm text-slate-800">{k}</label>
                    {/* percent input */}
                    <input
                      className="w-1/6 border rounded px-2 py-1 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-sky-500"
                    type="number"
                    value={(categories as any)[k]}
                    onChange={(e) => updateCategoryPercent(k, Number(e.target.value))}
                  />
                    <span className="text-sm text-slate-700">%</span>

                    {/* dollar input */}
                    <input
                      className="mx-4 w-1/3 border rounded px-2 py-1 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-sky-500"
                    type="number"
                    value={(amounts as any)[k]}
                    onChange={(e) => updateCategoryAmount(k, Number(e.target.value))}
                  />
                    <span className="text-sm text-slate-700">$</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button className="px-4 py-2 rounded border" onClick={() => setStep("income")}>Back</button>
              <div>
                <button className="px-4 py-2 rounded border mr-2" onClick={() => setStep("wants")}>Skip wants</button>
                <button className="px-4 py-2 rounded bg-sky-600 text-white" onClick={() => setStep("wants")}>Next</button>
              </div>
            </div>
          </div>
        )}

        {step === "wants" && (
          <div>
            <p className="text-sm text-slate-700 mb-4">Break down your Wants percentage into subcategories (each value is % of the Wants category)</p>
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 font-semibold text-sm mb-2 text-slate-800">
                <div className="col-span-6">Subcategory</div>
                <div className="col-span-2 text-right">% of Wants</div>
                <div className="col-span-2 text-right">% of Income</div>
                <div className="col-span-2 text-right">$</div>
              </div>

              {wantsSub.map((w, i) => {
                const wantsPct = Number(categories.wants) || 0; // e.g. 20
                const subPctOfWants = Number(w.percentage) || 0; // e.g. 20 means 20% of wants
                const subPctOfIncome = (wantsPct * subPctOfWants) / 100; // percent of total income
                const amount = monthlyIncome && Number(monthlyIncome) > 0 ? Number(((Number(monthlyIncome) * subPctOfIncome) / 100).toFixed(2)) : 0;
                return (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <input className="w-full border rounded px-2 py-1 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-sky-500" placeholder="Subcategory name" value={w.name} onChange={(e) => updateWantsSub(i, "name", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <input className="w-full text-right border rounded px-2 py-1" type="number" value={w.percentage} onChange={(e) => updateWantsSub(i, "percentage", Number(e.target.value))} />
                    </div>
                    <div className="col-span-2 text-right">{subPctOfIncome.toFixed(2)}%</div>
                    <div className="col-span-2 text-right">${amount.toFixed(2)}</div>
                    <div className="col-span-12 text-right mt-1">
                      <button className="px-2 py-1 border rounded" onClick={() => removeWantsSub(i)}>Remove</button>
                    </div>
                  </div>
                );
              })}

              <div>
                <button className="px-3 py-1 rounded border" onClick={addWantsSub}>Add subcategory</button>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button className="px-4 py-2 rounded border" onClick={() => setStep("categories")}>Back</button>
              <div>
                <button className="px-4 py-2 rounded border mr-2" onClick={async () => { await fetchCalculation(); setStep("review"); }}>Preview</button>
                <button className="px-4 py-2 rounded bg-sky-600 text-white" onClick={async () => { await fetchCalculation(); setStep("review"); }}>Review</button>
              </div>
            </div>
          </div>
        )}

        {step === "review" && (
          <div>
            <h3 className="text-lg font-medium text-slate-800">Preview</h3>
            <p className="text-sm text-slate-700">Name: {name || '(unnamed)'}</p>
            <p className="text-sm text-slate-700 mb-4">Monthly income: ${monthlyIncome}</p>

            <div className="border rounded p-4 mb-4">
              <div className="grid grid-cols-3 gap-2 font-semibold text-sm mb-2 text-slate-800">
                <div>Category</div>
                <div className="text-right">%</div>
                <div className="text-right">$</div>
              </div>
              <div className="space-y-2">
                {calc ? (
                  calc.categories.map((c, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 text-sm text-slate-700">
                      <div className="truncate">{c.name}</div>
                      <div className="text-right">{c.percentage}%</div>
                      <div className="text-right">${(c.amount ?? 0).toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  Object.entries(categories).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-3 gap-2 text-sm text-slate-700">
                      <div className="truncate">{k}</div>
                      <div className="text-right">{v}%</div>
                      <div className="text-right">${((amounts as any)[k] ?? 0).toFixed(2)}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 flex justify-between text-slate-800">
                <div className="text-sm">Total allocated: <strong>${calc ? calc.totalAllocated.toFixed(2) : '—'}</strong></div>
                <div className="text-sm">Unallocated: <strong>${calc ? calc.unallocated.toFixed(2) : '—'}</strong></div>
              </div>
            </div>

            <div className="flex justify-between">
              <button className="px-4 py-2 rounded border" onClick={() => setStep("wants")}>Back</button>
              <div>
                <button className="px-4 py-2 rounded border mr-2" onClick={() => { setCalc(null); setStep("categories"); }}>Edit allocations</button>
                <button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={handleCreate} disabled={loading}>{loading ? 'Saving...' : 'Create budget'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
