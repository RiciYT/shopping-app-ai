import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar, useTheme, TouchableRipple } from 'react-native-paper';
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
    <TouchableRipple
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      onLongPress={onLongPress}
      borderless
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons
              name={list.isArchived ? 'checkmark-circle' : 'cart'}
              size={22}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.headerText}>
            <Text variant="titleMedium" numberOfLines={1} style={[styles.listName, { color: theme.colors.onSurface }]}>
              {list.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {formatDate(list.updatedAt)}
            </Text>
          </View>
          <View style={styles.chevronContainer}>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.outline} />
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.progressWrapper}>
            <ProgressBar
              progress={progress}
              color={theme.colors.primary}
              style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}
            />
          </View>
          <View style={styles.statsInfo}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {checkedCount} of {totalCount} items
            </Text>
            {progress > 0 && progress < 1 && (
              <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {Math.round(progress * 100)}%
              </Text>
            )}
            {progress === 1 && totalCount > 0 && (
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
            )}
          </View>
        </View>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  listName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  chevronContainer: {
    marginLeft: 8,
  },
  stats: {
    marginTop: 14,
  },
  progressWrapper: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  statsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
