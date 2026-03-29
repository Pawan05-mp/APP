import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserStats, getPreferences, updatePreferences } from '../api';

export default function ProfileScreen({ onNavigate, onLogout, email, userId }) {
  const [stats, setStats] = useState({ saved: 0, visits: 0, vibes: 0 });
  const [prefs, setPrefs] = useState({ taste: 'Street food, Cafes', budget: 'Low - Medium' });
  const [loading, setLoading] = useState(true);

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

  const cycleTaste = async () => {
    const options = ['Street food, Cafes', 'Fine Dining, Wines', 'Bakeries, Desserts', 'Healthy, Organic'];
    const nextIndex = (options.indexOf(prefs.taste) + 1) % options.length;
    const newTaste = options[nextIndex];
    setPrefs({ ...prefs, taste: newTaste });
    await updatePreferences(userId, newTaste, prefs.budget);
  };

  const cycleBudget = async () => {
    const options = ['Low - Medium', 'Medium - High', 'Premium Luxury', 'Strict Budget'];
    const nextIndex = (options.indexOf(prefs.budget) + 1) % options.length;
    const newBudget = options[nextIndex];
    setPrefs({ ...prefs, budget: newBudget });
    await updatePreferences(userId, prefs.taste, newBudget);
  };

  const displayName = email ? email.split('@')[0].toUpperCase() : 'EXPLORER';
  const explorerLevel = Math.floor(stats.visits / 5) + 1;
  
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('home')}>
          <Ionicons name="arrow-back" size={28} color="#00FFC2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* AVATAR BLOCK */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarGlow}>
            <Image 
              source={{ uri: `https://i.pravatar.cc/150?u=${userId || 'default'}` }} 
              style={styles.avatar} 
            />
            <View style={styles.avatarBadge}>
              <Ionicons name="sparkles" size={14} color="#121212" />
            </View>
          </View>
          
          <Text style={styles.nameText}>{displayName}</Text>
          <View style={styles.tagRow}>
            <View style={styles.eliteBadge}>
              <Text style={styles.eliteText}>LEVEL {explorerLevel} EXPLORER</Text>
            </View>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="bookmark" size={20} color="#00FFC2" style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.saved}</Text>
            <Text style={styles.statLabel}>SAVED</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="navigate" size={20} color="#A1A5B7" style={styles.statIcon} />
            <Text style={[styles.statNumber, { color: '#FFF' }]}>{stats.visits}</Text>
            <Text style={styles.statLabel}>VISITS</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="pulse" size={20} color="#FF5A5F" style={styles.statIcon} />
            <Text style={[styles.statNumber, { color: '#FFF' }]}>{stats.vibes}</Text>
            <Text style={styles.statLabel}>MOODS</Text>
          </View>
        </View>

        {/* PREFS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <Text style={styles.editAll}>(Tap cards to change)</Text>
        </View>

        <TouchableOpacity style={styles.card} onPress={cycleTaste}>
          <View style={[styles.cardIconBox, { backgroundColor: 'rgba(0, 255, 194, 0.15)' }]}>
             <Ionicons name="restaurant" size={20} color="#00FFC2" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Taste Palette</Text>
            <Text style={styles.cardValue}>{prefs.taste}</Text>
          </View>
          <Ionicons name="swap-horizontal" size={18} color="#444" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={cycleBudget}>
          <View style={[styles.cardIconBox, { backgroundColor: 'rgba(161, 165, 183, 0.15)' }]}>
             <Ionicons name="wallet" size={20} color="#A1A5B7" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Budget Range</Text>
            <Text style={styles.cardValue}>{prefs.budget}</Text>
          </View>
          <Ionicons name="swap-horizontal" size={18} color="#444" />
        </TouchableOpacity>

        {/* ACCOUNT */}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>ACCOUNT SETTINGS</Text>
        <View style={styles.listCard}>
          <TouchableOpacity style={styles.listItem} onPress={() => Alert.alert('Privacy', 'Your data is secured with Supabase Auth.')}>
            <View style={styles.listIconContainer}>
               <Ionicons name="shield-checkmark" size={20} color="#A1A5B7" />
            </View>
            <Text style={styles.listText}>Privacy {"&"} Security</Text>
            <Ionicons name="chevron-forward" size={18} color="#444" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem} onPress={onLogout}>
            <View style={styles.listIconContainer}>
               <Ionicons name="log-out" size={20} color="#FF5A5F" />
            </View>
            <Text style={[styles.listText, { color: '#FF5A5F' }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerAppVersion}>ZIPO v1.1.0 (Live Context)</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D12', // A deeper, richer aesthetic titanium black
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  spacer: {
    width: 44, // Matches the back button width to center the title flexbox properly
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  avatarGlow: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 194, 0.1)',
    shadowColor: '#00FFC2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#0D0D12',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00FFC2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0D0D12',
  },
  nameText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 18,
    letterSpacing: -0.5,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  eliteBadge: {
    backgroundColor: 'rgba(0, 255, 194, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 194, 0.3)',
  },
  eliteText: {
    color: '#00FFC2',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#A1A5B7',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#16161D', // Smooth dark element background
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 18,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
  },
  statLabel: {
    color: '#777',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#777',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  editAll: {
    color: '#00FFC2',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#16161D',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    color: '#A1A5B7',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardValue: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listCard: {
    backgroundColor: '#16161D',
    borderRadius: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  listIconContainer: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  listText: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  footerAppVersion: {
    color: '#333',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 30, // Normal padding since doc is scrolling naturally
  }
});
