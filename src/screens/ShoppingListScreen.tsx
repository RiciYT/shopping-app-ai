import React, { useState, useMemo } from 'react';
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No List Selected</Text>
          <Text style={styles.emptyStateSubtitle}>
            Select or create a shopping list from the Home screen
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalPrice = calculateTotalPrice(currentList.items);
  const progress =
    currentList.items.length > 0
      ? (checkedItems.length / currentList.items.length) * 100
      : 0;

  const renderCategorySection = ([category, items]: [string, Product[]]) => (
    <View key={category} style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{category}</Text>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title} numberOfLines={1}>
            {currentList.name}
          </Text>
          <Text style={styles.subtitle}>
            {currentList.items.length} items •{' '}
            {formatPrice(totalPrice, state.settings.currency)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteList}
          disabled={currentList.items.length === 0}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {checkedItems.length} / {currentList.items.length} completed
        </Text>
      </View>

      {/* Items List */}
      {currentList.items.length === 0 ? (
        <View style={styles.emptyListState}>
          <Ionicons name="basket-outline" size={48} color="#ccc" />
          <Text style={styles.emptyListTitle}>List is Empty</Text>
          <Text style={styles.emptyListSubtitle}>
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
                <TouchableOpacity
                  style={styles.checkedHeader}
                  onPress={() => setShowChecked(!showChecked)}
                >
                  <Text style={styles.checkedHeaderText}>
                    Checked ({checkedItems.length})
                  </Text>
                  <Ionicons
                    name={showChecked ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
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
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    maxWidth: 280,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  completeButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  categorySection: {
    marginTop: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkedSection: {
    marginTop: 16,
  },
  checkedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  checkedHeaderText: {
    fontSize: 14,
    fontWeight: '600',
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
  emptyListState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyListSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
