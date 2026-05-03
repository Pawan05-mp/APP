import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Animated,
  RefreshControl,
  Dimensions,
  Easing,
  Image,
  StatusBar
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { useFonts } from 'expo-font';

import MoodCard from './src/components/MoodCard';
import PlaceCard from './src/components/PlaceCard';
import { interactWithPlace } from './src/api';
import { supabase } from './src/supabase';
import { getTimeBucket, getMOODS, scorePlaces } from './src/engine';
import PLACES from './src/places.json';

import LoadingScreen from './src/screens/LoadingScreen';
import Analytics from './src/utils/Analytics';
import ReviewEngine from './src/utils/ReviewEngine';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
import { SavedPlacesProvider } from './src/context/SavedPlacesContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { Typography, Spacing, Radius, Palette } from './src/constants/DesignTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function App() {
  const [fontsLoaded] = useFonts({
    'ClanPro-Bold': require('./assets/fonts/ClanPro-Bold.ttf'),
    'ClanPro-Medium': require('./assets/fonts/ClanPro-Medium.ttf'),
    'ClanPro-Regular': require('./assets/fonts/ClanPro-Regular.ttf'),
  });

  return (
    <ThemeProvider>
      <SavedPlacesProvider>
        {!fontsLoaded ? <LoadingScreen /> : <AppContent />}
      </SavedPlacesProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { isDarkMode, toggleTheme, theme, colors } = useTheme();
  
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');

  // APP STATE
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Detecting location...');
  const [appMode, setAppMode] = useState('browse'); // 'browse' or 'instant'
  const [selectedMood, setSelectedMood] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFuzzy, setIsFuzzy] = useState(false);

  // ANIMATION
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const sliderTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function updateApp() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        console.log("Update error:", e);
      }
    }
    updateApp();
  }, []);

  useEffect(() => {
    let authSubscription;

    const initApp = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session) {
            setIsAuthenticated(true);
            setUserEmail(session.user.email);
            setUserId(session.user.id);
          } else {
            setIsAuthenticated(false);
            setUserEmail('');
            setUserId(null);
          }
        });

        authSubscription = subscription;

        // SESSION TRACKING
        const sessionCount = await ReviewEngine.incrementSession();
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession && currentSession.user) {
          Analytics.trackSession(currentSession.user.id);
        }

        // DEFAULT LOCATION
        setLocation({ lat: 11.93, lng: 79.83 });
        setAddress('Puducherry, India');

        setTimeout(() => setIsReady(true), 1200); 
      } catch (err) {
        console.error('App init failed:', err);
        setIsReady(true);
      }
    };

    initApp();

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    setIsFuzzy(false);

    // Fade out old results if any
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    try {
      // Lazy permission check on interaction
      let { status } = await Location.requestForegroundPermissionsAsync();
      let userLoc = location;
      
      if (status === 'granted') {
        const geo = await Location.getCurrentPositionAsync({});
        userLoc = { lat: geo.coords.latitude, lng: geo.coords.longitude };
        setLocation(userLoc);
        setAddress('Near you');
      }

      const scored = scorePlaces(PLACES, userLoc, getMOODS(getTimeBucket()).find(m => m.id === mood).filters);
      setResults(scored);
      setIsFuzzy(scored.length > 0 && scored[0].isFuzzyMatch);

      // Trigger animation
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true })
      ]).start();

    } catch (err) {
      console.error('Mood processing error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantMood = (mood) => {
    handleMoodSelect(mood);
    // Instant mode logic can be added here
  };

  const switchMode = (mode) => {
    setAppMode(mode);
    Animated.spring(sliderTranslateX, {
      toValue: mode === 'instant' ? (SCREEN_WIDTH - 48) / 2 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();
  };

  const handleRefresh = () => {
    if (selectedMood) {
      handleMoodSelect(selectedMood);
    } else {
      handleReset();
    }
  };

  const handleReset = () => {
    setSelectedMood(null);
    setResults([]);
    setIsFuzzy(false);
  };

  if (!isReady) return <LoadingScreen />;
  if (!isAuthenticated) return <AuthScreen />;
  if (currentScreen === 'profile') return <ProfileScreen userId={userId} email={userEmail} onNavigate={setCurrentScreen} onLogout={() => supabase.auth.signOut()} />;

  const moods = getMOODS(getTimeBucket());
  const isInstant = appMode === 'instant';
  const moodHandler = isInstant ? handleInstantMood : handleMoodSelect;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.headerSideContainer}>
            <TouchableOpacity onPress={handleReset}>
              <Image 
                source={isDarkMode ? require('./assets/adaptive-icon-dark.png') : require('./assets/adaptive-icon-light.png')} 
                style={styles.profileRectIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerSideContainer}>
            <TouchableOpacity onPress={() => setCurrentScreen('profile')} style={{ alignItems: 'flex-end' }}>
              <Ionicons name="person-circle" size={42} color={colors.hero} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={16} color={colors.hero} style={styles.locationIcon} />
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{address}</Text>
        </View>

        <View style={styles.modeToggleContainer}>
          <View style={[styles.modeToggleTrack, { backgroundColor: colors.surfaceSecondary }]}>
            <Animated.View style={[
              styles.modeToggleSlider,
              { transform: [{ translateX: sliderTranslateX }], backgroundColor: colors.hero }
            ]} />
            <TouchableOpacity
              style={styles.modeToggleBtn}
              onPress={() => switchMode('browse')}
              activeOpacity={0.7}
            >
              <Ionicons name="compass-outline" size={14} color={!isInstant ? colors.heroContrast : colors.textSecondary} />
              <Text style={[styles.modeToggleText, { color: !isInstant ? colors.heroContrast : colors.textSecondary }]}>Browse</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modeToggleBtn}
              onPress={() => switchMode('instant')}
              activeOpacity={0.7}
            >
              <Ionicons name="flash-outline" size={14} color={isInstant ? colors.heroContrast : colors.textSecondary} />
              <Text style={[styles.modeToggleText, { color: isInstant ? colors.heroContrast : colors.textSecondary }]}>Instant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.hero} />}
      >
        {!selectedMood ? (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>How's the vibe?</Text>
            <View style={styles.moodGrid}>
              {moods.map((m) => (
                <MoodCard 
                  key={m.id}
                  title={m.title}
                  emoji={m.emoji}
                  isSelected={false}
                  onPress={() => moodHandler(m.id)}
                />
              ))}
            </View>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.resultsHeader}>
              <View>
                <Text style={[styles.resultsLabel, { color: colors.textSecondary }]}>Showing results for</Text>
                <Text style={[styles.resultsTitle, { color: colors.textPrimary }]}>{moods.find(m => m.id === selectedMood)?.title} vibe</Text>
              </View>
              <TouchableOpacity style={[styles.changeBtn, { backgroundColor: colors.surfaceSecondary }]} onPress={handleReset}>
                <Text style={[styles.changeBtnText, { color: colors.textPrimary }]}>Change</Text>
              </TouchableOpacity>
            </View>

            {isFuzzy && (
              <View style={[styles.fuzzyBanner, { backgroundColor: colors.hero + '1A', borderColor: colors.hero + '33' }]}>
                <Ionicons name="information-circle" size={18} color={colors.hero} />
                <Text style={[styles.fuzzyText, { color: colors.textSecondary }]}>No exact match—showing closest fits nearby.</Text>
              </View>
            )}

            {loading ? (
              <ActivityIndicator size="large" color={colors.hero} style={{ marginTop: 40 }} />
            ) : (
              results.map((place, idx) => (
                <PlaceCard 
                  key={place._id || idx} 
                  place={place} 
                  index={idx} 
                  userId={userId}
                  mood={selectedMood}
                  showReplace={true}
                />
              ))
            )}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.xxl, paddingTop: 50, paddingBottom: 12 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  headerSideContainer: {
    width: 80,
  },
  profileRectIcon: {
    width: 80,
    height: 50,
  },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { marginRight: Spacing.xs, marginTop: 1 },
  subtitle: { 
    fontFamily: Typography.families.uiMedium,
    fontSize: Typography.body.fontSize,
  },
  modeToggleContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  modeToggleTrack: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    borderRadius: Radius.medium,
    padding: 4,
    position: 'relative',
  },
  modeToggleSlider: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: (SCREEN_WIDTH - 48 - 8) / 2,
    height: 40,
    borderRadius: Radius.medium - 2,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modeToggleText: {
    fontFamily: Typography.families.uiBold,
    fontSize: Typography.caption.fontSize,
    marginLeft: Spacing.s,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: 40 },
  sectionTitle: {
    fontFamily: Typography.families.heading,
    fontSize: Typography.h2.fontSize,
    marginBottom: Spacing.xl,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.xxl,
  },
  resultsLabel: {
    fontFamily: Typography.families.uiMedium,
    fontSize: Typography.caption.fontSize,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  resultsTitle: {
    fontFamily: Typography.families.heading,
    fontSize: Typography.h2.fontSize,
  },
  changeBtn: {
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.s,
    borderRadius: Radius.pill,
  },
  changeBtnText: {
    fontFamily: Typography.families.uiBold,
    fontSize: Typography.caption.fontSize,
  },
  fuzzyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
    borderRadius: Radius.medium,
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  fuzzyText: {
    fontFamily: Typography.families.uiMedium,
    fontSize: Typography.caption.fontSize,
    marginLeft: Spacing.s,
    flex: 1,
  }
});
