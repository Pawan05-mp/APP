import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REVIEW_KEY = '@trixile_review_prompted';
const SESSION_COUNT_KEY = '@trixile_session_count';

/**
 * Controlled Review Flow
 * Happy users -> Store review
 * Unhappy users -> Internal feedback
 */
const ReviewEngine = {
  incrementSession: async () => {
    try {
      const count = await AsyncStorage.getItem(SESSION_COUNT_KEY);
      const newCount = (parseInt(count) || 0) + 1;
      await AsyncStorage.setItem(SESSION_COUNT_KEY, newCount.toString());
      return newCount;
    } catch (e) {
      return 0;
    }
  },

  promptIfAppropriate: async (isHappy = true) => {
    const alreadyPrompted = await AsyncStorage.getItem(REVIEW_KEY);
    if (alreadyPrompted) return;

    if (isHappy) {
      Alert.alert(
        "Enjoying TRIXILE?",
        "Your feedback helps others discover Pondicherry's hidden gems.",
        [
          { text: "Later", style: "cancel" },
          { 
            text: "Rate App", 
            onPress: () => {
              AsyncStorage.setItem(REVIEW_KEY, 'true');
              const url = Platform.OS === 'ios' 
                ? `itms-apps://itunes.apple.com/app/idYOUR_ID?action=write-review` 
                : `market://details?id=com.pawanch123.trixile`;
              Linking.openURL(url);
            } 
          }
        ]
      );
    } else {
      // Redirect unhappy users to internal feedback
      console.log("Redirecting to internal feedback...");
    }
  }
};

export default ReviewEngine;
