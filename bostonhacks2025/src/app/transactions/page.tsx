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

export default function TransactionsPage() {
  const router = useRouter();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
  }, []);

  const loadTransactions = async (userId: string) => {
    try {
      const response = await fetch(`/api/transactions/history?userId=${userId}`);
      
      // Check if response is ok
      if (!response.ok) {
        console.error("API response not ok:", response.status, response.statusText);
        
        // If 404, the route might not be loaded yet - just show empty transactions
        if (response.status === 404) {
          console.warn("Transactions API not found (404) - showing empty list. Try restarting the dev server.");
          setTransactions([]);
          setError("Transactions feature is loading. Please refresh the page or restart the dev server.");
        } else {
          setError(`Failed to load transactions (${response.status})`);
        }
        setLoading(false);
        return;
      }

      // Check content type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", contentType);
        const text = await response.text();
        console.error("Response text:", text.substring(0, 200));
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

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!budget) {
      setError("No budget found");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/transactions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: budget.userId,
          category,
          amount: parseFloat(amount),
          description,
          merchantName: subcategory || "Manual Entry",
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        console.error("API response not ok:", response.status, response.statusText);
        const text = await response.text();
        console.error("Response:", text.substring(0, 200));
        setError(`Failed to add transaction (${response.status})`);
        setSubmitting(false);
        return;
      }

      // Check content type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", contentType);
        const text = await response.text();
        console.error("Response text:", text.substring(0, 200));
        setError("Server returned an invalid response");
        setSubmitting(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSuccess("Transaction added successfully!");
        // Reset form
        setCategory("");
        setSubcategory("");
        setAmount("");
        setDescription("");
        setDate(new Date().toISOString().split('T')[0]);
        setShowAddForm(false);
        
        // Reload transactions
        await loadTransactions(budget.userId);
      } else {
        setError(data.error || "Failed to add transaction");
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
      setError("Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/delete?id=${transactionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Delete failed:", response.status, response.statusText);
        setError(`Failed to delete transaction (${response.status})`);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", contentType);
        setError("Server returned an invalid response");
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSuccess("Transaction deleted successfully!");
        // Remove from local state
        setTransactions(transactions.filter(t => t._id !== transactionId));
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to delete transaction");
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError("Failed to delete transaction");
    }
  };

  const getCategoryOptions = () => {
    if (!budget) return [];
    return Object.keys(budget.categories).filter(
      (key) => budget.categories[key as keyof typeof budget.categories] !== undefined
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalSpent = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const getSpentByCategory = () => {
    const totals: Record<string, number> = {};
    transactions.forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    return totals;
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
            Please create or select a budget to view transactions.
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

  const categoryTotals = getSpentByCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
              <p className="text-slate-600 mt-1">Budget: {budget.name}</p>
            </div>
            <button
              onClick={() => router.push("/budget")}
              className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-100 text-slate-900"
            >
              Back to Budget
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-sky-50 p-4 rounded">
              <p className="text-sm text-slate-600">Total Transactions</p>
              <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-slate-600">Total Spent</p>
              <p className="text-2xl font-bold text-slate-900">${getTotalSpent().toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-slate-600">Monthly Income</p>
              <p className="text-2xl font-bold text-slate-900">${budget.monthlyIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Global Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        {/* Add Transaction Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            {showAddForm ? "Cancel" : "+ Add Transaction"}
          </button>
        </div>

        {/* Add Transaction Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Transaction</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Select category</option>
                    {getCategoryOptions().map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Subcategory / Merchant
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g., Grocery Store"
                    className="w-full border rounded px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full border rounded px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="What was this for?"
                  className="w-full border rounded px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-100 text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category Breakdown */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Spending by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(categoryTotals).map(([cat, total]) => (
                <div key={cat} className="border rounded p-3">
                  <p className="text-sm text-slate-600 capitalize">{cat}</p>
                  <p className="text-xl font-bold text-slate-900">${total.toFixed(2)}</p>
                  {budget.categories[cat as keyof typeof budget.categories] && (
                    <p className="text-xs text-slate-500">
                      of ${((budget.monthlyIncome * budget.categories[cat as keyof typeof budget.categories]!) / 100).toFixed(2)} budgeted
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Transaction History</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No transactions yet.</p>
              <p className="text-sm text-slate-500 mt-2">Add your first transaction to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-slate-900 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-medium">Category</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-medium">Description</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-medium">Subcategory</th>
                    <th className="text-right py-3 px-4 text-slate-900 font-medium">Amount</th>
                    <th className="text-right py-3 px-4 text-slate-900 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-700 text-sm">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 bg-sky-100 text-sky-800 rounded text-xs font-medium capitalize">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-900">{transaction.description}</td>
                      <td className="py-3 px-4 text-slate-600 text-sm">
                        {transaction.subcategory || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
