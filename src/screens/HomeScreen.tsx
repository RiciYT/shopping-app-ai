import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  IconButton,
  useTheme,
  TouchableRipple,
  Menu,
  ProgressBar,
  Chip,
  Searchbar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { ProductItem, AddProductModal, BudgetViewPlaceholder, MultiUserSyncPlaceholder } from '../components';
import { ShoppingList, Product, RootStackParamList } from '../types';
import { formatPrice, calculateTotalPrice, groupByCategoryWithStoreOrder, StoreName, getCategoryColor, getCategoryIcon, COMMON_PRODUCTS } from '../utils';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STORES: StoreName[] = ['Custom', 'Lidl', 'Coop', 'Migros'];

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { state, addList, deleteList, dispatch, addProduct, getCurrentList, toggleProduct, deleteProduct, completeList } = useApp();
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showPlaceholder, setShowPlaceholder] = useState<'budget' | 'multiuser' | null>(null);
  const [showListMenu, setShowListMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChecked, setShowChecked] = useState(true);
  const [selectedStore, setSelectedStore] = useState<StoreName>('Custom');
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

  const currentList = getCurrentList();
  const activeLists = state.shoppingLists.filter(list => !list.isArchived);

  // Get recently used items based on lastUsedAt and timesUsed
  const recentlyUsedItems = useMemo(() => {
    const itemMap: Record<string, { name: string; category: string; lastUsedAt?: Date; timesUsed: number }> = {};
    
    // Collect all items from all lists (including archived) with usage stats
    state.shoppingLists.forEach(list => {
      list.items.forEach(item => {
        const key = item.name.toLowerCase();
        if (!itemMap[key]) {
          itemMap[key] = { 
            name: item.name, 
            category: item.category, 
            lastUsedAt: item.lastUsedAt, 
            timesUsed: item.timesUsed || 0 
          };
        } else {
          // Update with most recent usage
          if (item.lastUsedAt && (!itemMap[key].lastUsedAt || item.lastUsedAt > itemMap[key].lastUsedAt)) {
            itemMap[key].lastUsedAt = item.lastUsedAt;
          }
          itemMap[key].timesUsed = Math.max(itemMap[key].timesUsed, item.timesUsed || 0);
        }
      });
    });

    // Also include items from completed/archived lists
    state.shoppingLists.filter(list => list.isArchived).forEach(list => {
      list.items.forEach(item => {
        const key = item.name.toLowerCase();
        if (!itemMap[key]) {
          itemMap[key] = { 
            name: item.name, 
            category: item.category, 
            lastUsedAt: list.completedAt, 
            timesUsed: 1 
          };
        } else {
          itemMap[key].timesUsed += 1;
        }
      });
    });

    // If no history, show common products
    if (Object.keys(itemMap).length < 6) {
      COMMON_PRODUCTS.slice(0, 8).forEach(product => {
        const key = product.name.toLowerCase();
        if (!itemMap[key]) {
          itemMap[key] = { ...product, timesUsed: 0 };
        }
      });
    }

    // Sort by lastUsedAt (most recent) and timesUsed (most used)
    return Object.values(itemMap)
      .sort((a, b) => {
        // First by timesUsed
        if (b.timesUsed !== a.timesUsed) return b.timesUsed - a.timesUsed;
        // Then by lastUsedAt
        if (a.lastUsedAt && b.lastUsedAt) {
          return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
        }
        if (a.lastUsedAt) return -1;
        if (b.lastUsedAt) return 1;
        return 0;
      })
      .slice(0, 8);
  }, [state.shoppingLists]);

  const { uncheckedItems, checkedItems } = useMemo(() => {
    if (!currentList) return { uncheckedItems: [], checkedItems: [] };
    
    let items = currentList.items;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    return {
      uncheckedItems: items.filter(item => !item.isChecked),
      checkedItems: items.filter(item => item.isChecked),
    };
  }, [currentList, searchQuery]);

  const groupedUnchecked = useMemo(
    () => groupByCategoryWithStoreOrder(uncheckedItems, selectedStore),
    [uncheckedItems, selectedStore]
  );

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const list = addList(newListName.trim());
    setNewListName('');
    setShowNewListModal(false);
    dispatch({ type: 'SET_CURRENT_LIST', payload: list.id });
  };

  const handleSelectList = (list: ShoppingList) => {
    dispatch({ type: 'SET_CURRENT_LIST', payload: list.id });
    setShowListMenu(false);
  };

  const handleDeleteList = (listId: string) => {
    Alert.alert(
      'Delete List',
      'Are you sure you want to delete this list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteList(listId) },
      ]
    );
  };

  const handleQuickAdd = (item: { name: string; category: string }) => {
    if (currentList) {
      addProduct(currentList.id, {
        name: item.name,
        category: item.category,
        quantity: 1,
        unit: 'pcs',
        isChecked: false,
        lastUsedAt: new Date(),
        timesUsed: 1,
      });
    } else if (activeLists.length > 0) {
      const firstList = activeLists[0];
      dispatch({ type: 'SET_CURRENT_LIST', payload: firstList.id });
      addProduct(firstList.id, {
        name: item.name,
        category: item.category,
        quantity: 1,
        unit: 'pcs',
        isChecked: false,
        lastUsedAt: new Date(),
        timesUsed: 1,
      });
    } else {
      const newList = addList('Shopping List');
      addProduct(newList.id, {
        name: item.name,
        category: item.category,
        quantity: 1,
        unit: 'pcs',
        isChecked: false,
        lastUsedAt: new Date(),
        timesUsed: 1,
      });
    }
  };

  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (currentList) {
      addProduct(currentList.id, {
        ...productData,
        lastUsedAt: new Date(),
        timesUsed: 1,
      });
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
        'Mark this shopping list as complete? It will be archived.',
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

  const totalPrice = currentList ? calculateTotalPrice(currentList.items) : 0;
  const progress = currentList && currentList.items.length > 0
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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
        <Ionicons name="cart-outline" size={48} color={theme.colors.primary} />
      </View>
      <Text variant="headlineSmall" style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
        Start Shopping Smarter
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyStateSubtitle, { color: theme.colors.onSurfaceVariant }]}>
        Create your first shopping list and never forget an item again
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowNewListModal(true)}
        style={styles.emptyStateButton}
        contentStyle={styles.emptyStateButtonContent}
        icon="plus"
      >
        Create Your First List
      </Button>
    </View>
  );

  const renderListContent = () => {
    if (!currentList) return renderEmptyState();

    if (currentList.items.length === 0) {
      return (
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
      );
    }

    return (
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
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {currentList ? 'Current List' : 'Welcome'}
          </Text>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {currentList ? currentList.name : 'Shopping Lists'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {/* List Menu Button */}
          <Menu
            visible={showListMenu}
            onDismiss={() => setShowListMenu(false)}
            anchor={
              <IconButton
                icon="menu"
                iconColor={theme.colors.onSurfaceVariant}
                size={24}
                onPress={() => setShowListMenu(true)}
                style={styles.headerButton}
              />
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                setShowListMenu(false);
                setShowNewListModal(true);
              }}
              title="Create New List"
              leadingIcon="plus"
            />
            {activeLists.length > 0 && (
              <>
                <View style={styles.menuDivider} />
                <Text variant="labelSmall" style={[styles.menuSectionTitle, { color: theme.colors.onSurfaceVariant }]}>
                  Switch to:
                </Text>
                {activeLists.map(list => (
                  <Menu.Item
                    key={list.id}
                    onPress={() => handleSelectList(list)}
                    title={list.name}
                    leadingIcon={list.id === state.currentListId ? 'check' : 'cart-outline'}
                  />
                ))}
              </>
            )}
          </Menu>
          {currentList && (
            <IconButton
              icon="check-circle-outline"
              iconColor={theme.colors.primary}
              size={24}
              onPress={handleCompleteList}
              disabled={currentList.items.length === 0}
            />
          )}
        </View>
      </View>

      {/* Progress Bar (when list is active) */}
      {currentList && currentList.items.length > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {currentList.items.length} items • {formatPrice(totalPrice, state.settings.currency)}
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
      )}

      {/* Search Bar */}
      {currentList && currentList.items.length > 0 && (
        <Searchbar
          placeholder="Search items..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
          inputStyle={styles.searchInput}
          iconColor={theme.colors.onSurfaceVariant}
        />
      )}

      {/* Recently Used Section */}
      {currentList && recentlyUsedItems.length > 0 && (
        <View style={styles.recentlyUsedSection}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            RECENTLY USED
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentlyUsedScroll}
          >
            {recentlyUsedItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.recentItem, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleQuickAdd(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.recentItemDot, { backgroundColor: getCategoryColor(item.category) }]} />
                <Text variant="labelMedium" numberOfLines={1} style={{ color: theme.colors.onSurface }}>
                  {item.name}
                </Text>
                <Ionicons name="add" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Store Sort Button (when list has items) */}
      {currentList && currentList.items.length > 0 && (
        <View style={styles.storeMenuContainer}>
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
        </View>
      )}

      {/* Main Content */}
      {renderListContent()}

      {/* FAB for adding products */}
      {currentList && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color="#fff"
          onPress={() => setShowAddModal(true)}
        />
      )}

      {/* Add Product Modal */}
      <AddProductModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
        defaultUnit={state.settings.defaultUnit}
      />

      {/* New List Modal */}
      <Portal>
        <Modal
          visible={showNewListModal}
          onDismiss={() => {
            setNewListName('');
            setShowNewListModal(false);
          }}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            New Shopping List
          </Text>
          <TextInput
            mode="outlined"
            label="List name"
            placeholder="e.g., Weekly Groceries"
            value={newListName}
            onChangeText={setNewListName}
            style={styles.modalInput}
            outlineStyle={styles.modalInputOutline}
            autoFocus
          />
          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => {
                setNewListName('');
                setShowNewListModal(false);
              }}
              textColor={theme.colors.onSurfaceVariant}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateList}
              disabled={!newListName.trim()}
              style={styles.modalButton}
            >
              Create
            </Button>
          </View>
        </Modal>

        {/* Budget Placeholder Modal */}
        <Modal
          visible={showPlaceholder === 'budget'}
          onDismiss={() => setShowPlaceholder(null)}
          contentContainerStyle={[styles.placeholderModal, { backgroundColor: theme.colors.surface }]}
        >
          <IconButton
            icon="close"
            iconColor={theme.colors.onSurface}
            style={styles.closeButton}
            onPress={() => setShowPlaceholder(null)}
          />
          <BudgetViewPlaceholder />
        </Modal>

        {/* Multi-User Placeholder Modal */}
        <Modal
          visible={showPlaceholder === 'multiuser'}
          onDismiss={() => setShowPlaceholder(null)}
          contentContainerStyle={[styles.placeholderModal, { backgroundColor: theme.colors.surface }]}
        >
          <IconButton
            icon="close"
            iconColor={theme.colors.onSurface}
            style={styles.closeButton}
            onPress={() => setShowPlaceholder(null)}
          />
          <MultiUserSyncPlaceholder />
        </Modal>
      </Portal>
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
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    margin: 0,
  },
  menuContent: {
    marginTop: 40,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  menuSectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
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
  searchBar: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  recentlyUsedSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: 1,
    fontWeight: '600',
  },
  recentlyUsedScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 1,
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
  recentItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  storeMenuContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  storeButton: {
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  storeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
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
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
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
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  emptyStateButton: {
    marginTop: 32,
    borderRadius: 14,
  },
  emptyStateButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  modalContent: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    marginBottom: 20,
    fontWeight: '600',
  },
  modalInput: {
    marginBottom: 20,
  },
  modalInputOutline: {
    borderRadius: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    borderRadius: 12,
  },
  placeholderModal: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
    paddingTop: 48,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
