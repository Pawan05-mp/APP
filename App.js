import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView, Animated, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import MoodCard from './src/components/MoodCard';
import PlaceCard from './src/components/PlaceCard';
import { getRecommendations } from './src/api';
import { supabase } from './src/supabase';

import LoadingScreen from './src/screens/LoadingScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import AuthScreen from './src/screens/AuthScreen';

const MOODS = [
  { id: 'Bored', emoji: '😩', title: 'Bored' },
  { id: 'Hungry', emoji: '🍔', title: 'Hungry' },
  { id: 'Stress', emoji: '😌', title: 'Chill' },
  { id: 'Friends', emoji: '👥', title: 'Friends' }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  
  const [selectedMood, setSelectedMood] = useState(null);
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Finding location...');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // 1. Session Persistence Check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email);
        setUserId(session.user.id);
        setCurrentScreen('home');
      }
    };
    checkUser();

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

    // 3. Artificial Splash Delay
    const splashTimer = setTimeout(() => {
       // Only move to 'ready' if we haven't already moved to 'home' via auth check
       setCurrentScreen(prev => prev === 'splash' ? 'ready' : prev);
    }, 3200);

    // 4. Location Fetching
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied.\nUsing standard mockup config (Puducherry Location).');
        setLocation({ lat: 11.93, lng: 79.83 });
        setAddress('Puducherry, India');
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          lat: currentLocation.coords.latitude,
          lng: currentLocation.coords.longitude,
        });

        const geocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });

        if (geocode && geocode.length > 0) {
          const loc = geocode[0];
          const localArea = [loc.name || loc.street, loc.district || loc.subregion || loc.city].filter(Boolean).join(', ');
          setAddress(localArea || 'Current Location');
        } else {
          setAddress('Current Location');
        }
      } catch (err) {
        setLocation({ lat: 11.93, lng: 79.83 });
        setAddress('Puducherry, India');
      }
    })();

    return () => {
      clearTimeout(splashTimer);
      subscription.unsubscribe();
    };
  }, []);

  const handleMoodSelect = async (moodId) => {
    setSelectedMood(moodId);
    if (!location) return;

    setIsLoading(true);
    setPlaces([]);

    try {
      const data = await getRecommendations(location.lat, location.lng, moodId, userId);
      setPlaces(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Backend Error. Make sure API server is running on the correct local IP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!location || !selectedMood) return;
    setIsRefreshing(true);
    try {
      // Fetch new distinct recommendations without loading spinner takeover
      const data = await getRecommendations(location.lat, location.lng, selectedMood, userId);
      setPlaces(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Backend connection failed while refreshing.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReset = () => {
    setSelectedMood(null);
    setPlaces([]);
    setErrorMsg(null);
    setCurrentScreen('home');
  };

  const handleLogin = (email) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    setCurrentScreen('home');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentScreen('ready');
  };

  // State Router
  if (currentScreen === 'splash') return <LoadingScreen />;
  if (!isAuthenticated) return <AuthScreen onLogin={handleLogin} />;
  
  if (currentScreen === 'profile') {
    return <ProfileScreen 
             onNavigate={setCurrentScreen} 
             onLogout={handleLogout} 
             email={userEmail}
             userId={userId}
           />;
  }

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
      </View>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      <View style={styles.main}>
        {!selectedMood ? (
          <View style={styles.moodSection}>
            <Text style={styles.question}>How are you feeling right now?</Text>
            <Text style={styles.questionSub}>We'll find the perfect spot for your current mood.</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((mood) => (
                <MoodCard
                  key={mood.id}
                  title={mood.title}
                  emoji={mood.emoji}
                  isSelected={selectedMood === mood.id}
                  onPress={() => handleMoodSelect(mood.id)}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultsSection}>
             <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Top 3 Options</Text>
                <TouchableOpacity style={styles.changeBtn} onPress={handleReset}>
                  <Text style={styles.changeBtnText}>Change Mood</Text>
                </TouchableOpacity>
             </View>

             {isLoading ? (
               <View style={styles.loadingState}>
                 <ActivityIndicator size="large" color="#00FFC2" />
                 <Text style={styles.loadingText}>Finding perfect spots...</Text>
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
                     colors={["#00FFC2", "#0D0D12"]}
                   />
                 }
               >
                 {places.length > 0 ? (
                   places.map((place, index) => (
                     <View key={place._id}>
                        <PlaceCard 
                          place={place} 
                          index={index} 
                          userId={userId} 
                          mood={selectedMood} 
                        />
                     </View>
                   ))
                 ) : (
                   <View style={styles.emptyState}>
                     <Ionicons name="sad-outline" size={48} color="#A1A5B7" />
                     <Text style={styles.emptyText}>No perfect matches found.</Text>
                   </View>
                 )}
               </ScrollView>
             )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030303',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  appTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: '#00FFC2',
    letterSpacing: -1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  locationIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  errorBox: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  errorText: {
    color: '#FF706C',
    fontSize: 12,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    paddingHorizontal: 24,
  },
  moodSection: {
    flex: 1,
    justifyContent: 'center',
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  questionSub: {
    fontSize: 14,
    color: '#A1A5B7',
    marginBottom: 32,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultsSection: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  changeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A1A5B7',
    marginTop: 16,
    fontSize: 16,
  },
  placesList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#A1A5B7',
    marginTop: 16,
    fontSize: 16,
  }
});
