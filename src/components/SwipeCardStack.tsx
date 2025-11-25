import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Text, Button, useTheme, ProgressBar } from 'react-native-paper';
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
  onBackToList?: () => void;
}

export function SwipeCardStack({
  items,
  currency = 'USD',
  onSwipeRight,
  onSwipeLeft,
  onComplete,
  onBackToList,
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

  // Handle button press for Done (same as swipe right)
  const handleDonePress = useCallback(() => {
    if (visibleItems.length > 0) {
      handleSwipeRight(visibleItems[0].id);
    }
  }, [visibleItems, handleSwipeRight]);

  // Handle button press for Skip (same as swipe left)
  const handleSkipPress = useCallback(() => {
    if (visibleItems.length > 0) {
      handleSwipeLeft(visibleItems[0].id);
    }
  }, [visibleItems, handleSwipeLeft]);

  // Get the first item's ID to detect when the list changes completely (e.g., new list selected)
  const firstItemId = items.length > 0 ? items[0].id : null;

  // Reset index only when the first item changes (indicating a new list was selected)
  // This prevents resetting position when items are just modified
  useEffect(() => {
    setCurrentIndex(0);
  }, [firstItemId]);

  // Check if all items are done
  const isComplete = currentIndex >= items.length;

  // Calculate progress
  const progress = items.length > 0 ? currentIndex / items.length : 0;

  if (items.length === 0 || isComplete) {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <Ionicons name="checkmark-circle" size={80} color={theme.colors.primary} />
        </View>
        <Text variant="headlineMedium" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
          All Items Completed!
        </Text>
        <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {items.length === 0 
            ? 'No items to shop for'
            : 'Great job! You\'ve gone through all items'}
        </Text>
        {onBackToList && (
          <Button
            mode="contained"
            onPress={onBackToList}
            style={styles.backToListButton}
            contentStyle={styles.backToListButtonContent}
            icon="arrow-left"
          >
            Back to List
          </Button>
        )}
        {onComplete && items.length > 0 && (
          <Button
            mode="outlined"
            onPress={onComplete}
            style={styles.completeButton}
            contentStyle={styles.completeButtonContent}
            icon="check-circle-outline"
          >
            Complete Shopping
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text variant="titleMedium" style={[styles.progressText, { color: theme.colors.onSurface }]}>
          {currentIndex + 1} of {items.length} items
        </Text>
        <ProgressBar
          progress={progress}
          color={theme.colors.primary}
          style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}
        />
      </View>

      {/* Card Stack Container */}
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

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.skipButton, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={handleSkipPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={[styles.actionButtonText, { color: theme.colors.onSurfaceVariant }]}>
            Skip
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.doneButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleDonePress}
          activeOpacity={0.7}
        >
          <Text variant="titleMedium" style={[styles.actionButtonText, { color: '#fff' }]}>
            Done
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  progressSection: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  progressText: {
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  cardsContainer: {
    flex: 1,
    width: CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  skipButton: {
    // Background set dynamically
  },
  doneButton: {
    // Background set dynamically
  },
  actionButtonText: {
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  emptyTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  backToListButton: {
    borderRadius: 14,
    marginBottom: 12,
    minWidth: 220,
  },
  backToListButtonContent: {
    paddingVertical: 6,
  },
  completeButton: {
    borderRadius: 14,
    minWidth: 220,
  },
  completeButtonContent: {
    paddingVertical: 6,
  },
});
