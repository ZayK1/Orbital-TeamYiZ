import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAllPlans, deleteHabit } from '../api/plans';
import PlanCard from '../components/PlanCard';

const AllHabitsScreen = () => {
  const { token } = useAuth();
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

    if (token) {
      fetchHabits();
    }
  }, [token]);

  const handleDeleteHabit = async (habitId) => {
    try {
      await deleteHabit(habitId, token);
      setHabits((prev) => prev.filter((h) => h._id !== habitId));
    } catch (err) {
      console.error('Delete habit failed', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <PlanCard
      plan={item}
      type="habit"
      onPress={() => {}}
      onDelete={handleDeleteHabit}
    />
  );

  return (
    <View style={styles.container}>
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
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AllHabitsScreen; 