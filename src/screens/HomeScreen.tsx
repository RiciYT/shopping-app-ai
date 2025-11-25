import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      <Ionicons name="cart-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Shopping Lists</Text>
      <Text style={styles.emptyStateSubtitle}>
        Create your first shopping list to get started
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => setShowNewListModal(true)}
      >
        <Text style={styles.emptyStateButtonText}>Create List</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Lists</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowPlaceholder('multiuser')}
          >
            <Ionicons name="people-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowPlaceholder('budget')}
          >
            <Ionicons name="wallet-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeLists.length}</Text>
          <Text style={styles.statLabel}>Active Lists</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {activeLists.reduce((sum, list) => sum + list.items.length, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatPrice(totalBudget, state.settings.currency)}
          </Text>
          <Text style={styles.statLabel}>Estimated</Text>
        </View>
      </View>

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
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNewListModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* New List Modal */}
      <Modal visible={showNewListModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Shopping List</Text>
            <TextInput
              style={styles.modalInput}
              value={newListName}
              onChangeText={setNewListName}
              placeholder="List name (e.g., Weekly Groceries)"
              placeholderTextColor="#999"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setNewListName('');
                  setShowNewListModal(false);
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  !newListName.trim() && styles.modalButtonDisabled,
                ]}
                onPress={handleCreateList}
                disabled={!newListName.trim()}
              >
                <Text style={styles.modalButtonConfirmText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Placeholder Modals */}
      <Modal visible={showPlaceholder === 'budget'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.placeholderModal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPlaceholder(null)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <BudgetViewPlaceholder />
          </View>
        </View>
      </Modal>

      <Modal visible={showPlaceholder === 'multiuser'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.placeholderModal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPlaceholder(null)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <MultiUserSyncPlaceholder />
          </View>
        </View>
      </Modal>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
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
  emptyStateButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonConfirm: {
    backgroundColor: '#4CAF50',
  },
  modalButtonConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonDisabled: {
    backgroundColor: '#ccc',
  },
  placeholderModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    paddingTop: 40,
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
});
