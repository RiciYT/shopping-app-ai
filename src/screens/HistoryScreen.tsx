import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { HistoryEntry } from '../types';
import { formatDate, formatPrice } from '../utils';

export function HistoryScreen() {
  const { state, dispatch } = useApp();

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
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.listName} numberOfLines={1}>
            {item.listName}
          </Text>
          <Text style={styles.completedDate}>
            {formatDate(item.completedAt)}
          </Text>
        </View>
      </View>
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Ionicons name="cart-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.itemCount} items</Text>
        </View>
        {item.totalPrice !== undefined && item.totalPrice > 0 && (
          <View style={styles.statItem}>
            <Ionicons name="pricetag-outline" size={16} color="#666" />
            <Text style={styles.statText}>
              {formatPrice(item.totalPrice, state.settings.currency)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="time-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No History Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping History</Text>
        {state.history.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
            <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        )}
      </View>

      {/* Summary Stats */}
      {state.history.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalTrips}</Text>
            <Text style={styles.summaryLabel}>Shopping Trips</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalItems}</Text>
            <Text style={styles.summaryLabel}>Items Bought</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {formatPrice(totalSpent, state.settings.currency)}
            </Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </View>
        </View>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completedDate: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  cardStats: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});
