import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import { Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login: contextLogin } = useAuth();
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(40)).current;
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -6, duration: 1500, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    setLocalError('');
    setIsLoading(true);
    if (!identifier.trim() || !password.trim()) {
      setLocalError("Both fields are required");
      setIsLoading(false);
      return;
    }
    try {
      const result = await authAPI.login({ identifier, password });
      if (result.success) {
        const loginSuccess = await contextLogin(result.data.user, result.data.token);
        if (!loginSuccess) {
          setLocalError('Failed to store login data');
        }
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || "Login failed. Please check your credentials.";
      setLocalError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localError) {
      setLocalError('');
    }
  }, [identifier, password]);

  return (
    <LinearGradient colors={['#CCFBF1', '#14B8A6']} style={styles.background}>
      {/* mascot */}
      <Animated.View style={[styles.mascotWrapper, { transform: [{ translateY: bounceAnim }] }]}>
        <View style={styles.mascotCircle}>
          <Sparkles size={40} color={'white'} strokeWidth={2.5} />
        </View>
      </Animated.View>

      {/* Form */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ width: '100%', alignItems: 'center' }}
      >
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.appTitle}>YiZ Planner</Text>
          <Text style={styles.tagline}>Login to continue</Text>

          <Input
            label="Email"
            placeholder="Enter your email"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={localError || undefined}
          />

          <Button
            title="Login"
            onPress={handleLogin}
            isLoading={isLoading}
            disabled={!identifier.trim() || !password.trim()}
            style={styles.primaryButton}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  mascotWrapper: {
    marginTop: 80,
    marginBottom: 20,
  },
  mascotCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '88%',
    padding: 24,
    borderRadius: 32,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 24,
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  registerLink: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});