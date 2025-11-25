import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
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
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { ListCard, BudgetViewPlaceholder, MultiUserSyncPlaceholder } from '../components';
import { ShoppingList, RootStackParamList } from '../types';
import { formatPrice, calculateTotalPrice } from '../utils';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { state, addList, deleteList, dispatch } = useApp();
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showPlaceholder, setShowPlaceholder] = useState<'budget' | 'multiuser' | null>(null);
  const theme = useTheme();

  const activeLists = state.shoppingLists.filter(list => !list.isArchived);

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

  const totalBudget = activeLists.reduce(
    (sum, list) => sum + calculateTotalPrice(list.items),
    0
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cart-outline" size={64} color={theme.colors.outlineVariant} />
      <Text variant="titleLarge" style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
        No Shopping Lists
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyStateSubtitle, { color: theme.colors.onSurfaceVariant }]}>
        Create your first shopping list to get started
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowNewListModal(true)}
        style={styles.emptyStateButton}
      >
        Create List
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Shopping Lists
        </Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="account-group-outline"
            iconColor={theme.colors.onSurfaceVariant}
            size={24}
            onPress={() => setShowPlaceholder('multiuser')}
          />
          <IconButton
            icon="wallet-outline"
            iconColor={theme.colors.onSurfaceVariant}
            size={24}
            onPress={() => setShowPlaceholder('budget')}
          />
        </View>
      </View>

      {/* Quick Stats Card */}
      <Card style={[styles.statsCard, { backgroundColor: theme.colors.elevation.level1 }]} mode="elevated">
        <Card.Content style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
              {activeLists.length}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Active Lists
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.statItem}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
              {activeLists.reduce((sum, list) => sum + list.items.length, 0)}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Total Items
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={styles.statItem}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
              {formatPrice(totalBudget, state.settings.currency)}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Estimated
            </Text>
          </View>
        </Card.Content>
      </Card>

      {activeLists.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={activeLists}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ListCard
              list={item}
              onPress={() => handleSelectList(item)}
              onLongPress={() => handleDeleteList(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
        color={theme.colors.onPrimaryContainer}
        onPress={() => setShowNewListModal(true)}
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
            autoFocus
          />
          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => {
                setNewListName('');
                setShowNewListModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateList}
              disabled={!newListName.trim()}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  statsContent: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  listContent: {
    paddingBottom: 100,
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
  emptyStateButton: {
    marginTop: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 16,
  },
  modalContent: {
    margin: 20,
    borderRadius: 28,
    padding: 24,
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  placeholderModal: {
    margin: 20,
    borderRadius: 28,
    padding: 24,
    paddingTop: 48,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
