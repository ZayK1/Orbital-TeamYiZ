import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ProgressHeader from '../components/ProgressHeader';
import DayCard from '../components/DayCard';
import { colors } from '../constants/colors';
import { ArrowLeft } from 'lucide-react-native';
import { getSkillById, markSkillDayComplete } from '../api/plans'; // Import API functions

export default function SkillCurriculumScreen({ route, navigation }) {
  // samplePlan is for dev/testing, skillId is for real data
  const { skillId, samplePlan } = route.params; 
  
  const [skill, setSkill] = useState(samplePlan || null);
  const [loading, setLoading] = useState(!samplePlan); // Don't load if it's a sample
  const [error, setError] = useState(null);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const fetchSkillDetails = useCallback(async () => {
    if (!skillId) return; // Don't fetch if there's no ID

    console.log(`Fetching details for skillId: ${skillId}`);
    setLoading(true);
    setError(null);
    try {
      const skillData = await getSkillById(skillId);
      console.log('Fetched Skill Data:', skillData);
      setSkill(skillData);
    } catch (err) {
      console.error("Failed to fetch skill details:", err);
      setError("Could not load the plan. Please go back and try again.");
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  // Use useFocusEffect to fetch data when the screen comes into view
  useFocusEffect(
    useCallback(() => {
      if (skillId) { // Only fetch if we have a skillId
        fetchSkillDetails();
      }
    }, [skillId, fetchSkillDetails])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);


  const handleToggleComplete = async (dayNumber) => {
    // For sample plan, just update UI state without API call
    if (samplePlan) {
      const updatedDays = skill.curriculum.daily_tasks.map(day => 
        day.day === dayNumber ? { ...day, completed: !day.completed } : day
      );
      setSkill({ ...skill, curriculum: { daily_tasks: updatedDays }});
      return;
    }

    // For real plans, call the API
    try {
      const updatedProgress = await markSkillDayComplete(skillId, dayNumber);
      // Update the local state to reflect the change immediately
      const updatedDays = skill.curriculum.daily_tasks.map(day => 
         day.day === dayNumber ? { ...day, completed: !day.completed } : day
      );
      setSkill({ 
        ...skill, 
        curriculum: { daily_tasks: updatedDays },
        progress: updatedProgress.progress 
      });
    } catch (err) {
      console.error("Failed to mark day as complete:", err);
      // Optionally show an error to the user
    }
  };

  const navigateToDayDetail = (day) => {
    navigation.navigate('DayDetail', { 
        day,
        skillName: skill?.title || "Skill Day",
        skillId: skillId,
        isCompleted: day.completed,
        onToggleComplete: () => handleToggleComplete(day.day)
    });
  };
  
  const plan = skill?.curriculum?.daily_tasks || [];
  const numCompleted = plan.filter(day => day.completed).length;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Loading plan...</Text>
      </View>
    );
  }

  if (!plan || plan.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No plan available.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonInline}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.backButtonTextInline}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.primary} />
          <Text style={styles.backButtonText}>Back to Plans</Text>
      </TouchableOpacity>
      <ProgressHeader 
        skillName={skill?.title || "Unnamed Plan"} 
        completedDays={numCompleted} 
        totalDays={plan.length} 
      />
      <FlatList
        data={plan}
        keyExtractor={(item) => item.day.toString()} 
        renderItem={({ item }) => (
          <DayCard
            day={item}
            onPress={() => navigateToDayDetail(item)}
            isCompleted={item.completed}
            onToggleComplete={() => handleToggleComplete(item.day)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
    paddingHorizontal: 20, 
    paddingTop: 60, 
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    alignSelf: 'flex-start',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
   backButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  backButtonTextInline: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20, 
  },
}); 