import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated
} from 'react-native';
import { colors } from '../constants/colors';
import { CheckCircle, Circle, BookOpen, ExternalLink } from 'lucide-react-native';

const DayDetail = ({ day, isCompleted, onToggleComplete }) => {
  if (!day) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No day details available.</Text>
      </View>
    );
  }

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const estimatedTime = day.tasks.length * 15; 
  const title = `Day ${day.day}: Overview`;
  const description = day.tasks.join(' ');

  const handleResourcePress = (url) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  return (
    <Animated.ScrollView style={[styles.container, {opacity: fadeAnim}]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.estimatedTime}>{estimatedTime} min estimated</Text>
      </View>

      <Text style={styles.sectionTitle}>Tasks</Text>
      {day.tasks.map((task, index) => (
        <View key={index} style={styles.taskItem}>
          <Circle size={18} color={colors.primary} style={styles.taskIcon} />
          <Text style={styles.taskText}>{task}</Text>
        </View>
      ))}

      {day.resource && day.resource.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Resources</Text>
          {day.resource.map((resource, index) => (
            <TouchableOpacity key={index} style={styles.resourceItem} onPress={() => handleResourcePress(resource.startsWith('http') ? resource : `https://duckduckgo.com/?q=${encodeURIComponent(resource)}`)}>
              <BookOpen size={18} color={colors.primary} style={styles.resourceIcon} />
              <Text style={styles.resourceText} numberOfLines={1}>{resource}</Text>
              <ExternalLink size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </>
      )}
      
      <TouchableOpacity 
        style={[styles.completeButton, isCompleted && styles.completedButtonActive]} 
        onPress={onToggleComplete}
      >
        {isCompleted ? 
          <CheckCircle size={20} color={colors.white} /> : 
          <Circle size={20} color={colors.white} />
        }
        <Text style={styles.completeButtonText}>
          {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
        </Text>
      </TouchableOpacity>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50, 
  },
  contentContainer: {
    padding: 24,
  },
  headerContainer: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  estimatedTime: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  taskIcon: {
    marginRight: 12,
  },
  taskText: {
    fontSize: 16,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  resourceIcon: {
    marginRight: 12,
  },
  resourceText: {
    fontSize: 16,
    color: colors.primary,
    flex: 1,
    textDecorationLine: 'underline',
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  completedButtonActive: {
    backgroundColor: colors.primary, 
    shadowColor: colors.primary,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: colors.error,
  }
});

export default DayDetail; 