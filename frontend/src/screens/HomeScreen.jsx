import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
  Modal,
} from "react-native";
import axios from "axios";
import { colors } from "../constants/colors";
import { Sparkles, Mail, Lock } from 'lucide-react-native';
import { API_BASE_URL } from "../api/apiConfig";
import { useAuth } from "../context/AuthContext";
import { createSkillPlan } from "../api/plans";

export default function HomeScreen({ navigation }) {
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { token } = useAuth();

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
    if (!token) {
      setError("You must be logged in to create a plan.");
      return;
    }

    setLoading(true);
    setIsModalVisible(true);

    try {
      const newPlan = await createSkillPlan(skill.trim(), token);
      
      if (newPlan) {
        navigation.navigate('PlanIndex');
      } else {
        setError("Could not generate a plan. Please check your connection or try a different skill.");
      }
    } catch (err) {
      console.error("API Error:", err.response ? err.response.data : err);
      const errorDetails = err.response?.data?.details || {};
      const errorMessages = Object.values(errorDetails).flat().join(' ');
      const generalMessage = err.response?.data?.error || "Failed to generate plan. Please try again.";
      setError(errorMessages || generalMessage);
    } finally {
      setLoading(false);
      setIsModalVisible(false);
    }
  };

  const loadSamplePlan = () => {
    navigation.navigate('SkillCurriculum', { 
      samplePlan: sampleViolinPlan,
    });
  };

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
          <Sparkles size={32} color={colors.white} strokeWidth={2.5} />
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
        <Text style={[styles.formDescription, { opacity: 0.6 }]}>
          Enter a skill and we'll generate a personalized 30-day learning plan to help you master it. 
        </Text >
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
        <TouchableOpacity
          style={[styles.button, styles.sampleButton]}
          onPress={loadSamplePlan}
        >
          <Text style={[styles.buttonText, styles.sampleButtonText]}>Load Sample Plan</Text>
        </TouchableOpacity>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </Animated.View>

      {!loading && (
        <Animated.View
          style={[
            styles.howItWorksSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
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
      )}

      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.modalText}>Generating your plan...</Text>
            <Text style={styles.modalSubText}>This may take a moment.</Text>
          </View>
        </View>
      </Modal>

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
    paddingTop: 60,
    paddingBottom: 30,
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
  sampleButton: {
    backgroundColor: 'transparent',
    marginTop: 10,
    paddingVertical: 8,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  sampleButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 0,
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
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  activityIndicatorWrapper: {
    backgroundColor: colors.white,
    height: 150,
    width: 250,
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalSubText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
  }
});

const sampleViolinPlan = {
  _id: 'sample-violin-plan',
  title: 'Violin (Sample)',
  progress: 0,
  curriculum: {
    daily_tasks: [
      { "day": 1, "completed": false, "tasks": ["Learn the parts of the violin and bow.", "Practice holding the violin and bow correctly."], "resource": ["ViolinOnline.com - Beginner Basics"] },
      { "day": 2, "completed": false, "tasks": ["Practice open string bowing (G, D, A, E).", "Work on maintaining a straight bow path."], "resource": ["Fiddlerman.com - Free Beginner Lessons"] },
      { "day": 3, "completed": true, "tasks": ["Introduce the first finger on each string (1st position).", "Play simple scales (G major, D major)."], "resource": ["ViolinLab - YouTube Channel"] },
      { "day": 4, "completed": false, "tasks": ["Practice smooth bow changes between strings.", "Work on basic rhythm exercises (quarter and half notes)."], "resource": ["ViolinSchool.com - Free Resources"] },
      { "day": 5, "completed": false, "tasks": ["Learn a simple song using open strings and first finger.", "Focus on intonation (playing in tune)."], "resource": ["8Notes.com - Free Sheet Music"] },
    ]
  }
};
