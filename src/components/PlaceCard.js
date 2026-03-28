import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Animated, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PlaceCard = ({ place, index }) => {
  const { name, estimatedMinutes, distanceInKm, reason, category, score } = place;
  
  // Animation on mount
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: index * 100, // Staggered appearance
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

  const handleNavigate = () => {
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
        <View style={styles.timeBadge}>
          <Ionicons name="time-outline" size={12} color="#00FFC2" />
          <Text style={styles.timeText}>{estimatedMinutes} min</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.reasonPill}>
          <Ionicons name="star" size={10} color="#00FFC2" />
          <Text style={styles.reasonText}>{reason}</Text>
        </View>
        <Text style={styles.distanceText}>
          <Ionicons name="location-outline" size={12} color="#A1A5B7" /> {distanceInKm} km away • Walk / 2W
        </Text>
      </View>

      <Pressable 
        style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
        onPress={handleNavigate}
      >
        <Ionicons name="navigate" size={16} color="#000" />
        <Text style={styles.navBtnText}>Go Now</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  emoji: {
    fontSize: 22,
    marginRight: 8,
  },
  name: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 194, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  timeText: {
    color: '#00FFC2',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  body: {
    marginBottom: 16,
  },
  reasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  reasonText: {
    color: '#E2E8F0',
    fontSize: 12,
    marginLeft: 4,
  },
  distanceText: {
    color: '#A1A5B7',
    fontSize: 12,
  },
  navBtn: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  navBtnPressed: {
    backgroundColor: '#00FFC2',
  },
  navBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  }
});

export default PlaceCard;
