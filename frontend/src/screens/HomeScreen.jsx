import React, { useState, useEffect, useRef } from "react";
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



export default function HomeScreen({ navigation }) {
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

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
    setIsModalVisible(true);
    try {
      const response = await axios.post("http://192.168.0.116:5000/generate-plan", {
        skill_name: skill.trim(),
      });
      if (response.data.plan && response.data.plan.length > 0) {
        navigation.navigate('PlanIndex', { plan: response.data.plan, skillName: skill.trim() });
      } else {
        setError("Could not generate a plan for this skill. Try a different skill.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
      setIsModalVisible(false);
    }
  };

  const loadSamplePlan = () => {
    setError("");
    setLoading(false);
    navigation.navigate('PlanIndex', { plan: sampleViolinPlan, skillName: "Violin (Sample)" });
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
          style={[styles.button, styles.sampleButton, loading && styles.buttonDisabled]}
          onPress={loadSamplePlan}
          disabled={loading}
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
    opacity: 0.7,
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

const sampleViolinPlan = [
  {
      "day": 1,
      "tasks": ["Learn the parts of the violin and bow.", "Practice holding the violin and bow correctly."],
      "resource": ["ViolinOnline.com - Beginner Basics", "YouTube: Violin Tutorial for Beginners by Violin Tutor"]
  },
  {
      "day": 2,
      "tasks": ["Practice open string bowing (G, D, A, E).", "Work on maintaining a straight bow path."],
      "resource": ["Fiddlerman.com - Free Beginner Lessons", "ToneGym (app for ear training)"]
  },
  {
      "day": 3,
      "tasks": ["Introduce the first finger on each string (1st position).", "Play simple scales (G major, D major)."],
      "resource": ["ViolinLab - YouTube Channel", "MusicTheory.net (free exercises)"]
  },
  {
      "day": 4,
      "tasks": ["Practice smooth bow changes between strings.", "Work on basic rhythm exercises (quarter and half notes)."],
      "resource": ["ViolinSchool.com - Free Resources", "Metronome Online (free web app)"]
  },
  {
      "day": 5,
      "tasks": ["Learn a simple song using open strings and first finger.", "Focus on intonation (playing in tune)."],
      "resource": ["8Notes.com - Free Sheet Music", "Tuner Lite (free tuning app)"]
  },
  {
      "day": 6,
      "tasks": ["Introduce the second finger on each string.", "Play scales with first and second fingers."],
      "resource": ["ViolinMasterClass - YouTube", "ScaleBook (free scale app)"]
  },
  {
      "day": 7,
      "tasks": ["Practice bowing techniques (legato, staccato).", "Play a simple melody using first and second fingers."],
      "resource": ["The Violin Channel - Beginner Tips", "SimplyViolin (free app for beginners)"]
  },
  {
      "day": 8,
      "tasks": ["Introduce the third finger on each string.", "Play scales with first, second, and third fingers."],
      "resource": ["ViolinTutorPro - YouTube", "Intonia (intonation training app)"]
  },
  {
      "day": 9,
      "tasks": ["Work on finger independence exercises.", "Play a simple song using first, second, and third fingers."],
      "resource": ["ViolinSpiration - Free Lessons", "Fret Trainer (fingerboard visualization)"]
  },
  {
      "day": 10,
      "tasks": ["Introduce the fourth finger (pinky) on each string.", "Play full one-octave scales."],
      "resource": ["Red Desert Violin - YouTube", "Perfect Ear (free ear training app)"]
  },
  {
      "day": 11,
      "tasks": ["Practice shifting between first and third positions.", "Work on vibrato exercises."],
      "resource": ["ViolinClass - Free Tutorials", "iReal Pro (play-along app)"]
  },
  {
      "day": 12,
      "tasks": ["Play a song incorporating position shifts.", "Focus on smooth bow control."],
      "resource": ["Musescore.com - Free Sheet Music", "Violin Notes Flash Cards (free app)"]
  },
  {
      "day": 13,
      "tasks": ["Work on double stops (two strings at once).", "Practice scales in thirds."],
      "resource": ["ViolinMastery - YouTube", "TonalEnergy Tuner (app)"]
  },
  {
      "day": 14,
      "tasks": ["Learn a piece with dynamics (crescendo, decrescendo).", "Practice spiccato bowing."],
      "resource": ["IMSLP - Free Classical Sheet Music", "Violin Practice App (free)"]
  },
  {
      "day": 15,
      "tasks": ["Introduce advanced bowing techniques (col legno, sul ponticello).", "Play a challenging scale (three octaves)."],
      "resource": ["Violin Technique Videos - YouTube", "Sight-Reading Factory (free trials)"]
  },
  {
      "day": 16,
      "tasks": ["Work on a concerto or sonata excerpt.", "Practice sight-reading new music."],
      "resource": ["The Strad - Technique Articles", "NewViolinist.com - Free Exercises"]
  },
  {
      "day": 17,
      "tasks": ["Focus on phrasing and musical expression.", "Record yourself and analyze your playing."],
      "resource": ["ViolinTeacher.net - Free Tips", "Audacity (free recording software)"]
  },
  {
      "day": 18,
      "tasks": ["Practice playing in different styles (baroque, jazz, folk).", "Improvise over a simple chord progression."],
      "resource": ["JazzViolinLessons.net - Free Resources", "iWasDoingAllRight (jazz violin YouTube)"]
  },
  {
      "day": 19,
      "tasks": ["Work on a fast passage with clean articulation.", "Practice with a metronome at increasing speeds."],
      "resource": ["ViolinTechnique.com - Free Drills", "Pro Metronome (free app)"]
  },
  {
      "day": 20,
      "tasks": ["Learn a piece with advanced techniques (harmonics, pizzicato).", "Focus on stage presence and performance."],
      "resource": ["ViolinVirtuosity - YouTube", "Virtual Sheet Music (free samples)"]
  },
  {
      "day": 21,
      "tasks": ["Play along with a backing track or ensemble recording.", "Work on memorizing a piece."],
      "resource": ["YouTube - Violin Backing Tracks", "Anki (flashcard app for memorization)"]
  },
  {
      "day": 22,
      "tasks": ["Practice a challenging etude (Kreutzer, Ševčík).", "Focus on left-hand agility."],
      "resource": ["IMSLP - Free Etudes", "ViolinExercises.com - Free PDFs"]
  },
  {
      "day": 23,
      "tasks": ["Work on a duet or chamber music part.", "Practice listening and blending with another player."],
      "resource": ["8Notes - Free Duets", "Discord Violin Jam Groups"]
  },
  {
      "day": 24,
      "tasks": ["Refine vibrato speed and control.", "Practice playing in higher positions (5th, 7th)."],
      "resource": ["ViolinVibrato Masterclass - YouTube", "Fiddler's Fakebook (free folk tunes)"]
  },
  {
      "day": 25,
      "tasks": ["Learn a piece with irregular rhythms (syncopation, polyrhythms).", "Work on bow distribution."],
      "resource": ["Rhythm Trainer (free app)", "ViolinPatterns.com - Free Exercises"]
  },
  {
      "day": 26,
      "tasks": ["Practice performing under pressure (mock audition).", "Work on stage fright techniques."],
      "resource": ["TED Talk: Performance Anxiety", "ViolinPerformanceTips.com"]
  },
  {
      "day": 27,
      "tasks": ["Explore extended techniques (bariolage, ricochet).", "Improvise a cadenza."],
      "resource": ["Contemporary Violin - YouTube", "Impro-Violin (free ebook)"]
  },
  {
      "day": 28,
      "tasks": ["Polish a recital piece with full expression.", "Record a final performance video."],
      "resource": ["Violin Recital Tips - Blog", "Canva (free video editing)"]
  },
  {
      "day": 29,
      "tasks": ["Review all scales and arpeggios.", "Play through favorite pieces for enjoyment."],
      "resource": ["Violin Scale Book PDF - Free", "Spotify - Violin Playlists"]
  },
  {
      "day": 30,
      "tasks": ["Reflect on progress and set new goals.", "Play a fun piece just for joy!"],
      "resource": ["Goal Setting for Musicians - Article", "Violin Jam Tracks - YouTube"]
  }
];
