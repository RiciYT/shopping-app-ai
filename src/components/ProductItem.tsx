import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Checkbox, IconButton, Chip, useTheme } from 'react-native-paper';
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
  const theme = useTheme();
  const categoryColor = getCategoryColor(product.category);

  return (
    <Card
      style={[
        styles.container,
        { backgroundColor: product.isChecked ? theme.colors.surfaceVariant : theme.colors.elevation.level1 },
        product.isChecked && styles.checkedContainer,
      ]}
      onPress={onPress}
      mode="elevated"
    >
      <Card.Content style={styles.content}>
        <Checkbox
          status={product.isChecked ? 'checked' : 'unchecked'}
          onPress={onToggle}
          color={theme.colors.primary}
        />

        <View style={styles.info}>
          <View style={styles.header}>
            <Text
              variant="titleSmall"
              numberOfLines={1}
              style={[
                { color: theme.colors.onSurface },
                product.isChecked && styles.checkedText,
              ]}
            >
              {product.name}
            </Text>
            <Chip
              compact
              textStyle={[styles.categoryChipText, { color: categoryColor }]}
              style={[styles.categoryChip, { backgroundColor: categoryColor + '20' }]}
            >
              {product.category}
            </Chip>
          </View>

          <View style={styles.details}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {product.quantity} {product.unit}
            </Text>
            {product.price !== undefined && product.price > 0 && (
              <Text variant="labelMedium" style={[styles.price, { color: theme.colors.primary }]}>
                {formatPrice(product.price * product.quantity, currency)}
              </Text>
            )}
          </View>

          {product.notes && (
            <Text variant="bodySmall" numberOfLines={1} style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}>
              {product.notes}
            </Text>
          )}
        </View>

        {onDelete && (
          <IconButton
            icon="delete-outline"
            iconColor={theme.colors.error}
            size={20}
            onPress={onDelete}
            style={styles.deleteButton}
          />
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  checkedContainer: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  info: {
    flex: 1,
    marginLeft: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkedText: {
    textDecorationLine: 'line-through',
  },
  categoryChip: {
    marginLeft: 8,
    height: 24,
  },
  categoryChipText: {
    fontSize: 10,
    marginVertical: 0,
    marginHorizontal: 4,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    marginLeft: 12,
    fontWeight: '600',
  },
  notes: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    marginLeft: 4,
  },
});
