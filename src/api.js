import axios from 'axios';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  return 'https://app-repo-0j9c.onrender.com/api';
};

const API_URL = 'https://app-repo-0j9c.onrender.com/api';

export const getRecommendations = async (lat, lng, mood, userId) => {
  try {
    const response = await axios.get(`${API_URL}/places/recommend`, {
      params: { lat, lng, mood, user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching places:", error);
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/places/stats`, {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { saved: 0, visits: 0, vibes: 0 };
  }
};

export const interactWithPlace = async (userId, placeId, action, mood = null) => {
  try {
    await axios.post(`${API_URL}/places/interact`, {
      user_id: userId,
      place_id: placeId,
      action,
      mood
    });
  } catch (error) {
    console.error("Error logging interaction:", error);
  }
};
export const getInstantPick = async (lat, lng, mood, userId, excludeIds = []) => {
  try {
    const response = await axios.get(`${API_URL}/places/instant`, {
      params: {
        lat, lng, mood,
        user_id: userId,
        exclude: excludeIds.join(',')
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching instant picks:", error);
    throw error;
  }
};

export const getInstantReplacement = async (lat, lng, mood, userId, currentIds = []) => {
  try {
    const response = await axios.get(`${API_URL}/places/instant`, {
      params: {
        lat, lng, mood,
        user_id: userId,
        exclude: currentIds.join(',')
      }
    });
    // Return just the first result as the replacement
    return response.data?.[0] || null;
  } catch (error) {
    console.error("Error fetching replacement:", error);
    return null;
  }
};

export const getSavedPlaces = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/places/saved`, {
      params: { user_id: userId }
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching saved places:", error);
    return [];
  }
};

export const getPreferences = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/places/preferences`, {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return { taste: 'Street food, Cafes', budget: 'Low - Medium' };
  }
};

export const updatePreferences = async (userId, taste, budget) => {
  try {
    const response = await axios.patch(`${API_URL}/places/preferences`, {
      user_id: userId,
      taste,
      budget
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return null;
  }
};
