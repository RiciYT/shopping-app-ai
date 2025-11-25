import React, { useState } from 'react';
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
import { PriceHistoryPlaceholder } from '../components';
import { RootStackParamList, Product } from '../types';
import { formatPrice, formatDateTime, getCategoryColor, PRODUCT_CATEGORIES, PRODUCT_UNITS } from '../utils';

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
  const [showPriceHistory, setShowPriceHistory] = useState(false);

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.elevation.level1 }]}>
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
                icon="pencil"
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
        <Card style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]} mode="elevated">
          <Card.Content>
            {isEditing ? (
              <>
                <TextInput
                  mode="outlined"
                  label="Product Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />

                <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]}>
                  Category
                </Text>
                <View style={styles.chipContainer}>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <Chip
                      key={cat}
                      selected={cat === category}
                      onPress={() => setCategory(cat)}
                      compact
                      style={styles.chip}
                      showSelectedOverlay
                    >
                      {cat}
                    </Chip>
                  ))}
                </View>

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <TextInput
                      mode="outlined"
                      label="Quantity"
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]}>
                      Unit
                    </Text>
                    <View style={styles.unitChipContainer}>
                      {PRODUCT_UNITS.slice(0, 6).map(u => (
                        <Chip
                          key={u}
                          selected={u === unit}
                          onPress={() => setUnit(u)}
                          compact
                          style={styles.unitChip}
                          showSelectedOverlay
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
                />
              </>
            ) : (
              <>
                <View style={styles.productHeader}>
                  <Chip
                    style={[styles.categoryBadge, { backgroundColor: getCategoryColor(category) + '20' }]}
                    textStyle={{ color: getCategoryColor(category) }}
                    compact
                  >
                    {category}
                  </Chip>
                  {initialProduct.isChecked && (
                    <View style={styles.checkedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                      <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                        Purchased
                      </Text>
                    </View>
                  )}
                </View>

                <Text variant="headlineSmall" style={[styles.productName, { color: theme.colors.onSurface }]}>
                  {name}
                </Text>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Ionicons name="layers-outline" size={20} color={theme.colors.onSurfaceVariant} />
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Quantity
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                      {quantity} {unit}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons name="pricetag-outline" size={20} color={theme.colors.onSurfaceVariant} />
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Unit Price
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                      {price ? formatPrice(parseFloat(price), state.settings.currency) : '-'}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons name="calculator-outline" size={20} color={theme.colors.onSurfaceVariant} />
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Total
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
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
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Updated: {formatDateTime(initialProduct.updatedAt)}
                  </Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Price History Placeholder */}
        <TouchableRipple
          style={styles.sectionHeader}
          onPress={() => setShowPriceHistory(!showPriceHistory)}
        >
          <View style={styles.sectionHeaderContent}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              Price History
            </Text>
            <Ionicons
              name={showPriceHistory ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        </TouchableRipple>
        {showPriceHistory && <PriceHistoryPlaceholder productName={name} />}
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
  },
  headerActions: {
    flexDirection: 'row',
  },
  card: {
    margin: 16,
    borderRadius: 16,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 80,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginBottom: 4,
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
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
  },
  checkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  notesSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
  },
  notesText: {
    marginTop: 8,
    lineHeight: 20,
  },
  metaInfo: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
