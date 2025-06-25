import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const StatsScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <MaterialIcons name="insights" size={64} color="#14B8A6" style={{ marginBottom: 12 }} />
        <Text style={styles.title}>Your Stats – Beta</Text>
        <Text style={styles.paragraph}>
          Crunching the numbers! Soon you'll be able to view your progress and learning streaks through
          beautiful charts and insightful visualisations. Keep going—your achievements will shine here soon.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default StatsScreen; 