import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Switch,
  List,
  Divider,
  useTheme,
  Card,
  TouchableRipple,
  Portal,
  Modal,
  Button,
  RadioButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { clearAllStorage } from '../storage';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const UNITS = ['pcs', 'kg', 'lb', 'g', 'L', 'ml'];

export function SettingsScreen() {
  const { state, updateSettings } = useApp();
  const { settings } = state;
  const theme = useTheme();
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

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

  const currentCurrency = CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Settings
          </Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.sectionContainer}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Appearance
          </Text>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
            <TouchableRipple onPress={() => updateSettings({ darkMode: !settings.darkMode })}>
              <View style={styles.settingRow}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Ionicons 
                    name={settings.darkMode ? 'moon' : 'moon-outline'} 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </View>
                <View style={styles.settingContent}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                    Dark Mode
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {settings.darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                  </Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={value => updateSettings({ darkMode: value })}
                  color={theme.colors.primary}
                />
              </View>
            </TouchableRipple>
          </Card>
        </View>

        {/* Key Features Section */}
        <View style={styles.sectionContainer}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Key Features
          </Text>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
            <TouchableRipple onPress={() => updateSettings({ enablePriceTracking: !settings.enablePriceTracking })}>
              <View style={styles.settingRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="trending-up" size={20} color="#2196F3" />
                </View>
                <View style={styles.settingContent}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                    Price Tracking
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Track price history and trends
                  </Text>
                </View>
                <Switch
                  value={settings.enablePriceTracking}
                  onValueChange={value => updateSettings({ enablePriceTracking: value })}
                  color={theme.colors.primary}
                />
              </View>
            </TouchableRipple>
            <Divider style={styles.divider} />
            <TouchableRipple onPress={() => updateSettings({ enableNotifications: !settings.enableNotifications })}>
              <View style={styles.settingRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="notifications" size={20} color="#FF9800" />
                </View>
                <View style={styles.settingContent}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                    Notifications
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Get reminders and updates
                  </Text>
                </View>
                <Switch
                  value={settings.enableNotifications}
                  onValueChange={value => updateSettings({ enableNotifications: value })}
                  color={theme.colors.primary}
                />
              </View>
            </TouchableRipple>
            <Divider style={styles.divider} />
            <TouchableRipple onPress={() => updateSettings({ enableBudgetAlerts: !settings.enableBudgetAlerts })}>
              <View style={styles.settingRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="wallet" size={20} color="#F44336" />
                </View>
                <View style={styles.settingContent}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                    Budget Alerts
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Alert when nearing budget limit
                  </Text>
                </View>
                <Switch
                  value={settings.enableBudgetAlerts}
                  onValueChange={value => updateSettings({ enableBudgetAlerts: value })}
                  color={theme.colors.primary}
                />
              </View>
            </TouchableRipple>
          </Card>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionContainer}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Preferences
          </Text>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
            <TouchableRipple onPress={() => setShowCurrencyPicker(true)}>
              <View style={styles.settingRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="cash-outline" size={20} color="#4CAF50" />
                </View>
                <View style={styles.settingContent}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                    Currency
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {currentCurrency.name} ({currentCurrency.symbol})
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
              </View>
            </TouchableRipple>
            <Divider style={styles.divider} />
            <TouchableRipple onPress={() => setShowUnitPicker(true)}>
              <View style={styles.settingRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                  <Ionicons name="scale-outline" size={20} color="#9C27B0" />
                </View>
                <View style={styles.settingContent}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                    Default Unit
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {settings.defaultUnit}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
              </View>
            </TouchableRipple>
          </Card>
        </View>

        {/* Data Section */}
        <View style={styles.sectionContainer}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Data Management
          </Text>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
            <TouchableRipple onPress={handleClearData}>
              <View style={styles.settingRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </View>
                <View style={styles.settingContent}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.error }}>
                    Clear All Data
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Delete all lists, history, and settings
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
              </View>
            </TouchableRipple>
          </Card>
        </View>

        {/* About Section */}
        <View style={styles.sectionContainer}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            About
          </Text>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
            <View style={styles.settingRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                  Shopping App AI
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Version 1.0.0
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Made with ❤️ for easier shopping
          </Text>
        </View>
      </ScrollView>

      {/* Currency Picker Modal */}
      <Portal>
        <Modal
          visible={showCurrencyPicker}
          onDismiss={() => setShowCurrencyPicker(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Select Currency
          </Text>
          <RadioButton.Group
            onValueChange={value => {
              updateSettings({ currency: value });
              setShowCurrencyPicker(false);
            }}
            value={settings.currency}
          >
            {CURRENCIES.map(currency => (
              <TouchableRipple
                key={currency.code}
                onPress={() => {
                  updateSettings({ currency: currency.code });
                  setShowCurrencyPicker(false);
                }}
              >
                <View style={styles.radioRow}>
                  <RadioButton value={currency.code} />
                  <View style={styles.radioContent}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                      {currency.name}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {currency.symbol}
                    </Text>
                  </View>
                </View>
              </TouchableRipple>
            ))}
          </RadioButton.Group>
          <Button 
            mode="text" 
            onPress={() => setShowCurrencyPicker(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
        </Modal>

        {/* Unit Picker Modal */}
        <Modal
          visible={showUnitPicker}
          onDismiss={() => setShowUnitPicker(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Default Unit
          </Text>
          <RadioButton.Group
            onValueChange={value => {
              updateSettings({ defaultUnit: value });
              setShowUnitPicker(false);
            }}
            value={settings.defaultUnit}
          >
            {UNITS.map(unit => (
              <TouchableRipple
                key={unit}
                onPress={() => {
                  updateSettings({ defaultUnit: unit });
                  setShowUnitPicker(false);
                }}
              >
                <View style={styles.radioRow}>
                  <RadioButton value={unit} />
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                    {unit}
                  </Text>
                </View>
              </TouchableRipple>
            ))}
          </RadioButton.Group>
          <Button 
            mode="text" 
            onPress={() => setShowUnitPicker(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  divider: {
    marginLeft: 72,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
    paddingBottom: 100,
  },
  modal: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    marginBottom: 20,
    fontWeight: '600',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioContent: {
    marginLeft: 8,
  },
  modalButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
  },
});
