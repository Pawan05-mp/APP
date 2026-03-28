import React, { useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';

const MoodCard = ({ title, emoji, isSelected, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width: '48%', marginBottom: 15 }}
    >
      <Animated.View style={[
        styles.card, 
        isSelected && styles.selectedCard,
        { transform: [{ scale }] }
      ]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#333333',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  selectedCard: {
    backgroundColor: '#00332B', // A deep mint hint
    borderColor: '#00FFC2',
    shadowColor: '#00FFC2',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  emoji: {
    fontSize: 42,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});

export default MoodCard;
