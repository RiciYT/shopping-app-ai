import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  IconButton,
  useTheme,
  TouchableRipple,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { ListCard, BudgetViewPlaceholder, MultiUserSyncPlaceholder } from '../components';
import { ShoppingList, RootStackParamList } from '../types';
import { formatPrice, calculateTotalPrice, COMMON_PRODUCTS, getCategoryColor } from '../utils';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { state, addList, deleteList, dispatch, addProduct, getCurrentList } = useApp();
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showPlaceholder, setShowPlaceholder] = useState<'budget' | 'multiuser' | null>(null);
  const theme = useTheme();

  const activeLists = state.shoppingLists.filter(list => !list.isArchived);

  // Get frequently bought items from history
  const frequentItems = useMemo(() => {
    const itemCounts: Record<string, { name: string; category: string; count: number }> = {};
    
    // Count items from all completed lists
    state.shoppingLists.filter(list => list.isArchived).forEach(list => {
      list.items.forEach(item => {
        const key = item.name.toLowerCase();
        if (!itemCounts[key]) {
          itemCounts[key] = { name: item.name, category: item.category, count: 0 };
        }
        itemCounts[key].count += 1;
      });
    });

    // Also include some common products if no history
    if (Object.keys(itemCounts).length < 6) {
      COMMON_PRODUCTS.slice(0, 6).forEach(product => {
        const key = product.name.toLowerCase();
        if (!itemCounts[key]) {
          itemCounts[key] = { ...product, count: 0 };
        }
      });
    }

    return Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [state.shoppingLists]);

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const list = addList(newListName.trim());
    setNewListName('');
    setShowNewListModal(false);
    dispatch({ type: 'SET_CURRENT_LIST', payload: list.id });
    navigation.navigate('MainTabs');
  };

  const handleSelectList = (list: ShoppingList) => {
    dispatch({ type: 'SET_CURRENT_LIST', payload: list.id });
    navigation.navigate('MainTabs');
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
    const currentList = getCurrentList();
    if (currentList) {
      addProduct(currentList.id, {
        name: item.name,
        category: item.category,
        quantity: 1,
        unit: 'pcs',
        isChecked: false,
      });
    } else if (activeLists.length > 0) {
      // If no current list, use the first active list
      const firstList = activeLists[0];
      dispatch({ type: 'SET_CURRENT_LIST', payload: firstList.id });
      addProduct(firstList.id, {
        name: item.name,
        category: item.category,
        quantity: 1,
        unit: 'pcs',
        isChecked: false,
      });
    } else {
      // Create a new list and add the item
      const newList = addList('Shopping List');
      addProduct(newList.id, {
        name: item.name,
        category: item.category,
        quantity: 1,
        unit: 'pcs',
        isChecked: false,
      });
    }
  };

  const totalItems = activeLists.reduce((sum, list) => sum + list.items.length, 0);

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Welcome back
            </Text>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              Shopping Lists
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="account-group-outline"
              iconColor={theme.colors.onSurfaceVariant}
              size={24}
              onPress={() => setShowPlaceholder('multiuser')}
              style={styles.headerButton}
            />
            <IconButton
              icon="wallet-outline"
              iconColor={theme.colors.onSurfaceVariant}
              size={24}
              onPress={() => setShowPlaceholder('budget')}
              style={styles.headerButton}
            />
          </View>
        </View>

        {/* Primary Action - Create List */}
        <TouchableRipple
          style={[styles.createListCard, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowNewListModal(true)}
          borderless
        >
          <View style={styles.createListContent}>
            <View style={styles.createListIcon}>
              <Ionicons name="add-circle" size={32} color="#fff" />
            </View>
            <View style={styles.createListText}>
              <Text variant="titleMedium" style={styles.createListTitle}>
                Create New List
              </Text>
              <Text variant="bodySmall" style={styles.createListSubtitle}>
                Start a new shopping list
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
          </View>
        </TouchableRipple>

        {/* Quick Stats - Simplified */}
        {activeLists.length > 0 && (
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
                {activeLists.length}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Active Lists
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.tertiary }]}>
                {totalItems}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Items
              </Text>
            </View>
          </View>
        )}

        {/* Frequent Items */}
        {activeLists.length > 0 && frequentItems.length > 0 && (
          <View style={styles.frequentSection}>
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
              QUICK ADD
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.frequentItemsScroll}
            >
              {frequentItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.frequentItem, { backgroundColor: theme.colors.surface }]}
                  onPress={() => handleQuickAdd(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.frequentItemDot, { backgroundColor: getCategoryColor(item.category) }]} />
                  <Text variant="labelMedium" numberOfLines={1} style={{ color: theme.colors.onSurface }}>
                    {item.name}
                  </Text>
                  <Ionicons name="add" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Lists Section */}
        {activeLists.length > 0 && (
          <View style={styles.listsSection}>
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
              YOUR LISTS
            </Text>
            {activeLists.map(list => (
              <ListCard
                key={list.id}
                list={list}
                onPress={() => handleSelectList(list)}
                onLongPress={() => handleDeleteList(list.id)}
              />
            ))}
          </View>
        )}

        {activeLists.length === 0 && renderEmptyState()}
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    margin: 0,
  },
  createListCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  createListContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  createListIcon: {
    marginRight: 16,
  },
  createListText: {
    flex: 1,
  },
  createListTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  createListSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  statNumber: {
    fontWeight: '700',
  },
  frequentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: 1,
    fontWeight: '600',
  },
  frequentItemsScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  frequentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  frequentItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listsSection: {
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
