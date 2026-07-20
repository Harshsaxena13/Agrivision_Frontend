import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { OnboardingScreen } from "../screens/Onboarding/OnboardingScreen";
import { SignupScreen } from "../screens/Auth/SignupScreen";
import { LoginScreen } from "../screens/Auth/LoginScreen";
import { ScanResultScreen } from "../screens/Scanner/ScanResultScreen";
import { CompareGrowthScreen } from "../screens/History/CompareGrowthScreen";
import { PlantProfileScreen } from "../screens/History/PlantProfileScreen";
import { EditProfileScreen } from "../screens/Profile/EditProfileScreen";
import { SettingsScreen } from "../screens/Profile/SettingsScreen";
import { MyFieldsScreen } from "../screens/Profile/MyFieldsScreen";
import { AchievementsScreen } from "../screens/Profile/AchievementsScreen";
import { TabNavigator } from "./TabNavigator";
import { useAppStore } from "../store/appStore";
import { useAuthStore } from "../store/authStore";

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerShown: false,
  animation: "fade" as const,
  contentStyle: { backgroundColor: "#F9FAFB" },
};

export const AppNavigator: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const hasSeenOnboarding = useAppStore((state) => state.hasSeenOnboarding);

  if (user) {
    return (
      <Stack.Navigator
        key="authenticated"
        screenOptions={screenOptions}
        initialRouteName="Main"
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="ScanResult"
          component={ScanResultScreen}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="CompareGrowth"
          component={CompareGrowthScreen}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="PlantProfile"
          component={PlantProfileScreen}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="MyFields"
          component={MyFieldsScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{ animation: "slide_from_right" }}
        />
      </Stack.Navigator>
    );
  }

  const guestInitialRoute = hasSeenOnboarding ? "Login" : "Onboarding";

  return (
    <Stack.Navigator
      key="guest"
      screenOptions={screenOptions}
      initialRouteName={guestInitialRoute}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};
