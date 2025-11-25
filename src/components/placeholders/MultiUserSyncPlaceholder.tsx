import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MultiUserSyncPlaceholderProps {
  listName?: string;
}

export function MultiUserSyncPlaceholder({ listName }: MultiUserSyncPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="people-outline" size={48} color="#ccc" />
      <Text style={styles.title}>Multi-User Sync</Text>
      <Text style={styles.subtitle}>
        {listName
          ? `Share "${listName}" with family and friends.`
          : 'Collaborate on shopping lists with family and friends in real-time.'}
      </Text>
      <View style={styles.features}>
        <Text style={styles.featureItem}>• Share lists with family members</Text>
        <Text style={styles.featureItem}>• Real-time sync across devices</Text>
        <Text style={styles.featureItem}>• See who added or checked items</Text>
        <Text style={styles.featureItem}>• Assign items to specific people</Text>
      </View>
      <Text style={styles.comingSoon}>Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  features: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  featureItem: {
    fontSize: 13,
    color: '#555',
    marginVertical: 4,
  },
  comingSoon: {
    fontSize: 12,
    color: '#9C27B0',
    fontWeight: '600',
    marginTop: 16,
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
