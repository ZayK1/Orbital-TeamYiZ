import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgressHeader from '../components/ProgressHeader';
import DayCard from '../components/DayCard';
import { colors } from '../constants/colors';
import { ArrowLeft } from 'lucide-react-native';

export default function PlanIndexScreen({ route, navigation }) {
  const { plan: initialPlan, skillName } = route.params;
  const [plan, setPlan] = useState(initialPlan || []);
  const [completedDays, setCompletedDays] = useState({}); 
  const [loading, setLoading] = useState(true);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const loadCompletedStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem(`completedDays_${skillName}`);
        if (storedStatus) {
          setCompletedDays(JSON.parse(storedStatus));
        }
      } catch (e) {
        console.error("Failed to load completion status.", e);
      }
      setLoading(false);
    };
    if (skillName) loadCompletedStatus(); else setLoading(false);
  }, [skillName]);

  useEffect(() => {
    const saveCompletedStatus = async () => {
      try {
        await AsyncStorage.setItem(`completedDays_${skillName}`, JSON.stringify(completedDays));
      } catch (e) {
        console.error("Failed to save completion status.", e);
      }
    };
    if (!loading && skillName) saveCompletedStatus();
  }, [completedDays, loading, skillName]);

  const handleToggleComplete = (dayId) => {
    setCompletedDays(prev => ({
      ...prev,
      [dayId]: !prev[dayId],
    }));
  };

  const navigateToDayDetail = (day) => {
    navigation.navigate('DayDetail', { 
        day,
        skillName,
        isCompleted: completedDays[day.day],
        onToggleComplete: () => handleToggleComplete(day.day)
    });
  };
  
  const numCompleted = Object.values(completedDays).filter(Boolean).length;

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
          <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
      <ProgressHeader 
        skillName={skillName} 
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
            isCompleted={completedDays[item.day]}
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