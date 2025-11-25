import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  FAB,
  IconButton,
  ProgressBar,
  useTheme,
  TouchableRipple,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { ProductItem, AddProductModal } from '../components';
import { Product, RootStackParamList } from '../types';
import { formatPrice, calculateTotalPrice, groupByCategory } from '../utils';

type ShoppingListNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ShoppingListScreen() {
  const navigation = useNavigation<ShoppingListNavigationProp>();
  const { state, getCurrentList, addProduct, toggleProduct, deleteProduct, completeList } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChecked, setShowChecked] = useState(true);
  const theme = useTheme();

  const currentList = getCurrentList();

  const { uncheckedItems, checkedItems } = useMemo(() => {
    if (!currentList) return { uncheckedItems: [], checkedItems: [] };
    return {
      uncheckedItems: currentList.items.filter(item => !item.isChecked),
      checkedItems: currentList.items.filter(item => item.isChecked),
    };
  }, [currentList]);

  const groupedUnchecked = useMemo(
    () => groupByCategory(uncheckedItems),
    [uncheckedItems]
  );

  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (currentList) {
      addProduct(currentList.id, productData);
    }
  };

  const handleToggleProduct = (productId: string) => {
    if (currentList) {
      toggleProduct(currentList.id, productId);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (currentList) {
      Alert.alert(
        'Delete Item',
        'Are you sure you want to remove this item?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteProduct(currentList.id, productId),
          },
        ]
      );
    }
  };

  const handleProductPress = (product: Product) => {
    if (currentList) {
      navigation.navigate('ProductDetails', { product, listId: currentList.id });
    }
  };

  const handleCompleteList = () => {
    if (currentList) {
      Alert.alert(
        'Complete Shopping',
        'Mark this shopping list as complete? It will be moved to history.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete',
            onPress: () => completeList(currentList.id),
          },
        ]
      );
    }
  };

  if (!currentList) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={64} color={theme.colors.outlineVariant} />
          <Text variant="titleLarge" style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
            No List Selected
          </Text>
          <Text variant="bodyMedium" style={[styles.emptyStateSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Select or create a shopping list from the Home screen
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalPrice = calculateTotalPrice(currentList.items);
  const progress =
    currentList.items.length > 0
      ? checkedItems.length / currentList.items.length
      : 0;

  const renderCategorySection = ([category, items]: [string, Product[]]) => (
    <View key={category} style={styles.categorySection}>
      <Text variant="labelLarge" style={[styles.categoryTitle, { color: theme.colors.onSurfaceVariant }]}>
        {category}
      </Text>
      {items.map(item => (
        <ProductItem
          key={item.id}
          product={item}
          currency={state.settings.currency}
          onToggle={() => handleToggleProduct(item.id)}
          onPress={() => handleProductPress(item)}
          onDelete={() => handleDeleteProduct(item.id)}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall" numberOfLines={1} style={[styles.title, { color: theme.colors.onSurface }]}>
            {currentList.name}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {currentList.items.length} items •{' '}
            {formatPrice(totalPrice, state.settings.currency)}
          </Text>
        </View>
        <IconButton
          icon="check-circle-outline"
          iconColor={theme.colors.primary}
          size={28}
          onPress={handleCompleteList}
          disabled={currentList.items.length === 0}
        />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          progress={progress}
          color={theme.colors.primary}
          style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}
        />
        <Text variant="labelSmall" style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
          {checkedItems.length} / {currentList.items.length} completed
        </Text>
      </View>

      {/* Items List */}
      {currentList.items.length === 0 ? (
        <View style={styles.emptyListState}>
          <Ionicons name="basket-outline" size={48} color={theme.colors.outlineVariant} />
          <Text variant="titleMedium" style={[styles.emptyListTitle, { color: theme.colors.onSurface }]}>
            List is Empty
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Tap the button below to add items
          </Text>
        </View>
      ) : (
        <FlatList
          data={Object.entries(groupedUnchecked)}
          keyExtractor={([category]) => category}
          renderItem={({ item }) => renderCategorySection(item)}
          ListFooterComponent={
            checkedItems.length > 0 ? (
              <View style={styles.checkedSection}>
                <TouchableRipple
                  style={styles.checkedHeader}
                  onPress={() => setShowChecked(!showChecked)}
                >
                  <View style={styles.checkedHeaderContent}>
                    <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                      Checked ({checkedItems.length})
                    </Text>
                    <Ionicons
                      name={showChecked ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </View>
                </TouchableRipple>
                {showChecked &&
                  checkedItems.map(item => (
                    <ProductItem
                      key={item.id}
                      product={item}
                      currency={state.settings.currency}
                      onToggle={() => handleToggleProduct(item.id)}
                      onPress={() => handleProductPress(item)}
                      onDelete={() => handleDeleteProduct(item.id)}
                    />
                  ))}
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
        color={theme.colors.onPrimaryContainer}
        onPress={() => setShowAddModal(true)}
      />

      {/* Add Product Modal */}
      <AddProductModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
        defaultUnit={state.settings.defaultUnit}
      />
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
    maxWidth: 280,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  categorySection: {
    marginTop: 12,
  },
  categoryTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkedSection: {
    marginTop: 16,
  },
  checkedHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  checkedHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  emptyListState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListTitle: {
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 16,
  },
});
