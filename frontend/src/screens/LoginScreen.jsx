import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/auth';
import { Sparkles, Mail, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login: contextLogin } = useAuth();
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  
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
      })
    ]).start();
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
      const data = await loginUser({ identifier, password });
      contextLogin(data.user);
      navigation.replace('Main');
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
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View 
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.logoContainer}>
          <Sparkles size={32} color={colors.white} strokeWidth={2.5} />
        </View>
        <Text style={styles.title}>Skill Master</Text>
        <Text style={styles.subtitle}>Login to your account</Text>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.formContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Input
          label="Email"
          placeholder="Enter your email"
          value={identifier}
          onChangeText={setIdentifier}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.input}
          icon={<Mail size={20} color={colors.textSecondary} />}
        />
        
        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          containerStyle={styles.input}
          error={localError || undefined}
          icon={<Lock size={20} color={colors.textSecondary} />}
        />
        
        <Button
          title="Login"
          onPress={handleLogin}
          isLoading={isLoading}
          disabled={!identifier.trim() || !password.trim()}
          style={styles.button}
        />
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.footer,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            For demo purposes, any email with a password of 6+ characters will work
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 8,
    width: '100%',
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
  footer: {
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});