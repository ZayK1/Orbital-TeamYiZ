import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";


export default function PlanScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [skill, setSkill] = useState("");
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generatePlan = async () => {
    setError("");
    if (!skill.trim()) {
      setError("Please enter a skill");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/generate-plan", {
        skill_name: skill.trim(),
      });
      setPlan(response.data.plan || []);
    } catch (err) {
      console.error(err);
      setError("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };


  const renderPlanItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>Day {item.day}</Text>
      {item.tasks.map((task, idx) => (
        <Text key={idx} style={styles.taskText}>
          • {task}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.welcome}>Hello, {user.username}!</Text>
        <TouchableOpacity onPress={() => { logout(); navigation.replace("Login"); }}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Enter a skill (e.g., guitar)"
        style={styles.input}
        value={skill}
        onChangeText={setSkill}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={generatePlan}>
        <Text style={styles.buttonText}>Generate Plan</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading && <ActivityIndicator size="large" color="#10B981" />}

      <FlatList
        data={plan}
        keyExtractor={(item) => item.day.toString()}
        renderItem={renderPlanItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F9FAFB",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "600",
  },
  logoutText: {
    color: "#EF4444", 
    fontWeight: "500",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#10B981", 
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    marginBottom: 12,
    textAlign: "center",
  },
  list: {
    paddingTop: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2, 
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  taskText: {
    fontSize: 16,
    marginLeft: 8,
    marginBottom: 4,
  },
});
