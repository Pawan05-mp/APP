import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoadingScreen() {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <View style={styles.centerBox}>
        <View style={styles.logoGlowbox}>
          <View style={styles.logoCircle}>
            <Ionicons name="location-sharp" size={46} color="#0D0D12" style={styles.iconShift} />
          </View>
        </View>
        
        <Text style={styles.brandTitle}>Z I P O</Text>
        
        <Text style={styles.subtitle}>
          <Text style={styles.italic}>Where to go,</Text>
          <Text style={styles.bold}> in 10 seconds.</Text>
        </Text>

        <View style={styles.loaderBox}>
          <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
            <View style={styles.dot1} />
            <View style={styles.dot2} />
          </Animated.View>
          <Text style={styles.initText}>O P T I M I Z I N G . . .</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.line} />
        <Text style={styles.versionText}>ZIPO CADI_ENGINE v1.0.42</Text>
        <View style={styles.statusDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D12', // Rich graphite to match the Profile screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoGlowbox: {
    shadowColor: '#00FFC2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 36,
    elevation: 20,
    marginBottom: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00FFC2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#0D0D12',
  },
  iconShift: {
    marginLeft: 2, // Centering fix for standard map pins
  },
  brandTitle: {
    color: '#FFF',
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 16,
  },
  subtitle: {
    color: '#E0E0E0',
    fontSize: 16,
  },
  italic: {
    fontStyle: 'italic',
    fontWeight: '400',
    color: '#A1A5B7',
  },
  bold: {
    fontWeight: '800',
    color: '#FFF',
  },
  loaderBox: {
    marginTop: 64,
    alignItems: 'center',
  },
  spinner: {
    width: 28,
    height: 28,
    marginBottom: 24,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  dot1: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FFC2',
  },
  dot2: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#006B52',
    alignSelf: 'flex-end',
  },
  initText: {
    color: '#555',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  line: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  versionText: {
    color: '#444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FFC2',
    shadowColor: '#00FFC2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  }
});
