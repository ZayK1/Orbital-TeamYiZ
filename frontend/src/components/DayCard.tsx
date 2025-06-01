import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { SkillDay } from '../types';

interface DayCardProps {
  day: SkillDay;
  onPress: () => void;
  onToggleComplete: () => void;
}

export const DayCard: React.FC<DayCardProps> = ({ 
  day, 
  onPress,
  onToggleComplete
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View 
        style={[
          styles.card, 
          day.completed && styles.completedCard,
          { transform: [{ scale }] }
        ]} 
      >
        <View style={styles.header}>
          <View style={styles.dayContainer}>
            <Text style={styles.dayNumber}>Day {day.day}</Text>
            <Text style={styles.timeEstimate}>{day.timeEstimate}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.checkButton, day.completed && styles.checkedButton]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
          >
            {day.completed && <Check size={16} color={colors.white} strokeWidth={3} />}
          </TouchableOpacity>
        </View>
        
        <Text style={styles.title}>{day.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{day.description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.tasksContainer}>
            <Text style={styles.tasksText}>{day.tasks.length} tasks</Text>
          </View>
          <View style={styles.arrowContainer}>
            <ChevronRight size={18} color={colors.primary} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayContainer: {
    flexDirection: 'column',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  timeEstimate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tasksContainer: {
    backgroundColor: colors.gray200,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tasksText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  }
});