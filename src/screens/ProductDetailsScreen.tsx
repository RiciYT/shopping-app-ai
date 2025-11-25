import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  IconButton,
  TextInput,
  Chip,
  Button,
  useTheme,
  TouchableRipple,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { RootStackParamList, Product } from '../types';
import { formatPrice, formatDateTime, getCategoryColor, getCategoryIcon, CATEGORY_INFO, PRODUCT_UNITS } from '../utils';

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

export function ProductDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProductDetailsRouteProp>();
  const { product: initialProduct, listId } = route.params;
  const { state, updateProduct, deleteProduct } = useApp();
  const theme = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialProduct.name);
  const [category, setCategory] = useState(initialProduct.category);
  const [quantity, setQuantity] = useState(initialProduct.quantity.toString());
  const [unit, setUnit] = useState(initialProduct.unit);
  const [price, setPrice] = useState(initialProduct.price?.toString() || '');
  const [notes, setNotes] = useState(initialProduct.notes || '');

  // Get price history for this product
  const priceHistory = useMemo(() => {
    return state.priceRecords
      .filter(r => r.productName.toLowerCase() === name.toLowerCase())
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
      .slice(0, 10);
  }, [state.priceRecords, name]);

  // Calculate price stats
  const priceStats = useMemo(() => {
    if (priceHistory.length === 0) return null;
    
    const prices = priceHistory.map(r => r.price);
    const lastPrice = prices[0];
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (prices.length >= 2) {
      const recent = prices[0];
      const previous = prices.slice(1).reduce((a, b) => a + b, 0) / (prices.length - 1);
      if (recent > previous * 1.05) trend = 'up';
      else if (recent < previous * 0.95) trend = 'down';
    }

    return { lastPrice, avgPrice, minPrice, maxPrice, trend };
  }, [priceHistory]);

  const handleSave = () => {
    const updatedProduct: Product = {
      ...initialProduct,
      name: name.trim(),
      category,
      quantity: parseInt(quantity, 10) || 1,
      unit,
      price: price ? parseFloat(price) : undefined,
      notes: notes.trim() || undefined,
      updatedAt: new Date(),
    };
    updateProduct(listId, updatedProduct);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${initialProduct.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProduct(listId, initialProduct.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const totalPrice = (parseFloat(price) || 0) * (parseInt(quantity, 10) || 1);
  const categoryColor = getCategoryColor(category);
  const categoryIcon = getCategoryIcon(category);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <IconButton
            icon="arrow-left"
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            Product Details
          </Text>
          <View style={styles.headerActions}>
            {isEditing ? (
              <IconButton
                icon="check"
                iconColor={theme.colors.primary}
                size={24}
                onPress={handleSave}
              />
            ) : (
              <IconButton
                icon="pencil-outline"
                iconColor={theme.colors.tertiary}
                size={24}
                onPress={() => setIsEditing(true)}
              />
            )}
            <IconButton
              icon="delete-outline"
              iconColor={theme.colors.error}
              size={24}
              onPress={handleDelete}
            />
          </View>
        </View>

        {/* Product Info Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
          <Card.Content>
            {isEditing ? (
              <>
                <TextInput
                  mode="outlined"
                  label="Product Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                />

                <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  <View style={styles.categoryContainer}>
                    {CATEGORY_INFO.map(cat => (
                      <TouchableRipple
                        key={cat.name}
                        style={[
                          styles.categoryItem,
                          {
                            backgroundColor: cat.name === category ? cat.color + '20' : theme.colors.surfaceVariant,
                            borderColor: cat.name === category ? cat.color : 'transparent',
                          },
                        ]}
                        onPress={() => setCategory(cat.name)}
                      >
                        <View style={styles.categoryItemContent}>
                          <Ionicons
                            name={cat.icon as keyof typeof Ionicons.glyphMap}
                            size={18}
                            color={cat.name === category ? cat.color : theme.colors.onSurfaceVariant}
                          />
                          <Text
                            variant="labelSmall"
                            numberOfLines={1}
                            style={{ color: cat.name === category ? cat.color : theme.colors.onSurfaceVariant }}
                          >
                            {cat.name.split(' ')[0]}
                          </Text>
                        </View>
                      </TouchableRipple>
                    ))}
                  </View>
                </ScrollView>

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <TextInput
                      mode="outlined"
                      label="Quantity"
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                      Unit
                    </Text>
                    <View style={styles.unitChipContainer}>
                      {PRODUCT_UNITS.slice(0, 6).map(u => (
                        <Chip
                          key={u}
                          selected={u === unit}
                          onPress={() => setUnit(u)}
                          compact
                          style={[styles.unitChip, u === unit && { backgroundColor: theme.colors.primaryContainer }]}
                          textStyle={u === unit ? { color: theme.colors.primary } : undefined}
                          showSelectedOverlay={false}
                        >
                          {u}
                        </Chip>
                      ))}
                    </View>
                  </View>
                </View>

                <TextInput
                  mode="outlined"
                  label="Price per Unit"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  left={<TextInput.Affix text="$" />}
                />

                <TextInput
                  mode="outlined"
                  label="Notes"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.notesInput]}
                  outlineStyle={styles.inputOutline}
                />
              </>
            ) : (
              <>
                <View style={styles.productHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                    <Ionicons
                      name={categoryIcon as keyof typeof Ionicons.glyphMap}
                      size={14}
                      color={categoryColor}
                    />
                    <Text variant="labelSmall" style={{ color: categoryColor, marginLeft: 4 }}>
                      {category}
                    </Text>
                  </View>
                  {initialProduct.isChecked && (
                    <View style={[styles.checkedBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                      <Ionicons name="checkmark-circle" size={14} color={theme.colors.primary} />
                      <Text variant="labelSmall" style={{ color: theme.colors.primary, marginLeft: 4 }}>
                        Purchased
                      </Text>
                    </View>
                  )}
                </View>

                <Text variant="headlineSmall" style={[styles.productName, { color: theme.colors.onSurface }]}>
                  {name}
                </Text>

                <View style={styles.detailsGrid}>
                  <View style={[styles.detailItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Ionicons name="layers-outline" size={20} color={theme.colors.onSurfaceVariant} />
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                      Quantity
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                      {quantity} {unit}
                    </Text>
                  </View>

                  <View style={[styles.detailItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Ionicons name="pricetag-outline" size={20} color={theme.colors.onSurfaceVariant} />
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                      Unit Price
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                      {price ? formatPrice(parseFloat(price), state.settings.currency) : '-'}
                    </Text>
                  </View>

                  <View style={[styles.detailItem, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Ionicons name="calculator-outline" size={20} color={theme.colors.primary} />
                    <Text variant="labelSmall" style={{ color: theme.colors.primary, marginTop: 4 }}>
                      Total
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                      {formatPrice(totalPrice, state.settings.currency)}
                    </Text>
                  </View>
                </View>

                {notes && (
                  <View style={[styles.notesSection, { borderTopColor: theme.colors.outlineVariant }]}>
                    <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                      Notes
                    </Text>
                    <Text variant="bodyMedium" style={[styles.notesText, { color: theme.colors.onSurface }]}>
                      {notes}
                    </Text>
                  </View>
                )}

                <View style={[styles.metaInfo, { borderTopColor: theme.colors.outlineVariant }]}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Added: {formatDateTime(initialProduct.createdAt)}
                  </Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Price Tracking Section */}
        {state.settings.enablePriceTracking && !isEditing && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
            <Card.Content>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="trending-up" size={20} color={theme.colors.primary} />
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginLeft: 8 }}>
                    Price Tracking
                  </Text>
                </View>
              </View>

              {priceStats ? (
                <>
                  <View style={styles.priceStatsGrid}>
                    <View style={[styles.priceStatItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Last Price
                      </Text>
                      <View style={styles.priceWithTrend}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                          {formatPrice(priceStats.lastPrice, state.settings.currency)}
                        </Text>
                        {priceStats.trend !== 'stable' && (
                          <Ionicons
                            name={priceStats.trend === 'up' ? 'trending-up' : 'trending-down'}
                            size={18}
                            color={priceStats.trend === 'up' ? '#F44336' : '#4CAF50'}
                            style={styles.trendIcon}
                          />
                        )}
                      </View>
                    </View>

                    <View style={[styles.priceStatItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Average
                      </Text>
                      <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                        {formatPrice(priceStats.avgPrice, state.settings.currency)}
                      </Text>
                    </View>

                    <View style={[styles.priceStatItem, { backgroundColor: '#E8F5E9' }]}>
                      <Text variant="labelSmall" style={{ color: '#4CAF50' }}>
                        Lowest
                      </Text>
                      <Text variant="titleMedium" style={{ color: '#4CAF50', fontWeight: '600' }}>
                        {formatPrice(priceStats.minPrice, state.settings.currency)}
                      </Text>
                    </View>

                    <View style={[styles.priceStatItem, { backgroundColor: '#FFEBEE' }]}>
                      <Text variant="labelSmall" style={{ color: '#F44336' }}>
                        Highest
                      </Text>
                      <Text variant="titleMedium" style={{ color: '#F44336', fontWeight: '600' }}>
                        {formatPrice(priceStats.maxPrice, state.settings.currency)}
                      </Text>
                    </View>
                  </View>

                  <Text variant="labelSmall" style={[styles.historyLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Based on {priceHistory.length} price record{priceHistory.length !== 1 ? 's' : ''}
                  </Text>
                </>
              ) : (
                <View style={styles.noPriceData}>
                  <Ionicons name="analytics-outline" size={32} color={theme.colors.outline} />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}>
                    No price history available yet.{'\n'}Add prices when shopping to track trends.
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
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
    alignItems: 'center',
    paddingRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
  },
  card: {
    margin: 16,
    marginTop: 8,
    borderRadius: 20,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  input: {
    marginBottom: 8,
  },
  inputOutline: {
    borderRadius: 12,
  },
  notesInput: {
    minHeight: 80,
  },
  categoryScroll: {
    marginHorizontal: -16,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 70,
    borderWidth: 2,
  },
  categoryItemContent: {
    alignItems: 'center',
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  unitChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  unitChip: {
    height: 32,
    borderRadius: 8,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  checkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  productName: {
    fontWeight: '700',
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  notesSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
  },
  notesText: {
    marginTop: 8,
    lineHeight: 22,
  },
  metaInfo: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  priceStatItem: {
    width: '47%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceWithTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    marginLeft: 6,
  },
  historyLabel: {
    marginTop: 16,
    textAlign: 'center',
  },
  noPriceData: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});
