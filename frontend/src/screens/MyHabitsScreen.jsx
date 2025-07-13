import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAllPlans } from '../api/plans';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MyHabitsScreen = () => {
  const { token } = useAuth();
  const navigation = useNavigation();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('HabitDetail', { habitId: item._id })}>
      <View style={styles.cardContent}>
        <MaterialIcons name="check-circle" size={24} color={item.color || '#14B8A6'} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.pattern?.frequency || 'Custom'}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
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
});

export default MyHabitsScreen; 