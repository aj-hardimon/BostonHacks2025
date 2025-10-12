# 🤖 AI Assistant Feature Guide

## Overview

The AI Assistant is an **interactive chat interface** powered by **Google Gemini AI** that provides personalized budget advice, comprehensive analysis, and smart recommendations.

## Access Points

The AI Assistant can be accessed from multiple places:

1. **Home Page** - Click the "🤖 AI Assistant" button
2. **Budget Page** - Click the "🤖 AI Assistant" button in Budget Actions
3. **Create Budget Page** - Click "Get AI Budget Recommendations" during category allocation

## Features

### 1. 💬 Chat Mode
**Interactive Q&A about budgeting**

- Ask any budgeting-related questions
- Get personalized advice based on your current budget
- Real-time responses from Gemini AI
- Examples:
  - "How can I save more money?"
  - "Should I prioritize savings or investments?"
  - "What's a good emergency fund amount?"

### 2. 📊 Analyze Mode
**Comprehensive Budget Analysis**

Provides a complete evaluation of your current budget:
- ✅ **Overall Assessment** - Is your budget balanced?
- 💪 **Strengths** - What you're doing well
- ⚠️ **Areas for Improvement** - Where you can optimize
- 🎯 **Actionable Recommendations** - Specific steps to improve
- 🚨 **Warnings** - Financial concerns to address

**How to Use:**
1. Click "Analyze" tab
2. Click "Analyze My Budget" button
3. Review the comprehensive AI analysis

### 3. 💡 Recommendations Mode
**Personalized Budget Tips**

Get AI-suggested budget allocations based on:
- Your monthly income
- Financial goals (optional)
- Current budget (for improvement suggestions)

**How to Use:**
1. Click "Tips" tab
2. Optionally enter your financial goals:
   - "Save for a house down payment"
   - "Pay off student loans"
   - "Build emergency fund"
3. Click "Get Recommendations"
4. Review suggested category percentages

**Output Example:**
```
Based on your $5,000 monthly income and goal to save for a house:

Rent/Mortgage: 30% ($1,500)
Food: 12% ($600)
Bills: 10% ($500)
Savings: 25% ($1,250) ⬆️ Increased for down payment
Investments: 8% ($400)
Wants: 15% ($750)

Recommendations:
- Increase savings to 25% to reach your down payment goal faster
- Consider reducing wants slightly to boost savings
- Your rent is optimal at 30% of income
```

### 4. 🎯 Wants Subcategories Mode
**Smart Spending Breakdown**

Get intelligent subcategory suggestions for your discretionary spending:
- Based on your Wants budget amount
- Personalized to your interests
- Includes percentage allocations

**How to Use:**
1. Click "Wants" tab
2. Optionally enter your interests (comma-separated):
   - "Gaming, Dining out, Movies, Shopping"
3. Click "Get Subcategory Suggestions"
4. Review AI-generated subcategories

**Output Example:**
```
For your $1,000 Wants budget with interests in Gaming and Dining:

Dining Out: 35% ($350)
- Restaurants and social meals
- Budget-friendly tip: Set a per-meal limit

Gaming: 30% ($300)
- Game purchases and subscriptions
- Consider waiting for sales

Streaming Services: 15% ($150)
- Netflix, Spotify, etc.
- Bundle subscriptions when possible

Shopping: 15% ($150)
- Clothes, gadgets, etc.
- Use the 24-hour rule before purchasing

Hobbies: 5% ($50)
- Creative activities and supplies
```

## Technical Details

### API Endpoints Used

1. **`POST /api/ai/recommendations`**
   - Input: `monthlyIncome`, `userGoals`, `currentBudget`
   - Returns: Personalized budget recommendations

2. **`POST /api/ai/analyze`**
   - Input: `budgetResult` (full budget object)
   - Returns: Comprehensive budget analysis

3. **`POST /api/ai/wants-subcategories`**
   - Input: `wantsAmount`, `userPreferences`
   - Returns: Subcategory suggestions with percentages

### AI Model

- **Model:** Google Gemini 2.5 Flash
- **Provider:** Google Generative AI
- **API Key:** Required in `.env.local` as `GEMINI_API_KEY`

### Chat Interface

- **Message Types:**
  - 🟦 **User Messages** - Your questions (blue)
  - 🟩 **AI Responses** - Gemini answers (gray)
  - 🟨 **System Messages** - Notifications (light blue border)

- **Features:**
  - Message history with timestamps
  - Loading indicator while AI thinks
  - Scrollable chat window (max 500px)
  - Current budget display at bottom

## Usage Tips

### For Best Results:

1. **Be Specific** - The more details you provide, the better the advice
   - ❌ "Help with budget"
   - ✅ "I make $4,000/month and want to save for retirement while paying off $20k in student loans"

2. **Use Goals** - Enter your financial goals in Recommendations mode
   - Goals help AI tailor advice to your situation
   - Examples: "Emergency fund", "Retire early", "Buy a car"

3. **Ask Follow-ups** - Use Chat mode for conversational back-and-forth
   - AI remembers context within the session
   - Ask for clarification or deeper dives

4. **Multiple Modes** - Use different modes for different needs
   - **Analyze** - When you want validation
   - **Recommendations** - When starting from scratch
   - **Wants** - When budgeting discretionary spending
   - **Chat** - For specific questions

### Example Workflow:

1. Create your budget (rough estimates)
2. Use **Analyze Mode** to get feedback
3. Use **Recommendations Mode** to see expert suggestions
4. Adjust your budget based on AI advice
5. Use **Wants Mode** to break down discretionary spending
6. Use **Chat Mode** for ongoing questions

## Integration with App

### Current Budget Display

At the bottom of the AI Assistant page, you'll see:
- 💰 Monthly Income
- 📊 Total Allocated

This helps you and the AI stay aligned on your current financial situation.

### Navigation

- **Back to Budget** button in header
- All modes accessible from the page
- Seamless integration with budget creation workflow

## Error Handling

The AI Assistant handles errors gracefully:

- ⚠️ **No Budget Found** - Prompts you to create a budget first
- ❌ **API Failure** - Shows error message with retry option
- 🔄 **Loading States** - Clear "Thinking..." indicator

## Privacy & Security

- All AI requests include only budget data (no personal identifiable information)
- API key is server-side only (not exposed to client)
- Chat history is session-based (not persisted)
- MongoDB stores only budget numbers, not AI conversations

## Future Enhancements

Potential improvements:
- [ ] Persistent chat history
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Spending trend analysis integration
- [ ] Comparison with similar budgets
- [ ] AI-powered transaction categorization
- [ ] Proactive tips based on spending patterns

## Troubleshooting

### AI Not Responding
1. Check `.env.local` has `GEMINI_API_KEY`
2. Verify API key is valid
3. Check browser console for errors
4. Restart dev server

### "Create a Budget First" Error
1. Go to `/create-budget`
2. Complete the wizard
3. Return to AI Assistant

### Unexpected Responses
1. Try rephrasing your question
2. Be more specific with details
3. Use the appropriate mode for your need

## Resources

- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [Frontend Integration Guide](./README_FRONTEND.md)
- [Backend API Documentation](./README_BACKEND.md)

---

**Built with ❤️ for BostonHacks 2025**
