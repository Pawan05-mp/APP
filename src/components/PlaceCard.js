import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Animated, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { interactWithPlace } from '../api';

const PlaceCard = ({ place, index, userId, mood }) => {
  const { _id, name, estimatedMinutes, distanceInKm, reason, category } = place;
  const [isSaved, setIsSaved] = useState(false);
  
  // Animation on mount
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'quickbite': return '🍔';
      case 'chill': return '🥤';
      case 'reset': return '🌿';
      case 'social': return '🎉';
      default: return '📍';
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    interactWithPlace(userId, _id, isSaved ? 'unsave' : 'save', mood);
  };

  const handleNavigate = () => {
    interactWithPlace(userId, _id, 'go', mood);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
    Linking.openURL(url).catch(err => console.error('Error opening Map:', err));
  };

  return (
    <Animated.View style={[
      styles.card,
      { opacity, transform: [{ translateY }] }
    ]}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.emoji}>{getCategoryIcon(category)}</Text>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Ionicons 
            name={isSaved ? "heart" : "heart-outline"} 
            size={24} 
            color={isSaved ? "#FF5A5F" : "#FFF"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.badgeRow}>
        <View style={styles.timeBadge}>
          <Ionicons name="time-outline" size={12} color="#00FFC2" />
          <Text style={styles.timeText}>{estimatedMinutes} min</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Ionicons name="location-outline" size={12} color="#A1A5B7" />
          <Text style={styles.distanceText}>{distanceInKm} km away</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.reasonPill}>
          <Ionicons name="sparkles" size={10} color="#00FFC2" />
          <Text style={styles.reasonText}>{reason}</Text>
        </View>
      </View>

      <Pressable 
        style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
        onPress={handleNavigate}
      >
        <Ionicons name="navigate" size={18} color="#000" />
        <Text style={styles.navBtnText}>Go Now</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
  },
  name: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
  },
  saveBtn: {
    padding: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 194, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 10,
  },
  timeText: {
    color: '#00FFC2',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  distanceText: {
    color: '#A1A5B7',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  body: {
    marginBottom: 20,
  },
  reasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  reasonText: {
    color: '#CBD5E1',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  navBtn: {
    backgroundColor: '#00FFC2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#00FFC2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  navBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  }
});

export default PlaceCard;
