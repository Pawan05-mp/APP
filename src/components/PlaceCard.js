import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Animated, Linking, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { interactWithPlace } from '../api';
import { useSavedPlaces } from '../context/SavedPlacesContext';
import { useTheme } from '../context/ThemeContext';
import { Typography, Spacing, Radius, Palette } from '../constants/DesignTokens';
import Analytics from '../utils/Analytics';

const PlaceCard = ({ place, index, userId, mood, showReplace = false, isReplacing = false, onReplace }) => {
  const { _id, name, estimatedMinutes, distanceInKm, reason, category, image_url, trustTag } = place;
  const { toggleSave, isSaved: checkIsSaved } = useSavedPlaces();
  const { colors, theme } = useTheme();
  
  const isSaved = checkIsSaved(_id || place.id);
  const [isSaving, setIsSaving] = useState(false);

  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, tension: 50, friction: 8, delay: index * 100, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true })
    ]).start();
  }, [_id]);

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const newSavedState = !isSaved;
      await interactWithPlace(userId, _id || place.id, newSavedState ? 'save' : 'unsave', mood);
      toggleSave(place);
      Analytics.logEvent(userId, 'place_save', { placeId: _id || place.id, mood, saved: newSavedState });
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigate = () => {
    Analytics.logEvent(userId, 'place_go', { placeId: _id, mood });
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
    Linking.openURL(url);
  };

  return (
    <Animated.View style={[
      styles.card, 
      { opacity, transform: [{ translateY }], backgroundColor: colors.surface, borderColor: colors.border }
    ]}>
      <Image 
        source={{ uri: image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80' }} 
        style={styles.image}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {trustTag && (
              <View style={[styles.trustBadge, { backgroundColor: colors.hero }]}>
                <Text style={[styles.trustBadgeText, { color: colors.heroContrast }]}>{trustTag}</Text>
              </View>
            )}
            <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{name}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.category, { color: colors.hero }]}>{category.toUpperCase()}</Text>
              <View style={[styles.dot, { backgroundColor: colors.border }]} />
              <Text style={[styles.distance, { color: colors.textSecondary }]}>{distanceInKm} km away</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Ionicons name={isSaved ? "heart" : "heart-outline"} size={24} color={isSaved ? Palette.coral : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.reasonBox, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="sparkles" size={14} color={colors.hero} />
          <Text style={[styles.reasonText, { color: colors.textSecondary }]}>{reason}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.goBtn, { backgroundColor: colors.hero }]}
          onPress={handleNavigate}
          activeOpacity={0.8}
        >
          <Text style={[styles.goBtnText, { color: colors.heroContrast }]}>Get Directions</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.heroContrast} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    marginBottom: Spacing.xxl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#222',
  },
  content: {
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.m,
  },
  name: {
    fontFamily: Typography.families.heading,
    fontSize: Typography.h3.fontSize,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontFamily: Typography.families.uiBold,
    fontSize: Typography.caption.fontSize,
    letterSpacing: 1,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  distance: {
    fontFamily: Typography.families.uiMedium,
    fontSize: Typography.caption.fontSize,
  },
  saveBtn: {
    padding: 4,
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
    borderRadius: Radius.medium,
    marginBottom: Spacing.l,
  },
  reasonText: {
    fontFamily: Typography.families.uiMedium,
    fontSize: Typography.body.fontSize,
    marginLeft: 8,
    flex: 1,
  },
  trustBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.small,
    marginBottom: 6,
  },
  trustBadgeText: {
    fontFamily: Typography.families.uiBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  goBtn: {
    height: 52,
    borderRadius: Radius.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.s,
  },
  goBtnText: {
    fontFamily: Typography.families.uiBold,
    fontSize: Typography.button.fontSize,
    marginRight: 8,
  }
});

export default PlaceCard;
