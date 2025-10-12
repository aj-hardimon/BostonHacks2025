# Budget Visualization Feature - Pie Charts

## Overview

Added a collapsible "Budget Visualizations" section on the budget page that displays two interactive pie charts:
1. **Budget Allocation** - Shows how the monthly income is divided across categories
2. **Actual Spending This Month** - Shows real spending from transactions

## Location

The pie charts section is positioned between "Budget Breakdown" and "Wants Subcategories" sections on the budget page.

## Features

### 🎨 Interactive Pie Charts

**Chart 1: Budget Allocation**
- Shows planned budget distribution
- Displays percentages for each category
- Labels show: "Category: X%"
- Tooltips show dollar amounts
- Uses consistent category colors

**Chart 2: Actual Spending This Month**
- Shows real transaction data
- Displays percentages of total spending (not dollar amounts)
- Labels show: "Category: X%" for easy comparison with budget
- Tooltips show actual dollar amounts spent
- Uses same category colors for consistency
- Shows "No spending data yet" message if no transactions

### 🎯 Collapsible UI

- **Default State**: Collapsed (hidden)
- **Toggle Button**: Click "Budget Visualizations" header
- **Visual Indicator**: Arrow (▶ when collapsed, ▼ when expanded)
- **Smooth Transition**: Clean expand/collapse animation
- **Responsive Design**: Side-by-side on large screens, stacked on mobile

### 🌈 Category Color Coding

Consistent colors across both charts:
- **Rent**: Blue (#3b82f6)
- **Food**: Green (#10b981)
- **Bills**: Amber (#f59e0b)
- **Savings**: Purple (#8b5cf6)
- **Investments**: Cyan (#06b6d4)
- **Wants**: Pink (#ec4899)
- **Default**: Gray (#6b7280)

## Technical Implementation

### Dependencies

```json
{
  "recharts": "^2.x.x"
}
```

Installed with: `npm install recharts`

### Component Structure

```tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
```

### State Management

```typescript
const [showCharts, setShowCharts] = useState(false); // Controls expand/collapse
```

### Data Transformation

**Budget Allocation Data:**
```typescript
{
  name: "Rent",
  value: 1500.00,  // Dollar amount
  percentage: 30    // Percentage of total
}
```

**Actual Spending Data:**
```typescript
{
  name: "Food",
  value: 456.78,       // Actual dollar amount (used for chart size)
  percentage: 35.2,    // Percentage of total spending
  displayPercentage: "35.2" // String for label display
}
```

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  Budget Visualizations                               ▼  │ ← Expandable Header
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │  Budget Allocation   │  │  Actual Spending     │    │
│  │                      │  │  This Month          │    │
│  │   [Pie Chart 1]      │  │  [Pie Chart 2]       │    │
│  │                      │  │                      │    │
│  │  • Rent: 30%         │  │  • Food: 35.2%       │    │
│  │  • Food: 20%         │  │  • Bills: 28.5%      │    │
│  │  • Bills: 15%        │  │  • Wants: 24.8%      │    │
│  │  • Wants: 20%        │  │  • Rent: 11.5%       │    │
│  │  • Savings: 10%      │  │                      │    │
│  │  • Investments: 5%   │  │                      │    │
│  └──────────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Code Example

### Budget Allocation Chart
```tsx
<PieChart>
  <Pie
    data={Object.entries(budget.categories).map(([category, percentage]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: Number(((budget.monthlyIncome * percentage) / 100).toFixed(2)),
      percentage: percentage
    }))}
    cx="50%"
    cy="50%"
    labelLine={false}
    label={({ name, percentage }) => `${name}: ${percentage}%`}
    outerRadius={80}
    dataKey="value"
  >
    {Object.entries(budget.categories).map((entry, index) => (
      <Cell 
        key={`cell-${index}`} 
        fill={CATEGORY_COLORS[entry[0]] || CATEGORY_COLORS.default}
      />
    ))}
  </Pie>
  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
  <Legend />
</PieChart>
```

### Actual Spending Chart
```tsx
<PieChart>
  <Pie
    data={Object.entries(monthSummary.categorySpending).map(([category, amount]) => {
      const totalSpent = Object.values(monthSummary.categorySpending).reduce((sum, val) => sum + val, 0);
      const percentage = totalSpent > 0 
        ? ((amount / totalSpent) * 100).toFixed(1)
        : '0';
      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: Number(amount.toFixed(2)),
        percentage: Number(percentage),
        displayPercentage: percentage
      };
    })}
    cx="50%"
    cy="50%"
    labelLine={false}
    label={({ name, displayPercentage }) => `${name}: ${displayPercentage}%`}
    outerRadius={80}
    dataKey="value"
  >
    {/* Category-specific colors */}
  </Pie>
  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
  <Legend />
</PieChart>
```

## User Experience

### First Time (No Transactions)
1. User sees "Budget Visualizations" section (collapsed)
2. Clicks to expand
3. Left chart shows budget allocation
4. Right chart shows "No spending data yet" message

### With Transactions
1. User expands section
2. Both charts display with data
3. Can compare planned vs actual spending visually
4. Hover over slices for detailed tooltips
5. Click legend items to toggle categories

### Mobile View
- Charts stack vertically
- Full width for better visibility
- Scrollable if needed
- Touch-friendly tooltips

## Benefits

✅ **Visual Comparison** - Both charts use percentages for easy side-by-side comparison
✅ **Interactive** - Hover for details, toggle legend items
✅ **Collapsible** - Doesn't clutter the page when collapsed
✅ **Responsive** - Works on all screen sizes
✅ **Color Coded** - Easy category identification
✅ **Professional** - Clean, modern chart design
✅ **Informative** - Percentages on labels, dollar amounts in tooltips

## Data Requirements

**For Budget Chart:**
- Requires: `budget.categories` and `budget.monthlyIncome`
- Always available when budget is loaded

**For Spending Chart:**
- Requires: `monthSummary.categorySpending`
- Populated by `/api/budget/month-summary` endpoint
- Needs transactions to have data
- Gracefully handles empty state

## Future Enhancements

- [ ] Add trend lines (compare to previous months)
- [ ] Export charts as images
- [ ] Toggle between pie and donut charts
- [ ] Add bar chart comparison view
- [ ] Show over/under budget indicators
- [ ] Filter by date range
- [ ] Compare multiple months side-by-side
- [ ] Add drill-down to subcategories

## Files Modified

### 1. `/src/app/budget/page.tsx`

**Added Imports:**
```typescript
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
```

**Added State:**
```typescript
const [showCharts, setShowCharts] = useState(false);
```

**Added Constants:**
```typescript
const CATEGORY_COLORS: Record<string, string> = { ... };
```

**Added Section:**
- Collapsible container with toggle button
- Two pie charts (budget allocation & actual spending)
- Responsive grid layout
- Empty state handling

## Testing

### Manual Testing Steps

1. **Navigate to Budget Page**
   ```
   http://localhost:3001/budget
   ```

2. **Load a Budget**
   - Search for existing budget or create new one

3. **Expand Charts Section**
   - Click "Budget Visualizations" header
   - Verify arrow changes from ▶ to ▼
   - Charts should appear

4. **Verify Budget Chart**
   - Should show all budget categories
   - Percentages should match "Budget Breakdown" section
   - Hover over slices for tooltips
   - Check legend accuracy

5. **Verify Spending Chart**
   - If no transactions: Should show "No spending data yet"
   - If transactions exist: Should show category breakdown
   - Dollar amounts should match transaction totals
   - Colors should match budget chart

6. **Test Collapse**
   - Click header again
   - Charts should hide
   - Arrow should change back to ▶

7. **Test Responsive Design**
   - Resize browser window
   - Charts should stack on mobile
   - Should remain readable at all sizes

### Edge Cases

- ✅ No transactions yet (shows empty state)
- ✅ Only one category has spending
- ✅ Budget with many categories (6+)
- ✅ Very large amounts (thousands)
- ✅ Very small amounts (cents)
- ✅ Zero spending in some categories

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Performance

- Charts render smoothly
- No lag on expand/collapse
- SVG-based (scalable, crisp)
- Lightweight (~39 packages added)

---

**Implementation Date**: October 12, 2025
**Status**: ✅ Complete and Tested
**Library**: Recharts 2.x
