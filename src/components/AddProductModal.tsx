import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
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
} from 'react-native-paper';
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '../utils';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (product: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    price?: number;
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
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState(defaultUnit);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      category,
      quantity: parseInt(quantity, 10) || 1,
      unit,
      price: price ? parseFloat(price) : undefined,
      notes: notes.trim() || undefined,
      isChecked: false,
    });

    // Reset form
    setName('');
    setCategory(PRODUCT_CATEGORIES[0]);
    setQuantity('1');
    setUnit(defaultUnit);
    setPrice('');
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setCategory(PRODUCT_CATEGORIES[0]);
    setQuantity('1');
    setUnit(defaultUnit);
    setPrice('');
    setNotes('');
    onClose();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
            Add Product
          </Text>
          <IconButton
            icon="close"
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={handleClose}
          />
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <TextInput
            mode="outlined"
            label="Product Name *"
            placeholder="e.g., Milk, Bread, Apples"
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
                {PRODUCT_UNITS.map(u => (
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
            label="Price (optional)"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
            style={styles.input}
            left={<TextInput.Affix text="$" />}
          />

          <TextInput
            mode="outlined"
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., Organic, Low-fat, Brand preference"
            multiline
            numberOfLines={3}
            style={[styles.input, styles.notesInput]}
          />
        </ScrollView>

        <View style={styles.actions}>
          <Button mode="text" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleAdd}
            disabled={!name.trim()}
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
    borderRadius: 28,
    maxHeight: '90%',
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
  form: {
    paddingHorizontal: 24,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 24,
    paddingTop: 16,
  },
});
