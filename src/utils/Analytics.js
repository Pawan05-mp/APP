import { interactWithPlace } from '../api';

/**
 * Production-grade Analytics Wrapper
 * Focuses on product truth: CTR, Save Rate, Conversion
 */
const Analytics = {
  logEvent: async (userId, eventName, params = {}) => {
    console.log(`[Analytics] ${eventName}`, params);
    
    // In production, this would send to Segment/Mixpanel/Amplitude
    // For now, we leverage our existing interaction logger for behavioral metrics
    if (eventName === 'place_save') {
      await interactWithPlace(userId, params.placeId, 'save', params.mood);
    } else if (eventName === 'place_go') {
      await interactWithPlace(userId, params.placeId, 'go', params.mood);
    } else if (eventName === 'place_skip') {
      await interactWithPlace(userId, params.placeId, 'skip', params.mood);
    }
  },

  trackSession: (userId) => {
    // Track session start
    console.log(`[Analytics] Session Start for ${userId}`);
  }
};

export default Analytics;
