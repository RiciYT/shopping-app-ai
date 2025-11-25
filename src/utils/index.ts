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

// Common product categories
export const PRODUCT_CATEGORIES = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Bakery',
  'Pantry',
  'Beverages',
  'Snacks',
  'Frozen',
  'Household',
  'Personal Care',
  'Other',
];

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
  const colors: Record<string, string> = {
    'Fruits & Vegetables': '#4CAF50',
    'Dairy & Eggs': '#FFC107',
    'Meat & Seafood': '#F44336',
    'Bakery': '#795548',
    'Pantry': '#FF9800',
    'Beverages': '#2196F3',
    'Snacks': '#9C27B0',
    'Frozen': '#00BCD4',
    'Household': '#607D8B',
    'Personal Care': '#E91E63',
    'Other': '#9E9E9E',
  };
  return colors[category] || colors['Other'];
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
