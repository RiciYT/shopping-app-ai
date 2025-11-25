import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShoppingList } from '../types';
import { formatDate } from '../utils';

interface ListCardProps {
  list: ShoppingList;
  onPress: () => void;
  onLongPress?: () => void;
}

export function ListCard({ list, onPress, onLongPress }: ListCardProps) {
  const checkedCount = list.items.filter(item => item.isChecked).length;
  const totalCount = list.items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={list.isArchived ? 'checkmark-circle' : 'cart'}
            size={24}
            color={list.isArchived ? '#4CAF50' : '#2196F3'}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {list.name}
          </Text>
          <Text style={styles.date}>{formatDate(list.updatedAt)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>

      <View style={styles.stats}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.statsText}>
          {checkedCount} / {totalCount} items
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  stats: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  statsText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
});
