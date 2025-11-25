import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip, Card, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface MultiUserSyncPlaceholderProps {
  listName?: string;
}

export function MultiUserSyncPlaceholder({ listName }: MultiUserSyncPlaceholderProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]} mode="contained">
      <Card.Content style={styles.content}>
        <Ionicons name="people-outline" size={48} color={theme.colors.onSurfaceVariant} />
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Multi-User Sync
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {listName
            ? `Share "${listName}" with family and friends.`
            : 'Collaborate on shopping lists with family and friends in real-time.'}
        </Text>
        <View style={styles.features}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            • Share lists with family members
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            • Real-time sync across devices
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            • See who added or checked items
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            • Assign items to specific people
          </Text>
        </View>
        <Chip
          style={[styles.comingSoon, { backgroundColor: theme.colors.secondaryContainer }]}
          textStyle={{ color: theme.colors.onSecondaryContainer }}
          compact
        >
          Coming Soon
        </Chip>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
    borderRadius: 16,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    marginTop: 12,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  features: {
    marginTop: 16,
    alignSelf: 'stretch',
    gap: 4,
  },
  comingSoon: {
    marginTop: 16,
  },
});
