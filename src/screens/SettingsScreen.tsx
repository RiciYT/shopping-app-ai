import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { BudgetViewPlaceholder, MultiUserSyncPlaceholder } from '../components';
import { clearAllStorage } from '../storage';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'];
const UNITS = ['pcs', 'kg', 'lb', 'g', 'L', 'ml'];

export function SettingsScreen() {
  const { state, updateSettings } = useApp();
  const { settings } = state;

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your shopping lists, history, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllStorage();
            Alert.alert('Data Cleared', 'Please restart the app to see the changes.');
          },
        },
      ]
    );
  };

  const handleCurrencyChange = () => {
    const currentIndex = CURRENCIES.indexOf(settings.currency);
    const nextIndex = (currentIndex + 1) % CURRENCIES.length;
    updateSettings({ currency: CURRENCIES[nextIndex] });
  };

  const handleUnitChange = () => {
    const currentIndex = UNITS.indexOf(settings.defaultUnit);
    const nextIndex = (currentIndex + 1) % UNITS.length;
    updateSettings({ defaultUnit: UNITS[nextIndex] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={22} color="#666" />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={value => updateSettings({ darkMode: value })}
              trackColor={{ false: '#ddd', true: '#81c784' }}
              thumbColor={settings.darkMode ? '#4CAF50' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleCurrencyChange}>
            <View style={styles.settingInfo}>
              <Ionicons name="cash-outline" size={22} color="#666" />
              <Text style={styles.settingLabel}>Currency</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>{settings.currency}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleUnitChange}>
            <View style={styles.settingInfo}>
              <Ionicons name="scale-outline" size={22} color="#666" />
              <Text style={styles.settingLabel}>Default Unit</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>{settings.defaultUnit}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={22} color="#666" />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={settings.enableNotifications}
              onValueChange={value => updateSettings({ enableNotifications: value })}
              trackColor={{ false: '#ddd', true: '#81c784' }}
              thumbColor={settings.enableNotifications ? '#4CAF50' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="trending-up-outline" size={22} color="#666" />
              <Text style={styles.settingLabel}>Price Tracking</Text>
            </View>
            <Switch
              value={settings.enablePriceTracking}
              onValueChange={value => updateSettings({ enablePriceTracking: value })}
              trackColor={{ false: '#ddd', true: '#81c784' }}
              thumbColor={settings.enablePriceTracking ? '#4CAF50' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="alert-circle-outline" size={22} color="#666" />
              <Text style={styles.settingLabel}>Budget Alerts</Text>
            </View>
            <Switch
              value={settings.enableBudgetAlerts}
              onValueChange={value => updateSettings({ enableBudgetAlerts: value })}
              trackColor={{ false: '#ddd', true: '#81c784' }}
              thumbColor={settings.enableBudgetAlerts ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Coming Soon Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          <BudgetViewPlaceholder />
          <MultiUserSyncPlaceholder />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
            <View style={styles.settingInfo}>
              <Ionicons name="trash-outline" size={22} color="#ff6b6b" />
              <Text style={[styles.settingLabel, { color: '#ff6b6b' }]}>
                Clear All Data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={22} color="#666" />
              <Text style={styles.settingLabel}>Version</Text>
            </View>
            <Text style={styles.settingValueText}>1.0.0</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="logo-github" size={22} color="#666" />
              <Text style={styles.settingLabel}>Shopping App AI</Text>
            </View>
            <Text style={styles.settingValueText}>Expo SDK 54</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for easier shopping
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 16,
    color: '#666',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});
