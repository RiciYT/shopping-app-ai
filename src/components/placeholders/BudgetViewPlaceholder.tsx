import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip, Card, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface BudgetViewPlaceholderProps {
  month?: string;
}

export function BudgetViewPlaceholder({ month }: BudgetViewPlaceholderProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]} mode="contained">
      <Card.Content style={styles.content}>
        <Ionicons name="wallet-outline" size={48} color={theme.colors.onSurfaceVariant} />
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Budget Tracking
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {month
            ? `Budget details for ${month} will be available soon.`
            : 'Set monthly budgets and track your spending across shopping trips.'}
        </Text>
        <View style={styles.features}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            • Set monthly spending limits
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            • Track expenses by category
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            • Get alerts when nearing budget
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            • View spending trends
          </Text>
        </View>
        <Chip
          style={[styles.comingSoon, { backgroundColor: theme.colors.tertiaryContainer }]}
          textStyle={{ color: theme.colors.onTertiaryContainer }}
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
    margin: 8,
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
  features: {
    marginTop: 16,
    alignSelf: 'stretch',
    gap: 4,
  },
  comingSoon: {
    marginTop: 16,
  },
});
