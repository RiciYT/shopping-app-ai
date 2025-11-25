import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { HistoryEntry } from '../types';
import { formatDate, formatPrice } from '../utils';

export function HistoryScreen() {
  const { state, dispatch } = useApp();
  const theme = useTheme();

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all shopping history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => dispatch({ type: 'CLEAR_HISTORY' }),
        },
      ]
    );
  };

  const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
    <Card style={[styles.historyCard, { backgroundColor: theme.colors.elevation.level1 }]} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" numberOfLines={1} style={{ color: theme.colors.onSurface }}>
              {item.listName}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {formatDate(item.completedAt)}
            </Text>
          </View>
        </View>
        <View style={[styles.cardStats, { borderTopColor: theme.colors.outlineVariant }]}>
          <View style={styles.statItem}>
            <Ionicons name="cart-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.itemCount} items
            </Text>
          </View>
          {item.totalPrice !== undefined && item.totalPrice > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="pricetag-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {formatPrice(item.totalPrice, state.settings.currency)}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="time-outline" size={64} color={theme.colors.outlineVariant} />
      <Text variant="titleLarge" style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
        No History Yet
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyStateSubtitle, { color: theme.colors.onSurfaceVariant }]}>
        Completed shopping lists will appear here
      </Text>
    </View>
  );

  // Calculate summary stats
  const totalTrips = state.history.length;
  const totalSpent = state.history.reduce(
    (sum, entry) => sum + (entry.totalPrice || 0),
    0
  );
  const totalItems = state.history.reduce(
    (sum, entry) => sum + entry.itemCount,
    0
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Shopping History
        </Text>
        {state.history.length > 0 && (
          <IconButton
            icon="delete-outline"
            iconColor={theme.colors.error}
            size={24}
            onPress={handleClearHistory}
          />
        )}
      </View>

      {/* Summary Stats */}
      {state.history.length > 0 && (
        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.elevation.level1 }]} mode="elevated">
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                {totalTrips}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Shopping Trips
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: theme.colors.outlineVariant }]} />
            <View style={styles.summaryItem}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                {totalItems}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Items Bought
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: theme.colors.outlineVariant }]} />
            <View style={styles.summaryItem}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                {formatPrice(totalSpent, state.settings.currency)}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Total Spent
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {state.history.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={state.history}
          keyExtractor={item => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  summaryContent: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  historyCard: {
    marginBottom: 12,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardStats: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    marginTop: 16,
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    marginTop: 8,
  },
});
