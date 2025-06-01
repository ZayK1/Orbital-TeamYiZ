import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors'; 

const ProgressHeader = ({ skillName, completedDays, totalDays }) => {
  const progressPercentage = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.skillName}>{skillName || 'Your Skill Plan'}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressText}>{`${completedDays} / ${totalDays} days completed`}</Text>
      </View>
      <Text style={styles.percentageText}>{`${Math.round(progressPercentage)}% complete`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  skillName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarBackground: {
    width: '90%',
    height: 12,
    backgroundColor: colors.gray200, 
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  }
});

export default ProgressHeader; 