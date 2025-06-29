import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getAllPlans } from '../api/plans';
import { recordHabitCheckin } from '../api/plans';

const CircularProgress = ({
  size,
  strokeWidth,
  progress,
  color,
  backgroundColor,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ transform: [{ rotate: '-90deg' }] }}>
      <Svg width={size} height={size}>
        <Circle
          stroke={backgroundColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const getHabitIcon = (title = '') => {
  const lower = title.toLowerCase();
  if (lower.includes('water')) return 'water-drop';
  if (lower.includes('read')) return 'menu-book';
  if (lower.includes('exercise') || lower.includes('workout')) return 'fitness-center';
  if (lower.includes('medit')) return 'self-improvement';
  if (lower.includes('gratitude')) return 'sentiment-satisfied';
  return 'check-circle';
};

export default function RepositoryScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user, token } = useAuth();
  const [skills, setSkills] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedHabits, setCompletedHabits] = useState(new Set());

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getAllPlans(token);
        setSkills(data.skills || []);
        setHabits(data.habits || []);
        const completedSet = new Set();
        (data.habits || []).forEach(h => {
          if (h.checked_today) completedSet.add(h._id);
        });
        setCompletedHabits(completedSet);
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && isFocused) {
      fetchPlans();
    }
   
  }, [token, isFocused]);

  const firstSkill = skills.length > 0 ? skills[0] : null;
  const todaysHabits = habits.slice(0, 4);

  const showAddSkill = () => navigation.navigate('AddSkill');
  const showAddHabit = () => navigation.navigate('AddHabit');

  const handleHabitCheck = async (habitId) => {
    if (completedHabits.has(habitId)) return; 
    try {
      const todayIso = new Date().toISOString().split('T')[0];
      await recordHabitCheckin(habitId, todayIso, token);
      const newSet = new Set(completedHabits);
      newSet.add(habitId);
      setCompletedHabits(newSet);
    } catch (err) {
      console.error('Failed to record checkin', err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            style={styles.avatar}
            source={{
              uri:
                'https://ui-avatars.com/api/?name=' + (user?.username || 'U') + '&background=14B8A6&color=fff',
            }}
          />
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.userName}>{user?.username || 'User'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.streakButton}>
          <MaterialIcons
            name="local-fire-department"
            size={16}
            color="#14B8A6"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.streakText}>0 days</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Focus</Text>
        <View style={styles.focusGrid}>
          <FocusCard
            title="Daily Goals"
            icon="checklist"
            progress={67}
            backgroundColors={['#14B8A6', '#06B6D4']}
            subtitle="4/6 tasks"
          />
          <FocusCard
            title="Weekly Progress"
            icon="calendar-today"
            progress={40}
            backgroundColors={['#8B5CF6', '#6366F1']}
            subtitle="2/5 days"
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Skills</Text>
          {skills.length > 1 && (
            <TouchableOpacity style={styles.viewAll} onPress={() => navigation.navigate('AllSkills')}>
              <Text style={styles.viewAllText}>View All</Text>
              <MaterialIcons name="chevron-right" size={18} color="#14B8A6" />
            </TouchableOpacity>
          )}
        </View>

        {firstSkill ? (
          <View style={styles.skillCard}>
            <ImageBackground
              source={{ uri: firstSkill.image_url || 'https://via.placeholder.com/300' }}
              style={styles.skillImage}
              imageStyle={{ borderRadius: 16 }}
            >
              <View style={styles.skillOverlay}>
                <View style={styles.skillTopRow}>
                  <View style={styles.skillInfo}>
                    <MaterialIcons name="psychology" color="white" size={20} />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.skillTitle}>{firstSkill.title}</Text>
                      <Text style={styles.skillSub}>{firstSkill.difficulty || ''}</Text>
                    </View>
                  </View>
                  <Text style={styles.skillBadge}>Day {firstSkill?.progress?.current_day || 1}/30</Text>
                </View>
                <Text style={styles.skillProgressLabel}>Progress</Text>
                <View style={styles.skillProgressContainer}>
                  <View
                    style={[styles.skillProgressBar, { width: `${firstSkill?.progress?.completion_percentage || 0}%` }]}
                  />
                </View>
                <TouchableOpacity style={styles.skillButton} onPress={() => navigation.navigate('SkillDetail', { skillId: firstSkill._id })}>
                  <Text style={styles.skillButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        ) : (
          <View style={[styles.placeholderCard, { borderColor: '#A78BFA' }] }>
            <MaterialIcons name="self-improvement" size={48} color="#A78BFA" style={{ marginBottom: 12 }} />
            <Text style={styles.placeholderText}>
              Every great journey starts with a single step.{"\n"}
              Tap below to create your first 30-day skill plan and watch yourself grow!
            </Text>
            <TouchableOpacity style={styles.placeholderButton} onPress={showAddSkill}>
              <Text style={styles.placeholderButtonText}>Add New Skill</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          {habits.length > 4 && (
            <TouchableOpacity style={styles.viewAll} onPress={() => navigation.navigate('AllHabits')}>
              <Text style={styles.viewAllText}>See All</Text>
              <MaterialIcons name="chevron-right" size={18} color="#14B8A6" />
            </TouchableOpacity>
          )}
        </View>

        {todaysHabits.length > 0 ? (
          <View style={styles.habitCard}>
            {todaysHabits.map((habit, index) => (
              <View key={habit._id || index}>
                <View style={styles.habitItem}>
                  <View style={[styles.habitLine, { backgroundColor: habit.color || '#14B8A6' }]} />
                  <MaterialIcons name={getHabitIcon(habit.title)} size={20} color={habit.color || '#14B8A6'} style={{ marginRight: 8 }} />
                  <View>
                    <Text style={styles.habitTitle}>{habit.title}</Text>
                    <Text style={styles.habitTime}>{habit.pattern?.frequency || 'Daily'}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.habitCheck,
                      completedHabits.has(habit._id)
                        ? { backgroundColor: '#22C55E' }
                        : { backgroundColor: '#E5E7EB' },
                    ]}
                    onPress={() => handleHabitCheck(habit._id)}
                  >
                    <MaterialIcons
                      name="check"
                      size={16}
                      color={completedHabits.has(habit._id) ? 'white' : '#6B7280'}
                    />
                  </TouchableOpacity>
                </View>
                {index !== todaysHabits.length - 1 && (
                  <View style={styles.habitDivider} />
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.placeholderCard, { borderColor: '#14B8A6' }] }>
            <MaterialIcons name="emoji-people" size={48} color="#14B8A6" style={{ marginBottom: 12 }} />
            <Text style={styles.placeholderText}>
              Small daily actions create remarkable change.{"\n"}
              Add your first habit below and begin the path to a better you!
            </Text>
            <TouchableOpacity style={styles.placeholderButton} onPress={showAddHabit}>
              <Text style={styles.placeholderButtonText}>Add New Habit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const FocusCard = ({
  title,
  icon,
  progress,
  backgroundColors,
  subtitle,
}) => {
  return (
    <View style={styles.focusCard}>
      <MaterialIcons
        name={icon}
        size={16}
        color={backgroundColors[0]}
        style={styles.focusIcon}
      />
      <View style={styles.progressContainer}>
        <CircularProgress
          size={60}
          strokeWidth={6}
          progress={progress}
          color={backgroundColors[0]}
          backgroundColor="#F3F4F6"
        />
        <View style={styles.progressContent}>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>
      <View style={styles.focusInfo}>
        <Text style={styles.focusTitle}>{title}</Text>
        <Text style={styles.focusSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    alignItems: 'center',
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
  greeting: { fontSize: 14, color: '#6B7280' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  streakButton: {
    flexDirection: 'row',
    backgroundColor: '#CCFBF1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  streakText: { fontSize: 14, color: '#14B8A6', fontWeight: '500' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  viewAll: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { fontSize: 14, color: '#14B8A6', fontWeight: '500' },
  focusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 12,
  },
  focusCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  focusIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  progressContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  focusInfo: {
    alignItems: 'center',
  },
  focusTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  focusSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },

  skillCard: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#A78BFA',
    overflow: 'hidden',
  },
  skillImage: { height: 160, width: '100%' },
  skillOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#A78BFA',
  },
  skillTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillInfo: { flexDirection: 'row', alignItems: 'center' },
  skillTitle: { color: 'white', fontWeight: '600' },
  skillSub: { fontSize: 12, color: 'white', opacity: 0.8 },
  skillBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
    fontSize: 12,
    color: 'white',
  },
  skillProgressLabel: { color: 'white', fontSize: 12, marginTop: 8 },
  skillProgressContainer: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    marginTop: 4,
  },
  skillProgressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 5,
  },
  skillButton: {
    backgroundColor: 'white',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  skillButtonText: { color: '#111827', fontWeight: '500', fontSize: 14 },

  habitCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#A78BFA',
  },
  habitItem: { flexDirection: 'row', alignItems: 'center' },
  habitLine: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  habitTitle: { fontWeight: '500', color: '#111827' },
  habitTime: { fontSize: 12, color: '#6B7280' },
  habitCheck: {
    marginLeft: 'auto',
    borderRadius: 999,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  habitDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },

  placeholderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    color: '#6B7280',
  },
  placeholderButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  placeholderButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 