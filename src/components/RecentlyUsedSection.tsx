import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import {
  Text,
  useTheme,
  TouchableRipple,
  IconButton,
  Button,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { getCategoryColor, getCategoryIcon } from '../utils';

interface RecentlyUsedSectionProps {
  items: Product[];
  onSelectItem: (item: Product) => void;
  maxVisibleItems?: number;
}

export function RecentlyUsedSection({
  items,
  onSelectItem,
  maxVisibleItems = 3,
}: RecentlyUsedSectionProps) {
  const theme = useTheme();
  const [showAllModal, setShowAllModal] = useState(false);

  // Sort by most recently used and limit visible items
  const sortedItems = useMemo(() => {
    // Pre-calculate timestamps for efficient sorting
    const itemsWithTimestamp = items.map(item => ({
      item,
      timestamp: item.lastUsedAt 
        ? new Date(item.lastUsedAt).getTime() 
        : new Date(item.updatedAt).getTime()
    }));
    
    return itemsWithTimestamp
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(({ item }) => item);
  }, [items]);

  const visibleItems = sortedItems.slice(0, maxVisibleItems);
  const hasMore = sortedItems.length > maxVisibleItems;

  if (items.length === 0) return null;

  const renderQuickAddItem = (item: Product, isModal = false) => {
    const categoryColor = getCategoryColor(item.category);
    const categoryIcon = getCategoryIcon(item.category);
    
    return (
      <TouchableRipple
        key={item.id}
        onPress={() => {
          onSelectItem(item);
          if (isModal) setShowAllModal(false);
        }}
        style={[
          styles.quickAddItem,
          isModal ? styles.modalItem : null,
          { backgroundColor: theme.colors.surfaceVariant }
        ]}
      >
        <View style={styles.quickAddContent}>
          <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '20' }]}>
            <Ionicons
              name={categoryIcon as keyof typeof Ionicons.glyphMap}
              size={isModal ? 18 : 14}
              color={categoryColor}
            />
          </View>
          <Text 
            variant={isModal ? 'bodyMedium' : 'labelMedium'} 
            numberOfLines={1} 
            style={[styles.itemName, { color: theme.colors.onSurface }]}
          >
            {item.name}
          </Text>
          {isModal && (
            <Text 
              variant="bodySmall" 
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {item.quantity} {item.unit}
            </Text>
          )}
        </View>
      </TouchableRipple>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="time-outline" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelMedium" style={[styles.headerTitle, { color: theme.colors.onSurfaceVariant }]}>
            Recently Used
          </Text>
        </View>
        {hasMore && (
          <TouchableRipple
            onPress={() => setShowAllModal(true)}
            style={styles.showAllButton}
          >
            <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
              Show All ({sortedItems.length})
            </Text>
          </TouchableRipple>
        )}
      </View>

      {/* Single Row of Recent Items */}
      <View style={styles.itemsRow}>
        {visibleItems.map(item => renderQuickAddItem(item))}
      </View>

      {/* Show All Modal */}
      <Modal
        visible={showAllModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAllModal(false)}
      >
        <Pressable 
          style={styles.modalBackdrop} 
          onPress={() => setShowAllModal(false)}
        >
          <View 
            style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
            onStartShouldSetResponder={() => true}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginLeft: 8 }}>
                  Recently Used Items
                </Text>
              </View>
              <IconButton
                icon="close"
                iconColor={theme.colors.onSurfaceVariant}
                size={22}
                onPress={() => setShowAllModal(false)}
              />
            </View>

            {/* Items List */}
            <FlatList
              data={sortedItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderQuickAddItem(item, true)}
              style={styles.modalList}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}
            />

            {/* Close Button */}
            <View style={[styles.modalActions, { borderTopColor: theme.colors.outlineVariant }]}>
              <Button mode="text" onPress={() => setShowAllModal(false)}>
                Close
              </Button>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontWeight: '500',
  },
  showAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  quickAddItem: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    maxWidth: '32%',
  },
  modalItem: {
    flex: 0,
    maxWidth: '100%',
    marginBottom: 8,
  },
  quickAddContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 6,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    flex: 1,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 12,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalList: {
    maxHeight: 400,
  },
  modalListContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});
