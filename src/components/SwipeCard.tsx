import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Product } from '../types';
import { formatPrice, getCategoryColor, getCategoryIcon } from '../utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const CARD_WIDTH = SCREEN_WIDTH - 40;

interface SwipeCardProps {
  product: Product;
  currency?: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isFirst: boolean;
  index: number;
}

export function SwipeCard({
  product,
  currency = 'USD',
  onSwipeLeft,
  onSwipeRight,
  isFirst,
  index,
}: SwipeCardProps) {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const categoryColor = getCategoryColor(product.category);
  const categoryIcon = getCategoryIcon(product.category);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY * 0.3;
      cardRotate.value = interpolate(
        translateX.value,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-15, 0, 15],
        Extrapolation.CLAMP
      );
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        // Swipe right - mark as completed
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(onSwipeRight)();
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Swipe left - skip
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(onSwipeLeft)();
      } else {
        // Return to center
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        cardRotate.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const scale = isFirst
      ? 1
      : interpolate(index, [0, 1, 2], [1, 0.95, 0.9], Extrapolation.CLAMP);
    const translateYOffset = isFirst
      ? translateY.value
      : interpolate(index, [0, 1, 2], [0, 10, 20], Extrapolation.CLAMP);

    return {
      transform: [
        { translateX: isFirst ? translateX.value : 0 },
        { translateY: translateYOffset },
        { rotate: isFirst ? `${cardRotate.value}deg` : '0deg' },
        { scale },
      ],
      zIndex: 3 - index,
      opacity: index < 3 ? 1 : 0,
    };
  });

  const rightIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const leftIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface },
        cardStyle,
      ]}
    >
      {/* Swipe Indicators */}
      {isFirst && (
        <>
          <Animated.View style={[styles.indicator, styles.rightIndicator, rightIndicatorStyle]}>
            <View style={[styles.indicatorContent, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="checkmark" size={32} color="#fff" />
              <Text style={styles.indicatorText}>Done</Text>
            </View>
          </Animated.View>
          <Animated.View style={[styles.indicator, styles.leftIndicator, leftIndicatorStyle]}>
            <View style={[styles.indicatorContent, { backgroundColor: theme.colors.outline }]}>
              <Ionicons name="close" size={32} color="#fff" />
              <Text style={styles.indicatorText}>Skip</Text>
            </View>
          </Animated.View>
        </>
      )}

      {/* Category Header */}
      <View style={[styles.categoryHeader, { backgroundColor: categoryColor + '20' }]}>
        <View style={[styles.categoryIcon, { backgroundColor: categoryColor }]}>
          <Ionicons
            name={categoryIcon as keyof typeof Ionicons.glyphMap}
            size={24}
            color="#fff"
          />
        </View>
        <Text variant="labelLarge" style={[styles.categoryText, { color: categoryColor }]}>
          {product.category}
        </Text>
      </View>

      {/* Product Content */}
      <View style={styles.content}>
        <Text variant="headlineMedium" style={[styles.productName, { color: theme.colors.onSurface }]}>
          {product.name}
        </Text>

        <View style={styles.detailsRow}>
          <View style={styles.quantityBadge}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {product.quantity} {product.unit}
            </Text>
          </View>

          {product.price !== undefined && product.price > 0 && (
            <View style={[styles.priceBadge, { backgroundColor: theme.colors.primaryContainer }]}>
              <Ionicons name="pricetag" size={16} color={theme.colors.primary} />
              <Text variant="titleMedium" style={[styles.priceText, { color: theme.colors.primary }]}>
                {formatPrice(product.price * product.quantity, currency)}
              </Text>
            </View>
          )}
        </View>

        {product.notes && (
          <View style={[styles.notesContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="document-text-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
              {product.notes}
            </Text>
          </View>
        )}
      </View>

      {/* Swipe Hint */}
      {isFirst && (
        <View style={styles.swipeHint}>
          <Ionicons name="arrow-back" size={16} color={theme.colors.outline} />
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            Skip
          </Text>
          <View style={styles.swipeHintDivider} />
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            Done
          </Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.outline} />
        </View>
      )}
    </Animated.View>
  );

  if (isFirst) {
    return (
      <GestureDetector gesture={panGesture}>
        {cardContent}
      </GestureDetector>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    minHeight: 280,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
      },
    }),
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 8,
  },
  productName: {
    fontWeight: '700',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  quantityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  priceText: {
    fontWeight: '600',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  indicator: {
    position: 'absolute',
    top: 20,
    zIndex: 10,
  },
  leftIndicator: {
    left: 20,
  },
  rightIndicator: {
    right: 20,
  },
  indicatorContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  indicatorText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 2,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  swipeHintDivider: {
    flex: 1,
  },
});
