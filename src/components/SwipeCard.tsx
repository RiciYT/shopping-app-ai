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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const CARD_WIDTH = SCREEN_WIDTH - 40;
// Card height takes ~70-80% of available space (accounting for header, progress, and bottom buttons)
const CARD_HEIGHT_RATIO = 0.55;
const MAX_CARD_HEIGHT = 420;
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * CARD_HEIGHT_RATIO, MAX_CARD_HEIGHT);

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
              <Ionicons name="checkmark" size={28} color="#fff" />
              <Text style={styles.indicatorText}>Done</Text>
            </View>
          </Animated.View>
          <Animated.View style={[styles.indicator, styles.leftIndicator, leftIndicatorStyle]}>
            <View style={[styles.indicatorContent, { backgroundColor: theme.colors.outline }]}>
              <Ionicons name="close" size={28} color="#fff" />
              <Text style={styles.indicatorText}>Skip</Text>
            </View>
          </Animated.View>
        </>
      )}

      {/* Category Badge at Top */}
      <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
        <Ionicons
          name={categoryIcon as keyof typeof Ionicons.glyphMap}
          size={18}
          color="#fff"
        />
        <Text style={styles.categoryBadgeText}>
          {product.category}
        </Text>
      </View>

      {/* Main Content - Centered Item Name and Details */}
      <View style={styles.content}>
        <Text variant="displaySmall" style={[styles.productName, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Quantity below name */}
        <Text variant="titleLarge" style={[styles.quantityText, { color: theme.colors.onSurfaceVariant }]}>
          {product.quantity} {product.unit}
        </Text>

        {/* Price if available */}
        {product.price !== undefined && product.price > 0 && (
          <View style={[styles.priceBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons name="pricetag" size={18} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.priceText, { color: theme.colors.primary }]}>
              {formatPrice(product.price * product.quantity, currency)}
            </Text>
          </View>
        )}

        {/* Notes if available */}
        {product.notes && (
          <View style={[styles.notesContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="document-text-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={[styles.notesText, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
              {product.notes}
            </Text>
          </View>
        )}
      </View>

      {/* Swipe Hint at bottom */}
      {isFirst && (
        <View style={[styles.swipeHint, { borderTopColor: theme.colors.outlineVariant }]}>
          <View style={styles.swipeHintItem}>
            <Ionicons name="arrow-back" size={16} color={theme.colors.outline} />
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              Skip
            </Text>
          </View>
          <View style={styles.swipeHintDivider} />
          <View style={styles.swipeHintItem}>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              Done
            </Text>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.outline} />
          </View>
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
    height: CARD_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 30,
        elevation: 10,
      },
    }),
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    marginTop: 24,
  },
  categoryBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  productName: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  quantityText: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
  },
  priceText: {
    fontWeight: '600',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    gap: 10,
    maxWidth: '100%',
  },
  notesText: {
    flex: 1,
  },
  indicator: {
    position: 'absolute',
    top: 24,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
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
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  swipeHintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swipeHintDivider: {
    flex: 1,
  },
});
