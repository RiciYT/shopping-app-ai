import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [name, setName] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState(defaultUnit);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

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
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Product</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Milk, Bread, Apples"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={styles.pickerButtonText}>{category}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.pickerOptions}>
                {PRODUCT_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.pickerOption,
                      cat === category && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        cat === category && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

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
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowUnitPicker(!showUnitPicker)}
                >
                  <Text style={styles.pickerButtonText}>{unit}</Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                {showUnitPicker && (
                  <View style={styles.pickerOptions}>
                    {PRODUCT_UNITS.map(u => (
                      <TouchableOpacity
                        key={u}
                        style={[
                          styles.pickerOption,
                          u === unit && styles.pickerOptionSelected,
                        ]}
                        onPress={() => {
                          setUnit(u);
                          setShowUnitPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            u === unit && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.label}>Price (optional)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g., Organic, Low-fat, Brand preference"
              placeholderTextColor="#999"
              multiline
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.addButton, !name.trim() && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!name.trim()}
          >
            <Text style={styles.addButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  form: {
    padding: 16,
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
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptions: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#2196F3',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
