import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllPlans, deleteSkill } from '../api/plans';
import PlanCard from '../components/PlanCard';
import { colors } from '../constants/colors';

export default function PlanIndexScreen({ navigation }) {
  const [skills, setSkills] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPlans();
      setSkills(data.skills || []);
      setHabits(data.habits || []);
    } catch (err) {
      setError('Failed to fetch plans. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans])
  );

  const handleRefresh = () => {
    fetchPlans();
  };
  
  const handleDeleteSkill = async (skillId) => {
    try {
      await deleteSkill(skillId);
      setSkills(prevSkills => prevSkills.filter(skill => skill._id !== skillId));
    } catch (error) {
      console.error("Failed to delete skill:", error);
      setError('Failed to delete skill. Please try again.');
    }
  };

  const navigateToSkill = (skillId) => {
    navigation.navigate('SkillCurriculum', { skillId });
  };

  if (loading && !skills.length && !habits.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Loading your plans...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} colors={[colors.primary]} />}
    >
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <View style={styles.header}>
        <Text style={styles.title}>Your Plans</Text>
      </View>

      <Text style={styles.sectionTitle}>Skill Development Plans</Text>
      {skills.length > 0 ? (
        skills.map(skill => (
          <PlanCard 
            key={skill._id}
            plan={skill}
            onPress={() => navigateToSkill(skill._id)}
            onDelete={() => handleDeleteSkill(skill._id)}
            type="Skill"
          />
        ))
      ) : (
        !loading && <Text style={styles.emptyText}>No skill plans found. Create one from the Home screen!</Text>
      )}

      <Text style={styles.sectionTitle}>Habit Trackers</Text>
      {habits.length > 0 ? (
        habits.map(habit => (
           <PlanCard 
            key={habit._id}
            plan={habit}
            onPress={() => alert('Habit detail view not implemented yet.')}
            onDelete={() => alert('Habit deletion not implemented yet.')}
            type="Habit"
          />
        ))
      ) : (
        !loading && <Text style={styles.emptyText}>No habits being tracked. Add a new one!</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray100,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginVertical: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 20,
    fontStyle: 'italic',
  }
}); 