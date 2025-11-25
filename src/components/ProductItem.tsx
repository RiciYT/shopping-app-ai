import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { formatPrice, getCategoryColor } from '../utils';

interface ProductItemProps {
  product: Product;
  currency?: string;
  onToggle: () => void;
  onPress: () => void;
  onDelete?: () => void;
}

export function ProductItem({
  product,
  currency = 'USD',
  onToggle,
  onPress,
  onDelete,
}: ProductItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, product.isChecked && styles.checkedContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[styles.checkbox, product.isChecked && styles.checkedCheckbox]}
        onPress={onToggle}
      >
        {product.isChecked && (
          <Ionicons name="checkmark" size={16} color="#fff" />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.name, product.isChecked && styles.checkedText]}
            numberOfLines={1}
          >
            {product.name}
          </Text>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(product.category) + '20' },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: getCategoryColor(product.category) },
              ]}
            >
              {product.category}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.quantity}>
            {product.quantity} {product.unit}
          </Text>
          {product.price !== undefined && product.price > 0 && (
            <Text style={styles.price}>
              {formatPrice(product.price * product.quantity, currency)}
            </Text>
          )}
        </View>

        {product.notes && (
          <Text style={styles.notes} numberOfLines={1}>
            {product.notes}
          </Text>
        )}
      </View>

      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkedContainer: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedCheckbox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 12,
  },
  notes: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
