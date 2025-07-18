import React, { useState, useRef } from 'react';
import {
  View,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Text,
  Pressable,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RepositoryScreen from '../screens/RepositoryScreen';
import ExploreScreen from '../screens/ExploreScreen';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddSkillScreen from '../screens/AddSkillScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import AllSkillsScreen from '../screens/AllSkillsScreen';
import AllHabitsScreen from '../screens/AllHabitsScreen';
import SkillDetailScreen from '../screens/SkillDetailScreen';
import SkillEditScreen from '../screens/SkillEditScreen';
import PlanIndexScreen from '../screens/PlanIndexScreen';
import DayDetailScreen from '../screens/DayDetailScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import MyHabitsScreen from '../screens/MyHabitsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MyTabBar = ({ state, descriptors, navigation, setTabBarVisible }) => {
  const [addMenuVisible, setAddMenuVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = addMenuVisible ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setAddMenuVisible(!addMenuVisible);
  };

  const skillButtonStyle = {
    transform: [
      { scale: animation },
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -60],
        }),
      },
    ],
    opacity: animation,
  };

  const habitButtonStyle = {
    transform: [
      { scale: animation },
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 60],
        }),
      },
    ],
    opacity: animation,
  };

  const navigateAndClose = (screen) => {
    navigation.navigate('RepositoryStack', { screen });
    toggleMenu();
    setTabBarVisible(false);
  };

  return (
    <>
      <View style={styles.tabBarContainer}>
        <BlurView intensity={90} tint="light" style={styles.blurView}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.title !== undefined ? options.title : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              if (addMenuVisible) {
                toggleMenu();
              }
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
              setTabBarVisible(false);
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const iconName =
              route.name === 'RepositoryStack'
                ? 'home'
                : route.name === 'MyHabits'
                ? 'track-changes'
                : route.name === 'Explore'
                ? 'explore'
                : route.name === 'Stats'
                ? 'bar-chart'
                : 'person';

            const tabColor = isFocused ? '#14B8A6' : '#9CA3AF';

            // Skip the middle tab (reserved for add button)
            if (route.name === 'Explore') {
              return <View key={route.key} style={styles.tabSpacer} />;
            }

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
              >
                <View style={[styles.tabIconContainer, isFocused && styles.tabIconContainerActive]}>
                  <MaterialIcons name={iconName} size={22} color={tabColor} />
                </View>
                <Text style={[styles.tabLabel, { color: tabColor }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </BlurView>
        <TouchableOpacity style={styles.addButton} onPress={toggleMenu} activeOpacity={0.8}>
          <View style={styles.addButtonInner}>
            <MaterialIcons name={addMenuVisible ? "close" : "add"} size={28} color="white" />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.actionButtonContainer}>
        <Animated.View style={[styles.actionButton, skillButtonStyle]}>
          <TouchableOpacity onPress={() => navigateAndClose('AddSkill')} style={styles.actionButtonContent} activeOpacity={0.8}>
            <View style={[styles.actionButtonIconBg, { backgroundColor: '#8B5CF6' + '15' }]}>
              <MaterialIcons name="psychology" size={24} color="#8B5CF6" />
            </View>
            <Text style={[styles.actionButtonLabel, { color: '#8B5CF6' }]}>Skill</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.actionButton, habitButtonStyle]}>
          <TouchableOpacity onPress={() => navigateAndClose('AddHabit')} style={styles.actionButtonContent} activeOpacity={0.8}>
            <View style={[styles.actionButtonIconBg, { backgroundColor: '#14B8A6' + '15' }]}>
              <MaterialIcons name="repeat" size={24} color="#14B8A6" />
            </View>
            <Text style={[styles.actionButtonLabel, { color: '#14B8A6' }]}>Habit</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
};

function RepositoryStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Repository" component={RepositoryScreen} />
      <Stack.Screen name="AddSkill" component={AddSkillScreen} />
      <Stack.Screen name="AddHabit" component={AddHabitScreen} />
      <Stack.Screen name="AllSkills" component={AllSkillsScreen} />
      <Stack.Screen name="AllHabits" component={AllHabitsScreen} />
      <Stack.Screen name="MyHabits" component={MyHabitsScreen} />
      <Stack.Screen name="SkillDetail" component={SkillDetailScreen} />
      <Stack.Screen name="SkillEdit" component={SkillEditScreen} />
      <Stack.Screen name="PlanIndex" component={PlanIndexScreen} />
      <Stack.Screen name="DayDetail" component={DayDetailScreen} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
    </Stack.Navigator>
  );
}

export default function MainTabNavigator() {
  const [isTabBarVisible, setTabBarVisible] = useState(false);

  return (
    <Pressable style={{ flex: 1 }} onPress={() => {
      if (isTabBarVisible) {
        setTabBarVisible(false);
      }
    }}>
      <View style={{ flex: 1, position: 'relative' }}>
        <Tab.Navigator
          tabBar={(props) =>
            isTabBarVisible ? (
              <MyTabBar {...props} setTabBarVisible={setTabBarVisible} />
            ) : null
          }
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen name="RepositoryStack" component={RepositoryStackNavigator} options={{ title: 'Home' }} />
          <Tab.Screen name="MyHabits" component={MyHabitsScreen} options={{ title: 'Habits' }} />
          <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: 'Discover' }} />
          <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Stats' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
        {!isTabBarVisible && (
          <TouchableOpacity
            onPress={() => setTabBarVisible(true)}
            style={styles.catalogButton}
            activeOpacity={0.8}
          >
            <MaterialIcons name="apps" size={24} color="#14B8A6" />
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 16,
    right: 16,
    height: 70,
    elevation: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.9)' : 'white',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabSpacer: {
    width: 60,
    height: '100%',
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    top: -12,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  addButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catalogButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 36,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 180 : 160,
    alignItems: 'center',
  },
  actionButton: {
    position: 'absolute',
    left: '50%',
    marginLeft: -45,
    width: 90,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 6,
  },
  actionButtonIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
}); 