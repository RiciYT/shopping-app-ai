import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, IconButton, Button, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { SwipeCardStack } from '../components';
import { RootStackParamList } from '../types';

type SwipeModeNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * SwipeModeScreen - A dedicated full-screen view for processing shopping list items via swipe gestures.
 * 
 * This screen shows only unchecked items from the currently active list as swipeable cards.
 * - Swipe right: marks the item as completed/checked in global state.
 * - Swipe left: skips the item (moves to next card without marking).
 * 
 * All state changes are persisted through the AppContext which handles storage automatically.
 */
export function SwipeModeScreen() {
  const navigation = useNavigation<SwipeModeNavigationProp>();
  const { state, getCurrentList, toggleProduct, completeList } = useApp();
  const theme = useTheme();

  // Get the current active list from global state (source of truth)
  const currentList = getCurrentList();

  // Filter to only show unchecked items
  const uncheckedItems = useMemo(() => {
    if (!currentList) return [];
    return currentList.items.filter(item => !item.isChecked);
  }, [currentList]);

  // Handler for swipe right - mark item as completed
  const handleSwipeRight = useCallback((productId: string) => {
    if (currentList) {
      toggleProduct(currentList.id, productId);
    }
  }, [currentList, toggleProduct]);

  // Handler for swipe left - skip item (no state change, just move to next card)
  const handleSwipeLeft = useCallback((_productId: string) => {
    // Skip functionality: do nothing to state, the card stack handles the visual removal
    // This allows the user to revisit skipped items if they re-enter swipe mode
  }, []);

  // Handler for completing the entire list
  const handleCompleteList = useCallback(() => {
    if (currentList) {
      completeList(currentList.id);
      navigation.goBack();
    }
  }, [currentList, completeList, navigation]);

  // Navigate back to the normal list view
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // If no active list exists, show a message and allow going back
  if (!currentList) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={handleGoBack}
          />
          <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            Swipe Mode
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="list-outline" size={64} color={theme.colors.outline} />
          </View>
          <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            No List Selected
          </Text>
          <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Select a shopping list first to use swipe mode
          </Text>
          <Button
            mode="contained"
            onPress={handleGoBack}
            style={styles.backButton}
            icon="arrow-left"
          >
            Back to Lists
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // If all items are checked or list is empty, show "All Done" state
  if (uncheckedItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={handleGoBack}
          />
          <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {currentList.name}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons name="checkmark-circle" size={64} color={theme.colors.primary} />
          </View>
          <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            All Items Done!
          </Text>
          <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {currentList.items.length === 0
              ? 'Your list is empty. Add some items first!'
              : "You've completed all items in this list"}
          </Text>
          <Button
            mode="contained"
            onPress={handleGoBack}
            style={styles.backButton}
            icon="arrow-left"
          >
            Back to List
          </Button>
          {currentList.items.length > 0 && (
            <Button
              mode="outlined"
              onPress={handleCompleteList}
              style={styles.completeButton}
              icon="check-circle-outline"
            >
              Complete Shopping
            </Button>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Main swipe mode view with card stack
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with list name and back button */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={theme.colors.onSurface}
          size={24}
          onPress={handleGoBack}
        />
        <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
          {currentList.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main card stack area */}
      <View style={styles.cardStackContainer}>
        <SwipeCardStack
          items={uncheckedItems}
          currency={state.settings.currency}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          onComplete={handleCompleteList}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 48, // Same width as IconButton to center the title
  },
  cardStackContainer: {
    flex: 1,
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
    marginBottom: 32,
    lineHeight: 24,
  },
  backButton: {
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
  },
  completeButton: {
    borderRadius: 12,
    minWidth: 200,
  },
});
