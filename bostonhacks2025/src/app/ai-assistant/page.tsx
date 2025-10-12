'use client';

import React, { useState, useEffect } from 'react';
import { useBudget, Budget } from '@/context/BudgetContext';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  id: number;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
};

type AssistantMode = 'chat' | 'analyze' | 'recommendations' | 'wants-subcategories';

// Convert Budget to BudgetResult format for AI
function budgetToBudgetResult(budget: Budget) {
  const categories = [
    { name: 'Rent', percentage: budget.categories.rent, amount: (budget.monthlyIncome * budget.categories.rent) / 100 },
    { name: 'Food', percentage: budget.categories.food, amount: (budget.monthlyIncome * budget.categories.food) / 100 },
    { name: 'Bills', percentage: budget.categories.bills, amount: (budget.monthlyIncome * budget.categories.bills) / 100 },
    { name: 'Savings', percentage: budget.categories.savings, amount: (budget.monthlyIncome * budget.categories.savings) / 100 },
    { name: 'Investments', percentage: budget.categories.investments, amount: (budget.monthlyIncome * budget.categories.investments) / 100 },
    { name: 'Wants', percentage: budget.categories.wants, amount: (budget.monthlyIncome * budget.categories.wants) / 100 },
  ];

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.amount, 0);

  return {
    monthlyIncome: budget.monthlyIncome,
    totalAllocated,
    unallocated: budget.monthlyIncome - totalAllocated,
    categories,
    isValid: true,
  };
}

export default function AIAssistantPage() {
  const { getLatest } = useBudget();
  const [budget, setBudget] = useState<Budget | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AssistantMode>('chat');
  const [userGoals, setUserGoals] = useState('');
  const [userPreferences, setUserPreferences] = useState('');

  // Load budget from context or sessionStorage
  useEffect(() => {
    const loadBudget = () => {
      // Try to get from context first
      let currentBudget = getLatest();
      
      // If not in context, try sessionStorage
      if (!currentBudget) {
        try {
          const stored = sessionStorage.getItem('currentBudget');
          if (stored) {
            currentBudget = JSON.parse(stored);
          }
        } catch (error) {
          console.error('Error loading budget from sessionStorage:', error);
        }
      }
      
      setBudget(currentBudget);
    };

    loadBudget();
    
    // Re-check when window gains focus (user might have created budget in another tab)
    window.addEventListener('focus', loadBudget);
    return () => window.removeEventListener('focus', loadBudget);
  }, [getLatest]);

  useEffect(() => {
    // Welcome message
    const welcomeMsg = budget 
      ? '🤖 Welcome to your AI Budget Assistant! I can see you have a budget loaded. Choose a mode below to get started with personalized advice.'
      : '🤖 Welcome to your AI Budget Assistant! Create a budget first to get personalized advice, or ask general budgeting questions in Chat mode.';
    
    setMessages([
      {
        id: 1,
        type: 'system',
        content: welcomeMsg,
        timestamp: new Date(),
      },
    ]);
  }, [budget]);

  const addMessage = (type: 'user' | 'ai' | 'system', content: string) => {
    const newMessage: Message = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleAnalyzeBudget = async () => {
    if (!budget) {
      addMessage('system', '❌ No budget found. Please go to the Budget page or Create Budget page to set up your budget first, then come back here.');
      return;
    }

    setIsLoading(true);
    addMessage('user', '📊 Analyze my current budget');

    try {
      const budgetResult = budgetToBudgetResult(budget);
      
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetResult }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze budget');
      }

      const data = await response.json();
      addMessage('ai', data.analysis);
    } catch (error) {
      console.error('Error analyzing budget:', error);
      addMessage('system', '❌ Failed to analyze budget. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!budget) {
      addMessage('system', '❌ No budget found. Please go to the Budget page or Create Budget page to set up your budget first, then come back here.');
      return;
    }

    setIsLoading(true);
    const goalsText = userGoals.trim() 
      ? `My goals: ${userGoals}` 
      : 'Get budget recommendations for my income';
    addMessage('user', goalsText);

    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyIncome: budget.monthlyIncome,
          userGoals: userGoals.trim() || undefined,
          currentBudget: {
            monthlyIncome: budget.monthlyIncome,
            categories: budget.categories,
            wantsSubcategories: budget.wantsSubcategories,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      addMessage('ai', data.recommendations);
      setUserGoals('');
    } catch (error) {
      console.error('Error getting recommendations:', error);
      addMessage('system', '❌ Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetWantsSubcategories = async () => {
    if (!budget) {
      addMessage('system', '❌ No budget found. Please go to the Budget page or Create Budget page to set up your budget first, then come back here.');
      return;
    }

    setIsLoading(true);
    const prefsText = userPreferences.trim()
      ? `Suggest subcategories for my Wants budget. My interests: ${userPreferences}`
      : 'Suggest subcategories for my Wants budget';
    addMessage('user', prefsText);

    try {
      const wantsAmount = (budget.monthlyIncome * budget.categories.wants) / 100;

      const response = await fetch('/api/ai/wants-subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wantsAmount,
          userPreferences: userPreferences.trim() 
            ? userPreferences.split(',').map((p) => p.trim()) 
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get subcategory recommendations');
      }

      const data = await response.json();
      addMessage('ai', data.recommendations);
      setUserPreferences('');
    } catch (error) {
      console.error('Error getting wants subcategories:', error);
      addMessage('system', '❌ Failed to get subcategory recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomQuestion = async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    addMessage('user', inputMessage);
    const question = inputMessage;
    setInputMessage('');

    try {
      // For now, we'll use the recommendations endpoint for general Q&A
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyIncome: budget?.monthlyIncome || 5000,
          userGoals: question,
          currentBudget: budget ? {
            monthlyIncome: budget.monthlyIncome,
            categories: budget.categories,
            wantsSubcategories: budget.wantsSubcategories,
          } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      addMessage('ai', data.recommendations);
    } catch (error) {
      console.error('Error asking question:', error);
      addMessage('system', '❌ Failed to get answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                🤖 AI Budget Assistant
              </h1>
              <p className="text-slate-600 mt-2">
                Get personalized budget advice powered by Gemini AI
              </p>
              {budget && (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-2">
                  ✓ Budget loaded: {budget.name || 'Unnamed Budget'} (${budget.monthlyIncome.toLocaleString()}/month)
                </p>
              )}
              {!budget && (
                <p className="text-sm text-amber-600 mt-1 flex items-center gap-2">
                  ⚠️ No budget loaded - Create one first for personalized advice
                </p>
              )}
            </div>
            <Link
              href="/budget"
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
            >
              ← Back to Budget
            </Link>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            <button
              onClick={() => setMode('chat')}
              className={`px-4 py-3 rounded-lg font-semibold transition ${
                mode === 'chat'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setMode('analyze')}
              className={`px-4 py-3 rounded-lg font-semibold transition ${
                mode === 'analyze'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📊 Analyze
            </button>
            <button
              onClick={() => setMode('recommendations')}
              className={`px-4 py-3 rounded-lg font-semibold transition ${
                mode === 'recommendations'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              💡 Tips
            </button>
            <button
              onClick={() => setMode('wants-subcategories')}
              className={`px-4 py-3 rounded-lg font-semibold transition ${
                mode === 'wants-subcategories'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🎯 Wants
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.type === 'user'
                      ? 'bg-indigo-600 text-white'
                      : msg.type === 'ai'
                      ? 'bg-slate-100'
                      : 'bg-blue-50 text-blue-900 border border-blue-200'
                  }`}
                >
                  <div className={`text-sm ${msg.type === 'ai' ? 'prose prose-sm max-w-none' : ''} ${msg.type === 'user' ? 'text-white' : ''}`}>
                    {msg.type === 'ai' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      msg.type === 'user' ? 'text-indigo-200' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-900 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-bounce">🤖</div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {mode === 'chat' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ask me anything about budgeting
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomQuestion()}
                  placeholder="e.g., How can I save more money?"
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleCustomQuestion}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {mode === 'analyze' && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                📊 Analyze Your Budget
              </h3>
              <p className="text-slate-600 mb-4">
                Get a comprehensive analysis of your current budget with strengths, weaknesses, and actionable recommendations.
              </p>
              <button
                onClick={handleAnalyzeBudget}
                disabled={isLoading || !budget}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {budget ? 'Analyze My Budget' : 'Create a Budget First'}
              </button>
            </div>
          )}

          {mode === 'recommendations' && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                💡 Get Budget Recommendations
              </h3>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What are your financial goals? (optional)
              </label>
              <textarea
                value={userGoals}
                onChange={(e) => setUserGoals(e.target.value)}
                placeholder="e.g., Save for a house down payment, Pay off debt, Build emergency fund"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 mb-4"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={handleGetRecommendations}
                disabled={isLoading || !budget}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {budget ? 'Get Recommendations' : 'Create a Budget First'}
              </button>
            </div>
          )}

          {mode === 'wants-subcategories' && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                🎯 Wants Subcategory Suggestions
              </h3>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What are your interests? (comma-separated, optional)
              </label>
              <input
                type="text"
                value={userPreferences}
                onChange={(e) => setUserPreferences(e.target.value)}
                placeholder="e.g., Gaming, Dining out, Movies, Shopping"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 mb-4"
                disabled={isLoading}
              />
              <button
                onClick={handleGetWantsSubcategories}
                disabled={isLoading || !budget}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {budget ? 'Get Subcategory Suggestions' : 'Create a Budget First'}
              </button>
            </div>
          )}
        </div>

        {/* Current Budget Info */}
        {budget && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              📋 Your Current Budget
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Monthly Income</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${budget.monthlyIncome.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Allocated</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${(() => {
                    const total = 
                      (budget.monthlyIncome * budget.categories.rent / 100) +
                      (budget.monthlyIncome * budget.categories.food / 100) +
                      (budget.monthlyIncome * budget.categories.bills / 100) +
                      (budget.monthlyIncome * budget.categories.savings / 100) +
                      (budget.monthlyIncome * budget.categories.investments / 100) +
                      (budget.monthlyIncome * budget.categories.wants / 100);
                    return total.toLocaleString();
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
