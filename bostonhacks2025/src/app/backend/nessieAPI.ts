/**
 * Nessie API Integration for Sample Transaction Generation
 */

const NESSIE_API_KEY = process.env.NESSIE_API_KEY || '';
const NESSIE_BASE_URL = 'http://api.nessieisreal.com';

export interface NessiePurchase {
  _id: string;
  type: string;
  transaction_date: string;
  status: string;
  medium: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  description: string;
  merchant_id?: string;
}

export interface NessieMerchant {
  _id: string;
  name: string;
  category: string[];
  address: {
    street_number: string;
    street_name: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface FormattedTransaction {
  merchantName: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
}

/**
 * Category mapping from Nessie merchant categories to our budget categories
 */
const CATEGORY_MAPPING: Record<string, string> = {
  // Food related
  'Food & Dining': 'food',
  'Groceries': 'food',
  'Restaurants': 'food',
  'Coffee Shops': 'food',
  'Fast Food': 'food',
  'Cafe': 'food',
  'Food': 'food',
  
  // Bills related
  'Utilities': 'bills',
  'Phone': 'bills',
  'Internet': 'bills',
  'Insurance': 'bills',
  'Cable': 'bills',
  'Gas': 'bills',
  'Electric': 'bills',
  'Water': 'bills',
  
  // Wants related
  'Entertainment': 'wants',
  'Shopping': 'wants',
  'Movies': 'wants',
  'Games': 'wants',
  'Streaming': 'wants',
  'Hobbies': 'wants',
  'Sports': 'wants',
  'Books': 'wants',
  'Clothing': 'wants',
  'Electronics': 'wants',
  'Travel': 'wants',
  'Recreation': 'wants',
  
  // Rent (less common in purchases, but possible)
  'Housing': 'rent',
  'Rent': 'rent',
  'Mortgage': 'rent',
  'Property': 'rent',
};

/**
 * Get all customers from Nessie API
 */
async function getCustomers(): Promise<any[]> {
  try {
    const response = await fetch(`${NESSIE_BASE_URL}/customers?key=${NESSIE_API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

/**
 * Get purchases for a specific customer
 */
async function getCustomerPurchases(customerId: string): Promise<NessiePurchase[]> {
  try {
    const response = await fetch(
      `${NESSIE_BASE_URL}/customers/${customerId}/purchases?key=${NESSIE_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch purchases: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching purchases for customer ${customerId}:`, error);
    return []; // Return empty array on error
  }
}

/**
 * Get merchant details
 */
async function getMerchant(merchantId: string): Promise<NessieMerchant | null> {
  try {
    const response = await fetch(`${NESSIE_BASE_URL}/merchants/${merchantId}?key=${NESSIE_API_KEY}`);
    if (!response.ok) {
      console.warn(`Failed to fetch merchant ${merchantId}: ${response.statusText}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.warn(`Error fetching merchant ${merchantId}:`, error);
    return null;
  }
}

/**
 * Map Nessie category to our budget category
 */
function mapToBudgetCategory(merchantCategories: string[]): string {
  if (!merchantCategories || merchantCategories.length === 0) {
    return 'wants'; // Default category
  }

  // Try to find a matching category
  for (const cat of merchantCategories) {
    if (CATEGORY_MAPPING[cat]) {
      return CATEGORY_MAPPING[cat];
    }
  }

  // Check if any category contains keywords
  const categoryStr = merchantCategories.join(' ').toLowerCase();
  if (categoryStr.includes('food') || categoryStr.includes('restaurant') || categoryStr.includes('grocery')) {
    return 'food';
  }
  if (categoryStr.includes('utility') || categoryStr.includes('phone') || categoryStr.includes('internet')) {
    return 'bills';
  }
  if (categoryStr.includes('rent') || categoryStr.includes('housing')) {
    return 'rent';
  }

  // If no match, default to wants
  return 'wants';
}

/**
 * Generate sample transactions from Nessie API
 */
export async function generateSampleTransactions(
  limit: number = 20
): Promise<FormattedTransaction[]> {
  try {
    if (!NESSIE_API_KEY) {
      console.warn('NESSIE_API_KEY is not configured, using example transactions');
      return generateExampleTransactions(limit);
    }

    console.log('Fetching customers from Nessie API...');
    const customers = await getCustomers();
    
    if (!customers || customers.length === 0) {
      console.warn('No customers found in Nessie API, using example transactions');
      return generateExampleTransactions(limit);
    }

    console.log(`Found ${customers.length} customers`);

    // Pick a random customer
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    console.log(`Using customer: ${randomCustomer._id}`);

    // Get their purchases
    const purchases = await getCustomerPurchases(randomCustomer._id);
    
    if (!purchases || purchases.length === 0) {
      console.warn('No purchases found for customer, using example transactions');
      return generateExampleTransactions(limit);
    }

    console.log(`Found ${purchases.length} purchases`);

    // Limit the number of purchases
    const limitedPurchases = purchases.slice(0, limit);

    // Format transactions with merchant info
    const transactions: FormattedTransaction[] = [];

    for (const purchase of limitedPurchases) {
      try {
        let merchantName = 'Unknown Merchant';
        let category = 'wants';

        // Try to get merchant info if merchant_id exists
        if (purchase.merchant_id) {
          const merchant = await getMerchant(purchase.merchant_id);
          if (merchant) {
            merchantName = merchant.name;
            category = mapToBudgetCategory(merchant.category);
          }
        }

        // Use description as fallback for merchant name
        if (merchantName === 'Unknown Merchant' && purchase.description) {
          merchantName = purchase.description;
        }

        transactions.push({
          merchantName,
          date: new Date(purchase.transaction_date),
          amount: purchase.amount,
          category,
          description: purchase.description || merchantName,
        });
      } catch (err) {
        console.error('Error processing purchase:', err);
        // Continue with next purchase
      }
    }

    console.log(`Successfully formatted ${transactions.length} transactions from Nessie API`);
    
    // If no transactions were formatted, use examples
    if (transactions.length === 0) {
      console.warn('No transactions could be formatted from Nessie API, using example transactions');
      return generateExampleTransactions(limit);
    }
    
    return transactions;
  } catch (error) {
    console.error('Error generating sample transactions from Nessie API:', error);
    console.warn('Falling back to example transactions');
    return generateExampleTransactions(limit);
  }
}

/**
 * Generate realistic example transactions (fallback when Nessie API has no data)
 * @param limit Number of transactions to generate
 * @param monthlyIncome Optional monthly income to scale transaction amounts appropriately
 */
export function generateExampleTransactions(limit: number = 20, monthlyIncome?: number): FormattedTransaction[] {
  const exampleMerchants = [
    // Food
    { name: 'Whole Foods', category: 'food', description: 'Grocery shopping', minAmount: 40, maxAmount: 150 },
    { name: 'Trader Joe\'s', category: 'food', description: 'Groceries', minAmount: 30, maxAmount: 120 },
    { name: 'Starbucks', category: 'food', description: 'Coffee and snacks', minAmount: 5, maxAmount: 15 },
    { name: 'Chipotle', category: 'food', description: 'Lunch', minAmount: 10, maxAmount: 20 },
    { name: 'McDonald\'s', category: 'food', description: 'Fast food', minAmount: 7, maxAmount: 15 },
    { name: 'Subway', category: 'food', description: 'Sandwich', minAmount: 8, maxAmount: 12 },
    { name: 'Target', category: 'food', description: 'Groceries and household items', minAmount: 50, maxAmount: 200 },
    { name: 'Safeway', category: 'food', description: 'Weekly groceries', minAmount: 60, maxAmount: 180 },
    { name: 'Panera Bread', category: 'food', description: 'Lunch', minAmount: 10, maxAmount: 18 },
    { name: 'Dunkin\' Donuts', category: 'food', description: 'Coffee and breakfast', minAmount: 5, maxAmount: 12 },
    
    // Bills
    { name: 'Comcast', category: 'bills', description: 'Internet service', minAmount: 60, maxAmount: 120 },
    { name: 'Verizon', category: 'bills', description: 'Phone bill', minAmount: 70, maxAmount: 150 },
    { name: 'Pacific Gas & Electric', category: 'bills', description: 'Utilities - Electric', minAmount: 80, maxAmount: 200 },
    { name: 'Water Company', category: 'bills', description: 'Utilities - Water', minAmount: 40, maxAmount: 80 },
    { name: 'State Farm', category: 'bills', description: 'Insurance payment', minAmount: 100, maxAmount: 300 },
    { name: 'AT&T', category: 'bills', description: 'Phone and internet', minAmount: 80, maxAmount: 150 },
    
    // Wants
    { name: 'Amazon', category: 'wants', description: 'Online shopping', minAmount: 15, maxAmount: 200 },
    { name: 'Netflix', category: 'wants', description: 'Streaming subscription', minAmount: 15, maxAmount: 20 },
    { name: 'Spotify', category: 'wants', description: 'Music subscription', minAmount: 10, maxAmount: 15 },
    { name: 'AMC Theatres', category: 'wants', description: 'Movie tickets', minAmount: 12, maxAmount: 40 },
    { name: 'Barnes & Noble', category: 'wants', description: 'Books', minAmount: 15, maxAmount: 60 },
    { name: 'Best Buy', category: 'wants', description: 'Electronics', minAmount: 30, maxAmount: 500 },
    { name: 'Nike', category: 'wants', description: 'Athletic wear', minAmount: 50, maxAmount: 200 },
    { name: 'Target', category: 'wants', description: 'Shopping', minAmount: 25, maxAmount: 150 },
    { name: 'Steam', category: 'wants', description: 'Video games', minAmount: 10, maxAmount: 60 },
    { name: 'Apple Store', category: 'wants', description: 'Tech purchase', minAmount: 50, maxAmount: 1000 },
    { name: 'H&M', category: 'wants', description: 'Clothing', minAmount: 30, maxAmount: 120 },
    { name: 'Zara', category: 'wants', description: 'Clothing', minAmount: 40, maxAmount: 150 },
    { name: 'GameStop', category: 'wants', description: 'Video games', minAmount: 20, maxAmount: 70 },
    { name: 'Hulu', category: 'wants', description: 'Streaming subscription', minAmount: 12, maxAmount: 18 },
    
    // Rent
    { name: 'Property Management Co.', category: 'rent', description: 'Monthly rent', minAmount: 1000, maxAmount: 2500 },
    { name: 'Landlord Payment', category: 'rent', description: 'Rent payment', minAmount: 1200, maxAmount: 3000 },
  ];

  const transactions: FormattedTransaction[] = [];
  const now = new Date();
  
  // Scale amounts based on monthly income (if provided)
  const incomeScale = monthlyIncome ? monthlyIncome / 5000 : 1; // Base scale on $5000 income
  const cappedScale = Math.min(Math.max(incomeScale, 0.5), 3); // Cap between 0.5x and 3x

  for (let i = 0; i < limit; i++) {
    // Pick a random merchant
    const merchant = exampleMerchants[Math.floor(Math.random() * exampleMerchants.length)];
    
    // Generate random amount within merchant's range, scaled by income
    const baseAmount = Math.random() * (merchant.maxAmount - merchant.minAmount) + merchant.minAmount;
    const scaledAmount = baseAmount * cappedScale;
    const amount = Number(scaledAmount.toFixed(2));
    
    // Spread dates over last 30 days with more variance
    // Use a mix of recent and older transactions
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursOffset = Math.floor(Math.random() * 24); // Add random hours for more spread
    const minutesOffset = Math.floor(Math.random() * 60); // Add random minutes
    
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - hoursOffset);
    date.setMinutes(date.getMinutes() - minutesOffset);
    
    transactions.push({
      merchantName: merchant.name,
      date: date,
      amount: amount,
      category: merchant.category,
      description: merchant.description,
    });
  }

  // Sort by date (most recent first)
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Get all purchases from multiple customers (for more variety)
 * @param limit Number of transactions to generate
 * @param monthlyIncome Optional monthly income to scale transaction amounts appropriately
 */
export async function generateSampleTransactionsFromAllCustomers(
  limit: number = 20,
  monthlyIncome?: number
): Promise<FormattedTransaction[]> {
  try {
    if (!NESSIE_API_KEY) {
      console.warn('NESSIE_API_KEY is not configured, using example transactions');
      return generateExampleTransactions(limit, monthlyIncome);
    }

    console.log('Fetching customers from Nessie API...');
    const customers = await getCustomers();
    
    if (!customers || customers.length === 0) {
      console.warn('No customers found in Nessie API, using example transactions');
      return generateExampleTransactions(limit, monthlyIncome);
    }

    console.log(`Found ${customers.length} customers, fetching purchases...`);

    const allTransactions: FormattedTransaction[] = [];
    const now = new Date();

    // Get purchases from first 5 customers to get variety
    const customersToQuery = customers.slice(0, Math.min(5, customers.length));
    
    for (const customer of customersToQuery) {
      try {
        const purchases = await getCustomerPurchases(customer._id);
        
        for (const purchase of purchases) {
          let merchantName = 'Unknown Merchant';
          let category = 'wants';

          if (purchase.merchant_id) {
            const merchant = await getMerchant(purchase.merchant_id);
            if (merchant) {
              merchantName = merchant.name;
              category = mapToBudgetCategory(merchant.category);
            }
          }

          // Use description as fallback
          if (merchantName === 'Unknown Merchant' && purchase.description) {
            merchantName = purchase.description;
          }

          // Spread transaction dates over last 30 days
          const daysAgo = Math.floor(Math.random() * 30);
          const hoursOffset = Math.floor(Math.random() * 24);
          const date = new Date(now);
          date.setDate(date.getDate() - daysAgo);
          date.setHours(date.getHours() - hoursOffset);

          allTransactions.push({
            merchantName,
            date: date, // Use spread date instead of original purchase date
            amount: purchase.amount,
            category,
            description: purchase.description || merchantName,
          });
        }
      } catch (err) {
        console.error(`Failed to get purchases for customer ${customer._id}:`, err);
        // Continue with next customer
      }
    }

    console.log(`Collected ${allTransactions.length} total transactions from Nessie API`);

    // If no transactions found from Nessie, use examples
    if (allTransactions.length === 0) {
      console.warn('No transactions found from Nessie API, using example transactions');
      return generateExampleTransactions(limit, monthlyIncome);
    }

    // Shuffle and limit
    const shuffled = allTransactions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  } catch (error) {
    console.error('Error generating sample transactions from Nessie API:', error);
    console.warn('Falling back to example transactions');
    return generateExampleTransactions(limit, monthlyIncome);
  }
}
