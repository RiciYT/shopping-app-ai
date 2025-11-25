import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PriceHistoryPlaceholderProps {
  productName?: string;
}

export function PriceHistoryPlaceholder({ productName }: PriceHistoryPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="trending-up-outline" size={48} color="#ccc" />
      <Text style={styles.title}>Price History</Text>
      <Text style={styles.subtitle}>
        {productName
          ? `Price history for "${productName}" will be available soon.`
          : 'Track price changes over time for your favorite products.'}
      </Text>
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
  comingSoon: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 12,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
