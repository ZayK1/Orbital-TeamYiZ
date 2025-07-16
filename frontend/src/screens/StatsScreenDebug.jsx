import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUserStats } from '../api/plans';

const StatsScreenDebug = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching stats with token:', token ? 'Token present' : 'No token');
      
      const response = await getUserStats(token);
      console.log('Full API response:', response);
      
      setRawResponse(response);
      setStats(response.stats);
    } catch (err) {
      console.error('Stats fetch error:', err);
      setError(err.message || 'Failed to fetch stats');
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Stats Debug Screen</Text>
      
      <Text style={styles.sectionTitle}>Raw Response:</Text>
      <Text style={styles.codeText}>{JSON.stringify(rawResponse, null, 2)}</Text>
      
      <Text style={styles.sectionTitle}>Stats Data:</Text>
      <Text style={styles.codeText}>{JSON.stringify(stats, null, 2)}</Text>
      
      <Text style={styles.sectionTitle}>Data Analysis:</Text>
      <Text style={styles.text}>Has stats: {stats ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Has overview: {stats?.overview ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Has skills: {stats?.skills ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Has habits: {stats?.habits ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Has activity_timeline: {stats?.activity_timeline ? 'Yes' : 'No'}</Text>
      
      {stats?.overview && (
        <>
          <Text style={styles.text}>Total skills: {stats.overview.total_skills}</Text>
          <Text style={styles.text}>Total habits: {stats.overview.total_habits}</Text>
          <Text style={styles.text}>Days active: {stats.overview.days_active}</Text>
          <Text style={styles.text}>Progress points: {stats.overview.total_progress_points}</Text>
        </>
      )}
      
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 10,
  },
  codeText: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: 'monospace',
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
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

export default StatsScreenDebug;