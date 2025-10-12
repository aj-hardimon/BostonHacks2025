"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

type Budget = {
  _id?: string;
  userId: string;
  name?: string;
  monthlyIncome: number;
  categories: Record<string, number>;
  wantsSubcategories?: { name: string; percentage: number }[];
  createdAt?: string;
};

export default function EditBudgetPage() {
  const router = useRouter();
  const { updateBudget } = useBudget();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>("income");
  const [monthlyIncome, setMonthlyIncome] = useState<number | "">("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [categories, setCategories] = useState<Categories>({
    rent: 30,
    food: 15,
    bills: 10,
    savings: 20,
    investments: 5,
    wants: 20,
  });

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
  const [saveLoading, setSaveLoading] = useState(false);
  const [calc, setCalc] = useState<CalcResult | null>(null);

  // Load budget from sessionStorage
  useEffect(() => {
    const storedBudget = sessionStorage.getItem('currentBudget');
    if (storedBudget) {
      try {
        const parsed = JSON.parse(storedBudget) as Budget;
        setBudget(parsed);
        
        // Pre-fill form with budget data
        setUsername(parsed.userId);
        setName(parsed.name || "");
        setMonthlyIncome(parsed.monthlyIncome);
        
        // Convert categories to the format expected by the form
        const cats: Categories = {
          rent: parsed.categories.rent || 0,
          food: parsed.categories.food || 0,
          bills: parsed.categories.bills || 0,
          savings: parsed.categories.savings || 0,
          investments: parsed.categories.investments || 0,
          wants: parsed.categories.wants || 0,
        };
        setCategories(cats);
        
        // Calculate initial amounts
        const amts: CategoryAmounts = {
          rent: (parsed.monthlyIncome * cats.rent) / 100,
          food: (parsed.monthlyIncome * cats.food) / 100,
          bills: (parsed.monthlyIncome * cats.bills) / 100,
          savings: (parsed.monthlyIncome * cats.savings) / 100,
          investments: (parsed.monthlyIncome * cats.investments) / 100,
          wants: (parsed.monthlyIncome * cats.wants) / 100,
        };
        setAmounts(amts);
        
        // Pre-fill wants subcategories
        if (parsed.wantsSubcategories) {
          setWantsSub(parsed.wantsSubcategories.map(sub => ({
            name: sub.name,
            percentage: sub.percentage
          })));
        }
        
        setLoading(false);
      } catch (e) {
        console.error('Failed to parse budget:', e);
        setError('Failed to load budget');
        setLoading(false);
      }
    } else {
      setError('No budget to edit. Please select a budget first.');
      setLoading(false);
    }
  }, []);

  // Recalculate amounts when income or percentages change
  useEffect(() => {
    if (monthlyIncome && Number(monthlyIncome) > 0) {
      const newAmounts: CategoryAmounts = {
        rent: Number(((categories.rent / 100) * Number(monthlyIncome)).toFixed(2)),
        food: Number(((categories.food / 100) * Number(monthlyIncome)).toFixed(2)),
        bills: Number(((categories.bills / 100) * Number(monthlyIncome)).toFixed(2)),
        savings: Number(((categories.savings / 100) * Number(monthlyIncome)).toFixed(2)),
        investments: Number(((categories.investments / 100) * Number(monthlyIncome)).toFixed(2)),
        wants: Number(((categories.wants / 100) * Number(monthlyIncome)).toFixed(2)),
      };
      setAmounts(newAmounts);
    }
  }, [monthlyIncome, categories]);

  function updateCategoryPercent(key: keyof Categories, percent: number) {
    setCategories((c) => ({ ...c, [key]: percent }));
    setAmounts((a) => ({
      ...a,
      [key]: monthlyIncome && Number(monthlyIncome) > 0 ? Number(((percent / 100) * Number(monthlyIncome)).toFixed(2)) : a[key],
    }));
  }

  function updateCategoryAmount(key: keyof CategoryAmounts, amount: number) {
    setAmounts((a) => ({ ...a, [key]: Number.isFinite(Number(amount)) ? Number(amount) : 0 }));
    if (monthlyIncome && Number(monthlyIncome) > 0) {
      const pct = (Number(amount) / Number(monthlyIncome)) * 100;
      setCategories((c) => ({ ...c, [key]: Number(pct.toFixed(2)) }));
    }
  }

  function updateWantsSubAmount(idx: number, dollars: number) {
    const wantsAmount = amounts.wants;
    if (wantsAmount <= 0) return;
    const pctOfWants = (dollars / wantsAmount) * 100;
    setWantsSub((subs) => {
      const next = [...subs];
      next[idx] = { ...next[idx], percentage: Number(pctOfWants.toFixed(2)) };
      return next;
    });
  }

  async function handleUpdate() {
    setError(null);
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    
    if (!name.trim()) {
      setError("Budget name is required");
      return;
    }
    
    setSaveLoading(true);
    try {
      const result = await updateBudget({
        userId: username.trim(),
        name,
        monthlyIncome: Number(monthlyIncome),
        categories,
        wantsSubcategories: wantsSub,
      });
      
      // Update sessionStorage with the updated budget
      if (result && result.budget) {
        sessionStorage.setItem('currentBudget', JSON.stringify(result.budget));
      }
      
      router.push("/budget");
    } catch (e) {
      setError("Failed to update budget");
    } finally {
      setSaveLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-slate-600">Loading budget...</div>
      </div>
    );
  }

  if (error && !budget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/budget')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Back to Budget
          </button>
        </div>
      </div>
    );
  }

  const percentTotal = Object.values(categories).reduce((s, v) => s + v, 0) + (wantsSub.reduce((s, w) => s + w.percentage, 0) - categories.wants);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-800">Edit Budget</h1>
            <p className="text-sm text-slate-600 mt-1">Update your budget details</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm">
              {(["income", "categories", "wants", "review"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === s ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {i + 1}
                  </div>
                  {i < 3 && <div className="w-16 h-0.5 bg-slate-200 mx-2" />}
                </div>
              ))}
            </div>
          </div>

          {error && <div className="mb-4 text-red-600">{error}</div>}

          {/* Income Step */}
          {step === "income" && (
            <div>
              <label className="block text-sm font-medium text-slate-800">Username (read-only)</label>
              <input 
                className="mt-1 block w-full border rounded px-3 py-2 text-slate-900 bg-slate-100" 
                value={username} 
                disabled
              />

              <label className="block text-sm font-medium text-slate-800 mt-4">Budget Name *</label>
              <input 
                className="mt-1 block w-full border rounded px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-sky-500" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., My 2025 Budget"
              />

              <label className="block text-sm font-medium text-slate-800 mt-4">Monthly Income</label>
              <input
                className="mt-1 block w-full border rounded px-3 py-2 text-slate-900 focus:ring-1 focus:ring-sky-500"
                type="number"
                value={monthlyIncome}
                onChange={(e) => {
                  const val = e.target.value === "" ? "" : Number(e.target.value);
                  setMonthlyIncome(val);
                }}
                placeholder="5000"
              />
            </div>
          )}

          {/* Categories Step */}
          {step === "categories" && (
            <div>
              <h2 className="text-lg font-medium mb-4">Adjust Category Percentages</h2>
              <p className="text-sm text-slate-600 mb-4">Total: {percentTotal.toFixed(1)}%</p>
              
              {(Object.keys(categories) as (keyof Categories)[]).map((key) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 capitalize mb-2">{key}</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={categories[key]}
                        onChange={(e) => updateCategoryPercent(key, Number(e.target.value))}
                        className="w-full border rounded px-3 py-2 text-slate-900"
                        placeholder="%"
                      />
                      <span className="text-xs text-slate-500">Percentage</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={amounts[key]}
                        onChange={(e) => updateCategoryAmount(key, Number(e.target.value))}
                        className="w-full border rounded px-3 py-2 text-slate-900"
                        placeholder="$"
                      />
                      <span className="text-xs text-slate-500">Dollar amount</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Wants Step */}
          {step === "wants" && (
            <div>
              <h2 className="text-lg font-medium mb-4">Wants Subcategories</h2>
              <p className="text-sm text-slate-600 mb-4">
                Break down your "wants" budget (${amounts.wants.toFixed(2)}) into subcategories
              </p>

              {wantsSub.map((sub, idx) => {
                const subAmount = (amounts.wants * sub.percentage) / 100;
                return (
                  <div key={idx} className="mb-4 p-3 border rounded">
                    <input
                      className="block w-full border rounded px-3 py-2 mb-2"
                      placeholder="Subcategory name"
                      value={sub.name}
                      onChange={(e) => {
                        const next = [...wantsSub];
                        next[idx] = { ...next[idx], name: e.target.value };
                        setWantsSub(next);
                      }}
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={sub.percentage}
                          onChange={(e) => {
                            const next = [...wantsSub];
                            next[idx] = { ...next[idx], percentage: Number(e.target.value) };
                            setWantsSub(next);
                          }}
                          className="w-full border rounded px-3 py-2 text-slate-900"
                          placeholder="% of wants"
                        />
                        <span className="text-xs text-slate-500">% of wants</span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={subAmount.toFixed(2)}
                          onChange={(e) => updateWantsSubAmount(idx, Number(e.target.value))}
                          className="w-full border rounded px-3 py-2 text-slate-900"
                          placeholder="$"
                        />
                        <span className="text-xs text-slate-500">Dollar amount</span>
                      </div>
                      <button
                        onClick={() => setWantsSub(wantsSub.filter((_, i) => i !== idx))}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setWantsSub([...wantsSub, { name: "", percentage: 0 }])}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
              >
                + Add Subcategory
              </button>
            </div>
          )}

          {/* Review Step */}
          {step === "review" && (
            <div>
              <h2 className="text-lg font-medium mb-4">Review Your Changes</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Username:</strong> {username}</p>
                <p><strong>Budget Name:</strong> {name}</p>
                <p><strong>Monthly Income:</strong> ${Number(monthlyIncome).toLocaleString()}</p>
                <div className="mt-4">
                  <strong>Categories:</strong>
                  <ul className="ml-4 mt-2">
                    {Object.entries(categories).map(([k, v]) => (
                      <li key={k} className="capitalize">
                        {k}: {v}% (${((Number(monthlyIncome) * v) / 100).toFixed(2)})
                      </li>
                    ))}
                  </ul>
                </div>
                {wantsSub.length > 0 && (
                  <div className="mt-4">
                    <strong>Wants Subcategories:</strong>
                    <ul className="ml-4 mt-2">
                      {wantsSub.map((sub, i) => (
                        <li key={i}>
                          {sub.name}: {sub.percentage}% of wants
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => {
                const steps: Step[] = ["income", "categories", "wants", "review"];
                const idx = steps.indexOf(step);
                if (idx > 0) setStep(steps[idx - 1]);
              }}
              disabled={step === "income"}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Back
            </button>

            {step !== "review" ? (
              <button
                onClick={() => {
                  const steps: Step[] = ["income", "categories", "wants", "review"];
                  const idx = steps.indexOf(step);
                  if (idx < steps.length - 1) setStep(steps[idx + 1]);
                }}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleUpdate}
                disabled={saveLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {saveLoading ? "Updating..." : "Update Budget"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
