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
import PlanIndexScreen from '../screens/PlanIndexScreen';
import DayDetailScreen from '../screens/DayDetailScreen';

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
                ? 'dashboard'
                : route.name === 'Explore'
                ? 'explore'
                : route.name === 'Stats'
                ? 'insights'
                : 'person';

            const tabColor = isFocused ? '#14B8A6' : '#888';

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: route.name === 'Explore' ? 40 : 0,
                  marginLeft: route.name === 'Stats' ? 40 : 0,
                }}
              >
                <MaterialIcons name={iconName} size={24} color={tabColor} />
                <Text style={{ color: tabColor, fontSize: 11, marginTop: 4 }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </BlurView>
        <TouchableOpacity style={styles.addButton} onPress={toggleMenu}>
          <MaterialIcons name={addMenuVisible ? "close" : "add"} size={32} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.actionButtonContainer}>
        <Animated.View style={[styles.actionButton, { borderColor: '#8B5CF6' }, skillButtonStyle]}>
          <TouchableOpacity onPress={() => navigateAndClose('AddSkill')} style={styles.actionButtonContent}>
            <MaterialIcons name="psychology" size={28} color="#8B5CF6" />
            <Text style={styles.actionButtonLabel}>Skill</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.actionButton, habitButtonStyle]}>
          <TouchableOpacity onPress={() => navigateAndClose('AddHabit')} style={styles.actionButtonContent}>
            <MaterialIcons name="repeat" size={28} color="#14B8A6" />
            <Text style={styles.actionButtonLabel}>Habit</Text>
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
      <Stack.Screen name="SkillDetail" component={PlanIndexScreen} />
      <Stack.Screen name="DayDetail" component={DayDetailScreen} />
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
          <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: 'Discover' }} />
          <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Stats' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
        {!isTabBarVisible && (
          <TouchableOpacity
            onPress={() => setTabBarVisible(true)}
            style={styles.catalogButton}
          >
            <MaterialIcons name="menu" size={28} color="#111827" />
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 60,
    elevation: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  addButton: {
    position: 'absolute',
    top: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  catalogButton: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  actionButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 200,
    alignItems: 'center',
  },
  actionButton: {
    position: 'absolute',
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 70,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  actionButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginTop: 4,
  },
}); 