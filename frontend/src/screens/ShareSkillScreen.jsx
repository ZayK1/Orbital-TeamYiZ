import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { getSkillsForSharing, shareSkillToSocial } from '../api/social';

const ShareSkillScreen = ({ navigation }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharingSkill, setSharingSkill] = useState(null);

  useEffect(() => {
    loadSkillsForSharing();
  }, []);

  const loadSkillsForSharing = async () => {
    try {
      setLoading(true);
      const data = await getSkillsForSharing();
      setSkills(data.skills || []);
    } catch (error) {
      console.error('Error loading skills for sharing:', error);
      Alert.alert('Error', 'Failed to load your skills');
    } finally {
      setLoading(false);
    }
  };

  const handleShareSkill = async (skill) => {
    if (sharingSkill === skill._id) return;

    try {
      setSharingSkill(skill._id);
      const result = await shareSkillToSocial(skill);
      
      if (result.success) {
        Alert.alert('Success', 'Skill shared to social feed!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error sharing skill:', error);
      Alert.alert('Error', 'Failed to share skill');
    } finally {
      setSharingSkill(null);
    }
  };

  const renderSkillItem = ({ item }) => (
    <View style={styles.skillCard}>
      <View style={styles.skillContent}>
        <Text style={styles.skillTitle}>{item.title}</Text>
        <Text style={styles.skillDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.skillMeta}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={[
            styles.difficultyPill,
            { backgroundColor: getDifficultyColor(item.difficulty) }
          ]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
          <View style={styles.durationInfo}>
            <MaterialIcons name="schedule" size={14} color={colors.textTertiary} />
            <Text style={styles.durationText}>{item.estimated_duration || 30} days</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.shareButton,
          sharingSkill === item._id && styles.sharingButton
        ]}
        onPress={() => handleShareSkill(item)}
        disabled={sharingSkill === item._id}
      >
        {sharingSkill === item._id ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <MaterialIcons name="share" size={18} color={colors.white} />
            <Text style={styles.shareButtonText}>Share</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return colors.success;
      case 'intermediate': return colors.warning;
      case 'advanced': return colors.error;
      default: return colors.primary;
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="psychology" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyStateTitle}>No Skills to Share</Text>
      <Text style={styles.emptyStateText}>
        Create some skills in your repository first, then come back to share them with the community!
      </Text>
      <TouchableOpacity 
        style={styles.createSkillButton}
        onPress={() => navigation.navigate('RepositoryStack', { screen: 'AddSkill' })}
      >
        <MaterialIcons name="add" size={20} color={colors.white} />
        <Text style={styles.createSkillButtonText}>Create a Skill</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your skills...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share a Skill</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Skills List */}
      <FlatList
        data={skills}
        renderItem={renderSkillItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.skillsList,
          skills.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0 + 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  skillsList: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  skillCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  skillContent: {
    flex: 1,
    marginBottom: 12,
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  skillDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  skillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryPill: {
    backgroundColor: colors.primaryUltraLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  difficultyPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'capitalize',
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  sharingButton: {
    opacity: 0.7,
  },
  shareButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createSkillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createSkillButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default ShareSkillScreen;