import React, { useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography, Radius, Spacing } from '../constants/DesignTokens';

const MoodCard = ({ title, emoji, isSelected, onPress }) => {
  const { colors, theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width: '48%', marginBottom: Spacing.l }}
    >
      <Animated.View style={[
        styles.card, 
        { 
          backgroundColor: colors.surface, 
          borderColor: colors.border,
          shadowColor: isSelected ? colors.hero : '#000'
        },
        isSelected && { 
            backgroundColor: colors.hero + '1A', 
            borderColor: colors.hero,
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8 
        },
        { transform: [{ scale }] }
      ]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.title, { color: isSelected ? colors.hero : colors.textPrimary }]}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  emoji: {
    fontSize: 40,
    marginBottom: Spacing.s,
  },
  title: {
    fontFamily: Typography.families.uiBold,
    fontSize: Typography.bodyLarge.fontSize,
    letterSpacing: 0.2,
  }
});

export default MoodCard;
