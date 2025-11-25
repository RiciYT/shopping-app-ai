import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ShoppingList } from '../types';
import { formatDate } from '../utils';

interface ListCardProps {
  list: ShoppingList;
  onPress: () => void;
  onLongPress?: () => void;
}

export function ListCard({ list, onPress, onLongPress }: ListCardProps) {
  const theme = useTheme();
  const checkedCount = list.items.filter(item => item.isChecked).length;
  const totalCount = list.items.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  return (
    <Card
      style={[styles.container, { backgroundColor: theme.colors.elevation.level1 }]}
      onPress={onPress}
      onLongPress={onLongPress}
      mode="elevated"
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons
              name={list.isArchived ? 'checkmark-circle' : 'cart'}
              size={24}
              color={list.isArchived ? theme.colors.primary : theme.colors.tertiary}
            />
          </View>
          <View style={styles.headerText}>
            <Text variant="titleMedium" numberOfLines={1} style={{ color: theme.colors.onSurface }}>
              {list.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {formatDate(list.updatedAt)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.outlineVariant} />
        </View>

        <View style={styles.stats}>
          <ProgressBar
            progress={progress}
            color={theme.colors.primary}
            style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}
          />
          <Text variant="labelSmall" style={[styles.statsText, { color: theme.colors.onSurfaceVariant }]}>
            {checkedCount} / {totalCount} items
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  stats: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  statsText: {
    marginTop: 8,
  },
});
