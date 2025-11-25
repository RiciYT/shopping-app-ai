import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerActions}>
            {isEditing ? (
              <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
                <Ionicons name="checkmark" size={24} color="#4CAF50" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.headerButton} onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil" size={24} color="#2196F3" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Info Card */}
        <View style={styles.card}>
          {isEditing ? (
            <>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Product name"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerRow}>
                {PRODUCT_CATEGORIES.slice(0, 5).map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.pickerChip,
                      category === cat && styles.pickerChipSelected,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.pickerChipText,
                        category === cat && styles.pickerChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.pickerRow}>
                {PRODUCT_CATEGORIES.slice(5).map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.pickerChip,
                      category === cat && styles.pickerChipSelected,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.pickerChipText,
                        category === cat && styles.pickerChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Unit</Text>
                  <View style={styles.unitPicker}>
                    {PRODUCT_UNITS.slice(0, 6).map(u => (
                      <TouchableOpacity
                        key={u}
                        style={[
                          styles.unitChip,
                          unit === u && styles.unitChipSelected,
                        ]}
                        onPress={() => setUnit(u)}
                      >
                        <Text
                          style={[
                            styles.unitChipText,
                            unit === u && styles.unitChipTextSelected,
                          ]}
                        >
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.label}>Price per Unit</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes..."
                placeholderTextColor="#999"
                multiline
              />
            </>
          ) : (
            <>
              <View style={styles.productHeader}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(category) + '20' },
                  ]}
                >
                  <Text
                    style={[styles.categoryBadgeText, { color: getCategoryColor(category) }]}
                  >
                    {category}
                  </Text>
                </View>
                {initialProduct.isChecked && (
                  <View style={styles.checkedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.checkedBadgeText}>Purchased</Text>
                  </View>
                )}
              </View>

              <Text style={styles.productName}>{name}</Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="layers-outline" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Quantity</Text>
                  <Text style={styles.detailValue}>
                    {quantity} {unit}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="pricetag-outline" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Unit Price</Text>
                  <Text style={styles.detailValue}>
                    {price ? formatPrice(parseFloat(price), state.settings.currency) : '-'}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="calculator-outline" size={20} color="#666" />
                  <Text style={styles.detailLabel}>Total</Text>
                  <Text style={styles.detailValueHighlight}>
                    {formatPrice(totalPrice, state.settings.currency)}
                  </Text>
                </View>
              </View>

              {notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesSectionTitle}>Notes</Text>
                  <Text style={styles.notesText}>{notes}</Text>
                </View>
              )}

              <View style={styles.metaInfo}>
                <Text style={styles.metaText}>
                  Added: {formatDateTime(initialProduct.createdAt)}
                </Text>
                <Text style={styles.metaText}>
                  Updated: {formatDateTime(initialProduct.updatedAt)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Price History Placeholder */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowPriceHistory(!showPriceHistory)}
        >
          <Text style={styles.sectionTitle}>Price History</Text>
          <Ionicons
            name={showPriceHistory ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
        {showPriceHistory && <PriceHistoryPlaceholder productName={name} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  pickerChipSelected: {
    backgroundColor: '#e3f2fd',
  },
  pickerChipText: {
    fontSize: 12,
    color: '#666',
  },
  pickerChipTextSelected: {
    color: '#2196F3',
    fontWeight: '500',
  },
  unitPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  unitChipSelected: {
    backgroundColor: '#e3f2fd',
  },
  unitChipText: {
    fontSize: 12,
    color: '#666',
  },
  unitChipTextSelected: {
    color: '#2196F3',
    fontWeight: '500',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkedBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
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
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  detailValueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 2,
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginTop: 8,
  },
  notesSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  metaInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginTop: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
