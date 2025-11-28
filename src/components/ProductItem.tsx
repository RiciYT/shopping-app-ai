import React from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Card, Text, Checkbox, useTheme, TouchableRipple } from 'react-native-paper';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { formatPrice, getCategoryColor, getCategoryIcon } from '../utils';

interface ProductItemProps {
  product: Product;
  currency?: string;
  onToggle: () => void;
  onPress: () => void;
  onLongPress?: () => void;
  onDelete?: () => void;
}

export function ProductItem({
  product,
  currency = 'USD',
  onToggle,
  onPress,
  onLongPress,
  onDelete,
}: ProductItemProps) {
  const theme = useTheme();
  const categoryColor = getCategoryColor(product.category);
  const categoryIcon = getCategoryIcon(product.category);

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.leftAction, { backgroundColor: theme.colors.primary }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="checkmark-circle" size={28} color="#fff" />
        </Animated.View>
        <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
          {product.isChecked ? 'Uncheck' : 'Done'}
        </Animated.Text>
      </View>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <TouchableRipple 
        onPress={onDelete} 
        style={[styles.rightAction, { backgroundColor: theme.colors.error }]}
      >
        <View style={styles.rightActionContent}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
          </Animated.View>
          <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
            Delete
          </Animated.Text>
        </View>
      </TouchableRipple>
    );
  };

  const handleSwipeOpen = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      onToggle();
    }
  };

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={onDelete ? renderRightActions : undefined}
      onSwipeableOpen={handleSwipeOpen}
      overshootLeft={false}
      overshootRight={false}
      leftThreshold={60}
      rightThreshold={60}
      friction={2}
    >
      <TouchableRipple
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={400}
        style={[
          styles.container,
          { 
            backgroundColor: product.isChecked 
              ? theme.colors.surfaceVariant 
              : theme.colors.surface,
          },
          product.isChecked && styles.checkedContainer,
        ]}
      >
        <View style={styles.content}>
          {/* Category Color Indicator */}
          <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
          
          {/* Checkbox */}
          <Checkbox
            status={product.isChecked ? 'checked' : 'unchecked'}
            onPress={onToggle}
            color={theme.colors.primary}
          />

          {/* Product Info */}
          <View style={styles.info}>
            <View style={styles.header}>
              <Text
                variant="bodyLarge"
                numberOfLines={1}
                style={[
                  styles.productName,
                  { color: theme.colors.onSurface },
                  product.isChecked && styles.checkedText,
                ]}
              >
                {product.name}
              </Text>
              
              {/* Category Tag */}
              <View style={[styles.categoryTag, { backgroundColor: categoryColor + '20' }]}>
                <Ionicons
                  name={categoryIcon as keyof typeof Ionicons.glyphMap}
                  size={12}
                  color={categoryColor}
                />
              </View>
            </View>

            <View style={styles.details}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {product.quantity} {product.unit}
              </Text>
              {product.price !== undefined && product.price > 0 && (
                <View style={styles.priceContainer}>
                  <Ionicons name="pricetag-outline" size={12} color={theme.colors.primary} />
                  <Text variant="labelMedium" style={[styles.price, { color: theme.colors.primary }]}>
                    {formatPrice(product.price * product.quantity, currency)}
                  </Text>
                </View>
              )}
            </View>

            {product.notes && (
              <Text 
                variant="bodySmall" 
                numberOfLines={1} 
                style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}
              >
                {product.notes}
              </Text>
            )}
          </View>
        </View>
      </TouchableRipple>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
    }),
  },
  checkedContainer: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
  },
  categoryIndicator: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
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
  productName: {
    fontWeight: '500',
    flex: 1,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  categoryTag: {
    padding: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 4,
  },
  price: {
    fontWeight: '600',
  },
  notes: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  leftAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 4,
    marginLeft: 16,
    borderRadius: 16,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 4,
    marginRight: 16,
    borderRadius: 16,
  },
  rightActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
