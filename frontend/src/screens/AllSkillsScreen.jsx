import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAllPlans } from '../api/plans';
import PlanCard from '../components/PlanCard';

const AllSkillsScreen = () => {
  const { token } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await getAllPlans(token);
        setSkills(data.skills || []);
      } catch (err) {
        console.error('Failed to fetch skills', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSkills();
    }
  }, [token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <PlanCard plan={item} type="skill" onPress={() => {}} onDelete={() => {}} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={skills}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 32 }}>
            You have no skills yet.
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

export default AllSkillsScreen; 