import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

/**
 * Creates a new skill plan for the authenticated user.
 * @param {string} skillName - The name of the skill to learn.
 * @param {string} token - The user's authentication JWT.
 * @returns {Promise<any>} The newly created plan object.
 */
export const createSkillPlan = async (skillName, token) => {
  const response = await axios.post(`${API_BASE_URL}/api/v1/plans/skills`, 
    { skill_name: skillName },
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

export const createHabitPlan = async (title, category, token) => {
  const response = await axios.post(`${API_BASE_URL}/api/v1/plans/habits`, 
    { title, category },
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

export const getAllPlans = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/plans/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const getSkillById = async (skillId, token) => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/plans/skills/${skillId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const deleteSkill = async (skillId, token) => {
  const response = await axios.delete(`${API_BASE_URL}/api/v1/plans/skills/${skillId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const deleteHabit = async (habitId, token) => {
  const response = await axios.delete(`${API_BASE_URL}/api/v1/plans/habits/${habitId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const markSkillDayComplete = async (skillId, dayNumber, token) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/v1/plans/skills/${skillId}/days/${dayNumber}/complete`, 
    {}, // No body needed for this request
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
}; 