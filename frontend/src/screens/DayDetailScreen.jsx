import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Alert, ActivityIndicator } from 'react-native';
import DayDetail from '../components/DayDetail';
import { colors } from '../constants/colors';
import { ArrowLeft } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { markSkillDayComplete } from '../api/plans';

export default function DayDetailScreen({ route, navigation }) {
  const { day, skillId, isCompleted: initialIsCompleted } = route.params;
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useContext(AuthContext);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300, 
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleToggleComplete = async () => {
    // If there's no skillId, it's a sample plan.
    // Just call the callback to update the UI on the previous screen.
    if (!skillId) {
      if (route.params.onToggleComplete) {
        route.params.onToggleComplete(day.day);
      }
      setIsCompleted(!isCompleted); // Toggle local state
      return;
    }
    
    // This part handles real plans with a skillId
    if (isCompleted) {
      Alert.alert("Already Completed", "This day is already marked as complete.");
      return;
    }
    
    setIsLoading(true);
    try {
      await markSkillDayComplete(skillId, day.day, token);
      setIsCompleted(true);
      Alert.alert("Success", "Day marked as complete!");
      // Update the state on the previous screen
      if (route.params.onToggleComplete) {
        route.params.onToggleComplete(day.day); 
      }
    } catch (error) {
      console.error("Failed to mark day as complete:", error);
      Alert.alert("Error", "Could not mark day as complete. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      )}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 