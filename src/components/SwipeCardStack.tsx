import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SwipeCard } from './SwipeCard';
import { Product } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

interface SwipeCardStackProps {
  items: Product[];
  currency?: string;
  onSwipeRight: (productId: string) => void;
  onSwipeLeft: (productId: string) => void;
  onComplete?: () => void;
}

export function SwipeCardStack({
  items,
  currency = 'USD',
  onSwipeRight,
  onSwipeLeft,
  onComplete,
}: SwipeCardStackProps) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState<Product[]>([]);

  // Update visible items when items or currentIndex changes
  useEffect(() => {
    const remaining = items.slice(currentIndex, currentIndex + 3);
    setVisibleItems(remaining);
  }, [items, currentIndex]);

  const handleSwipeRight = useCallback((productId: string) => {
    onSwipeRight(productId);
    setCurrentIndex(prev => prev + 1);
  }, [onSwipeRight]);

  const handleSwipeLeft = useCallback((productId: string) => {
    onSwipeLeft(productId);
    setCurrentIndex(prev => prev + 1);
  }, [onSwipeLeft]);

  // Get the first item's ID to detect when the list changes completely (e.g., new list selected)
  const firstItemId = items.length > 0 ? items[0].id : null;

  // Reset index only when the first item changes (indicating a new list was selected)
  // This prevents resetting position when items are just modified
  useEffect(() => {
    setCurrentIndex(0);
  }, [firstItemId]);

  // Check if all items are done
  const isComplete = currentIndex >= items.length;

  if (items.length === 0 || isComplete) {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <Ionicons name="checkmark-circle" size={64} color={theme.colors.primary} />
        </View>
        <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
          All Done!
        </Text>
        <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {items.length === 0 
            ? 'No items to shop for'
            : 'You\'ve gone through all items'}
        </Text>
        {onComplete && items.length > 0 && (
          <Button
            mode="contained"
            onPress={onComplete}
            style={styles.completeButton}
            icon="check"
          >
            Complete Shopping
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.counterContainer}>
        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          {currentIndex + 1} of {items.length}
        </Text>
      </View>
      <View style={styles.cardsContainer}>
        {visibleItems.map((item, index) => (
          <SwipeCard
            key={item.id}
            product={item}
            currency={currency}
            isFirst={index === 0}
            index={index}
            onSwipeRight={() => handleSwipeRight(item.id)}
            onSwipeLeft={() => handleSwipeLeft(item.id)}
          />
        )).reverse()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  counterContainer: {
    paddingVertical: 12,
  },
  cardsContainer: {
    flex: 1,
    width: CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  completeButton: {
    borderRadius: 12,
    marginTop: 8,
  },
});
