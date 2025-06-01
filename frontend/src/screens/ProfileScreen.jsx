import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LogOut, UserCircle2 } from 'lucide-react-native';
import { colors } from '../constants/colors'; 
import { useAuth } from '../context/AuthContext'; 

export default function ProfileScreen({ navigation }) {
  const { user, logout: contextLogout } = useAuth(); 

  const handleLogout = () => {
    contextLogout(); 
    navigation.navigate('Login'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Profile</Text>
        
        <View style={styles.profileIconContainer}>
          <UserCircle2 size={80} color={colors.primary} strokeWidth={1.5} />
          <Text style={styles.userName}>{user?.username || 'User Name'}</Text> 
          <Text style={styles.userEmail}>{user?.email || 'user.email@example.com'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Plan</Text>
          <View style={styles.noPlanContainer}>
            <LogOut size={40} color={colors.gray500} strokeWidth={1.5}/> 
            <Text style={styles.noPlanText}>No active plan</Text>
            <Text style={styles.noPlanSubText}>Create a new skill plan from the home screen</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={22} color={colors.error} strokeWidth={2} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20, 
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 30,
    textAlign: 'left',
  },
  profileIconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noPlanContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noPlanText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
  },
  noPlanSubText: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 5,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error,
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
}); 