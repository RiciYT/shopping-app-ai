import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  IconButton,
  Chip,
  Button,
  useTheme,
  TouchableRipple,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { CATEGORY_INFO, PRODUCT_UNITS, getCategoryColor } from '../utils';

interface EditItemBottomSheetProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
  onDelete: (productId: string) => void;
  currency?: string;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function EditItemBottomSheet({
  visible,
  product,
  onClose,
  onSave,
  onDelete,
  currency = 'USD',
}: EditItemBottomSheetProps) {
  const theme = useTheme();
  
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Other');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setQuantity(product.quantity.toString());
      setUnit(product.unit);
      setPrice(product.price?.toString() || '');
      setStore(product.store || '');
      setNotes(product.notes || '');
    }
  }, [product]);

  const handleSave = useCallback(() => {
    if (!product || !name.trim()) return;

    const updatedProduct: Product = {
      ...product,
      name: name.trim(),
      category,
      quantity: parseInt(quantity, 10) || 1,
      unit,
      price: price ? parseFloat(price) : undefined,
      store: store.trim() || undefined,
      notes: notes.trim() || undefined,
      updatedAt: new Date(),
      autofilled: false, // User manually edited, so no longer autofilled
    };
    onSave(updatedProduct);
    onClose();
  }, [product, name, category, quantity, unit, price, store, notes, onSave, onClose]);

  const handleDelete = useCallback(() => {
    if (product) {
      onDelete(product.id);
      onClose();
    }
  }, [product, onDelete, onClose]);

  const handleQuantityChange = (delta: number) => {
    const current = parseInt(quantity, 10) || 0;
    const newValue = Math.max(1, current + delta);
    setQuantity(newValue.toString());
  };

  // Currency symbol mapping
  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CHF: 'CHF ',
    JPY: '¥',
  };
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        {/* Bottom Sheet */}
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
              Edit Item
            </Text>
            <View style={styles.headerActions}>
              <IconButton
                icon="delete-outline"
                iconColor={theme.colors.error}
                size={22}
                onPress={handleDelete}
              />
              <IconButton
                icon="close"
                iconColor={theme.colors.onSurfaceVariant}
                size={22}
                onPress={onClose}
              />
            </View>
          </View>

          {/* Autofilled indicator */}
          {product.autofilled && (
            <View style={[styles.autofilledBanner, { backgroundColor: theme.colors.primaryContainer }]}>
              <Ionicons name="sparkles-outline" size={16} color={theme.colors.primary} />
              <Text variant="labelSmall" style={{ color: theme.colors.primary, marginLeft: 6 }}>
                Auto-detected values - review and adjust if needed
              </Text>
            </View>
          )}

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Product Name */}
            <TextInput
              mode="outlined"
              label="Product Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />

            {/* Category */}
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

            {/* Quantity + Unit Row */}
            <View style={styles.row}>
              <View style={styles.quantitySection}>
                <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                  Quantity
                </Text>
                <View style={styles.quantityControl}>
                  <IconButton
                    icon="minus"
                    mode="outlined"
                    size={16}
                    onPress={() => handleQuantityChange(-1)}
                    style={styles.quantityButton}
                  />
                  <TextInput
                    mode="outlined"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    style={styles.quantityInput}
                    outlineStyle={styles.inputOutline}
                    contentStyle={styles.quantityInputContent}
                  />
                  <IconButton
                    icon="plus"
                    mode="outlined"
                    size={16}
                    onPress={() => handleQuantityChange(1)}
                    style={styles.quantityButton}
                  />
                </View>
              </View>
              
              <View style={styles.unitSection}>
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
                      style={[
                        styles.unitChip,
                        u === unit && { backgroundColor: theme.colors.primaryContainer },
                      ]}
                      textStyle={u === unit ? { color: theme.colors.primary } : undefined}
                      showSelectedOverlay={false}
                    >
                      {u}
                    </Chip>
                  ))}
                </View>
              </View>
            </View>

            {/* Price */}
            <TextInput
              mode="outlined"
              label="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Affix text={currencySymbol} />}
            />

            {/* Store */}
            <TextInput
              mode="outlined"
              label="Store"
              value={store}
              onChangeText={setStore}
              placeholder="e.g., Lidl, Coop, Migros"
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />

            {/* Notes */}
            <TextInput
              mode="outlined"
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g., Organic, Brand preference"
              multiline
              numberOfLines={2}
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />

            {/* Spacer for bottom padding */}
            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: theme.colors.outlineVariant }]}>
            <Button 
              mode="text" 
              onPress={onClose}
              textColor={theme.colors.onSurfaceVariant}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              disabled={!name.trim()}
              style={styles.saveButton}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
  },
  autofilledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 20,
  },
  input: {
    marginBottom: 12,
  },
  inputOutline: {
    borderRadius: 12,
  },
  label: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  categoryScroll: {
    marginHorizontal: -20,
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    minWidth: 64,
    borderWidth: 2,
  },
  categoryItemContent: {
    alignItems: 'center',
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  quantitySection: {
    flex: 0.45,
  },
  unitSection: {
    flex: 0.55,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 12,
  },
  quantityButton: {
    margin: 0,
    borderRadius: 8,
  },
  quantityInput: {
    flex: 1,
    height: 40,
  },
  quantityInputContent: {
    textAlign: 'center',
  },
  unitChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  unitChip: {
    height: 30,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    borderRadius: 12,
    paddingHorizontal: 8,
  },
});
