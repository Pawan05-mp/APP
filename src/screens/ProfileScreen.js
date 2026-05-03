import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserStats, getPreferences, updatePreferences } from '../api';
import { useSavedPlaces } from '../context/SavedPlacesContext';
import { useTheme } from '../context/ThemeContext';
import PlaceCard from '../components/PlaceCard';
import { Typography, Spacing, Radius, Palette } from '../constants/DesignTokens';

export default function ProfileScreen({ onNavigate, onLogout, email, userId }) {
  const [stats, setStats] = useState({ saved: 0, visits: 0, vibes: 0 });
  const [prefs, setPrefs] = useState({ taste: 'Street food, Cafes', budget: 'Low - Medium' });
  const [loading, setLoading] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const { savedPlaces } = useSavedPlaces();
  const { isDarkMode, toggleTheme, colors, theme } = useTheme();

  useEffect(() => {
    const initProfile = async () => {
      if (userId) {
        const [statsData, prefData] = await Promise.all([
          getUserStats(userId),
          getPreferences(userId)
        ]);
        setStats(statsData);
        setPrefs(prefData);
      }
      setLoading(false);
    };
    initProfile();
  }, [userId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.hero} />
      </View>
    );
  }

  const displayName = email ? email.split('@')[0].toUpperCase() : 'EXPLORER';
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerSideContainer}>
          <TouchableOpacity onPress={() => onNavigate('home')}>
            <Ionicons name="arrow-back" size={28} color={colors.hero} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>PROFILE</Text>
        <View style={[styles.headerSideContainer, { alignItems: 'flex-end' }]}>
          <Image 
            source={isDarkMode ? require('../../assets/adaptive-icon-dark.png') : require('../../assets/adaptive-icon-light.png')} 
            style={styles.headerRectIcon}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarGlow, { backgroundColor: colors.hero + '1A' }]}>
            <Image 
              source={{ uri: `https://i.pravatar.cc/150?u=${userId || 'default'}` }} 
              style={[styles.avatar, { borderColor: colors.background }]} 
            />
          </View>
          <Text style={[styles.nameText, { color: colors.textPrimary }]}>{displayName}</Text>
          <View style={[styles.levelBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.levelText, { color: colors.textSecondary }]}>GOLD MEMBER</Text>
          </View>
        </View>

        {/* STATS GRID */}
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }, showSaved && { borderColor: colors.hero }]} 
            onPress={() => setShowSaved(!showSaved)}
          >
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{savedPlaces.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>SAVED</Text>
          </TouchableOpacity>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{stats.visits}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>VISITS</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{stats.vibes}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>MOODS</Text>
          </View>
        </View>

        {showSaved && (
          <View style={styles.savedContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Saved Spots</Text>
            {savedPlaces.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={{ color: colors.textSecondary, fontFamily: Typography.families.uiMedium }}>Nothing saved yet.</Text>
              </View>
            ) : (
              savedPlaces.map((place, index) => (
                <PlaceCard key={index} place={place} index={index} userId={userId} mood={null} />
              ))
            )}
          </View>
        )}

        {/* SETTINGS */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: Spacing.huge }]}>Settings</Text>
        <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.listItem} onPress={toggleTheme}>
            <View style={styles.listIconBox}>
              <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={colors.hero} />
            </View>
            <Text style={[styles.listText, { color: colors.textPrimary }]}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Text>
            <View style={[styles.toggleTrack, { backgroundColor: isDarkMode ? colors.hero : colors.surfaceSecondary }]}>
              <View style={[styles.toggleThumb, { marginLeft: isDarkMode ? 18 : 2 }]} />
            </View>
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <TouchableOpacity style={styles.listItem} onPress={onLogout}>
            <View style={styles.listIconBox}>
              <Ionicons name="log-out" size={20} color={Palette.coral} />
            </View>
            <Text style={[styles.listText, { color: Palette.coral }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerText, { color: colors.textSecondary }]}>TRIXILE v1.2.0 • Production Build</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingBottom: 21,
    paddingHorizontal: Spacing.xxl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerSideContainer: { width: 80 },
  headerTitle: {
    fontFamily: Typography.families.heading,
    fontSize: Typography.h3.fontSize,
    flex: 1,
    textAlign: 'center',
  },
  headerRectIcon: { width: 80, height: 50 },
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', marginTop: Spacing.huge, marginBottom: Spacing.huge },
  avatarGlow: {
    width: 120,
    height: 120,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 3 },
  nameText: {
    fontFamily: Typography.families.heading,
    fontSize: Typography.h2.fontSize,
    marginTop: Spacing.l,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginTop: Spacing.s,
  },
  levelText: {
    fontFamily: Typography.families.uiBold,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.huge },
  statBox: {
    flex: 1,
    height: 90,
    borderRadius: Radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
  },
  statNumber: { fontFamily: Typography.families.heading, fontSize: Typography.h2.fontSize },
  statLabel: { fontFamily: Typography.families.uiBold, fontSize: 10, letterSpacing: 1, marginTop: 2 },
  sectionTitle: {
    fontFamily: Typography.families.heading,
    fontSize: Typography.h3.fontSize,
    marginBottom: Spacing.l,
  },
  listCard: { borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.xl },
  listIconBox: { width: 32 },
  listText: { flex: 1, fontFamily: Typography.families.uiBold, fontSize: 15 },
  toggleTrack: { width: 44, height: 24, borderRadius: Radius.pill, justifyContent: 'center', paddingHorizontal: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF' },
  divider: { height: 1 },
  footerText: { textAlign: 'center', marginTop: Spacing.huge, fontSize: 10, fontFamily: Typography.families.uiMedium, letterSpacing: 2 }
});
