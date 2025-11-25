// Generate a unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

// Format price with currency
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CHF: 'CHF ',
  };
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${price.toFixed(2)}`;
};

// Format date
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Format date with time
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Category with icon information (Ionicons names)
export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
}

// Common product categories with icons
export const CATEGORY_INFO: CategoryInfo[] = [
  { name: 'Fruits & Vegetables', icon: 'leaf-outline', color: '#4CAF50' },
  { name: 'Dairy & Eggs', icon: 'egg-outline', color: '#FFC107' },
  { name: 'Meat & Seafood', icon: 'fish-outline', color: '#F44336' },
  { name: 'Bakery', icon: 'pizza-outline', color: '#795548' },
  { name: 'Pantry', icon: 'cube-outline', color: '#FF9800' },
  { name: 'Beverages', icon: 'beer-outline', color: '#2196F3' },
  { name: 'Snacks', icon: 'fast-food-outline', color: '#9C27B0' },
  { name: 'Frozen', icon: 'snow-outline', color: '#00BCD4' },
  { name: 'Household', icon: 'home-outline', color: '#607D8B' },
  { name: 'Personal Care', icon: 'body-outline', color: '#E91E63' },
  { name: 'Other', icon: 'ellipsis-horizontal-outline', color: '#9E9E9E' },
];

// Common product categories (names only for compatibility)
export const PRODUCT_CATEGORIES = CATEGORY_INFO.map(c => c.name);

// Common units
export const PRODUCT_UNITS = [
  'pcs',
  'kg',
  'g',
  'lb',
  'oz',
  'L',
  'ml',
  'pack',
  'bottle',
  'can',
  'box',
  'bag',
];

// Get category color
export const getCategoryColor = (category: string): string => {
  const info = CATEGORY_INFO.find(c => c.name === category);
  return info?.color || '#9E9E9E';
};

// Get category icon
export const getCategoryIcon = (category: string): string => {
  const info = CATEGORY_INFO.find(c => c.name === category);
  return info?.icon || 'ellipsis-horizontal-outline';
};

// Common products for autocomplete with their typical categories
export const COMMON_PRODUCTS: Array<{ name: string; category: string }> = [
  // Fruits & Vegetables
  { name: 'Apples', category: 'Fruits & Vegetables' },
  { name: 'Bananas', category: 'Fruits & Vegetables' },
  { name: 'Oranges', category: 'Fruits & Vegetables' },
  { name: 'Tomatoes', category: 'Fruits & Vegetables' },
  { name: 'Potatoes', category: 'Fruits & Vegetables' },
  { name: 'Onions', category: 'Fruits & Vegetables' },
  { name: 'Carrots', category: 'Fruits & Vegetables' },
  { name: 'Lettuce', category: 'Fruits & Vegetables' },
  { name: 'Cucumber', category: 'Fruits & Vegetables' },
  { name: 'Broccoli', category: 'Fruits & Vegetables' },
  { name: 'Spinach', category: 'Fruits & Vegetables' },
  { name: 'Grapes', category: 'Fruits & Vegetables' },
  { name: 'Lemons', category: 'Fruits & Vegetables' },
  { name: 'Avocado', category: 'Fruits & Vegetables' },
  // Dairy & Eggs
  { name: 'Milk', category: 'Dairy & Eggs' },
  { name: 'Eggs', category: 'Dairy & Eggs' },
  { name: 'Cheese', category: 'Dairy & Eggs' },
  { name: 'Butter', category: 'Dairy & Eggs' },
  { name: 'Yogurt', category: 'Dairy & Eggs' },
  { name: 'Cream', category: 'Dairy & Eggs' },
  { name: 'Mozzarella', category: 'Dairy & Eggs' },
  // Meat & Seafood
  { name: 'Chicken Breast', category: 'Meat & Seafood' },
  { name: 'Ground Beef', category: 'Meat & Seafood' },
  { name: 'Salmon', category: 'Meat & Seafood' },
  { name: 'Bacon', category: 'Meat & Seafood' },
  { name: 'Shrimp', category: 'Meat & Seafood' },
  { name: 'Pork Chops', category: 'Meat & Seafood' },
  { name: 'Sausages', category: 'Meat & Seafood' },
  // Bakery
  { name: 'Bread', category: 'Bakery' },
  { name: 'Croissants', category: 'Bakery' },
  { name: 'Bagels', category: 'Bakery' },
  { name: 'Tortillas', category: 'Bakery' },
  { name: 'Baguette', category: 'Bakery' },
  // Pantry
  { name: 'Rice', category: 'Pantry' },
  { name: 'Pasta', category: 'Pantry' },
  { name: 'Olive Oil', category: 'Pantry' },
  { name: 'Sugar', category: 'Pantry' },
  { name: 'Flour', category: 'Pantry' },
  { name: 'Salt', category: 'Pantry' },
  { name: 'Pepper', category: 'Pantry' },
  { name: 'Cereal', category: 'Pantry' },
  { name: 'Canned Tomatoes', category: 'Pantry' },
  { name: 'Beans', category: 'Pantry' },
  // Beverages
  { name: 'Water', category: 'Beverages' },
  { name: 'Orange Juice', category: 'Beverages' },
  { name: 'Coffee', category: 'Beverages' },
  { name: 'Tea', category: 'Beverages' },
  { name: 'Soda', category: 'Beverages' },
  { name: 'Wine', category: 'Beverages' },
  { name: 'Beer', category: 'Beverages' },
  // Snacks
  { name: 'Chips', category: 'Snacks' },
  { name: 'Cookies', category: 'Snacks' },
  { name: 'Chocolate', category: 'Snacks' },
  { name: 'Nuts', category: 'Snacks' },
  { name: 'Popcorn', category: 'Snacks' },
  // Frozen
  { name: 'Ice Cream', category: 'Frozen' },
  { name: 'Frozen Pizza', category: 'Frozen' },
  { name: 'Frozen Vegetables', category: 'Frozen' },
  { name: 'Frozen Berries', category: 'Frozen' },
  // Household
  { name: 'Toilet Paper', category: 'Household' },
  { name: 'Paper Towels', category: 'Household' },
  { name: 'Dish Soap', category: 'Household' },
  { name: 'Laundry Detergent', category: 'Household' },
  { name: 'Trash Bags', category: 'Household' },
  { name: 'Cleaning Spray', category: 'Household' },
  // Personal Care
  { name: 'Shampoo', category: 'Personal Care' },
  { name: 'Toothpaste', category: 'Personal Care' },
  { name: 'Soap', category: 'Personal Care' },
  { name: 'Deodorant', category: 'Personal Care' },
];

// Get product suggestions based on search query
export const getProductSuggestions = (
  query: string,
  limit: number = 5
): Array<{ name: string; category: string }> => {
  if (!query.trim()) return [];
  const lowerQuery = query.toLowerCase();
  return COMMON_PRODUCTS
    .filter(p => p.name.toLowerCase().includes(lowerQuery))
    .slice(0, limit);
};

// Suggest category based on product name
export const suggestCategory = (productName: string): string | null => {
  const lowerName = productName.toLowerCase();
  const match = COMMON_PRODUCTS.find(p => 
    p.name.toLowerCase() === lowerName || 
    lowerName.includes(p.name.toLowerCase())
  );
  return match?.category || null;
};

// Store sorting configurations
export type StoreName = 'Lidl' | 'Coop' | 'Migros' | 'Custom';

export const STORE_CATEGORY_ORDER: Record<StoreName, string[]> = {
  Lidl: [
    'Fruits & Vegetables',
    'Bakery',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Frozen',
    'Pantry',
    'Beverages',
    'Snacks',
    'Household',
    'Personal Care',
    'Other',
  ],
  Coop: [
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Bakery',
    'Meat & Seafood',
    'Pantry',
    'Beverages',
    'Frozen',
    'Snacks',
    'Household',
    'Personal Care',
    'Other',
  ],
  Migros: [
    'Bakery',
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Pantry',
    'Frozen',
    'Beverages',
    'Snacks',
    'Household',
    'Personal Care',
    'Other',
  ],
  Custom: PRODUCT_CATEGORIES,
};

// Calculate total price of items
export const calculateTotalPrice = (
  items: Array<{ price?: number; quantity: number }>
): number => {
  return items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
};

// Group items by category
export const groupByCategory = <T extends { category: string }>(
  items: T[]
): Record<string, T[]> => {
  return items.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Group and sort items by store category order
export const groupByCategoryWithStoreOrder = <T extends { category: string }>(
  items: T[],
  store: StoreName = 'Custom'
): Array<[string, T[]]> => {
  const grouped = groupByCategory(items);
  const order = STORE_CATEGORY_ORDER[store];
  
  const sorted: Array<[string, T[]]> = [];
  for (const category of order) {
    if (grouped[category]) {
      sorted.push([category, grouped[category]]);
    }
  }
  
  // Add any categories not in the order
  for (const [category, categoryItems] of Object.entries(grouped)) {
    if (!order.includes(category)) {
      sorted.push([category, categoryItems]);
    }
  }
  
  return sorted;
};

// Parse item input to extract name, quantity, and unit
export interface ParsedItemInput {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  autofilled: boolean;
}

// Unit patterns for parsing (regex patterns for common units)
const UNIT_PATTERNS: Array<{ pattern: RegExp; unit: string }> = [
  { pattern: /(\d+(?:\.\d+)?)\s*kg\b/i, unit: 'kg' },
  { pattern: /(\d+(?:\.\d+)?)\s*g\b/i, unit: 'g' },
  { pattern: /(\d+(?:\.\d+)?)\s*lb\b/i, unit: 'lb' },
  { pattern: /(\d+(?:\.\d+)?)\s*oz\b/i, unit: 'oz' },
  { pattern: /(\d+(?:\.\d+)?)\s*l\b/i, unit: 'L' },
  { pattern: /(\d+(?:\.\d+)?)\s*ml\b/i, unit: 'ml' },
  { pattern: /(\d+)\s*(?:pcs?|pieces?|x)\b/i, unit: 'pcs' },
  { pattern: /(\d+)\s*(?:pack(?:s)?|pk)\b/i, unit: 'pack' },
  { pattern: /(\d+)\s*(?:bottle(?:s)?)\b/i, unit: 'bottle' },
  { pattern: /(\d+)\s*(?:can(?:s)?)\b/i, unit: 'can' },
  { pattern: /(\d+)\s*(?:box(?:es)?)\b/i, unit: 'box' },
  { pattern: /(\d+)\s*(?:bag(?:s)?)\b/i, unit: 'bag' },
];

export const parseItemInput = (input: string, defaultUnit: string = 'pcs'): ParsedItemInput => {
  let text = input.trim();
  let quantity = 1;
  let unit = defaultUnit;
  let autofilled = false;
  
  // Check for quantity + unit patterns (e.g., "milk 1l", "tomatoes 500g")
  for (const { pattern, unit: matchedUnit } of UNIT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      quantity = parseFloat(match[1]);
      unit = matchedUnit;
      text = text.replace(pattern, '').trim();
      autofilled = true;
      break;
    }
  }
  
  // Check for leading quantity (e.g., "3 bananas")
  if (!autofilled) {
    const leadingNumberMatch = text.match(/^(\d+)\s+(.+)$/);
    if (leadingNumberMatch) {
      quantity = parseInt(leadingNumberMatch[1], 10);
      text = leadingNumberMatch[2];
      autofilled = true;
    }
    
    // Check for trailing quantity (e.g., "bananas 3")
    const trailingNumberMatch = text.match(/^(.+?)\s+(\d+)$/);
    if (trailingNumberMatch && !autofilled) {
      quantity = parseInt(trailingNumberMatch[2], 10);
      text = trailingNumberMatch[1];
      autofilled = true;
    }
  }
  
  // Clean up the name - capitalize first letter
  const name = text.charAt(0).toUpperCase() + text.slice(1);
  
  // Auto-suggest category
  const category = suggestCategory(name) || 'Other';
  
  return {
    name,
    quantity,
    unit,
    category,
    autofilled,
  };
};
