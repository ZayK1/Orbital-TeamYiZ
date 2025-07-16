import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUserStats } from '../api/plans';

const StatsScreenSimple = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getUserStats(token);
      console.log('Stats response:', response);
      
      setStats(response.stats);
    } catch (err) {
      console.error('Stats error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={styles.text}>Loading stats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchStats} style={styles.button}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No stats data available</Text>
        <TouchableOpacity onPress={fetchStats} style={styles.button}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Simple Stats Screen</Text>
      
      {/* Overview Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.text}>Total Skills: {stats.overview?.total_skills || 0}</Text>
        <Text style={styles.text}>Total Habits: {stats.overview?.total_habits || 0}</Text>
        <Text style={styles.text}>Days Active: {stats.overview?.days_active || 0}</Text>
        <Text style={styles.text}>Progress Points: {stats.overview?.total_progress_points || 0}</Text>
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <Text style={styles.text}>Active Skills: {stats.skills?.active_skills || 0}</Text>
        <Text style={styles.text}>Average Completion: {stats.skills?.average_completion || 0}%</Text>
        <Text style={styles.text}>Total Days Completed: {stats.skills?.total_days_completed || 0}</Text>
        <Text style={styles.text}>Completion Trend: {stats.skills?.completion_trend?.length || 0} entries</Text>
      </View>

      {/* Habits Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habits</Text>
        <Text style={styles.text}>Active Habits: {stats.habits?.active_habits || 0}</Text>
        <Text style={styles.text}>Current Streaks: {stats.habits?.current_streaks || 0}</Text>
        <Text style={styles.text}>Consistency Score: {stats.habits?.consistency_score || 0}%</Text>
        <Text style={styles.text}>Weekly Checkins: {stats.habits?.weekly_checkins?.length || 0} entries</Text>
      </View>

      {/* Activity Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Timeline</Text>
        <Text style={styles.text}>Timeline Data: {stats.activity_timeline?.length || 0} entries</Text>
      </View>

      <TouchableOpacity onPress={fetchStats} style={styles.button}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0f172a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StatsScreenSimple;