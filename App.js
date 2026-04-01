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
  Easing
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';

import MoodCard from './src/components/MoodCard';
import PlaceCard from './src/components/PlaceCard';
import { getRecommendations, getInstantPick, getInstantReplacement } from './src/api';
import { supabase } from './src/supabase';

import LoadingScreen from './src/screens/LoadingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOODS = [
  { id: 'Bored', emoji: '😩', title: 'Bored' },
  { id: 'Hungry', emoji: '🍔', title: 'Hungry' },
  { id: 'Stress', emoji: '😌', title: 'Chill' },
  { id: 'Friends', emoji: '👥', title: 'Friends' }
];

// Animation configs
const ANIMATION_CONFIG = {
  moodSelect: { duration: 200, easing: Easing.out(Easing.ease) },
  resultsAppear: { duration: 400, easing: Easing.out(Easing.back(1.2)) },
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  
  // App mode: 'browse' or 'instant'
  const [appMode, setAppMode] = useState('instant');

  const [selectedMood, setSelectedMood] = useState(null);
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Finding location...');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [excludedPlaces, setExcludedPlaces] = useState([]);

  // Animation refs
  const modeSlide = useRef(new Animated.Value(1)).current;
  const resultsOpacity = useRef(new Animated.Value(0)).current;
  const resultsTranslateY = useRef(new Animated.Value(30)).current;
  const moodGridOpacity = useRef(new Animated.Value(1)).current;
  const loadingStepRef = useRef(null);

  useEffect(() => {
    async function updateApp() {
      if (__DEV__) return;
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
    console.log("Channel:", Updates.channel);
    console.log("Runtime:", Updates.runtimeVersion);
    const initApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email);
          setUserId(session.user.id);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            setIsAuthenticated(true);
            setUserEmail(session.user.email);
            setUserId(session.user.id);
          } else {
            setIsAuthenticated(false);
            setUserEmail('');
            setUserId(null);
            setCurrentScreen('ready');
          }
        });

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let currentLocation = await Location.getCurrentPositionAsync({});
          const coords = {
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
          };
          setLocation(coords);

          const geocode = await Location.reverseGeocodeAsync({
            latitude: coords.lat,
            longitude: coords.lng
          });

          if (geocode && geocode.length > 0) {
            const loc = geocode[0];
            const localArea = [loc.name || loc.street, loc.district || loc.subregion || loc.city].filter(Boolean).join(', ');
            setAddress(localArea || 'Current Location');
          } else {
            setAddress('Current Location');
          }
        } else {
          setErrorMsg('Permission to access location was denied.');
          setLocation({ lat: 11.93, lng: 79.83 });
          setAddress('Puducherry, India');
        }

        setTimeout(() => setIsReady(true), 1500);
        
        return () => subscription.unsubscribe();
      } catch (err) {
        console.error("Initialization error:", err);
        setIsReady(true);
      }
    };

    initApp();
  }, []);

  // Mode toggle
  const switchMode = useCallback((mode) => {
    if (mode === appMode) return;
    
    setAppMode(mode);
    
    Animated.spring(modeSlide, {
      toValue: mode === 'instant' ? 1 : 0,
      tension: 80,
      friction: 12,
      useNativeDriver: true,
    }).start();

    setSelectedMood(null);
    setPlaces([]);
    setErrorMsg(null);
    setExcludedPlaces([]);
    
    resultsOpacity.setValue(0);
    resultsTranslateY.setValue(30);
    moodGridOpacity.setValue(1);
  }, [appMode, modeSlide]);

  // Animation helpers
  const animateResultsIn = useCallback(() => {
    resultsOpacity.setValue(0);
    resultsTranslateY.setValue(30);
    
    Animated.parallel([
      Animated.timing(resultsOpacity, {
        toValue: 1,
        duration: ANIMATION_CONFIG.resultsAppear.duration,
        easing: ANIMATION_CONFIG.resultsAppear.easing,
        useNativeDriver: true,
      }),
      Animated.timing(resultsTranslateY, {
        toValue: 0,
        duration: ANIMATION_CONFIG.resultsAppear.duration,
        easing: ANIMATION_CONFIG.resultsAppear.easing,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const animateMoodOut = useCallback(() => {
    Animated.timing(moodGridOpacity, {
      toValue: 0,
      duration: 150,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const startLoadingSteps = useCallback((steps, isInstant) => {
    setLoadingStep(0);
    let i = 0;
    loadingStepRef.current = setInterval(() => {
      i = (i + 1) % steps.length;
      setLoadingStep(i);
    }, isInstant ? 400 : 800);
  }, []);

  const stopLoadingSteps = useCallback(() => {
    if (loadingStepRef.current) {
      clearInterval(loadingStepRef.current);
      loadingStepRef.current = null;
    }
    setLoadingStep(0);
  }, []);

  const BROWSE_STEPS = [
    'Scanning nearby options...',
    'Matching your mood...',
    'Ranking by vibe...',
    'Almost there...',
  ];

  const INSTANT_STEPS = [
    'Finding spots...',
    'Locked in.',
  ];

  // Browse mode
  const handleMoodSelect = useCallback(async (moodId) => {
    if (!location) {
      setErrorMsg('Location not available. Please enable location services.');
      return;
    }

    setSelectedMood(moodId);
    setIsLoading(true);
    setPlaces([]);
    setErrorMsg(null);
    animateMoodOut();
    startLoadingSteps(BROWSE_STEPS, false);

    try {
      const data = await getRecommendations(location.lat, location.lng, moodId, userId);
      if (data && data.length > 0) {
        setPlaces(data.slice(0, 3));
        animateResultsIn();
      } else {
        setErrorMsg('No places found nearby.');
      }
    } catch (err) {
      setErrorMsg('Unable to fetch recommendations.');
    } finally {
      stopLoadingSteps();
      setIsLoading(false);
    }
  }, [location, userId, startLoadingSteps, stopLoadingSteps, animateMoodOut, animateResultsIn]);

  // Instant mode
  const handleInstantMood = useCallback(async (moodId) => {
    if (!location) {
      setErrorMsg('Location not available.');
      return;
    }

    setSelectedMood(moodId);
    setIsLoading(true);
    setPlaces([]);
    setErrorMsg(null);
    animateMoodOut();
    startLoadingSteps(INSTANT_STEPS, true);

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), 1200)
    );

    try {
      const data = await Promise.race([
        getInstantPick(location.lat, location.lng, moodId, userId, excludedPlaces),
        timeoutPromise
      ]);
      
      if (data && data.length >= 3) {
        setPlaces(data.slice(0, 3));
        animateResultsIn();
      } else if (data && data.length > 0) {
        setPlaces(data);
        animateResultsIn();
      } else {
        setErrorMsg('No places found nearby.');
      }
    } catch (err) {
      if (err.message === 'TIMEOUT') {
        setErrorMsg('Taking longer than expected...');
        try {
          const data = await getInstantPick(location.lat, location.lng, moodId, userId, excludedPlaces);
          if (data && data.length > 0) {
            setPlaces(data.slice(0, 3));
            setErrorMsg(null);
            animateResultsIn();
          }
        } catch (bgErr) {
          setErrorMsg('Unable to load places.');
        }
      } else {
        setErrorMsg('Something went wrong.');
      }
    } finally {
      stopLoadingSteps();
      setIsLoading(false);
    }
  }, [location, userId, excludedPlaces, startLoadingSteps, stopLoadingSteps, animateMoodOut, animateResultsIn]);

  // Replace one card ("Not this")
  const handleReplace = useCallback(async (index) => {
    if (!location || !selectedMood || replacingIndex !== null) return;
    
    setReplacingIndex(index);
    setErrorMsg(null);
    
    const currentPlaceId = places[index]?._id;
    if (currentPlaceId) {
      setExcludedPlaces(prev => [...prev, currentPlaceId]);
    }
    
    try {
      const currentIds = places.map(p => p._id);
      const replacement = await getInstantReplacement(
        location.lat, location.lng, selectedMood, userId, currentIds
      );

      if (replacement) {
        setPlaces(prev => {
          const updated = [...prev];
          updated[index] = replacement;
          return updated;
        });
      } else {
        setErrorMsg('No alternatives found.');
      }
    } catch (err) {
      setErrorMsg('Failed to find alternative.');
    } finally {
      setReplacingIndex(null);
    }
  }, [location, selectedMood, replacingIndex, places, userId]);

  const handleRefresh = useCallback(async () => {
    if (!location || !selectedMood) return;
    setIsRefreshing(true);
    setErrorMsg(null);
    
    try {
      let data;
      const excludeIds = places.map(p => p._id).filter(Boolean);
      
      if (appMode === 'instant') {
        data = await getInstantPick(location.lat, location.lng, selectedMood, userId, [...excludedPlaces, ...excludeIds]);
      } else {
        data = await getRecommendations(location.lat, location.lng, selectedMood, userId);
      }
      
      if (data && data.length > 0) {
        setPlaces(data.slice(0, 3));
      } else {
        setErrorMsg('No new places found.');
      }
    } catch (err) {
      setErrorMsg('Failed to refresh.');
    } finally {
      setIsRefreshing(false);
    }
  }, [location, selectedMood, userId, places, excludedPlaces, appMode]);

  const handleReset = useCallback(() => {
    setSelectedMood(null);
    setPlaces([]);
    setErrorMsg(null);
    setExcludedPlaces([]);
    resultsOpacity.setValue(0);
    moodGridOpacity.setValue(1);
  }, [resultsOpacity, moodGridOpacity]);

  const handleLogin = (user) => {
    setUserEmail(user.email);
    setUserId(user.id);
    setIsAuthenticated(true);
    setCurrentScreen('home');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!isReady) return <LoadingScreen />;
  if (!isAuthenticated) return <AuthScreen onLogin={handleLogin} />;
  
  if (currentScreen === 'profile') {
    return <ProfileScreen 
             onNavigate={setCurrentScreen} 
             onLogout={handleLogout} 
             email={userEmail}
             userId={userId}
           />;
  }

  const sliderTranslateX = modeSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  const isInstant = appMode === 'instant';
  const moodHandler = isInstant ? handleInstantMood : handleMoodSelect;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.appTitle}>ZIPO.</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentScreen('profile')}>
            <Ionicons name="person-circle" size={42} color="#00FFC2" />
          </TouchableOpacity>
        </View>

        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={16} color="#00FFC2" style={styles.locationIcon} />
          <Text style={styles.subtitle}>{address}</Text>
        </View>

        <View style={styles.modeToggleContainer}>
          <View style={styles.modeToggleTrack}>
            <Animated.View style={[
              styles.modeToggleSlider,
              { transform: [{ translateX: sliderTranslateX }] }
            ]} />
            <TouchableOpacity
              style={styles.modeToggleBtn}
              onPress={() => switchMode('browse')}
              activeOpacity={0.7}
            >
              <Ionicons name="compass-outline" size={14} color={!isInstant ? '#030303' : '#A1A5B7'} />
              <Text style={[styles.modeToggleText, !isInstant && styles.modeToggleTextActive]}>Browse</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modeToggleBtn}
              onPress={() => switchMode('instant')}
              activeOpacity={0.7}
            >
              <Ionicons name="flash" size={14} color={isInstant ? '#030303' : '#A1A5B7'} />
              <Text style={[styles.modeToggleText, isInstant && styles.modeToggleTextActive]}>Instant</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modeDescription}>
            {isInstant ? '⚡ Tap mood → get 3 picks → go.' : '🧭 Explore by mood, take your time.'}
          </Text>
        </View>
      </View>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      <View style={styles.main}>
        {!selectedMood ? (
          <Animated.View style={[styles.moodSection, { opacity: moodGridOpacity }]}>
            <Text style={styles.question}>
              {isInstant ? 'What do you need right now?' : 'How are you feeling?'}
            </Text>
            <Text style={styles.questionSub}>
              {isInstant 
                ? 'Tap once. Get 3 options. Decide in seconds.' 
                : "We'll find the perfect spot for your mood."}
            </Text>
            <View style={styles.moodGrid}>
              {MOODS.map((mood) => (
                <MoodCard
                  key={mood.id}
                  title={mood.title}
                  emoji={mood.emoji}
                  isSelected={selectedMood === mood.id}
                  onPress={() => moodHandler(mood.id)}
                />
              ))}
            </View>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.resultsSection, { opacity: resultsOpacity, transform: [{ translateY: resultsTranslateY }] }]}>
             <View style={styles.resultsHeader}>
                <View>
                  <Text style={styles.resultsTitle}>
                    {isInstant ? 'Your 3 Picks' : 'Top 3 Options'}
                  </Text>
                  <View style={styles.moodChipRow}>
                    <View style={styles.moodChip}>
                      <Text style={styles.moodChipText}>
                        {MOODS.find(m => m.id === selectedMood)?.emoji} {selectedMood}
                      </Text>
                    </View>
                    {isInstant && (
                      <Text style={styles.resultsSubtitle}>Tap "Not this" to swap</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity style={styles.changeBtn} onPress={handleReset}>
                  <Text style={styles.changeBtnText}>Change Mood</Text>
                </TouchableOpacity>
             </View>

             {isLoading ? (
               <View style={styles.loadingState}>
                 <ActivityIndicator size="large" color="#00FFC2" />
                 <Text style={styles.loadingText}>
                   {isInstant ? INSTANT_STEPS[loadingStep] : BROWSE_STEPS[loadingStep]}
                 </Text>
               </View>
             ) : (
               <ScrollView 
                 style={styles.placesList} 
                 showsVerticalScrollIndicator={false}
                 refreshControl={
                   <RefreshControl 
                     refreshing={isRefreshing} 
                     onRefresh={handleRefresh} 
                     tintColor="#00FFC2" 
                   />
                 }
               >
                 {places.length > 0 ? (
                   places.map((place, index) => (
                     <PlaceCard 
                       key={`${place._id}-${index}`}
                       place={place} 
                       index={index} 
                       userId={userId} 
                       mood={selectedMood}
                       showReplace={isInstant}
                       isReplacing={replacingIndex === index}
                       onReplace={() => handleReplace(index)}
                     />
                   ))
                 ) : (
                   <View style={styles.emptyState}>
                     <Ionicons name="sad-outline" size={48} color="#A1A5B7" />
                     <Text style={styles.emptyText}>No perfect matches found.</Text>
                   </View>
                 )}
               </ScrollView>
             )}
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030303' },
  header: { paddingHorizontal: 24, paddingTop: 50, paddingBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appTitle: { fontSize: 40, fontWeight: '800', color: '#00FFC2', letterSpacing: -1 },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { marginRight: 6, marginTop: 1 },
  subtitle: { fontSize: 16, color: '#E0E0E0', fontWeight: '500' },
  modeToggleContainer: { marginTop: 16, alignItems: 'center' },
  modeToggleTrack: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 3, width: 200, position: 'relative' },
  modeToggleSlider: { position: 'absolute', top: 3, left: 3, width: 97, height: 34, borderRadius: 13, backgroundColor: '#00FFC2' },
  modeToggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, zIndex: 1 },
  modeToggleText: { fontSize: 13, fontWeight: '700', color: '#A1A5B7' },
  modeToggleTextActive: { color: '#030303' },
  modeDescription: { color: '#555', fontSize: 11, fontWeight: '600', marginTop: 8 },
  errorBox: { marginHorizontal: 24, marginBottom: 16, backgroundColor: 'rgba(255,59,48,0.15)', padding: 12, borderRadius: 8 },
  errorText: { color: '#FF706C', fontSize: 12, textAlign: 'center' },
  main: { flex: 1, paddingHorizontal: 24 },
  moodSection: { flex: 1, justifyContent: 'center' },
  question: { fontSize: 22, fontWeight: '700', color: '#FFF', marginBottom: 8, textAlign: 'center' },
  questionSub: { fontSize: 14, color: '#A1A5B7', marginBottom: 32, textAlign: 'center' },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  resultsSection: { flex: 1 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  resultsTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  resultsSubtitle: { fontSize: 12, color: '#A1A5B7', marginTop: 4 },
  moodChipRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  moodChip: { backgroundColor: 'rgba(0,255,194,0.12)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  moodChipText: { color: '#00FFC2', fontSize: 12, fontWeight: '700' },
  changeBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  changeBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#A1A5B7', marginTop: 16, fontSize: 16 },
  placesList: { flex: 1 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#A1A5B7', marginTop: 16, fontSize: 16 }
});
