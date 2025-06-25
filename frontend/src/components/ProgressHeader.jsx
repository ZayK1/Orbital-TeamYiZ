import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { Circle } from 'lucide-react-native';

const ProgressHeader = ({ skillName = '', completedDays = 0, totalDays = 30 }) => {
  const percent = Math.round((completedDays / totalDays) * 100);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{skillName}</Text>
      <View style={styles.progressRow}>
        <View style={styles.circleWrapper}>
          <Circle size={80} color={colors.primaryLight} strokeWidth={8} />
          <View style={styles.percentTextWrapper}>
            <Text style={styles.percentText}>{percent}%</Text>
          </View>
        </View>
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.subtitle}>{completedDays}/{totalDays} days completed</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 16 },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  circleWrapper: { justifyContent: 'center', alignItems: 'center' },
  percentTextWrapper: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  percentText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  subtitle: { fontSize: 16, color: colors.textSecondary },
});

export default ProgressHeader; 