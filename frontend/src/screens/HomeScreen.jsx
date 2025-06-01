import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
import axios from "axios";
import { colors } from "../constants/colors";

export default function HomeScreen({ navigation }) {
  const [skill, setSkill] = useState("");
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
  }, [fadeAnim, slideAnim]);

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
      setError("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderPlanItem = ({ item }) => (
    <View style={styles.planCard}>
      <Text style={styles.planDay}>Day {item.day}</Text>
      {item.tasks.map((task, idx) => (
        <Text key={idx} style={styles.planTask}>
          • {task}
        </Text>
      ))}
    </View>
  );

  const howItWorksItems = [
    {
      title: "Enter your skill",
      description: "Tell us what skill you want to learn or improve",
    },
    {
      title: "AI generates your plan",
      description: "Our AI creates a personalized 30-day learning plan",
    },
    {
      title: "Follow your daily tasks",
      description: "Complete daily activities and track your progress",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View 
        style={[
          styles.headerSection,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>✨</Text> 
        </View>
        <Text style={styles.mainTitle}>Skill Master</Text>
        <Text style={styles.subtitle}>Your AI-powered skill development assistant</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.inputSection,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Text style={styles.inputLabel}>What skill do you want to master?</Text>
        <Text style={styles.formDescription}>
          Enter a skill and we'll generate a personalized 30-day learning plan to help you master it.
        </Text>
        <View style={styles.skillInputContainer}>
          <TextInput
            placeholder="e.g., Python programming"
            style={styles.input}
            value={skill}
            onChangeText={setSkill}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={generatePlan}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>➔ Generate 30-Day Plan</Text>
          )}
        </TouchableOpacity>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </Animated.View>

      {plan && plan.length > 0 ? (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.sectionTitle}>Your 30-Day Plan</Text>
          <FlatList
            data={plan}
            keyExtractor={(item) => item.day.toString()}
            renderItem={renderPlanItem}
            contentContainerStyle={styles.list}
            scrollEnabled={false}
          />
        </Animated.View>
      ) : (
        !loading && (
          <Animated.View 
            style={[
              styles.howItWorksSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Text style={styles.sectionTitle}>How it works</Text>
            {howItWorksItems.map((item, index) => (
              <View key={index} style={styles.howItWorksItem}>
                <View style={styles.howItWorksIconContainer}>
                  {index === 0 && <Text style={styles.iconPlaceholderText}>🔍</Text>}
                  {index === 1 && <Text style={styles.iconPlaceholderText}>🧠</Text>}
                  {index === 2 && <Text style={styles.iconPlaceholderText}>✔️</Text>}
                </View>
                <View style={styles.howItWorksTextContainer}>
                  <Text style={styles.howItWorksTitle}>{item.title}</Text>
                  <Text style={styles.howItWorksDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  logoText: {
    fontSize: 30,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
  inputSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  skillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 10,
    backgroundColor: colors.gray100,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.gray400,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    color: colors.error,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  howItWorksSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  howItWorksItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  howItWorksIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconPlaceholderText: {
    fontSize: 24,
  },
  howItWorksTextContainer: {
    flex: 1,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  howItWorksDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  list: {
    paddingTop: 10,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  planDay: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  planTask: {
    fontSize: 15,
    color: colors.textSecondary,
    marginLeft: 8,
    marginBottom: 4,
    lineHeight: 22,
  },
});
