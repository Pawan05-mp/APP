import axios from 'axios';

// IMPORTANT: For Android Emulator to access local node server, use 10.0.2.2 
// For physical device, use your computer's local WiFi IP (e.g., 192.168.1.xxx)
// Fallback is standard localhost for web/iOS sim.
import { Platform } from 'react-native';

const getBaseUrl = () => {
    // ⚡ Local WiFi IP dynamically mapped to link Physical Expo Go app (Android & iOS) to the Local Windows Backend safely
    // 10.0.2.2 removed since you are using a Physical Android device from the PlayStore
    return 'http://192.168.1.34:5000/api'; 
};

const API_URL = 'http://192.168.1.34:5000/api'; // Standard Physical LAN Bridge

export const getRecommendations = async (lat, lng, mood) => {
  try {
    const response = await axios.get(`${API_URL}/places/recommend`, {
      params: { lat, lng, mood }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching places:", error);
    throw error;
  }
};
