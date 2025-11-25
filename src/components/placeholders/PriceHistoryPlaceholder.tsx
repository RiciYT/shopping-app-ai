import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Chip, Card, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface PriceHistoryPlaceholderProps {
  productName?: string;
}

export function PriceHistoryPlaceholder({ productName }: PriceHistoryPlaceholderProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]} mode="contained">
      <Card.Content style={styles.content}>
        <Ionicons name="trending-up-outline" size={48} color={theme.colors.onSurfaceVariant} />
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Price History
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {productName
            ? `Price history for "${productName}" will be available soon.`
            : 'Track price changes over time for your favorite products.'}
        </Text>
        <Chip
          style={[styles.comingSoon, { backgroundColor: theme.colors.primaryContainer }]}
          textStyle={{ color: theme.colors.onPrimaryContainer }}
          compact
        >
          Coming Soon
        </Chip>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 16,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    marginTop: 12,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  comingSoon: {
    marginTop: 12,
  },
});
