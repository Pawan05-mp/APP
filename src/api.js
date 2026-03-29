import axios from 'axios';

// IMPORTANT: For Android Emulator to access local node server, use 10.0.2.2 
// For physical device, use your computer's local WiFi IP (e.g., 192.168.1.xxx)
// Fallback is standard localhost for web/iOS sim.
import { Platform } from 'react-native';

const getBaseUrl = () => {
  // ⚡ Local WiFi IP dynamically mapped to link Physical Expo Go app (Android & iOS) to the Local Windows Backend safely
  // 10.0.2.2 removed since you are using a Physical Android device from the PlayStore
  return 'https://app-repo-0j9c.onrender.com/api';
};

const API_URL = 'https://app-repo-0j9c.onrender.com/api'; // Standard Physical LAN Bridge

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
