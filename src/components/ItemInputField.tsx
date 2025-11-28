import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  Keyboard,
  Platform,
  Pressable,
} from 'react-native';
import {
  Text,
  useTheme,
  TouchableRipple,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { getProductSuggestions, parseItemInput, getCategoryColor, ParsedItemInput } from '../utils';
import { Product } from '../types';

// Delay before hiding suggestions to allow time for selection
const BLUR_DELAY_MS = 150;

interface ItemInputFieldProps {
  onAddItem: (item: ParsedItemInput) => void;
  recentItems?: Product[];
  defaultUnit?: string;
  placeholder?: string;
}

interface Suggestion {
  name: string;
  category: string;
  source: 'recent' | 'common' | 'user';
}

export function ItemInputField({
  onAddItem,
  recentItems = [],
  defaultUnit = 'pcs',
  placeholder = 'Add item...',
}: ItemInputFieldProps) {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Build suggestions list
  const suggestions = useMemo((): Suggestion[] => {
    if (!inputValue.trim() || inputValue.length < 2) return [];

    const results: Suggestion[] = [];
    const lowerQuery = inputValue.toLowerCase();

    // Add recent items that match
    const recentMatches = recentItems
      .filter(item => item.name.toLowerCase().includes(lowerQuery))
      .slice(0, 2)
      .map(item => ({
        name: item.name,
        category: item.category,
        source: 'recent' as const,
      }));
    results.push(...recentMatches);

    // Add common product suggestions
    const commonMatches = getProductSuggestions(inputValue, 5)
      .filter(s => !results.some(r => r.name.toLowerCase() === s.name.toLowerCase()))
      .map(s => ({
        ...s,
        source: 'common' as const,
      }));
    results.push(...commonMatches);

    return results.slice(0, 5);
  }, [inputValue, recentItems]);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;

    const parsed = parseItemInput(inputValue, defaultUnit);
    onAddItem(parsed);
    setInputValue('');
    Keyboard.dismiss();
  }, [inputValue, defaultUnit, onAddItem]);

  const handleSelectSuggestion = useCallback((suggestion: Suggestion) => {
    const parsed = parseItemInput(suggestion.name, defaultUnit);
    // Override category with suggestion's category
    parsed.category = suggestion.category;
    onAddItem(parsed);
    setInputValue('');
    Keyboard.dismiss();
  }, [defaultUnit, onAddItem]);

  const showSuggestions = isFocused && suggestions.length > 0;

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: isFocused ? theme.colors.primary : 'transparent',
        }
      ]}>
        <Ionicons
          name="add-circle-outline"
          size={20}
          color={isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant}
          style={styles.inputIcon}
        />
        <RNTextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: theme.colors.onSurface }
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={inputValue}
          onChangeText={setInputValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => {
              if (isMountedRef.current) {
                setIsFocused(false);
              }
            }, BLUR_DELAY_MS);
          }}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        {inputValue.length > 0 && (
          <Pressable onPress={() => setInputValue('')} style={styles.clearButton}>
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
        )}
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <View style={[
          styles.suggestionsContainer,
          { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
          }
        ]}>
          {suggestions.map((suggestion, index) => (
            <TouchableRipple
              key={`${suggestion.name}-${index}`}
              onPress={() => handleSelectSuggestion(suggestion)}
              style={styles.suggestionItem}
            >
              <View style={styles.suggestionContent}>
                <View style={[
                  styles.categoryDot,
                  { backgroundColor: getCategoryColor(suggestion.category) }
                ]} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
                  {suggestion.name}
                </Text>
                {suggestion.source === 'recent' && (
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={theme.colors.onSurfaceVariant}
                  />
                )}
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 6 }}>
                  {suggestion.category.split(' ')[0]}
                </Text>
              </View>
            </TouchableRipple>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
    }),
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
});
