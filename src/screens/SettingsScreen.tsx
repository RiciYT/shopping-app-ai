import React from 'react';
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
} from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { BudgetViewPlaceholder, MultiUserSyncPlaceholder } from '../components';
import { clearAllStorage } from '../storage';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'];
const UNITS = ['pcs', 'kg', 'lb', 'g', 'L', 'ml'];

export function SettingsScreen() {
  const { state, updateSettings } = useApp();
  const { settings } = state;
  const theme = useTheme();

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Settings
          </Text>
        </View>

        {/* General Settings */}
        <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          General
        </Text>
        <List.Section style={[styles.section, { backgroundColor: theme.colors.elevation.level1 }]}>
          <List.Item
            title="Dark Mode"
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="weather-night" color={theme.colors.onSurfaceVariant} />}
            right={() => (
              <Switch
                value={settings.darkMode}
                onValueChange={value => updateSettings({ darkMode: value })}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Currency"
            titleStyle={{ color: theme.colors.onSurface }}
            description={settings.currency}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            left={props => <List.Icon {...props} icon="currency-usd" color={theme.colors.onSurfaceVariant} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
            onPress={handleCurrencyChange}
          />
          <Divider />
          <List.Item
            title="Default Unit"
            titleStyle={{ color: theme.colors.onSurface }}
            description={settings.defaultUnit}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            left={props => <List.Icon {...props} icon="scale" color={theme.colors.onSurfaceVariant} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
            onPress={handleUnitChange}
          />
        </List.Section>

        {/* Features */}
        <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          Features
        </Text>
        <List.Section style={[styles.section, { backgroundColor: theme.colors.elevation.level1 }]}>
          <List.Item
            title="Notifications"
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="bell-outline" color={theme.colors.onSurfaceVariant} />}
            right={() => (
              <Switch
                value={settings.enableNotifications}
                onValueChange={value => updateSettings({ enableNotifications: value })}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Price Tracking"
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="trending-up" color={theme.colors.onSurfaceVariant} />}
            right={() => (
              <Switch
                value={settings.enablePriceTracking}
                onValueChange={value => updateSettings({ enablePriceTracking: value })}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Budget Alerts"
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="alert-circle-outline" color={theme.colors.onSurfaceVariant} />}
            right={() => (
              <Switch
                value={settings.enableBudgetAlerts}
                onValueChange={value => updateSettings({ enableBudgetAlerts: value })}
                color={theme.colors.primary}
              />
            )}
          />
        </List.Section>

        {/* Coming Soon Features */}
        <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          Coming Soon
        </Text>
        <View style={styles.placeholderSection}>
          <BudgetViewPlaceholder />
          <MultiUserSyncPlaceholder />
        </View>

        {/* Data Management */}
        <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          Data
        </Text>
        <List.Section style={[styles.section, { backgroundColor: theme.colors.elevation.level1 }]}>
          <List.Item
            title="Clear All Data"
            titleStyle={{ color: theme.colors.error }}
            left={props => <List.Icon {...props} icon="delete-outline" color={theme.colors.error} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
            onPress={handleClearData}
          />
        </List.Section>

        {/* App Info */}
        <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          About
        </Text>
        <List.Section style={[styles.section, { backgroundColor: theme.colors.elevation.level1 }]}>
          <List.Item
            title="Version"
            titleStyle={{ color: theme.colors.onSurface }}
            description="1.0.0"
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            left={props => <List.Icon {...props} icon="information-outline" color={theme.colors.onSurfaceVariant} />}
          />
          <Divider />
          <List.Item
            title="Shopping App AI"
            titleStyle={{ color: theme.colors.onSurface }}
            description="Expo SDK 54 • Material Design 3"
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            left={props => <List.Icon {...props} icon="github" color={theme.colors.onSurfaceVariant} />}
          />
        </List.Section>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
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
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  placeholderSection: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
});
