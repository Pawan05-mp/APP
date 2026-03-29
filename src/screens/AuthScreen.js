import React, { useState } from 'react';
import { supabase } from '../supabase';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSumbit = async () => {
    setAuthError(null);

    // Validate empty states
    if (!email.trim() || !password) {
      setAuthError('Please fill out all fields.');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;
        onLogin(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;
        // Supabase sends a confirmation email by default unless configured otherwise.
        if (data?.user && data.session) {
          onLogin(data.user);
        } else {
          setAuthError('Sign up successful! Please check your email for verification.');
        }
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.heroSection}>
            <View style={styles.logoGlowbox}>
              <View style={styles.logoCircle}>
                <Ionicons name="location-sharp" size={42} color="#0D0D12" style={{ marginLeft: 2 }} />
              </View>
            </View>
            <Text style={styles.brandTitle}>Z I P O</Text>
            <Text style={styles.subtitle}>{isLogin ? 'Welcome back, Explorer.' : 'Join the journey.'}</Text>
          </View>

          <View style={styles.formSection}>
            {authError && (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={16} color="#FF5A5F" />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            <View style={styles.inputBox}>
              <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Email Address"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputBox}>
              <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {isLogin && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.submitBtn, (!email || !password || isLoading) && styles.submitBtnDisabled]} 
              onPress={handleSumbit}
              disabled={!email || !password || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#0D0D12" />
              ) : (
                <>
                  <Text style={styles.submitText}>{isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#0D0D12" />
                </>
              )}
            </TouchableOpacity>

          </View>

          <View style={styles.toggleSection}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already an explorer? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleLink}>{isLogin ? 'Sign Up' : 'Log In'}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D12',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoGlowbox: {
    shadowColor: '#00FFC2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 16,
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00FFC2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0D0D12',
  },
  brandTitle: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    color: '#A1A5B7',
    fontSize: 16,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 95, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF5A5F',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  formSection: {
    marginBottom: 32,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161D',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    height: '100%',
  },
  eyeBtn: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotText: {
    color: '#A1A5B7',
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#00FFC2',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#00FFC2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#2A303C',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: '#0D0D12',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginRight: 8,
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  toggleText: {
    color: '#A1A5B7',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleLink: {
    color: '#00FFC2',
    fontSize: 14,
    fontWeight: '800',
  }
});
