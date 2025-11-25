import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import {
  Portal,
  Modal,
  Text,
  TextInput,
  Button,
  IconButton,
  Chip,
  useTheme,
  TouchableRipple,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_INFO, PRODUCT_UNITS, getProductSuggestions, suggestCategory, getCategoryColor, getCategoryIcon } from '../utils';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (product: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    price?: number;
    store?: string;
    notes?: string;
    isChecked: boolean;
  }) => void;
  defaultUnit?: string;
}

export function AddProductModal({
  visible,
  onClose,
  onAdd,
  defaultUnit = 'pcs',
}: AddProductModalProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_INFO[0].name);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState(defaultUnit);
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');
  const [notes, setNotes] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get product suggestions
  const suggestions = useMemo(() => getProductSuggestions(name, 5), [name]);

  // Auto-suggest category when name changes
  useEffect(() => {
    if (name.length >= 3) {
      const suggested = suggestCategory(name);
      if (suggested) {
        setCategory(suggested);
      }
    }
  }, [name]);

  const handleAdd = () => {
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      category,
      quantity: parseInt(quantity, 10) || 1,
      unit,
      price: price ? parseFloat(price) : undefined,
      store: store.trim() || undefined,
      notes: notes.trim() || undefined,
      isChecked: false,
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setCategory(CATEGORY_INFO[0].name);
    setQuantity('1');
    setUnit(defaultUnit);
    setPrice('');
    setStore('');
    setNotes('');
    setShowOptionalFields(false);
    setShowSuggestions(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectSuggestion = (suggestion: { name: string; category: string }) => {
    setName(suggestion.name);
    setCategory(suggestion.category);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const handleQuantityChange = (delta: number) => {
    const current = parseInt(quantity, 10) || 0;
    const newValue = Math.max(1, current + delta);
    setQuantity(newValue.toString());
  };

  const renderCategoryItem = useCallback(({ item }: { item: typeof CATEGORY_INFO[0] }) => {
    const isSelected = item.name === category;
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          {
            backgroundColor: isSelected 
              ? item.color + '20' 
              : theme.colors.surfaceVariant,
            borderColor: isSelected ? item.color : 'transparent',
          },
        ]}
        onPress={() => setCategory(item.name)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={item.icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={isSelected ? item.color : theme.colors.onSurfaceVariant}
        />
        <Text
          variant="labelSmall"
          numberOfLines={1}
          style={[
            styles.categoryItemText,
            { color: isSelected ? item.color : theme.colors.onSurfaceVariant },
          ]}
        >
          {item.name.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    );
  }, [category, theme.colors.surfaceVariant, theme.colors.onSurfaceVariant]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            Add Product
          </Text>
          <IconButton
            icon="close"
            iconColor={theme.colors.onSurfaceVariant}
            size={24}
            onPress={handleClose}
          />
        </View>

        <ScrollView 
          style={styles.form} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Product Name with Autocomplete */}
          <View style={styles.inputWrapper}>
            <TextInput
              mode="outlined"
              label="Product Name"
              placeholder="e.g., Milk, Bread, Apples"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setShowSuggestions(text.length >= 2);
              }}
              onFocus={() => setShowSuggestions(name.length >= 2)}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              autoFocus
            />
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={[styles.suggestionsContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                {suggestions.map((suggestion, index) => (
                  <TouchableRipple
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(suggestion)}
                  >
                    <View style={styles.suggestionContent}>
                      <View style={[styles.suggestionDot, { backgroundColor: getCategoryColor(suggestion.category) }]} />
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                        {suggestion.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
                        {suggestion.category}
                      </Text>
                    </View>
                  </TouchableRipple>
                ))}
              </View>
            )}
          </View>

          {/* Category Horizontal Scroll */}
          <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
            Category
          </Text>
          <FlatList
            horizontal
            data={CATEGORY_INFO}
            keyExtractor={(item) => item.name}
            renderItem={renderCategoryItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            style={styles.categoryScroll}
          />

          {/* Quantity + Unit Row */}
          <View style={styles.quantityUnitRow}>
            <View style={styles.quantitySection}>
              <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                Quantity
              </Text>
              <View style={styles.quantityControl}>
                <IconButton
                  icon="minus"
                  mode="outlined"
                  size={18}
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
                  size={18}
                  onPress={() => handleQuantityChange(1)}
                  style={styles.quantityButton}
                />
              </View>
            </View>
            
            <View style={styles.unitSection}>
              <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                Unit
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
              </ScrollView>
            </View>
          </View>

          {/* Optional Fields Toggle */}
          <TouchableRipple
            style={styles.optionalToggle}
            onPress={() => setShowOptionalFields(!showOptionalFields)}
          >
            <View style={styles.optionalToggleContent}>
              <Ionicons
                name={showOptionalFields ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
                {showOptionalFields ? 'Hide' : 'Show'} optional fields (price, store, notes)
              </Text>
            </View>
          </TouchableRipple>

          {/* Optional Fields */}
          {showOptionalFields && (
            <View style={styles.optionalFields}>
              <View style={styles.optionalRow}>
                <TextInput
                  mode="outlined"
                  label="Price"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  style={[styles.input, styles.halfInput]}
                  outlineStyle={styles.inputOutline}
                  left={<TextInput.Affix text="$" />}
                />
                <TextInput
                  mode="outlined"
                  label="Store"
                  value={store}
                  onChangeText={setStore}
                  placeholder="e.g., Lidl, Coop"
                  style={[styles.input, styles.halfInput]}
                  outlineStyle={styles.inputOutline}
                />
              </View>
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
            </View>
          )}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <Button 
            mode="text" 
            onPress={handleClose}
            textColor={theme.colors.onSurfaceVariant}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleAdd}
            disabled={!name.trim()}
            style={styles.addButton}
          >
            Add Product
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 24,
    paddingRight: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 24,
  },
  inputWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  input: {
    marginBottom: 8,
  },
  inputOutline: {
    borderRadius: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
    }),
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  sectionLabel: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  categoryScroll: {
    marginBottom: 8,
    marginHorizontal: -24,
  },
  categoryList: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 72,
    borderWidth: 2,
  },
  categoryItemText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  quantityUnitRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  quantitySection: {
    flex: 0.4,
  },
  unitSection: {
    flex: 0.6,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quantityButton: {
    margin: 0,
    borderRadius: 10,
  },
  quantityInput: {
    flex: 1,
    height: 42,
  },
  quantityInputContent: {
    textAlign: 'center',
  },
  unitChipContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  unitChip: {
    height: 34,
    borderRadius: 8,
  },
  optionalToggle: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  optionalToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionalFields: {
    marginTop: 8,
  },
  optionalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 8,
  },
  addButton: {
    borderRadius: 12,
    paddingHorizontal: 8,
  },
});
