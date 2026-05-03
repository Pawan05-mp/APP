import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Theme } from '../constants/Theme';

const { width } = Dimensions.get('window');
const BUTTON_WIDTH = (width - 48) / 2;

const MoodButton = ({ mood, label, icon, active, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        active && styles.activeButton
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: BUTTON_WIDTH,
    height: 80,
    backgroundColor: Theme.dark.background.secondary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeButton: {
    backgroundColor: Theme.brand.hero,
    borderColor: Theme.brand.hero,
    borderWidth: 2,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.dark.text.secondary,
  },
  activeLabel: {
    color: Theme.brand.black,
  },
});

export default MoodButton;
