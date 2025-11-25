import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BudgetViewPlaceholderProps {
  month?: string;
}

export function BudgetViewPlaceholder({ month }: BudgetViewPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="wallet-outline" size={48} color="#ccc" />
      <Text style={styles.title}>Budget Tracking</Text>
      <Text style={styles.subtitle}>
        {month
          ? `Budget details for ${month} will be available soon.`
          : 'Set monthly budgets and track your spending across shopping trips.'}
      </Text>
      <View style={styles.features}>
        <Text style={styles.featureItem}>• Set monthly spending limits</Text>
        <Text style={styles.featureItem}>• Track expenses by category</Text>
        <Text style={styles.featureItem}>• Get alerts when nearing budget</Text>
        <Text style={styles.featureItem}>• View spending trends</Text>
      </View>
      <Text style={styles.comingSoon}>Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  features: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  featureItem: {
    fontSize: 13,
    color: '#555',
    marginVertical: 4,
  },
  comingSoon: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
    marginTop: 16,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
