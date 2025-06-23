import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { LogOut, ChevronRight } from 'lucide-react-native';
import { getAllPlans } from '../api/plans'; 
import PlanCard from '../components/PlanCard'; 

export default function ProfileScreen({ navigation }) {
  const { user, logout, token } = useAuth();
  const [skills, setSkills] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPlans();
      setSkills(data.skills || []);
      setHabits(data.habits || []);
    } catch (err) {
      setError('Failed to fetch plans.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans])
  );
  
  const navigateToSkill = (skillId) => {
    navigation.navigate('SkillCurriculum', { skillId });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      {user && (
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.username ? user.username.charAt(0).toUpperCase() : '?'}</Text>
          </View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}

      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>Current Plans</Text>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }}/>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {skills.length === 0 && habits.length === 0 && (
              <Text style={styles.emptyText}>You have no active plans.</Text>
            )}
            {skills.map(skill => (
              <PlanCard 
                key={skill._id}
                plan={skill}
                onPress={() => navigateToSkill(skill._id)}
                type="Skill"
              />
            ))}
            {habits.map(habit => (
              <PlanCard 
                key={habit._id}
                plan={habit}
                onPress={() => alert('Habit details not implemented.')}
                type="Habit"
              />
            ))}
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <LogOut color={colors.error} size={20} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  plansSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  errorText: {
    textAlign: 'center',
    color: colors.error,
    marginTop: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 15,
    fontStyle: 'italic',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
}); 