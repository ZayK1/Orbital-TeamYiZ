import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors } from '../constants/colors';
import { Sparkles } from 'lucide-react-native';
import { authAPI } from "../api/auth";
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await authAPI.register({ username: name, email, password });
      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      Alert.alert("Success", "Registration complete! Please log in.", [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ]);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      setError('');
    }
  }, [email, password, name]);

  return (
    <LinearGradient colors={['#EDE9FE', '#8B5CF6']} style={styles.background}>
      <Animated.View style={[styles.mascotWrapper, { transform: [{ translateY: bounceAnim }] }]}> 
        <View style={[styles.mascotCircle, { backgroundColor: 'rgba(255,255,255,0.3)' }]}> 
          <Sparkles size={40} color={'white'} strokeWidth={2.5} />
        </View>
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{ width:'100%', alignItems:'center' }}>
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform:[{translateY: slideAnim}] }]}> 
          <Text style={styles.appTitle}>Create Account</Text>
          <Text style={styles.tagline}>Start your learning journey</Text>

          <Input label="Name" placeholder="Enter your name" value={name} onChangeText={setName}/>
          <Input label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry error={error||undefined} />
          {error ? <Text style={styles.errorText}>{error}</Text>:null}

          <Button title="Register" onPress={handleRegister} isLoading={isLoading} disabled={!email.trim()||!password.trim()||!name.trim()} style={styles.primaryButton} />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={()=>navigation.replace('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex:1,
    justifyContent:'flex-start',
    alignItems:'center',
  },
  mascotWrapper:{ marginTop:80, marginBottom:20 },
  mascotCircle:{ width:80,height:80,borderRadius:40,justifyContent:'center',alignItems:'center' },
  card:{ width:'88%', padding:24, borderRadius:32, backgroundColor:colors.white, shadowColor:colors.black, shadowOffset:{width:0,height:6}, shadowOpacity:0.06, shadowRadius:12, elevation:10 },
  appTitle:{ fontSize:28, fontWeight:'800', textAlign:'center', color:colors.text },
  tagline:{ fontSize:16, textAlign:'center', color:colors.textSecondary, marginBottom:24 },
  primaryButton:{ marginTop:12, backgroundColor:colors.secondary },
  loginLink:{ color:colors.secondary, fontWeight:'600' },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: colors.textSecondary,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});