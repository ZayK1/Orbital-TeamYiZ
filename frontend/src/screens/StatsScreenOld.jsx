import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Easing
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { getUserStats } from '../api/plans';
import { colors } from '../constants/colors';
import { 
  ProgressRing, 
  StatsLineChart, 
  StatsBarChart, 
  ActivityHeatMap, 
  StatCard 
} from '../components/charts';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const StatsScreen = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  // Reset animations on mount
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.9);
    bounceAnim.setValue(0);
  }, []);
  
  // Start bounce animation for scroll indicator
  useEffect(() => {
    const startBounceAnimation = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat the animation
        setTimeout(startBounceAnimation, 2000);
      });
    };
    
    // Start bounce animation after a delay
    setTimeout(startBounceAnimation, 2000);
  }, [bounceAnim]);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const response = await getUserStats(token);
      setStats(response.stats);
      
      // Start entrance animations immediately
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
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, fadeAnim, slideAnim, scaleAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Reset animations for refresh
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.9);
    fetchStats();
  }, [fetchStats, fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [fetchStats, token]);

  const renderOverviewCards = () => {
    if (!stats || !stats.overview) {
      return null;
    }
    
    return (
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
            value={Math.round(stats.overview.total_progress_points || 0)}
            icon="trending-up"
            color="#a855f7"
            style={styles.compactCard}
          />
          <StatCard
            title="Skills Active"
            value={Math.round(stats.skills?.active_skills || 0)}
            subtitle={`${Math.round(stats.skills?.total_skills || 0)} total`}
            icon="school"
            color="#22c55e"
            style={styles.compactCard}
          />
          <StatCard
            title="Habits Active"
            value={Math.round(stats.habits?.active_habits || 0)}
            subtitle={`${Math.round(stats.habits?.total_habits || 0)} total`}
            icon="check-circle"
            color="#3b82f6"
            style={styles.compactCard}
          />
          <StatCard
            title="Days Active"
            value={Math.round(stats.overview.days_active || 0)}
            subtitle="since you started"
            icon="calendar-today"
            color="#f59e0b"
            style={styles.compactCard}
          />
        </View>
      </Animated.View>
    );
  };

  const renderSkillsProgress = () => {
    if (!stats || !stats.skills) return null;
    
    // Show skills section even with zero skills, but with different content
    const hasSkillsData = stats.skills.total_skills > 0;
    
    // If no skills data, show encouragement message
    if (!hasSkillsData) {
      return (
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
          <Text style={styles.sectionTitle}>📚 Skills Deep Dive</Text>
          <View style={styles.emptySection}>
            <MaterialIcons name="school" size={40} color="#94a3b8" />
            <Text style={styles.emptySectionText}>Create your first skill to see progress analytics!</Text>
          </View>
        </Animated.View>
      );
    }

    return (
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
        <Text style={styles.sectionTitle}>📚 Skills Deep Dive</Text>
        
        {stats.skills?.completion_trend && stats.skills.completion_trend.length > 0 && (
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
                labels: stats.skills.completion_trend.map(d => d.day_label),
                datasets: [{
                  data: stats.skills.completion_trend.map(d => d.completed_days)
                }]
              }}
              width={screenWidth - 60}
              height={220}
              bezier
            />
          </Animated.View>
        )}

        <Animated.View style={[
          styles.progressContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
          <View style={styles.progressRingSection}>
            <ProgressRing
              size={100}
              progress={Math.round(stats.skills?.average_completion || 0)}
              gradientColors={['#a855f7', '#3b82f6']}
              strokeWidth={8}
              animate={true}
            />
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Average Completion</Text>
              <Text style={styles.progressSubtitle}>
                {Math.round(stats.skills?.total_days_completed || 0)} days completed across all skills
              </Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    );
  };

  const renderHabitsAnalytics = () => {
    if (!stats || !stats.habits) return null;
    
    // Show habits section even with zero habits, but with different content
    const hasHabitsData = stats.habits.total_habits > 0;
    
    // If no habits data, show encouragement message
    if (!hasHabitsData) {
      return (
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
          <Text style={styles.sectionTitle}>✅ Habits Mastery</Text>
          <View style={styles.emptySection}>
            <MaterialIcons name="check-circle" size={40} color="#94a3b8" />
            <Text style={styles.emptySectionText}>Create your first habit to track consistency!</Text>
          </View>
        </Animated.View>
      );
    }

    return (
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
        <Text style={styles.sectionTitle}>✅ Habits Mastery</Text>
        
        {stats.habits?.weekly_checkins && stats.habits.weekly_checkins.length > 0 && (
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
                labels: stats.habits.weekly_checkins.map(d => d.day_label),
                datasets: [{
                  data: stats.habits.weekly_checkins.map(d => d.checkins)
                }]
              }}
              width={screenWidth - 60}
              height={220}
              showValuesOnTopOfBars
            />
          </Animated.View>
        )}

        <Animated.View style={[
          styles.habitsStats,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
          <StatCard
            title="Current Streaks"
            value={Math.round(stats.habits?.current_streaks || 0)}
            icon="local-fire-department"
            color="#f59e0b"
            style={[styles.gridCard, { flex: 1 }]}
          />
          <StatCard
            title="Consistency Score"
            value={`${Math.round(stats.habits?.consistency_score || 0)}%`}
            icon="assessment"
            color="#22c55e"
            style={[styles.gridCard, { flex: 1 }]}
          />
        </Animated.View>
      </Animated.View>
    );
  };

  const renderActivityTimeline = () => {
    if (!stats || !stats.activity_timeline) return null;
    
    // Show timeline even if all values are zero

    return (
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
              data={stats.activity_timeline}
              width={screenWidth - 80}
              cellSize={14}
              gap={3}
              backgroundColor="transparent"
              onDatePress={(item) => {
                console.log('Selected date:', item);
              }}
            />
          </Animated.View>
          
          <Animated.View style={[
            styles.timelineInsights,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <View style={styles.insightItem}>
              <Text style={styles.insightNumber}>
                {stats.activity_timeline.filter(d => d.total_activity > 0).length}
              </Text>
              <Text style={styles.insightLabel}>Active Days</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightNumber}>
                {Math.round(stats.activity_timeline.reduce((sum, d) => sum + d.total_activity, 0) / stats.activity_timeline.length)}
              </Text>
              <Text style={styles.insightLabel}>Avg Daily</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightNumber}>
                {Math.max(...stats.activity_timeline.map(d => d.total_activity))}
              </Text>
              <Text style={styles.insightLabel}>Best Day</Text>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{
          transform: [{ scale: scaleAnim }]
        }}>
          <ActivityIndicator size="large" color="#a855f7" />
        </Animated.View>
        <Animated.Text style={[
          styles.loadingText,
          { opacity: fadeAnim }
        ]}>
          Loading your progress...
        </Animated.Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStats}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Always show the stats screen, even with zero data
  const hasSkills = stats && stats.overview && stats.overview.total_skills > 0;
  const hasHabits = stats && stats.overview && stats.overview.total_habits > 0;
  const hasAnyData = hasSkills || hasHabits;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        nestedScrollEnabled={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Scroll Indicator */}
        <Animated.View style={[
          styles.scrollIndicator,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { 
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 10]
                })
              }
            ]
          }
        ]}>
          <View style={styles.scrollHint}>
            <Animated.View style={{
              transform: [{
                scale: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2]
                })
              }]
            }}>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#94a3b8" />
            </Animated.View>
            <Text style={styles.scrollHintText}>Scroll to explore</Text>
          </View>
        </Animated.View>
        
        {/* Compact Header */}
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}>
          <LinearGradient
            colors={['#0f172a', '#1e293b', '#334155']}
            style={styles.compactHeader}
          >
            <Text style={styles.headerTitle}>Your Progress</Text>
            <Text style={styles.headerSubtitle}>Amazing insights await below ✨</Text>
          </LinearGradient>
        </Animated.View>

        {/* Hero Progress Ring */}
        {stats && stats.skills && hasSkills && (
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
                  progress={Math.round(stats.skills?.average_completion || 0)}
                  gradientColors={['#ffffff', '#e0f2fe']}
                  strokeWidth={12}
                  centerText={
                    <View style={styles.heroRingCenter}>
                      <Text style={styles.heroPercentage}>{Math.round(stats.skills?.average_completion || 0)}%</Text>
                      <Text style={styles.heroLabel}>Complete</Text>
                    </View>
                  }
                  showPercentage={false}
                  animate={true}
                />
                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatNumber}>{Math.round(stats.skills?.total_days_completed || 0)}</Text>
                    <Text style={styles.heroStatLabel}>Days Completed</Text>
                  </View>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatNumber}>{Math.round(stats.skills?.active_skills || 0)}</Text>
                    <Text style={styles.heroStatLabel}>Active Skills</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Show empty state message if no data */}
        {!hasAnyData && (
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
            <View style={styles.emptySection}>
              <MaterialIcons name="insights" size={60} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Start Your Journey</Text>
              <Text style={styles.emptySectionText}>
                Create your first skill or habit to see beautiful analytics and track your progress!
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Overview Cards - show first to grab attention */}
        {renderOverviewCards()}

        {/* Activity Timeline */}
        {renderActivityTimeline()}

        {/* Charts Section */}
        {renderSkillsProgress()}
        {renderHabitsAnalytics()}
        
        {/* Additional sections for better scrolling */}
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
          <Text style={styles.sectionTitle}>🎯 Your Goals</Text>
          <View style={styles.emptySection}>
            <MaterialIcons name="flag" size={40} color="#94a3b8" />
            <Text style={styles.emptySectionText}>Set your first goal to track your progress!</Text>
          </View>
        </Animated.View>
        
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
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          <View style={styles.emptySection}>
            <MaterialIcons name="emoji-events" size={40} color="#94a3b8" />
            <Text style={styles.emptySectionText}>Unlock achievements as you make progress!</Text>
          </View>
        </Animated.View>

        {/* Achievement Section */}
        {stats && (
          <Animated.View style={[
            styles.achievementSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}>
            <LinearGradient
              colors={['#1e293b', '#334155', '#475569']}
              style={styles.achievementCard}
            >
              <Text style={styles.achievementTitle}>🎉 Your Achievements</Text>
              <View style={styles.achievementGrid}>
                <View style={styles.achievementItem}>
                  <Text style={styles.achievementNumber}>{stats.overview.days_active}</Text>
                  <Text style={styles.achievementLabel}>Days on Journey</Text>
                </View>
                <View style={styles.achievementItem}>
                  <Text style={styles.achievementNumber}>{Math.round(stats.overview?.total_progress_points || 0)}</Text>
                  <Text style={styles.achievementLabel}>Progress Points</Text>
                </View>
                {stats.habits.longest_streak > 0 && (
                  <View style={styles.achievementItem}>
                    <Text style={styles.achievementNumber}>{stats.habits.longest_streak}</Text>
                    <Text style={styles.achievementLabel}>Longest Streak</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Additional scrollable content to ensure bounce effect */}
        <View style={styles.scrollableContent}>
          <View style={styles.endOfContent}>
            <Text style={styles.endOfContentText}>✨ You've reached the end ✨</Text>
            <Text style={styles.endOfContentSubtext}>Pull down to refresh your stats</Text>
          </View>
        </View>
        
        {/* Footer spacing */}
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
    paddingBottom: 200,
    minHeight: screenHeight + 200, // Force content to be taller than screen
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8',
    letterSpacing: 0.2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 32,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 24,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },
  emptyGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  compactHeader: {
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
  achievementSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  achievementCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  achievementTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  achievementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  achievementItem: {
    alignItems: 'center',
    minWidth: 90,
  },
  achievementNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  achievementLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
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
  gridCard: {
    width: (screenWidth - 64) / 2,
  },
  compactCard: {
    width: (screenWidth - 64) / 2,
    minHeight: 100,
  },
  progressContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressRingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
    marginLeft: 24,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  progressSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#cbd5e1',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  habitsStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
  timelineInsights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  insightItem: {
    alignItems: 'center',
  },
  insightNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  insightLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },
  footer: {
    height: 100,
  },
  scrollableContent: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endOfContent: {
    alignItems: 'center',
    padding: 20,
    opacity: 0.7,
  },
  endOfContentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 8,
  },
  endOfContentSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  scrollIndicator: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingTop: 20,
  },
  scrollHint: {
    alignItems: 'center',
    opacity: 0.7,
  },
  scrollHintText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 4,
  },
  emptySection: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptySectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});

export default StatsScreen;