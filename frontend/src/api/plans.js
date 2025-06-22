import api from './apiConfig';

/**
 * Creates a new skill plan for the authenticated user.
 * @param {string} title - The title of the skill to learn.
 * @param {string} token - The user's authentication JWT.
 * @returns {Promise<any>} The newly created plan object.
 */
export const createSkillPlan = async (title, token) => {
  try {
    const response = await api.post('/api/v1/plans/skills', 
      { title },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating skill plan:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Skill plan creation failed');
  }
}; 