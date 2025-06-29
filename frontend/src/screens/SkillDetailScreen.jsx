import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getSkillById, markSkillDayComplete } from '../api/plans';

const SkillDetailScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { token } = useAuth();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSkill = async () => {
    try {
      const data = await getSkillById(params.skillId, token);
      setSkill(data);
    } catch (err) {
      console.error('Failed fetch skill', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkill();
  }, [params.skillId]);

  if (loading || !skill) {
    return (
      <SafeAreaView style={styles.safeAreaCenter}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </SafeAreaView>
    );
  }

  const currentDayIdx = (skill.progress?.current_day || 1) - 1;
  const todayTasks = skill.curriculum?.daily_tasks[currentDayIdx] || {};
  const tomorrow = skill.curriculum?.daily_tasks[currentDayIdx + 1];

  const handleMarkComplete = async () => {
    try {
      await markSkillDayComplete(skill._id, skill.progress.current_day, token);
      fetchSkill();
    } catch (err) {
      console.error('Complete day error', err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={24} color="gray" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{skill.title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressTop}>
            <View>
              <View style={styles.rowAlign}>
                <MaterialIcons name="calendar-today" size={16} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.dayText}>Day {skill.progress.current_day} of 30</Text>
              </View>
              <Text style={styles.progressPercent}>{skill.progress.completion_percentage}% Complete</Text>
              <Text style={styles.nextMilestone}>Keep going!</Text>
            </View>
            <View style={styles.progressCircleWrapper}>
              <View style={styles.circleOuter}>
                <Text style={styles.circleText}>{skill.progress.completion_percentage}%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardGrayWrapper}>
          <View style={styles.cardTopRow}>
            <View style={styles.rowAlign}>
              <View style={[styles.iconCircle, { backgroundColor: '#CCFBF1' }]}> 
                <MaterialIcons name="schedule" size={20} color="#0D9488" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Today's Tasks</Text>
                <Text style={[styles.cardSubtitle, { color: '#0D9488' }]}>Day {skill.progress.current_day}: {todayTasks.title}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.progressLabel}>Today's Progress</Text>
            <Text style={styles.progressLabelSecondary}>{todayTasks.tasks?.filter(t=>t.completed).length || 0}/{todayTasks.tasks?.length || 0}</Text>
          </View>
          <View style={styles.taskList}>
            {todayTasks.tasks?.map((t, idx) => (
              <View key={idx} style={styles.taskItem}>
                <View style={idx < (todayTasks.tasks?.filter(tt=>tt.completed).length||0) ? styles.dotDone : styles.dotEmpty}>
                  {idx < (todayTasks.tasks?.filter(tt=>tt.completed).length||0) && (
                    <MaterialIcons name="done" size={12} color="white" />
                  )}
                </View>
                <Text style={styles.taskText}>{t.description || t}</Text>
              </View>
            ))}
          </View>
        </View>

        {tomorrow && (
          <View style={styles.cardWhiteWrapper}>
            <View style={[styles.rowAlign, { alignItems: 'flex-start', marginBottom: 12 }]}> 
              <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2', marginTop: 4 }]}> 
                <MaterialIcons name="event-available" size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Tomorrow's Tasks</Text>
                <Text style={[styles.cardSubtitle, { color: '#EF4444' }]}>Day {skill.progress.current_day + 1}: {tomorrow.title}</Text>
              </View>
            </View>
            {tomorrow.tasks?.map((item, i) => (
              <View key={i} style={styles.taskBulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{item.description || item}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
        
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleMarkComplete}>
          <Text style={styles.primaryButtonText}>Mark Day Complete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  safeAreaCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937' },
  progressSection: { backgroundColor: '#8B5CF6', padding: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rowAlign: { flexDirection: 'row', alignItems: 'center' },
  dayText: { color: 'white', fontSize: 14 },
  progressPercent: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  nextMilestone: { fontSize: 14, color: '#E5E7EB' },
  progressCircleWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' },
  circleOuter: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' },
  circleText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  cardGrayWrapper: { backgroundColor: '#F9FAFB', margin: 16, padding: 16, borderRadius: 16 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontWeight: '600', color: '#1F2937' },
  cardSubtitle: { color: '#6B7280', fontSize: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel: { fontSize: 10, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' },
  progressLabelSecondary: { fontSize: 10, color: '#9CA3AF' },
  taskList: { gap: 12 },
  taskItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 8 },
  taskText: { color: '#374151', fontSize: 14 },
  dotDone: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dotEmpty: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', marginRight: 12 },
  cardWhiteWrapper: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
  taskBulletRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 44, marginBottom: 6 },
  bullet: { width: 8, height: 8, backgroundColor: '#D1D5DB', borderRadius: 4, marginRight: 8 },
  bulletText: { color: '#4B5563', fontSize: 14 },
  bottomButtons: { position: 'absolute', bottom: 40, left: 16, right: 16 },
  primaryButton: { backgroundColor: '#14B8A6', paddingVertical: 14, borderRadius: 12 },
  primaryButtonText: { color: 'white', fontWeight: '600', textAlign: 'center' },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 12, marginHorizontal: 16, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width:0, height:1 }, shadowRadius: 2 },
  viewLink: { color: '#4B5563', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
});

export default SkillDetailScreen; 