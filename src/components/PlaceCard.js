import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Animated, Linking, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { interactWithPlace } from '../api';

const PlaceCard = ({ place, index, userId, mood, showReplace = false, isReplacing = false, onReplace, isSaved: initialSaved = false }) => {
  const { _id, name, estimatedMinutes, distanceInKm, reason, category } = place;
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  
  // Animation on mount / replacement
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset and re-run entrance animation when the place data changes (replacement swap)
    translateY.setValue(40);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        delay: index * 80,
        useNativeDriver: true,
      })
    ]).start();

    // Reset save state when place changes
    setIsSaved(initialSaved);
    setSaveError(false);
  }, [_id, initialSaved]);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'quickbite': return '🍔';
      case 'chill': return '🥤';
      case 'reset': return '🌿';
      case 'social': return '🎉';
      default: return '📍';
    }
  };

  const handleSave = async () => {
    if (isSaving || !userId) return;
    
    setIsSaving(true);
    setSaveError(false);
    
    try {
      const newSavedState = !isSaved;
      await interactWithPlace(userId, _id, newSavedState ? 'save' : 'unsave', mood);
      setIsSaved(newSavedState);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError(true);
      // Revert UI state on error
      setTimeout(() => setSaveError(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigate = () => {
    if (!userId || !_id) return;
    interactWithPlace(userId, _id, 'go', mood).catch(err => console.error('Navigate log failed:', err));
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
    Linking.openURL(url).catch(err => console.error('Error opening Map:', err));
  };

  const handleNotThis = () => {
    if (!userId || !_id) return;
    // Log the "skip" interaction for learning
    interactWithPlace(userId, _id, 'skip', mood).catch(err => console.error('Skip log failed:', err));
    if (onReplace) onReplace();
  };

  return (
    <Animated.View style={[
      styles.card,
      { opacity, transform: [{ translateY }] },
      isReplacing && styles.cardReplacing
    ]}>
      {isReplacing && (
        <View style={styles.replacingOverlay}>
          <ActivityIndicator size="small" color="#00FFC2" />
          <Text style={styles.replacingText}>Finding alternative...</Text>
        </View>
      )}

      <View style={isReplacing ? styles.contentHidden : undefined}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Text style={styles.emoji}>{getCategoryIcon(category)}</Text>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveBtn, isSaving && styles.saveBtnLoading, saveError && styles.saveBtnError]}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#00FFC2" />
            ) : (
              <Ionicons 
                name={isSaved ? "heart" : "heart-outline"} 
                size={24} 
                color={saveError ? "#FF5A5F" : (isSaved ? "#FF5A5F" : "#FFF")} 
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={12} color="#00FFC2" />
            <Text style={styles.timeText}>{estimatedMinutes <= 5 ? `${estimatedMinutes} min away` : `${estimatedMinutes} min`}</Text>
          </View>
          {place.isLessCrowded && (
            <View style={styles.crowdBadge}>
              <Ionicons name="people-outline" size={12} color="#00FFC2" />
              <Text style={styles.crowdText}>Less crowded</Text>
            </View>
          )}
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

        <View style={styles.actionRow}>
          <Pressable 
            style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
            onPress={handleNavigate}
          >
            <Ionicons name="navigate" size={18} color="#000" />
            <Text style={styles.navBtnText}>Go Now</Text>
          </Pressable>

          {showReplace && (
            <TouchableOpacity 
              style={styles.notThisBtn} 
              onPress={handleNotThis}
              disabled={isReplacing}
              activeOpacity={0.6}
            >
              <Ionicons name="close-circle-outline" size={16} color="#FF5A5F" />
              <Text style={styles.notThisText}>Not this</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  cardReplacing: {
    minHeight: 180,
    justifyContent: 'center',
  },
  replacingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  replacingText: {
    color: '#A1A5B7',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  contentHidden: {
    opacity: 0,
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
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnLoading: {
    opacity: 0.7,
  },
  saveBtnError: {
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
    borderRadius: 16,
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
  crowdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 194, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 10,
  },
  crowdText: {
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
  // ─── Action buttons row ─────────────────────────
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navBtn: {
    flex: 1,
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
  },
  notThisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.2)',
    gap: 4,
  },
  notThisText: {
    color: '#FF5A5F',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default PlaceCard;
