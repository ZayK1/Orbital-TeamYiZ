import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ProgressRing, 
  StatsLineChart, 
  StatsBarChart, 
  ActivityHeatMap, 
  StatCard 
} from '../components/charts';

const { width: screenWidth } = Dimensions.get('window');

const StatsScreenMock = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Mock data for testing
  const mockStats = {
    overview: {
      total_skills: 5,
      total_habits: 3,
      days_active: 45,
      total_progress_points: 234
    },
    skills: {
      total_skills: 5,
      active_skills: 3,
      average_completion: 67,
      total_days_completed: 89,
      completion_trend: [
        { day_label: 'Mon', completed_days: 2 },
        { day_label: 'Tue', completed_days: 3 },
        { day_label: 'Wed', completed_days: 1 },
        { day_label: 'Thu', completed_days: 4 },
        { day_label: 'Fri', completed_days: 3 },
        { day_label: 'Sat', completed_days: 2 },
        { day_label: 'Sun', completed_days: 1 }
      ]
    },
    habits: {
      total_habits: 3,
      active_habits: 2,
      current_streaks: 12,
      consistency_score: 85,
      longest_streak: 15,
      weekly_checkins: [
        { day_label: 'Mon', checkins: 2 },
        { day_label: 'Tue', checkins: 1 },
        { day_label: 'Wed', checkins: 3 },
        { day_label: 'Thu', checkins: 2 },
        { day_label: 'Fri', checkins: 1 },
        { day_label: 'Sat', checkins: 2 },
        { day_label: 'Sun', checkins: 1 }
      ]
    },
    activity_timeline: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_activity: Math.floor(Math.random() * 5),
      intensity: Math.random()
    }))
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}>
          <LinearGradient
            colors={['#0f172a', '#1e293b', '#334155']}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Your Progress</Text>
            <Text style={styles.headerSubtitle}>Mock Data for Testing ✨</Text>
          </LinearGradient>
        </Animated.View>

        {/* Hero Progress Ring */}
        <Animated.View style={[
          styles.heroSection,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <LinearGradient
            colors={['#475569', '#64748b', '#94a3b8']}
            style={styles.heroCard}
          >
            <Text style={styles.heroTitle}>Skills Mastery</Text>
            <View style={styles.heroContent}>
              <ProgressRing
                size={140}
                progress={mockStats.skills.average_completion}
                gradientColors={['#ffffff', '#e0f2fe']}
                strokeWidth={12}
                centerText={
                  <View style={styles.heroRingCenter}>
                    <Text style={styles.heroPercentage}>{mockStats.skills.average_completion}%</Text>
                    <Text style={styles.heroLabel}>Complete</Text>
                  </View>
                }
                showPercentage={false}
                animate={true}
              />
              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatNumber}>{mockStats.skills.total_days_completed}</Text>
                  <Text style={styles.heroStatLabel}>Days Completed</Text>
                </View>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatNumber}>{mockStats.skills.active_skills}</Text>
                  <Text style={styles.heroStatLabel}>Active Skills</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Overview Cards */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <Text style={styles.sectionTitle}>📊 Quick Overview</Text>
          <Text style={styles.sectionSubtitle}>Your journey at a glance</Text>
          <View style={styles.cardGrid}>
            <StatCard
              title="Total Progress"
              value={mockStats.overview.total_progress_points}
              icon="trending-up"
              color="#a855f7"
              style={styles.compactCard}
            />
            <StatCard
              title="Skills Active"
              value={mockStats.skills.active_skills}
              subtitle={`${mockStats.skills.total_skills} total`}
              icon="school"
              color="#22c55e"
              style={styles.compactCard}
            />
            <StatCard
              title="Habits Active"
              value={mockStats.habits.active_habits}
              subtitle={`${mockStats.habits.total_habits} total`}
              icon="check-circle"
              color="#3b82f6"
              style={styles.compactCard}
            />
            <StatCard
              title="Days Active"
              value={mockStats.overview.days_active}
              subtitle="since you started"
              icon="calendar-today"
              color="#f59e0b"
              style={styles.compactCard}
            />
          </View>
        </Animated.View>

        {/* Skills Chart */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <Text style={styles.sectionTitle}>📚 Skills Progress</Text>
          <Animated.View style={[
            styles.chartContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <Text style={styles.chartTitle}>📈 Weekly Progress Trend</Text>
            <Text style={styles.chartSubtitle}>Your learning momentum over time</Text>
            <StatsLineChart
              data={{
                labels: mockStats.skills.completion_trend.map(d => d.day_label),
                datasets: [{
                  data: mockStats.skills.completion_trend.map(d => d.completed_days)
                }]
              }}
              width={screenWidth - 60}
              height={220}
              bezier
            />
          </Animated.View>
        </Animated.View>

        {/* Habits Chart */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <Text style={styles.sectionTitle}>✅ Habits Analytics</Text>
          <Animated.View style={[
            styles.chartContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <Text style={styles.chartTitle}>📊 Daily Check-ins This Week</Text>
            <Text style={styles.chartSubtitle}>Building consistency day by day</Text>
            <StatsBarChart
              data={{
                labels: mockStats.habits.weekly_checkins.map(d => d.day_label),
                datasets: [{
                  data: mockStats.habits.weekly_checkins.map(d => d.checkins)
                }]
              }}
              width={screenWidth - 60}
              height={220}
              showValuesOnTopOfBars
            />
          </Animated.View>
        </Animated.View>

        {/* Activity Timeline */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <LinearGradient
            colors={['#374151', '#4b5563', '#6b7280']}
            style={styles.timelineCard}
          >
            <Text style={styles.timelineTitle}>📅 Activity Timeline</Text>
            <Text style={styles.timelineSubtitle}>Your daily progress journey</Text>
            
            <Animated.View style={[
              styles.timelineContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}>
              <ActivityHeatMap
                data={mockStats.activity_timeline}
                width={screenWidth - 80}
                cellSize={14}
                gap={3}
                backgroundColor="transparent"
              />
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.85,
    letterSpacing: 0.2,
  },
  heroSection: {
    marginTop: -10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroRingCenter: {
    alignItems: 'center',
  },
  heroPercentage: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -1,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroStats: {
    flex: 1,
    marginLeft: 30,
  },
  heroStatItem: {
    marginBottom: 16,
  },
  heroStatNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  heroStatLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#cbd5e1',
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  compactCard: {
    width: (screenWidth - 64) / 2,
    minHeight: 100,
  },
  chartContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  chartSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#cbd5e1',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  timelineCard: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  timelineTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
  },
  timelineContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footer: {
    height: 50,
  },
});

export default StatsScreenMock;