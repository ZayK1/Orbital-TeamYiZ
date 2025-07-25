// Clean social media API - only essential functionality
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCurrentUser,
  getSharedSkills,
  saveSharedSkills,
  getUserDownloads,
  saveUserDownload,
  getSocialInteractions,
  saveSocialInteractions,
  generateId
} from './socialData';
import { getAllPlans, createSkillPlan } from './plans';

// Share a skill from user's repository to social feed
export const shareSkillToSocial = async (skillData) => {
  try {
    const currentUser = await getCurrentUser();
    const sharedSkills = await getSharedSkills();
    
    const sharedSkill = {
      _id: generateId(),
      original_skill_id: skillData._id,
      title: skillData.title,
      description: skillData.description,
      category: skillData.category,
      difficulty: skillData.difficulty,
      tags: skillData.tags || [],
      curriculum: skillData.curriculum || [],
      estimated_duration: skillData.estimated_duration || 30,
      
      // Social metadata
      shared_by: currentUser._id,
      shared_by_username: currentUser.username,
      shared_by_display_name: currentUser.display_name || currentUser.username,
      author: currentUser,
      
      // Engagement metrics
      likes_count: 0,
      downloads_count: 0,
      comments_count: 0,
      views_count: 0,
      
      // Timestamps
      created_at: new Date().toISOString(),
      shared_at: new Date().toISOString(),
      
      // User interaction flags
      user_has_liked: false,
      user_has_downloaded: false,
      
      visibility: 'public'
    };
    
    // Add to beginning of shared skills array
    sharedSkills.unshift(sharedSkill);
    await saveSharedSkills(sharedSkills);
    
    return {
      success: true,
      skill: sharedSkill,
      message: 'Skill shared successfully!'
    };
  } catch (error) {
    console.error('Error sharing skill:', error);
    throw error;
  }
};

// Get social feed (all shared skills)
export const getSocialFeed = async (page = 1, limit = 20) => {
  try {
    const sharedSkills = await getSharedSkills();
    const currentUser = await getCurrentUser();
    const interactions = await getSocialInteractions();
    
    // Sort by newest first
    const sortedSkills = sharedSkills
      .sort((a, b) => new Date(b.shared_at) - new Date(a.shared_at));
    
    // Add user interaction flags
    const skillsWithInteractions = sortedSkills.map(skill => {
      const likeKey = `${currentUser._id}_${skill._id}`;
      const downloadKey = `${currentUser._id}_${skill._id}`;
      
      return {
        ...skill,
        user_has_liked: !!interactions.likes[likeKey],
        user_has_downloaded: !!interactions.downloads[downloadKey]
      };
    });
    
    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedSkills = skillsWithInteractions.slice(startIndex, startIndex + limit);
    
    return {
      activities: paginatedSkills.map(skill => ({ skill })),
      skills: paginatedSkills,
      total_count: sharedSkills.length,
      page: page,
      has_more: startIndex + limit < sharedSkills.length,
      message: 'Social feed loaded successfully'
    };
  } catch (error) {
    console.error('Error getting social feed:', error);
    return {
      activities: [],
      skills: [],
      total_count: 0,
      page: 1,
      has_more: false,
      message: 'Unable to load social feed'
    };
  }
};

// Download a skill from social feed to user's repository
export const downloadSkillFromSocial = async (sharedSkillId) => {
  try {
    const currentUser = await getCurrentUser();
    const sharedSkills = await getSharedSkills();
    const interactions = await getSocialInteractions();
    
    // Find the shared skill
    const sharedSkill = sharedSkills.find(skill => skill._id === sharedSkillId);
    if (!sharedSkill) {
      throw new Error('Shared skill not found');
    }
    
    // Create skill for user's repository
    const downloadedSkill = {
      _id: generateId(),
      title: sharedSkill.title,
      description: sharedSkill.description,
      category: sharedSkill.category,
      difficulty: sharedSkill.difficulty,
      tags: sharedSkill.tags,
      curriculum: sharedSkill.curriculum,
      estimated_duration: sharedSkill.estimated_duration,
      
      // Mark as downloaded
      downloaded_from_social: true,
      original_shared_skill_id: sharedSkillId,
      downloaded_from_user: sharedSkill.shared_by_username,
      
      // User's copy metadata
      user_id: currentUser._id,
      created_at: new Date().toISOString(),
      downloaded_at: new Date().toISOString(),
      
      // Progress tracking
      progress: 0,
      is_completed: false,
      current_day: 1,
      
      // User can customize their copy
      is_customizable: true
    };
    
    // Save to user's actual repository via plans API
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      try {
        // Create the skill in the user's actual repository using the plans API
        await createSkillPlan(downloadedSkill.title, downloadedSkill.difficulty, token);
        console.log('Skill successfully added to user repository via API');
      } catch (apiError) {
        console.error('Failed to add to repository via API, falling back to local storage:', apiError);
        // Fallback: Add to local storage
        const userSkills = await getUserSkills();
        userSkills.unshift(downloadedSkill);
        await saveUserSkills(userSkills);
      }
    } else {
      // No token, save locally
      const userSkills = await getUserSkills();
      userSkills.unshift(downloadedSkill);
      await saveUserSkills(userSkills);
    }
    
    // Update download count on shared skill
    const skillIndex = sharedSkills.findIndex(skill => skill._id === sharedSkillId);
    if (skillIndex !== -1) {
      sharedSkills[skillIndex].downloads_count += 1;
      await saveSharedSkills(sharedSkills);
    }
    
    // Track user download
    await saveUserDownload(currentUser._id, sharedSkillId);
    
    // Update interactions
    const downloadKey = `${currentUser._id}_${sharedSkillId}`;
    interactions.downloads[downloadKey] = true;
    await saveSocialInteractions(interactions);
    
    return {
      success: true,
      skill: downloadedSkill,
      message: 'Skill downloaded to your repository!'
    };
  } catch (error) {
    console.error('Error downloading skill:', error);
    throw error;
  }
};

// Like a shared skill
export const likeSharedSkill = async (sharedSkillId) => {
  try {
    const currentUser = await getCurrentUser();
    const sharedSkills = await getSharedSkills();
    const interactions = await getSocialInteractions();
    
    const likeKey = `${currentUser._id}_${sharedSkillId}`;
    const hasLiked = !!interactions.likes[likeKey];
    
    // Find and update skill
    const skillIndex = sharedSkills.findIndex(skill => skill._id === sharedSkillId);
    if (skillIndex === -1) {
      throw new Error('Skill not found');
    }
    
    if (hasLiked) {
      // Unlike
      delete interactions.likes[likeKey];
      sharedSkills[skillIndex].likes_count -= 1;
    } else {
      // Like
      interactions.likes[likeKey] = true;
      sharedSkills[skillIndex].likes_count += 1;
    }
    
    await saveSharedSkills(sharedSkills);
    await saveSocialInteractions(interactions);
    
    return {
      success: true,
      liked: !hasLiked,
      likes_count: sharedSkills[skillIndex].likes_count,
      message: hasLiked ? 'Skill unliked' : 'Skill liked!'
    };
  } catch (error) {
    console.error('Error liking skill:', error);
    throw error;
  }
};

// Get user's skills repository from the real API
export const getUserSkills = async (userId = null) => {
  try {
    // Get auth token
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      console.log('No auth token found');
      return [];
    }

    console.log('Fetching user skills from plans API...');
    
    // Get user's actual plans from the API
    const response = await getAllPlans(token);
    console.log('getAllPlans response:', response);
    
    // Get skills directly from the response (matching RepositoryScreen pattern)
    const skills = response.skills || [];
    console.log('User skills from API:', skills);
    
    // Transform plans to skill format for social sharing
    const transformedSkills = skills.map(plan => ({
      _id: plan._id,
      title: plan.title || plan.skill_name || 'Untitled Skill',
      description: plan.description || `Learn ${plan.title || plan.skill_name}`,
      category: plan.category || 'General',
      difficulty: plan.difficulty || 'beginner',
      tags: plan.tags || [],
      curriculum: plan.curriculum || [],
      estimated_duration: plan.estimated_duration || 30,
      created_at: plan.created_at,
      user_id: userId,
      // Additional metadata from the API
      progress: plan.progress || 0,
      is_completed: plan.is_completed || false,
      current_day: plan.current_day || 1,
      image_url: plan.image_url
    }));
    
    console.log('Transformed skills for sharing:', transformedSkills);
    return transformedSkills;
  } catch (error) {
    console.error('Error getting user skills:', error);
    // Fallback to local storage if API fails
    try {
      const targetUserId = userId || (await getCurrentUser())._id;
      const data = await AsyncStorage.getItem(`user_skills_${targetUserId}`);
      return data ? JSON.parse(data) : [];
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return [];
    }
  }
};

// Save user's skills repository (for downloaded skills)
export const saveUserSkills = async (skills, userId = null) => {
  try {
    const targetUserId = userId || (await getCurrentUser())._id;
    // For downloaded skills, we store them locally
    // The original user-created skills come from the API
    await AsyncStorage.setItem(`user_skills_${targetUserId}`, JSON.stringify(skills));
  } catch (error) {
    console.error('Error saving user skills:', error);
  }
};

// Get user's shared skills (what they've posted to social)
export const getMySharedSkills = async () => {
  try {
    const currentUser = await getCurrentUser();
    const sharedSkills = await getSharedSkills();
    
    return {
      skills: sharedSkills.filter(skill => skill.shared_by === currentUser._id)
    };
  } catch (error) {
    console.error('Error getting my shared skills:', error);
    return { skills: [] };
  }
};

// Get skills available for sharing (from user's repository)
export const getSkillsForSharing = async () => {
  try {
    const userSkills = await getUserSkills();
    
    // Filter out skills that are already shared
    const mySharedSkills = await getMySharedSkills();
    const sharedSkillIds = mySharedSkills.skills.map(skill => skill.original_skill_id);
    
    const availableSkills = userSkills.filter(skill => 
      !sharedSkillIds.includes(skill._id)
    );
    
    return {
      skills: availableSkills,
      total_count: availableSkills.length
    };
  } catch (error) {
    console.error('Error getting skills for sharing:', error);
    return { skills: [], total_count: 0 };
  }
};

// Search skills in social feed
export const searchSkills = async (params = {}) => {
  try {
    const sharedSkills = await getSharedSkills();
    const { category, difficulty, search } = params;
    
    let filteredSkills = sharedSkills;
    
    if (category) {
      filteredSkills = filteredSkills.filter(skill => 
        skill.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (difficulty) {
      filteredSkills = filteredSkills.filter(skill => 
        skill.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }
    
    if (search) {
      filteredSkills = filteredSkills.filter(skill => 
        skill.title.toLowerCase().includes(search.toLowerCase()) ||
        skill.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return {
      skills: filteredSkills,
      total_count: filteredSkills.length,
      message: 'Search completed'
    };
  } catch (error) {
    console.error('Error searching skills:', error);
    return {
      skills: [],
      total_count: 0,
      message: 'Search failed'
    };
  }
};

// Get trending skills (most downloaded)
export const getTrendingSkills = async (limit = 10) => {
  try {
    const sharedSkills = await getSharedSkills();
    
    const trending = sharedSkills
      .sort((a, b) => (b.downloads_count + b.likes_count) - (a.downloads_count + a.likes_count))
      .slice(0, limit);
    
    return {
      skills: trending,
      message: 'Trending skills loaded'
    };
  } catch (error) {
    console.error('Error getting trending skills:', error);
    return {
      skills: [],
      message: 'Unable to load trending skills'
    };
  }
};

// Get discover feed (popular skills)
export const getDiscoverFeed = async (page = 1, limit = 10) => {
  try {
    const sharedSkills = await getSharedSkills();
    
    // Sort by engagement (downloads + likes)
    const discoverSkills = sharedSkills
      .sort((a, b) => (b.downloads_count + b.likes_count) - (a.downloads_count + a.likes_count))
      .slice((page - 1) * limit, page * limit);
    
    return {
      activities: discoverSkills,
      skills: discoverSkills,
      total_count: sharedSkills.length,
      page,
      message: 'Discover feed loaded'
    };
  } catch (error) {
    console.error('Error loading discover feed:', error);
    return {
      activities: [],
      skills: [],
      total_count: 0,
      page: 1,
      message: 'Unable to load discover feed'
    };
  }
};

// Clear all social data (for testing)
export const clearAllSocialData = async () => {
  try {
    const currentUser = await getCurrentUser();
    await AsyncStorage.multiRemove([
      'shared_skills',
      'social_interactions', 
      'user_downloads',
      `user_skills_${currentUser._id}`
    ]);
    return { message: 'All social data cleared' };
  } catch (error) {
    console.error('Error clearing social data:', error);
    throw error;
  }
};