import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { getSharedSkillDetail, likeSkill, downloadSkill } from '../api/social';
import CommentsSection from '../components/CommentsSection';

const SharedSkillDetailScreen = ({ route, navigation }) => {
  const { skillId } = route.params;
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [downloadsCount, setDownloadsCount] = useState(0);
  const [activeTab, setActiveTab] = useState('curriculum'); // curriculum, custom-tasks, comments

  useEffect(() => {
    fetchSkillDetail();
  }, [skillId]);

  const fetchSkillDetail = async () => {
    try {
      setLoading(true);
      const response = await getSharedSkillDetail(skillId);
      const skillData = response.skill;
      setSkill(skillData);
      setIsLiked(skillData.user_has_liked || false);
      setLikesCount(skillData.likes_count || 0);
      setDownloadsCount(skillData.downloads_count || 0);
    } catch (error) {
      console.error('Error fetching skill detail:', error);
      Alert.alert('Error', 'Failed to load skill details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
      
      await likeSkill(skillId);
    } catch (error) {
      // Revert optimistic update
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleDownload = async () => {
    try {
      await downloadSkill(skillId);
      setDownloadsCount(prev => prev + 1);
      Alert.alert('Success', 'Skill added to your repository!');
    } catch (error) {
      Alert.alert('Error', 'Failed to download skill');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return colors.success;
      case 'intermediate':
        return colors.warning;
      case 'advanced':
        return colors.error;
      default:
        return colors.gray500;
    }
  };

  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count?.toString() || '0';
  };

  const renderCurriculumDay = ({ item, index }) => (
    <View style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <View style={styles.dayBadge}>
          <Text style={styles.dayBadgeText}>Day {index + 1}</Text>
        </View>
        {item.estimated_time && (
          <View style={styles.timeEstimate}>
            <MaterialIcons name="schedule" size={14} color={colors.gray600} />
            <Text style={styles.timeText}>{item.estimated_time} min</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.dayTitle}>{item.title}</Text>
      <Text style={styles.dayDescription}>{item.description}</Text>
      
      {item.resources && item.resources.length > 0 && (
        <View style={styles.resourcesSection}>
          <Text style={styles.resourcesTitle}>Resources:</Text>
          {item.resources.map((resource, idx) => (
            <TouchableOpacity key={idx} style={styles.resourceItem}>
              <MaterialIcons name="link" size={16} color={colors.primary} />
              <Text style={styles.resourceText} numberOfLines={1}>
                {resource.title || resource.url || resource}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderTabButton = (tab, label, icon) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <MaterialIcons 
        name={icon} 
        size={18} 
        color={activeTab === tab ? colors.white : colors.gray600} 
      />
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading skill details...</Text>
      </View>
    );
  }

  if (!skill) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={48} color={colors.error} />
        <Text style={styles.errorText}>Skill not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backIcon} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.gray700} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.shareIcon}>
            <MaterialIcons name="share" size={24} color={colors.gray700} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Skill Info */}
        <View style={styles.skillInfo}>
          <Text style={styles.skillTitle}>{skill.title}</Text>
          <Text style={styles.skillDescription}>{skill.description}</Text>
          
          <View style={styles.skillMeta}>
            <View style={styles.authorSection}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>
                  {skill.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{skill.author?.username || 'Anonymous'}</Text>
                <Text style={styles.authorLabel}>Skill Creator</Text>
              </View>
            </View>
            
            <View style={styles.skillStats}>
              <View style={styles.statItem}>
                <MaterialIcons name="visibility" size={16} color={colors.gray600} />
                <Text style={styles.statText}>{formatCount(skill.views_count)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.skillDetails}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(skill.difficulty) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(skill.difficulty) }]}>
                {skill.difficulty || 'Beginner'}
              </Text>
            </View>
            
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{skill.category || 'General'}</Text>
            </View>
          </View>

          {skill.tags && skill.tags.length > 0 && (
            <View style={styles.tagsSection}>
              {skill.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton, isLiked && styles.likedButton]}
            onPress={handleLike}
          >
            <MaterialIcons 
              name={isLiked ? "favorite" : "favorite-border"} 
              size={20} 
              color={isLiked ? colors.white : colors.error} 
            />
            <Text style={[styles.actionButtonText, isLiked && styles.likedButtonText]}>
              {formatCount(likesCount)} Likes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={handleDownload}
          >
            <MaterialIcons name="download" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>
              Add to Repository ({formatCount(downloadsCount)})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          {renderTabButton('curriculum', 'Curriculum', 'list')}
          {skill.has_custom_tasks && renderTabButton('custom-tasks', 'Custom Tasks', 'extension')}
          {renderTabButton('comments', 'Comments', 'comment')}
        </View>

        {/* Tab Content */}
        {activeTab === 'curriculum' && (
          <View style={styles.curriculumSection}>
            <Text style={styles.sectionTitle}>30-Day Learning Plan</Text>
            <FlatList
              data={skill.curriculum || []}
              renderItem={renderCurriculumDay}
              keyExtractor={(item, index) => `day-${index}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {activeTab === 'custom-tasks' && skill.has_custom_tasks && (
          <View style={styles.customTasksSection}>
            <Text style={styles.sectionTitle}>Community Custom Tasks</Text>
            <Text style={styles.comingSoonText}>
              Custom tasks feature coming soon! Community members will be able to add
              alternative tasks for each day.
            </Text>
          </View>
        )}

        {activeTab === 'comments' && (
          <View style={styles.commentsSection}>
            <CommentsSection 
              skillId={skillId}
              onUserPress={(user) => navigation.navigate('UserProfile', { userId: user._id })}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  backIcon: {
    padding: 12,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  shareIcon: {
    padding: 12,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: 16,
  },
  content: {
    flex: 1,
  },
  skillInfo: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 24,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  skillTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  skillDescription: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: 24,
  },
  skillMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  authorAvatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  authorLabel: {
    fontSize: 13,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  skillStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTertiary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 6,
  },
  skillDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 16,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryBadge: {
    backgroundColor: colors.primaryUltraLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    backgroundColor: colors.surfaceTertiary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    marginHorizontal: 6,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  likeButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.error,
  },
  likedButton: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  downloadButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.error,
    marginLeft: 8,
  },
  likedButtonText: {
    color: colors.white,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    backgroundColor: colors.white,
    marginHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceTertiary,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  activeTabButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  curriculumSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  customTasksSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  commentsSection: {
    flex: 1,
    minHeight: 400,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  dayCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayBadgeText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  dayDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  resourcesSection: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resourcesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.primaryUltraLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  resourceText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
  },
  comingSoonText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 32,
    backgroundColor: colors.white,
    borderRadius: 20,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.error,
    marginTop: 20,
    marginBottom: 32,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SharedSkillDetailScreen;