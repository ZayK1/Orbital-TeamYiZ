import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAllPlans, deleteHabit } from '../api/plans';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MyHabitsScreen = () => {
  const { token } = useAuth();
  const navigation = useNavigation();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const data = await getAllPlans(token);
        setHabits(data.habits || []);
      } catch (err) {
        console.error('Failed to fetch habits', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchHabits();
  }, [token]);

  const handleDelete = async (habitId) => {
    setError(null);
    setDeletingId(habitId);
    try {
      await deleteHabit(habitId, token);
      setHabits((prev) => prev.filter((h) => h._id !== habitId));
    } catch (err) {
      setError('Failed to delete habit.');
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (habitId, title) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(habitId) },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('RepositoryStack', { screen: 'HabitDetail', params: { habitId: item._id } })}>
        <View style={styles.cardContent}>
          <MaterialIcons name="check-circle" size={24} color={item.color || '#14B8A6'} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.pattern?.frequency || 'Custom'}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('RepositoryStack', { screen: 'HabitDetail', params: { habitId: item._id } })}
        >
          <MaterialIcons name="edit" size={22} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item._id, item.title)}
          disabled={deletingId === item._id}
        >
          {deletingId === item._id ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <MaterialIcons name="delete" size={22} color="#EF4444" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Habits</Text>
      {error && <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 8 }}>{error}</Text>}
      <FlatList
        data={habits}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 32 }}>
            You have no habits yet.
          </Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginTop: 32, marginBottom: 16 },
  card: { backgroundColor: 'white', borderRadius: 12, marginHorizontal: 16, marginVertical: 8, padding: 16, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actionButtons: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  editButton: { padding: 6, marginRight: 2 },
  deleteButton: { padding: 6 },
});

export default MyHabitsScreen; 