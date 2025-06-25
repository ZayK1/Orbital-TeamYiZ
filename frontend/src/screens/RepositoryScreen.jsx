import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const habits = [
  {
    title: 'Morning meditation',
    icon: 'wb-sunny',
    time: '7:00 AM',
    color: '#A78BFA',
  },
  {
    title: 'Read 20 pages',
    icon: 'menu-book',
    time: '8:30 AM',
    color: '#2DD4BF',
  },
  {
    title: 'Drink water',
    icon: 'water-drop',
    time: 'Throughout day',
    color: '#60A5FA',
  },
  {
    title: 'Evening walk',
    icon: 'directions-walk',
    time: '6:00 PM',
    color: '#F472B6',
  },
];

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

export default function RepositoryScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            style={styles.avatar}
            source={{
              uri:
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCmDtwn9LLEClGztRStca1u7J3RiU949GILuJJwJTVycquPO_U_HXwmbao8XHty8t44JW-hcaWK47bmLwip3Z1_pUEgbvxjBdhg1hQW-r7iBna3anmEbNnPPIkcVvmS9ZujvZa5sLXx4Xwa7AZ-XcZyi-w0KY4OoU6ZosPPSRZU7wvtu8USaEexED9593aPdXa9wWCGh5ervUM_SLtzeOYtaCGyV5Gbydv4sbe52l6-A2zpbKw4y-t0pM06vKxqpIj72Q8KxCnmgNM',
            }}
          />
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.userName}>Sarah</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.streakButton}>
          <MaterialIcons
            name="local-fire-department"
            size={16}
            color="#14B8A6"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.streakText}>12 days</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Focus */}
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

      {/* Active Skills */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Skills</Text>
          <TouchableOpacity style={styles.viewAll}>
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialIcons name="chevron-right" size={18} color="#14B8A6" />
          </TouchableOpacity>
        </View>

        <View style={styles.skillCard}>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMhDkOG3MEUk2ZURk1xihaqg8N405d9-9M88CUZqYIU3AFCcSdNNgaGb0oKUUQvYOiT06pliZLDkBW99NHg6XGbNfUgS8MHPxAf2BAn7aGGLKKfz3LVklebMcEeIBZ-nBqyQYUY4DR2T0nD3zE7pcbVLxwYWFXAn73VQNHWhc_lnnB4RWbpZ_qszJwU4LslDCR29UNYdqlbehB9tiqrA5ekOlG1fDbqZZRuYeM9L8upQxAYDLlR1rXSGjXYJbOxOWXW7VJDIW0jYw',
            }}
            style={styles.skillImage}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.skillOverlay}>
              <View style={styles.skillTopRow}>
                <View style={styles.skillInfo}>
                  <MaterialIcons name="translate" color="white" size={20} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.skillTitle}>Spanish</Text>
                    <Text style={styles.skillSub}>Conversational Fluency</Text>
                  </View>
                </View>
                <Text style={styles.skillBadge}>Day 8/30</Text>
              </View>
              <Text style={styles.skillProgressLabel}>Progress</Text>
              <View style={styles.skillProgressContainer}>
                <View style={[styles.skillProgressBar, { width: '27%' }]} />
              </View>
              <TouchableOpacity style={styles.skillButton}>
                <Text style={styles.skillButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </View>

      {/* Today's Habits */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          <TouchableOpacity style={styles.viewAll}>
            <Text style={styles.viewAllText}>See All</Text>
            <MaterialIcons name="chevron-right" size={18} color="#14B8A6" />
          </TouchableOpacity>
        </View>

        <View style={styles.habitCard}>
          {habits.map((habit, index) => (
            <View key={habit.title}>
              <View style={styles.habitItem}>
                <View style={[styles.habitLine, { backgroundColor: habit.color }]} />
                <MaterialIcons name={habit.icon} size={20} color={habit.color} style={{ marginRight: 8 }} />
                <View>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  <Text style={styles.habitTime}>{habit.time}</Text>
                </View>
                <TouchableOpacity style={styles.habitCheck}>
                  <MaterialIcons name="check" size={16} color="white" />
                </TouchableOpacity>
              </View>
              {index !== habits.length - 1 && (
                <View style={styles.habitDivider} />
              )}
            </View>
          ))}
        </View>
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

  // Active Skills
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

  // Habits
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
    backgroundColor: '#14B8A6',
    borderRadius: 999,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
}); 