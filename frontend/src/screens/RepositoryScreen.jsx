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
  
  // Health & Fitness
  if (lower.includes('water') || lower.includes('hydrate')) return 'water-drop';
  if (lower.includes('exercise') || lower.includes('workout') || lower.includes('gym') || lower.includes('run')) return 'fitness-center';
  if (lower.includes('walk') || lower.includes('steps')) return 'directions-walk';
  if (lower.includes('sleep') || lower.includes('bedtime')) return 'bedtime';
  if (lower.includes('stretch') || lower.includes('yoga')) return 'accessibility-new';
  
  // Mental & Learning
  if (lower.includes('read') || lower.includes('book')) return 'menu-book';
  if (lower.includes('medit') || lower.includes('mindful')) return 'self-improvement';
  if (lower.includes('gratitude') || lower.includes('grateful')) return 'sentiment-satisfied';
  if (lower.includes('journal') || lower.includes('write')) return 'edit-note';
  if (lower.includes('learn') || lower.includes('study')) return 'school';
  
  // Productivity & Work
  if (lower.includes('work') || lower.includes('task')) return 'work';
  if (lower.includes('email') || lower.includes('inbox')) return 'email';
  if (lower.includes('organize') || lower.includes('clean')) return 'cleaning-services';
  if (lower.includes('plan') || lower.includes('schedule')) return 'event';
  
  // Social & Personal
  if (lower.includes('call') || lower.includes('phone')) return 'phone';
  if (lower.includes('family') || lower.includes('friend')) return 'people';
  if (lower.includes('cook') || lower.includes('meal')) return 'restaurant';
  if (lower.includes('music') || lower.includes('listen')) return 'music-note';
  if (lower.includes('create') || lower.includes('art')) return 'palette';
  
  // Default
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
        console.log('🔄 Fetching plans from backend...');
        const data = await getAllPlans(token);
        console.log('📊 Backend response:', data);
        
        setSkills(data.skills || []);
        setHabits(data.habits || []);
        
        // Update completed habits based on backend data (checked_today field)
        const completedSet = new Set();
        (data.habits || []).forEach(h => {
          if (h.checked_today) {
            completedSet.add(h._id);
          }
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
  const todaysHabits = habits;

  const getTodaysFocusData = () => {
    const today = new Date();
    
    let totalTodaysTasks = 0;
    let completedTodaysTasks = 0;
    
    skills.forEach(skill => {
      const currentDay = skill.progress?.current_day || 1;
      const dailyTasks = skill.curriculum?.daily_tasks || [];
      if (currentDay <= dailyTasks.length) {
        const todaysTasks = dailyTasks[currentDay - 1]?.tasks || [];
        totalTodaysTasks += todaysTasks.length;
        completedTodaysTasks += todaysTasks.filter(task => task.completed).length;
      }
    });
    
    const todaysHabitsCount = todaysHabits.length;
    const completedHabitsCount = todaysHabits.filter(h => completedHabits.has(h._id)).length;
    
    totalTodaysTasks += todaysHabitsCount;
    completedTodaysTasks += completedHabitsCount;
    
    const dailyGoalsProgress = totalTodaysTasks > 0 ? Math.round((completedTodaysTasks / totalTodaysTasks) * 100) : 0;
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    let weeklyActiveDays = 0;
    const daysInWeek = 7;
    
    for (let i = 0; i < daysInWeek; i++) {
      const checkDate = new Date(startOfWeek);
      checkDate.setDate(startOfWeek.getDate() + i);
      if (checkDate <= today) {
        const hasActivity = skills.some(skill => {
          const skillStartDate = new Date(skill.progress?.started_at || skill.created_at);
          const daysSinceStart = Math.floor((checkDate - skillStartDate) / (1000 * 60 * 60 * 24)) + 1;
          return daysSinceStart > 0 && daysSinceStart <= (skill.progress?.current_day || 1);
        });
        if (hasActivity) weeklyActiveDays++;
      }
    }
    
    const weeklyProgress = Math.round((weeklyActiveDays / daysInWeek) * 100);
    
    return {
      dailyGoals: {
        progress: dailyGoalsProgress,
        completed: completedTodaysTasks,
        total: totalTodaysTasks
      },
      weeklyProgress: {
        progress: weeklyProgress,
        activeDays: weeklyActiveDays,
        totalDays: daysInWeek
      }
    };
  };
  
  const focusData = getTodaysFocusData();

  const showAddSkill = () => navigation.navigate('AddSkill');
  const showAddHabit = () => navigation.navigate('AddHabit');

  const handleHabitCheck = async (habitId) => {
    const isCurrentlyCompleted = completedHabits.has(habitId);
    
    if (isCurrentlyCompleted) return; // Already completed, don't allow unchecking
    
    // Optimistic update
    const newSet = new Set(completedHabits);
    newSet.add(habitId);
    setCompletedHabits(newSet);
    
    // Update the habits array optimistically
    setHabits(prev => prev.map(h => 
      h._id === habitId ? { ...h, checked_today: true } : h
    ));
    
    try {
      const todayIso = new Date().toISOString().split('T')[0];
      const response = await recordHabitCheckin(habitId, todayIso, token);
      
      // Update with the actual habit data from backend (includes updated streaks and checked_today)
      if (response.habit) {
        setHabits(prev => prev.map(h => 
          h._id === habitId ? response.habit : h
        ));
        
        // Update completedHabits based on the backend response
        const updatedSet = new Set(completedHabits);
        if (response.habit.checked_today) {
          updatedSet.add(habitId);
        } else {
          updatedSet.delete(habitId);
        }
        setCompletedHabits(updatedSet);
      }
    } catch (err) {
      console.error('Failed to record checkin:', err);
      
      // Rollback optimistic update on error
      const rollbackSet = new Set(completedHabits);
      rollbackSet.delete(habitId);
      setCompletedHabits(rollbackSet);
      
      setHabits(prev => prev.map(h => 
        h._id === habitId ? { ...h, checked_today: false } : h
      ));
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
        {loading ? (
          <View style={styles.focusGrid}>
            <View style={styles.focusCardTouchable}>
              <View style={[styles.focusCard, styles.loadingCard]}>
                <ActivityIndicator size="small" color="#14B8A6" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            </View>
            <View style={styles.focusCardTouchable}>
              <View style={[styles.focusCard, styles.loadingCard]}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.focusGrid}>
            <TouchableOpacity 
              style={styles.focusCardTouchable}
              onPress={() => {
                if (skills.length > 0) {
                  navigation.navigate('SkillDetail', { skillId: skills[0]._id });
                } else {
                  navigation.navigate('AddSkill');
                }
              }}
              activeOpacity={0.7}
            >
              <FocusCard
                title="Daily Goals"
                icon="today"
                progress={focusData.dailyGoals.progress}
                backgroundColors={['#14B8A6', '#06B6D4']}
                subtitle={focusData.dailyGoals.total > 0 ? `${focusData.dailyGoals.completed}/${focusData.dailyGoals.total} tasks` : 'No tasks today'}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.focusCardTouchable}
              onPress={() => navigation.navigate('AllSkills')}
              activeOpacity={0.7}
            >
              <FocusCard
                title="Weekly Progress"
                icon="calendar-today"
                progress={focusData.weeklyProgress.progress}
                backgroundColors={['#8B5CF6', '#6366F1']}
                subtitle={`${focusData.weeklyProgress.activeDays}/${focusData.weeklyProgress.totalDays} days`}
              />
            </TouchableOpacity>
          </View>
        )}
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
          {habits.length > 0 && (
            <TouchableOpacity style={styles.viewAll} onPress={() => navigation.navigate('MyHabits')}>
              <Text style={styles.viewAllText}>View All</Text>
              <MaterialIcons name="chevron-right" size={18} color="#14B8A6" />
            </TouchableOpacity>
          )}
        </View>

        {todaysHabits.length > 0 ? (
          <View style={styles.habitsGridContainer}>
            {todaysHabits.map((habit, index) => (
              <TouchableOpacity 
                key={habit._id || index} 
                style={[
                  styles.gridHabitCard,
                  completedHabits.has(habit._id) && styles.completedGridHabitCard,
                  { borderColor: habit.color || '#14B8A6' }
                ]}
                onPress={() => handleHabitCheck(habit._id)}
                activeOpacity={0.8}
              >
                <View style={styles.gridHabitContent}>
                  <View style={[
                    styles.gridHabitIconContainer, 
                    { backgroundColor: (habit.color || '#14B8A6') + '15' }
                  ]}>
                    <MaterialIcons 
                      name={getHabitIcon(habit.title)} 
                      size={20} 
                      color={habit.color || '#14B8A6'} 
                    />
                  </View>
                  
                  <Text style={[
                    styles.gridHabitTitle,
                    completedHabits.has(habit._id) && styles.completedGridHabitTitle
                  ]} numberOfLines={2}>
                    {habit.title}
                  </Text>
                  
                  <Text style={styles.gridHabitFrequency}>
                    {habit.pattern?.frequency || 'Daily'}
                  </Text>
                  
                  {habit.streaks?.current_streak > 0 && (
                    <View style={styles.gridStreakContainer}>
                      <MaterialIcons name="local-fire-department" size={12} color="#F97316" />
                      <Text style={styles.gridStreakText}>
                        {habit.streaks.current_streak}d
                      </Text>
                    </View>
                  )}
                  
                  <View style={[
                    styles.gridHabitCheckbox,
                    completedHabits.has(habit._id) 
                      ? { backgroundColor: '#22C55E', borderColor: '#22C55E' }
                      : { backgroundColor: 'transparent', borderColor: habit.color || '#14B8A6' }
                  ]}>
                    {completedHabits.has(habit._id) && (
                      <MaterialIcons name="check" size={12} color="white" />
                    )}
                  </View>
                </View>
                
              </TouchableOpacity>
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
  const getProgressColor = (progress) => {
    if (progress >= 80) return backgroundColors[0];
    if (progress >= 50) return '#F59E0B';
    return '#14B8A6';
  };
  
  const progressColor = getProgressColor(progress);
  
  return (
    <View style={styles.focusCard}>
      <View style={styles.focusCardHeader}>
        <View style={[styles.focusIconBackground, { backgroundColor: progressColor + '15' }]}>
          <MaterialIcons
            name={icon}
            size={18}
            color={progressColor}
          />
        </View>
      </View>
      <View style={styles.progressContainer}>
        <CircularProgress
          size={70}
          strokeWidth={6}
          progress={progress}
          color={progressColor}
          backgroundColor="#F3F4F6"
        />
        <View style={styles.progressContent}>
          <Text style={[styles.progressText, { color: progressColor }]}>{progress}%</Text>
        </View>
      </View>
      <View style={styles.focusInfo}>
        <Text style={styles.focusTitle}>{title}</Text>
        <Text style={styles.focusSubtitle}>{subtitle}</Text>
      </View>
      {progress === 100 && (
        <View style={styles.completedBadge}>
          <MaterialIcons name="check" size={12} color="white" />
        </View>
      )}
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
  focusCardTouchable: {
    flex: 1,
  },
  focusCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  focusCardHeader: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusIconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 12,
  },
  loadingCard: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#22C55E',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '800',
  },
  focusInfo: {
    alignItems: 'center',
  },
  focusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  focusSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
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

  habitsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  gridHabitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    width: '48%',
    minHeight: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  completedGridHabitCard: {
    backgroundColor: '#F0FDF4',
  },
  gridHabitContent: {
    alignItems: 'center',
    flex: 1,
  },
  gridHabitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridHabitTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 14,
  },
  completedGridHabitTitle: {
    color: '#059669',
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  gridHabitFrequency: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  gridStreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
  },
  gridStreakText: {
    fontSize: 10,
    color: '#F97316',
    fontWeight: '600',
  },
  gridHabitCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  gridCompletedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

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