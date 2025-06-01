import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, UserCircle2 } from "lucide-react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import PlanIndexScreen from "./src/screens/PlanIndexScreen";
import DayDetailScreen from "./src/screens/DayDetailScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { colors } from "./src/constants/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ProtectedRoute({ navigation, children }) {
  const { user } = useAuth();
  if (!user) {
    navigation.replace("Login");
    return null;
  }
  return children;
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "HomeStack") {
            iconName = focused ? <Home color={colors.primary} /> : <Home color={colors.gray500} />;
          } else if (route.name === "Profile") {
            iconName = focused ? <UserCircle2 color={colors.primary} /> : <UserCircle2 color={colors.gray500} />;
          }
          return iconName;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray300,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="HomeStack" component={HomeStackNavigator} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="PlanIndex" component={PlanIndexScreen} />
      <Stack.Screen name="DayDetail" component={DayDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Main" component={MainTabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

