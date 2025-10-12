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
      throw new Error('NESSIE_API_KEY is not configured');
    }

    console.log('Fetching customers from Nessie API...');
    const customers = await getCustomers();
    
    if (!customers || customers.length === 0) {
      throw new Error('No customers found in Nessie API');
    }

    console.log(`Found ${customers.length} customers`);

    // Pick a random customer
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    console.log(`Using customer: ${randomCustomer._id}`);

    // Get their purchases
    const purchases = await getCustomerPurchases(randomCustomer._id);
    
    if (!purchases || purchases.length === 0) {
      throw new Error('No purchases found for customer');
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

    console.log(`Successfully formatted ${transactions.length} transactions`);
    return transactions;
  } catch (error) {
    console.error('Error generating sample transactions:', error);
    throw error;
  }
}

/**
 * Get all purchases from multiple customers (for more variety)
 */
export async function generateSampleTransactionsFromAllCustomers(
  limit: number = 20
): Promise<FormattedTransaction[]> {
  try {
    if (!NESSIE_API_KEY) {
      throw new Error('NESSIE_API_KEY is not configured');
    }

    console.log('Fetching customers from Nessie API...');
    const customers = await getCustomers();
    
    if (!customers || customers.length === 0) {
      throw new Error('No customers found in Nessie API');
    }

    console.log(`Found ${customers.length} customers, fetching purchases...`);

    const allTransactions: FormattedTransaction[] = [];

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

          allTransactions.push({
            merchantName,
            date: new Date(purchase.transaction_date),
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

    console.log(`Collected ${allTransactions.length} total transactions`);

    // Shuffle and limit
    const shuffled = allTransactions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  } catch (error) {
    console.error('Error generating sample transactions:', error);
    throw error;
  }
}
