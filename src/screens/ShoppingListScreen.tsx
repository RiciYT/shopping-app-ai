import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  FAB,
  IconButton,
  ProgressBar,
  useTheme,
  TouchableRipple,
  Menu,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { ProductItem, AddProductModal } from '../components';
import { Product, RootStackParamList } from '../types';
import { formatPrice, calculateTotalPrice, groupByCategoryWithStoreOrder, StoreName, getCategoryColor, getCategoryIcon } from '../utils';

type ShoppingListNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STORES: StoreName[] = ['Custom', 'Lidl', 'Coop', 'Migros'];

export function ShoppingListScreen() {
  const navigation = useNavigation<ShoppingListNavigationProp>();
  const { state, getCurrentList, addProduct, toggleProduct, deleteProduct, completeList } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChecked, setShowChecked] = useState(true);
  const [selectedStore, setSelectedStore] = useState<StoreName>('Custom');
  const [showStoreMenu, setShowStoreMenu] = useState(false);
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
    () => groupByCategoryWithStoreOrder(uncheckedItems, selectedStore),
    [uncheckedItems, selectedStore]
  );

  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (currentList) {
      addProduct(currentList.id, productData);
    }
  };

  const handleToggleProduct = useCallback((productId: string) => {
    if (currentList) {
      toggleProduct(currentList.id, productId);
    }
  }, [currentList, toggleProduct]);

  const handleDeleteProduct = useCallback((productId: string) => {
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
  }, [currentList, deleteProduct]);

  const handleProductPress = useCallback((product: Product) => {
    if (currentList) {
      navigation.navigate('ProductDetails', { product, listId: currentList.id });
    }
  }, [currentList, navigation]);

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
          <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons name="list-outline" size={48} color={theme.colors.primary} />
          </View>
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
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIconContainer, { backgroundColor: getCategoryColor(category) + '20' }]}>
          <Ionicons
            name={getCategoryIcon(category) as keyof typeof Ionicons.glyphMap}
            size={16}
            color={getCategoryColor(category)}
          />
        </View>
        <Text variant="labelLarge" style={[styles.categoryTitle, { color: theme.colors.onSurfaceVariant }]}>
          {category}
        </Text>
        <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
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
        <View style={styles.headerMain}>
          <Text variant="headlineSmall" numberOfLines={1} style={[styles.title, { color: theme.colors.onSurface }]}>
            {currentList.name}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {currentList.items.length} items • {formatPrice(totalPrice, state.settings.currency)}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {/* Store Sorting Menu */}
          <Menu
            visible={showStoreMenu}
            onDismiss={() => setShowStoreMenu(false)}
            anchor={
              <TouchableRipple
                style={[styles.storeButton, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => setShowStoreMenu(true)}
                borderless
              >
                <View style={styles.storeButtonContent}>
                  <Ionicons name="storefront-outline" size={16} color={theme.colors.onSurfaceVariant} />
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {selectedStore}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={theme.colors.onSurfaceVariant} />
                </View>
              </TouchableRipple>
            }
          >
            {STORES.map(store => (
              <Menu.Item
                key={store}
                onPress={() => {
                  setSelectedStore(store);
                  setShowStoreMenu(false);
                }}
                title={store === 'Custom' ? 'Default Order' : store}
                leadingIcon={selectedStore === store ? 'check' : undefined}
              />
            ))}
          </Menu>
          <IconButton
            icon="check-circle-outline"
            iconColor={theme.colors.primary}
            size={24}
            onPress={handleCompleteList}
            disabled={currentList.items.length === 0}
          />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Progress
          </Text>
          <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: '600' }}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
        <ProgressBar
          progress={progress}
          color={theme.colors.primary}
          style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}
        />
      </View>

      {/* Items List */}
      {currentList.items.length === 0 ? (
        <View style={styles.emptyListState}>
          <View style={[styles.emptyListIconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="basket-outline" size={40} color={theme.colors.outline} />
          </View>
          <Text variant="titleMedium" style={[styles.emptyListTitle, { color: theme.colors.onSurface }]}>
            Your List is Empty
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Tap the + button to add your first item
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedUnchecked}
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
                    <View style={styles.checkedHeaderLeft}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={theme.colors.primary}
                      />
                      <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
                        Completed
                      </Text>
                      <Chip 
                        compact 
                        style={[styles.checkedCount, { backgroundColor: theme.colors.primaryContainer }]}
                        textStyle={{ fontSize: 12, color: theme.colors.primary }}
                      >
                        {checkedItems.length}
                      </Chip>
                    </View>
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
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerMain: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  storeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  listContent: {
    paddingBottom: 100,
  },
  categorySection: {
    marginTop: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 10,
  },
  categoryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    flex: 1,
    fontWeight: '600',
  },
  checkedSection: {
    marginTop: 16,
    paddingTop: 8,
  },
  checkedHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  checkedHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkedCount: {
    marginLeft: 8,
    height: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    marginTop: 16,
    fontWeight: '600',
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  emptyListState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyListIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyListTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: 16,
    elevation: 4,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
});
