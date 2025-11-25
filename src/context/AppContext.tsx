import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  ShoppingList,
  Product,
  Settings,
  HistoryEntry,
  PriceRecord,
} from '../types';
import {
  saveShoppingLists,
  loadShoppingLists,
  saveSettings,
  loadSettings,
  saveHistory,
  loadHistory,
  savePriceRecords,
  loadPriceRecords,
} from '../storage';
import { generateId } from '../utils';

// State interface
interface AppState {
  shoppingLists: ShoppingList[];
  currentListId: string | null;
  settings: Settings;
  history: HistoryEntry[];
  priceRecords: PriceRecord[];
  isLoading: boolean;
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_LIST'; payload: ShoppingList }
  | { type: 'UPDATE_LIST'; payload: ShoppingList }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'SET_CURRENT_LIST'; payload: string | null }
  | { type: 'ADD_PRODUCT'; payload: { listId: string; product: Product } }
  | { type: 'UPDATE_PRODUCT'; payload: { listId: string; product: Product } }
  | { type: 'DELETE_PRODUCT'; payload: { listId: string; productId: string } }
  | { type: 'TOGGLE_PRODUCT'; payload: { listId: string; productId: string } }
  | { type: 'COMPLETE_LIST'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'ADD_HISTORY_ENTRY'; payload: HistoryEntry }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'ADD_PRICE_RECORD'; payload: PriceRecord };

// Initial state
const initialState: AppState = {
  shoppingLists: [],
  currentListId: null,
  settings: {
    darkMode: false,
    currency: 'USD',
    defaultUnit: 'pcs',
    enableNotifications: false,
    enablePriceTracking: true,
    enableBudgetAlerts: false,
  },
  history: [],
  priceRecords: [],
  isLoading: true,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_DATA':
      return { ...state, ...action.payload, isLoading: false };

    case 'ADD_LIST':
      return {
        ...state,
        shoppingLists: [...state.shoppingLists, action.payload],
        currentListId: action.payload.id,
      };

    case 'UPDATE_LIST':
      return {
        ...state,
        shoppingLists: state.shoppingLists.map(list =>
          list.id === action.payload.id ? action.payload : list
        ),
      };

    case 'DELETE_LIST':
      return {
        ...state,
        shoppingLists: state.shoppingLists.filter(list => list.id !== action.payload),
        currentListId: state.currentListId === action.payload ? null : state.currentListId,
      };

    case 'SET_CURRENT_LIST':
      return { ...state, currentListId: action.payload };

    case 'ADD_PRODUCT': {
      const { listId, product } = action.payload;
      return {
        ...state,
        shoppingLists: state.shoppingLists.map(list =>
          list.id === listId
            ? { ...list, items: [...list.items, product], updatedAt: new Date() }
            : list
        ),
      };
    }

    case 'UPDATE_PRODUCT': {
      const { listId, product } = action.payload;
      return {
        ...state,
        shoppingLists: state.shoppingLists.map(list =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map(item =>
                  item.id === product.id ? product : item
                ),
                updatedAt: new Date(),
              }
            : list
        ),
      };
    }

    case 'DELETE_PRODUCT': {
      const { listId, productId } = action.payload;
      return {
        ...state,
        shoppingLists: state.shoppingLists.map(list =>
          list.id === listId
            ? {
                ...list,
                items: list.items.filter(item => item.id !== productId),
                updatedAt: new Date(),
              }
            : list
        ),
      };
    }

    case 'TOGGLE_PRODUCT': {
      const { listId, productId } = action.payload;
      return {
        ...state,
        shoppingLists: state.shoppingLists.map(list =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map(item =>
                  item.id === productId
                    ? { ...item, isChecked: !item.isChecked, updatedAt: new Date() }
                    : item
                ),
                updatedAt: new Date(),
              }
            : list
        ),
      };
    }

    case 'COMPLETE_LIST': {
      const list = state.shoppingLists.find(l => l.id === action.payload);
      if (!list) return state;

      const historyEntry: HistoryEntry = {
        id: generateId(),
        listId: list.id,
        listName: list.name,
        itemCount: list.items.length,
        totalPrice: list.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
        completedAt: new Date(),
      };

      return {
        ...state,
        shoppingLists: state.shoppingLists.map(l =>
          l.id === action.payload
            ? { ...l, isArchived: true, completedAt: new Date(), updatedAt: new Date() }
            : l
        ),
        history: [historyEntry, ...state.history],
      };
    }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'ADD_HISTORY_ENTRY':
      return {
        ...state,
        history: [action.payload, ...state.history],
      };

    case 'CLEAR_HISTORY':
      return { ...state, history: [] };

    case 'ADD_PRICE_RECORD':
      return {
        ...state,
        priceRecords: [...state.priceRecords, action.payload],
      };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  addList: (name: string) => ShoppingList;
  deleteList: (listId: string) => void;
  addProduct: (listId: string, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (listId: string, product: Product) => void;
  deleteProduct: (listId: string, productId: string) => void;
  toggleProduct: (listId: string, productId: string) => void;
  completeList: (listId: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  getCurrentList: () => ShoppingList | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [shoppingLists, settings, history, priceRecords] = await Promise.all([
          loadShoppingLists(),
          loadSettings(),
          loadHistory(),
          loadPriceRecords(),
        ]);

        dispatch({
          type: 'LOAD_DATA',
          payload: {
            shoppingLists,
            settings,
            history,
            priceRecords,
            currentListId: shoppingLists.length > 0 ? shoppingLists[0].id : null,
          },
        });
      } catch (error) {
        console.error('Error loading data:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  // Save data to storage when state changes
  useEffect(() => {
    if (!state.isLoading) {
      saveShoppingLists(state.shoppingLists);
    }
  }, [state.shoppingLists, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      saveSettings(state.settings);
    }
  }, [state.settings, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      saveHistory(state.history);
    }
  }, [state.history, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      savePriceRecords(state.priceRecords);
    }
  }, [state.priceRecords, state.isLoading]);

  // Helper functions
  const addList = (name: string): ShoppingList => {
    const newList: ShoppingList = {
      id: generateId(),
      name,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
    };
    dispatch({ type: 'ADD_LIST', payload: newList });
    return newList;
  };

  const deleteList = (listId: string) => {
    dispatch({ type: 'DELETE_LIST', payload: listId });
  };

  const addProduct = (
    listId: string,
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const product: Product = {
      ...productData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_PRODUCT', payload: { listId, product } });

    // Record price if available (for price tracking feature)
    if (productData.price && state.settings.enablePriceTracking) {
      const priceRecord: PriceRecord = {
        id: generateId(),
        productId: product.id,
        productName: product.name,
        price: productData.price,
        recordedAt: new Date(),
      };
      dispatch({ type: 'ADD_PRICE_RECORD', payload: priceRecord });
    }
  };

  const updateProduct = (listId: string, product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { listId, product } });
  };

  const deleteProduct = (listId: string, productId: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: { listId, productId } });
  };

  const toggleProduct = (listId: string, productId: string) => {
    dispatch({ type: 'TOGGLE_PRODUCT', payload: { listId, productId } });
  };

  const completeList = (listId: string) => {
    dispatch({ type: 'COMPLETE_LIST', payload: listId });
  };

  const updateSettings = (settings: Partial<Settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const getCurrentList = (): ShoppingList | undefined => {
    return state.shoppingLists.find(
      list => list.id === state.currentListId && !list.isArchived
    );
  };

  const value: AppContextType = {
    state,
    dispatch,
    addList,
    deleteList,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProduct,
    completeList,
    updateSettings,
    getCurrentList,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook for using the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
