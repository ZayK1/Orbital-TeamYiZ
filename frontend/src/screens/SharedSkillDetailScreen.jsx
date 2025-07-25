import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { getSharedSkillDetail, likeSkill, downloadSkill } from '../api/social';
import CommentsSection from '../components/CommentsSection';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

const SharedSkillDetailScreen = ({ route, navigation }) => {
  const { skillId } = route?.params || {};
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [downloadsCount, setDownloadsCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview'); // overview, curriculum, comments
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (skillId) {
      fetchSkillDetail();
    } else {
      setLoading(false);
    }
  }, [skillId]);

  const fetchSkillDetail = async () => {
    if (!skillId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await getSharedSkillDetail(skillId);
      const skillData = response.skill;
      setSkill(skillData);
      setIsLiked(skillData.user_has_liked || false);
      setLikesCount(skillData.likes_count || 0);
      setDownloadsCount(skillData.downloads_count || 0);
      setIsUpvoted(skillData.user_has_upvoted || false);
      setIsDownvoted(skillData.user_has_downvoted || false);
      setIsSaved(skillData.user_has_saved || false);
      setUpvotes(skillData.upvotes || 0);
      setDownvotes(skillData.downvotes || 0);
      setSaveCount(skillData.save_count || 0);
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

  const handleUpvote = async () => {
    try {
      if (isUpvoted) {
        setIsUpvoted(false);
        setUpvotes(prev => prev - 1);
      } else {
        setIsUpvoted(true);
        setUpvotes(prev => prev + 1);
        if (isDownvoted) {
          setIsDownvoted(false);
          setDownvotes(prev => prev - 1);
        }
      }
      // TODO: Call API to update upvote
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleDownvote = async () => {
    try {
      if (isDownvoted) {
        setIsDownvoted(false);
        setDownvotes(prev => prev - 1);
      } else {
        setIsDownvoted(true);
        setDownvotes(prev => prev + 1);
        if (isUpvoted) {
          setIsUpvoted(false);
          setUpvotes(prev => prev - 1);
        }
      }
      // TODO: Call API to update downvote
    } catch (error) {
      console.error('Error downvoting:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaved(!isSaved);
      setSaveCount(prev => isSaved ? prev - 1 : prev + 1);
      // TODO: Call API to update save
    } catch (error) {
      console.error('Error saving:', error);
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

  const getGradientColors = (category) => {
    const categoryKey = category?.toLowerCase() || 'default';
    return colors.gradients?.[categoryKey] || colors.gradients?.default || ['#667eea', '#764ba2'];
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
      
      <Text style={styles.dayItemTitle}>{item.title}</Text>
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

  if (!skillId) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={48} color={colors.error} />
        <Text style={styles.errorText}>Invalid skill link</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Floating Header */}
      <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
        <View style={styles.floatingHeaderContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              console.log('Floating back button pressed');
              navigation.goBack();
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.floatingTitle} numberOfLines={1}>{skill?.title}</Text>
          <TouchableOpacity style={styles.shareButton}>
            <MaterialIcons name="share" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={getGradientColors(skill?.category)}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroOverlay} />
          
          {/* Navigation Controls */}
          <View style={styles.heroNavigation}>
            <TouchableOpacity 
              style={styles.heroBackButton} 
              onPress={() => {
                console.log('Back button pressed');
                navigation.goBack();
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.heroActionButton} onPress={handleSave}>
                <MaterialIcons 
                  name={isSaved ? "bookmark" : "bookmark-border"} 
                  size={24} 
                  color={isSaved ? (colors.reddit?.save || '#FFD700') : colors.white} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroActionButton}>
                <MaterialIcons name="share" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <View style={styles.skillBadges}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.glass?.background || 'rgba(255, 255, 255, 0.25)' }]}>
                <Text style={styles.categoryText}>{skill?.category}</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(skill?.difficulty) }]}>
                <Text style={styles.difficultyText}>{skill?.difficulty}</Text>
              </View>
            </View>
            
            <Text style={styles.heroTitle}>{skill?.title}</Text>
            
            {/* Author Card */}
            <View style={styles.authorCard}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>
                  {skill?.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{skill?.author?.username || 'Anonymous'}</Text>
                <View style={styles.postMeta}>
                  <Text style={styles.postTime}>2 hours ago</Text>
                  <Text style={styles.postSeparator}>•</Text>
                  <Text style={styles.viewCount}>{formatCount(skill?.views_count)} views</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Voting and Actions Bar */}
        <View style={styles.votingBar}>
          <View style={styles.votingSection}>
            <TouchableOpacity 
              style={[styles.voteButton, isUpvoted && styles.upvotedButton]}
              onPress={handleUpvote}
            >
              <MaterialIcons 
                name="keyboard-arrow-up" 
                size={28} 
                color={isUpvoted ? (colors.reddit?.upvote || '#FF4500') : colors.textSecondary} 
              />
            </TouchableOpacity>
            <Text style={[styles.voteCount, isUpvoted && { color: colors.reddit?.upvote || '#FF4500' }]}>
              {formatCount(upvotes - downvotes)}
            </Text>
            <TouchableOpacity 
              style={[styles.voteButton, isDownvoted && styles.downvotedButton]}
              onPress={handleDownvote}
            >
              <MaterialIcons 
                name="keyboard-arrow-down" 
                size={28} 
                color={isDownvoted ? (colors.reddit?.downvote || '#7193FF') : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.engagementActions}>
            <TouchableOpacity style={styles.engagementButton} onPress={handleLike}>
              <MaterialIcons 
                name={isLiked ? "favorite" : "favorite-border"} 
                size={22} 
                color={isLiked ? colors.like : colors.textSecondary} 
              />
              <Text style={styles.engagementText}>{formatCount(likesCount)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.engagementButton}>
              <MaterialIcons name="comment" size={22} color={colors.textSecondary} />
              <Text style={styles.engagementText}>{formatCount(skill?.comments_count || 0)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.engagementButton} onPress={handleDownload}>
              <MaterialIcons name="download" size={22} color={colors.textSecondary} />
              <Text style={styles.engagementText}>{formatCount(downloadsCount)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Skill Description */}
          <View style={styles.contentCard}>
            <Text style={styles.contentTitle}>About This Skill</Text>
            <Text style={styles.skillDescription}>
              {skill?.skill_description || skill?.description}
            </Text>
            
            {/* Personal Message */}
            {skill?.personal_message && (
              <View style={styles.personalMessage}>
                <View style={styles.messageHeader}>
                  <MaterialIcons name="format-quote" size={20} color={colors.primary} />
                  <Text style={styles.messageLabel}>Creator's Note</Text>
                </View>
                <Text style={styles.messageText}>{skill?.personal_message}</Text>
              </View>
            )}
            
            {/* Tags */}
            {skill?.tags && skill.tags.length > 0 && (
              <View style={styles.tagsSection}>
                {skill.tags.map((tag, index) => (
                  <TouchableOpacity key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabNavigation}>
            {[
              { key: 'overview', label: 'Overview', icon: 'info' },
              { key: 'curriculum', label: 'Curriculum', icon: 'list' },
              { key: 'comments', label: 'Comments', icon: 'comment' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]}
                onPress={() => setActiveTab(tab.key)}
              >
                <MaterialIcons 
                  name={tab.icon} 
                  size={20} 
                  color={activeTab === tab.key ? colors.primary : colors.textSecondary} 
                />
                <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <View style={styles.overviewSection}>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialIcons name="schedule" size={24} color={colors.primary} />
                  <Text style={styles.statValue}>{skill?.estimated_duration || 30}</Text>
                  <Text style={styles.statLabel}>Days</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialIcons name="trending-up" size={24} color={colors.success} />
                  <Text style={styles.statValue}>{skill?.difficulty || 'Beginner'}</Text>
                  <Text style={styles.statLabel}>Level</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialIcons name="people" size={24} color={colors.warning} />
                  <Text style={styles.statValue}>{formatCount(downloadsCount)}</Text>
                  <Text style={styles.statLabel}>Learners</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'curriculum' && (
            <View style={styles.curriculumSection}>
              <FlatList
                data={skill?.curriculum || []}
                renderItem={renderCurriculumDay}
                keyExtractor={(item, index) => `day-${index}`}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
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
        </View>
      </Animated.ScrollView>

      {/* Sticky Action Bar */}
      <View style={styles.stickyActionBar}>
        <TouchableOpacity 
          style={[styles.actionBarButton, styles.saveActionButton]}
          onPress={handleSave}
        >
          <MaterialIcons 
            name={isSaved ? "bookmark" : "bookmark-border"} 
            size={20} 
            color={isSaved ? (colors.reddit?.save || '#FFD700') : colors.white} 
          />
          <Text style={styles.actionBarText}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBarButton, styles.downloadActionButton]}
          onPress={handleDownload}
        >
          <MaterialIcons name="download" size={20} color={colors.white} />
          <Text style={styles.actionBarText}>Add to Repository</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBarButton, styles.commentActionButton]}
          onPress={() => setActiveTab('comments')}
        >
          <MaterialIcons name="comment" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  
  // Floating Header
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: colors.backgroundOverlay,
    zIndex: 1000,
    paddingTop: StatusBar.currentHeight || 44,
  },
  floatingHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  floatingTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  
  // Hero Section
  heroSection: {
    height: HEADER_HEIGHT,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  heroNavigation: {
    position: 'absolute',
    top: StatusBar.currentHeight || 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heroBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass?.background || 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass?.border || 'rgba(255, 255, 255, 0.18)',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },
  heroActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass?.background || 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass?.border || 'rgba(255, 255, 255, 0.18)',
  },
  heroContent: {
    padding: 24,
    paddingBottom: 32,
  },
  skillBadges: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glass?.border || 'rgba(255, 255, 255, 0.18)',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 36,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass?.background || 'rgba(255, 255, 255, 0.25)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glass?.border || 'rgba(255, 255, 255, 0.18)',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorAvatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTime: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
  postSeparator: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.6,
    marginHorizontal: 6,
  },
  viewCount: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
  
  // Voting Bar
  votingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  votingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    padding: 8,
    borderRadius: 12,
  },
  upvotedButton: {
    backgroundColor: (colors.reddit?.upvote || '#FF4500') + '15',
  },
  downvotedButton: {
    backgroundColor: (colors.reddit?.downvote || '#7193FF') + '15',
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 8,
    minWidth: 40,
    textAlign: 'center',
  },
  engagementActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  engagementText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  
  // Content Section
  contentSection: {
    backgroundColor: colors.white,
  },
  contentCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  skillDescription: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  personalMessage: {
    backgroundColor: colors.primaryUltraLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 8,
  },
  messageText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  
  // Tab Navigation
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  
  // Overview Section
  overviewSection: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Curriculum Section
  curriculumSection: {
    padding: 20,
    gap: 16,
  },
  
  // Comments Section
  commentsSection: {
    flex: 1,
  },
  
  // Sticky Action Bar
  stickyActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  actionBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginHorizontal: 4,
  },
  saveActionButton: {
    backgroundColor: colors.reddit?.save || '#FFD700',
    flex: 1,
  },
  downloadActionButton: {
    backgroundColor: colors.primary,
    flex: 2,
  },
  commentActionButton: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 8,
  },
  
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
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
    backgroundColor: colors.white,
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
    borderRadius: 24,
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
  
  // Day Card for Curriculum
  dayCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  dayDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  dayTime: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '600',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
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
  dayItemTitle: {
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