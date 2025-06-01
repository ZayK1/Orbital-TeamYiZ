import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';
import { SkillPlan } from '../types';

interface ProgressHeaderProps {
  plan: SkillPlan;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({ plan }) => {
  const { completedCount, progressPercentage } = useMemo(() => {
    const completed = plan.days.filter(day => day.completed).length;
    const percentage = Math.round((completed / plan.days.length) * 100);
    
    return {
      completedCount: completed,
      progressPercentage: percentage
    };
  }, [plan.days]);
  
  const widthAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progressPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);
  
  const progressWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.skillName}>{plan.skillName}</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>30-Day Plan</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>
            {completedCount} of {plan.days.length} days completed
          </Text>
          <Text style={styles.percentageText}>{progressPercentage}%</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { width: progressWidth }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  skillName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  badgeContainer: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});