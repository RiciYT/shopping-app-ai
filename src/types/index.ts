// Core product type
export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
  price?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  timesUsed?: number;
}

// Shopping list type
export interface ShoppingList {
  id: string;
  name: string;
  items: Product[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  isArchived: boolean;
}

// Price tracking structure for future use
export interface PriceRecord {
  id: string;
  productId: string;
  productName: string;
  price: number;
  store?: string;
  recordedAt: Date;
}

// Budget tracking for future use
export interface Budget {
  id: string;
  month: string; // YYYY-MM format
  limit: number;
  spent: number;
}

// Settings type
export interface Settings {
  darkMode: boolean;
  currency: string;
  defaultUnit: string;
  enableNotifications: boolean;
  enablePriceTracking: boolean;
  enableBudgetAlerts: boolean;
}

// History entry for completed shopping lists
export interface HistoryEntry {
  id: string;
  listId: string;
  listName: string;
  itemCount: number;
  totalPrice?: number;
  completedAt: Date;
}

// Multi-user sync placeholder types
export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface SharedList {
  listId: string;
  ownerId: string;
  sharedWith: string[]; // user IDs
  permissions: 'read' | 'write';
}

// Navigation types
export type RootTabParamList = {
  Home: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  ProductDetails: { product: Product; listId: string };
  NewList: undefined;
};
