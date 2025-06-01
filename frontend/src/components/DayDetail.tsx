import React from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { colors } from '../constants/colors';
import { SkillDay } from '../types';
import { Button } from './Button';
import { Check, Clock } from 'lucide-react-native';

interface DayDetailProps {
  day: SkillDay;
  onToggleComplete: () => void;
}

export const DayDetail: React.FC<DayDetailProps> = ({ 
  day,
  onToggleComplete
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>Day {day.day}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={styles.timeEstimate}>{day.timeEstimate}</Text>
            </View>
          </View>
          
          <Text style={styles.title}>{day.title}</Text>
          <Text style={styles.description}>{day.description}</Text>
          
          {day.completed && (
            <View style={styles.completedBadge}>
              <Check size={16} color={colors.white} strokeWidth={3} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
        
        <View style={styles.tasksContainer}>
          <Text style={styles.tasksTitle}>Today's Tasks</Text>
          
          {day.tasks.map((task, index) => (
            <View key={index} style={styles.taskItem}>
              <View style={styles.taskNumber}>
                <Text style={styles.taskNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskText}>{task}</Text>
              </View>
            </View>
          ))}
        </View>
        
        <Button
          title={day.completed ? "Mark as Incomplete" : "Mark as Complete"}
          onPress={onToggleComplete}
          variant={day.completed ? "outline" : "primary"}
          style={styles.completeButton}
          textStyle={styles.completeButtonText}
          icon={day.completed ? undefined : <Check size={18} color={colors.white} />}
        />
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dayBadge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  dayBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeEstimate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
    lineHeight: 24,
  },
  tasksContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  taskNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  taskNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  completeButton: {
    marginTop: 8,
  },
  completeButtonText: {
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  completedText: {
    color: colors.success,
    fontWeight: '600',
    marginLeft: 8,
  },
});