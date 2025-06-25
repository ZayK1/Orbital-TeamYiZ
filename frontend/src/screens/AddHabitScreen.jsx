import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { createHabitPlan } from '../api/plans';

const suggestionList = [
  { icon: 'water-drop', label: 'Drink water' },
  { icon: 'menu-book', label: 'Read a book' },
  { icon: 'fitness-center', label: 'Exercise' },
  { icon: 'restaurant-menu', label: 'Healthy meal' },
  { icon: 'sentiment-satisfied', label: 'Gratitude' },
];

const habitColors = {
  'red': '#F87171',
  'blue': '#60A5FA',
  'green': '#34D399',
  'yellow': '#FBBF24',
  'purple': '#A78BFA',
  'pink': '#F472B6',
};

export default function AddHabitScreen({ navigation }) {
  const { token } = useAuth();
  const [habit, setHabit] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState('Daily');
  const [selectedColor, setSelectedColor] = useState('green');
  const [loading, setLoading] = useState(false);

  const handleAddHabit = async () => {
    if (!habit.trim()) {
      Alert.alert('Validation', 'Please enter a habit title.');
      return;
    }

    const frequencyMap = {
      Daily: 'daily',
      Weekdays: 'weekly',
      Custom: 'custom',
    };

    try {
      setLoading(true);
      await createHabitPlan(
        habit.trim(),
        'health', 
        frequencyMap[selectedFrequency],
        habitColors[selectedColor],
        token
      );
      Alert.alert('Success', 'Habit created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Repository');
            }
          },
        },
      ]);
    } catch (err) {
      console.error('Habit creation failed:', err);
      const msg = err.response?.data?.error || 'Could not create habit.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#4B5563" style={{ marginLeft: 10 }}/>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Habit</Text>
          <Text style={styles.headerStep}>1/2</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What habit would you like to build?</Text>
            <Text style={styles.sectionSubtitle}>Describe your habit or pick from suggestions.</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.textInputWrapper}>
              <TextInput
                value={habit}
                onChangeText={setHabit}
                placeholder="e.g., Daily Meditation"
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
              />
              {habit !== '' && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setHabit('')}
                >
                  <MaterialIcons name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggestions:</Text>
              <View style={styles.suggestionsGrid}>
                {suggestionList.map(s => (
                  <TouchableOpacity
                    key={s.label}
                    style={styles.suggestionChip}
                    onPress={() => setHabit(s.label)}
                  >
                    <MaterialIcons name={s.icon} size={16} color="#4B5563" style={{ marginRight: 4 }} />
                    <Text style={styles.suggestionLabel}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.charCount}>{habit.length}/50 characters</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Frequency</Text>
            <View style={styles.frequencyContainer}>
              {["Daily", "Weekdays", "Custom"].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.frequencyButton, selectedFrequency === f && styles.frequencyButtonSelected]}
                  onPress={() => setSelectedFrequency(f)}
                >
                  <Text style={[styles.frequencyButtonText, selectedFrequency === f && styles.frequencyButtonTextSelected]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.reminderContainer}>
            <View style={styles.reminderInfo}>
              <MaterialIcons name="notifications-active" size={24} color="#6366F1" style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.reminderTitle}>Enable Reminder</Text>
                <Text style={styles.reminderSubtitle}>Get a gentle nudge at your chosen time.</Text>
              </View>
            </View>
            <Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ false: "#E5E7EB", true: "#8B5CF6" }} thumbColor={reminderEnabled ? "#FFFFFF" : "#F4F3F4"} />
          </View>

          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Choose a Habit Color</Text>
            <View style={styles.colorContainer}>
              {Object.keys(habitColors).map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorSwatch, { backgroundColor: habitColors[c] }, selectedColor === c && styles.colorSwatchSelected]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity disabled={!habit.trim() || loading} onPress={handleAddHabit}>
            <LinearGradient
              colors={[habitColors[selectedColor], '#14B8A6']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.primaryButton, (!habit.trim() || loading) && { opacity: 0.6 }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Add Habit</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('AddSkill')}>
            <Text style={styles.secondaryButtonText}>Create Skill Instead</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
  },
  headerStep: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 24,
  },
  textInputWrapper: {
    position: 'relative',
    padding: 12,
  },
  textInput: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 0,
    color: '#1F2937',
    fontSize: 14,
    borderRadius: 8,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10, 
    padding: 4,
  },
  suggestionsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  suggestionLabel: {
    color: '#374151',
    fontSize: 12,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#9CA3AF',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  frequencyButtonSelected: {
    backgroundColor: '#6366F1',
  },
  frequencyButtonText: {
    textAlign: 'center',
    fontWeight: '500',
    color: '#374151',
  },
  frequencyButtonTextSelected: {
    color: 'white',
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  reminderSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
    gap: 8,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    textAlign: 'center',
  },
}); 