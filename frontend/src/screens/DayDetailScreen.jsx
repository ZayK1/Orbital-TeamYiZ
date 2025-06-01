import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';
import DayDetail from '../components/DayDetail';
import { colors } from '../constants/colors';
import { ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DayDetailScreen({ route, navigation }) {
  const { day, skillName, isCompleted: initialIsCompleted } = route.params;
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300, 
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const updateCompletionStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem(`completedDays_${skillName}`);
        let completedDays = storedStatus ? JSON.parse(storedStatus) : {};
        completedDays[day.day] = isCompleted;
        await AsyncStorage.setItem(`completedDays_${skillName}`, JSON.stringify(completedDays));
        
        if (route.params.onToggleComplete) {
            route.params.onToggleComplete(day.day); 
        }

      } catch (e) {
        console.error("Failed to save completion status from DetailScreen.", e);
      }
    };
    if (initialIsCompleted !== isCompleted) { 
        updateCompletionStatus();
    }
  }, [isCompleted, skillName, day.day, initialIsCompleted, route.params]);

  const handleToggleComplete = () => {
    setIsCompleted(!isCompleted);
  };

  if (!day) {
    return <View style={styles.container}><Text>Loading day details...</Text></View>;
  }

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowLeft size={24} color={colors.primary} />
        <Text style={styles.backButtonText}>Back to Plan</Text>
      </TouchableOpacity>
      <DayDetail 
        day={day} 
        isCompleted={isCompleted} 
        onToggleComplete={handleToggleComplete} 
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
    paddingTop: 20, 
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
}); 