import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider, useAuth } from "./src/context/AuthContext";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";

const Stack = createNativeStackNavigator();

function ProtectedRoute({ navigation, children }) {
  const { user } = useAuth();
  if (!user) {
    navigation.replace("Login");
    return null;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="Home"
            component={(props) => (
              <ProtectedRoute navigation={props.navigation}>
                <HomeScreen {...props} />
              </ProtectedRoute>
            )}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

