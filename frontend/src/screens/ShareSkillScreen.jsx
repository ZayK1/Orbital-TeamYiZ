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
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { getSkillsForSharing, shareSkillToSocial } from '../api/social';

const ShareSkillScreen = ({ navigation }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharingSkill, setSharingSkill] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [editedDescription, setEditedDescription] = useState('');

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

  const handleShareSkill = (skill) => {
    setSelectedSkill(skill);
    setEditedDescription(skill.description || `Learn ${skill.title}`);
    setEditModalVisible(true);
  };

  const confirmShareSkill = async () => {
    if (!selectedSkill || sharingSkill === selectedSkill._id) return;

    try {
      setSharingSkill(selectedSkill._id);
      
      // Create updated skill with edited description
      const updatedSkill = {
        ...selectedSkill,
        description: editedDescription.trim() || selectedSkill.description
      };
      
      const result = await shareSkillToSocial(updatedSkill);
      
      if (result.success) {
        setEditModalVisible(false);
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

      {/* Edit Description Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setEditModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Customize Your Post</Text>
            <TouchableOpacity 
              style={styles.modalShareButton}
              onPress={confirmShareSkill}
              disabled={sharingSkill === selectedSkill?._id}
            >
              {sharingSkill === selectedSkill?._id ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.modalShareButtonText}>Share</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.skillPreview}>
              <Text style={styles.skillPreviewTitle}>{selectedSkill?.title}</Text>
              <View style={styles.skillPreviewMeta}>
                <Text style={styles.skillPreviewCategory}>{selectedSkill?.category}</Text>
                <Text style={styles.skillPreviewDifficulty}>{selectedSkill?.difficulty}</Text>
              </View>
            </View>

            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.descriptionHint}>
                Tell the community what makes this skill special and what they'll learn
              </Text>
              <TextInput
                style={styles.descriptionInput}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Describe what this skill teaches..."
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {editedDescription.length}/500
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalShareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  modalShareButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  skillPreview: {
    backgroundColor: colors.primaryUltraLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  skillPreviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  skillPreviewMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  skillPreviewCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillPreviewDifficulty: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: 'capitalize',
  },
  descriptionSection: {
    flex: 1,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  descriptionHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  descriptionInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: 8,
  },
});

export default ShareSkillScreen;