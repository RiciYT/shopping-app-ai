import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingList, Settings, HistoryEntry, PriceRecord } from '../types';

const STORAGE_KEYS = {
  SHOPPING_LISTS: '@shopping_lists',
  SETTINGS: '@settings',
  HISTORY: '@history',
  PRICE_RECORDS: '@price_records',
  CURRENT_LIST_ID: '@current_list_id',
};

// Default settings
const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
  currency: 'USD',
  defaultUnit: 'pcs',
  enableNotifications: false,
  enablePriceTracking: true,
  enableBudgetAlerts: false,
};

// Shopping Lists Storage
export const saveShoppingLists = async (lists: ShoppingList[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SHOPPING_LISTS, JSON.stringify(lists));
  } catch (error) {
    console.error('Error saving shopping lists:', error);
    throw error;
  }
};

export const loadShoppingLists = async (): Promise<ShoppingList[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SHOPPING_LISTS);
    if (data) {
      const lists = JSON.parse(data) as ShoppingList[];
      // Parse dates
      return lists.map(list => ({
        ...list,
        createdAt: new Date(list.createdAt),
        updatedAt: new Date(list.updatedAt),
        completedAt: list.completedAt ? new Date(list.completedAt) : undefined,
        items: list.items.map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading shopping lists:', error);
    return [];
  }
};

// Settings Storage
export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const loadSettings = async (): Promise<Settings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data) as Settings;
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// History Storage
export const saveHistory = async (history: HistoryEntry[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history:', error);
    throw error;
  }
};

export const loadHistory = async (): Promise<HistoryEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    if (data) {
      const history = JSON.parse(data) as HistoryEntry[];
      return history.map(entry => ({
        ...entry,
        completedAt: new Date(entry.completedAt),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
};

// Price Records Storage (for future price tracking feature)
export const savePriceRecords = async (records: PriceRecord[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PRICE_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving price records:', error);
    throw error;
  }
};

export const loadPriceRecords = async (): Promise<PriceRecord[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PRICE_RECORDS);
    if (data) {
      const records = JSON.parse(data) as PriceRecord[];
      return records.map(record => ({
        ...record,
        recordedAt: new Date(record.recordedAt),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading price records:', error);
    return [];
  }
};

// Current List ID Storage
export const saveCurrentListId = async (listId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_LIST_ID, listId);
  } catch (error) {
    console.error('Error saving current list ID:', error);
    throw error;
  }
};

export const loadCurrentListId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_LIST_ID);
  } catch (error) {
    console.error('Error loading current list ID:', error);
    return null;
  }
};

// Clear all storage (for debugging/reset)
export const clearAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};
