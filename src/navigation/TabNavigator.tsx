import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { MainTabParamList } from "./types";

// Import Screens
import { HomeScreen } from "../screens/Home/HomeScreen";
import { ScannerScreen } from "../screens/Scanner/ScannerScreen";
import { HistoryScreen } from "../screens/History/HistoryScreen";
import { AIAssistantNavigator } from "./AIAssistantNavigator";
import { ProfileScreen } from "../screens/Profile/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

const GREEN = "#0B7A3E";
const GRAY = "#6B7280";

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: GREEN,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 10,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconSize = 26;

          if (route.name === "Home") {
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={iconSize}
                color={color}
              />
            );
          } else if (route.name === "Scan") {
            return (
              <Ionicons
                name={focused ? "scan" : "scan-outline"}
                size={iconSize}
                color={color}
              />
            );
          } else if (route.name === "History") {
            // Document/Clipboard icon
            return (
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                size={iconSize}
                color={color}
              />
            );
          } else if (route.name === "AIAssistant") {
            // Robot/AI icon
            return (
              <MaterialCommunityIcons
                name={focused ? "robot" : "robot-outline"}
                size={iconSize + 2}
                color={color}
              />
            );
          } else if (route.name === "Profile") {
            return (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={iconSize}
                color={color}
              />
            );
          }
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Scan"
        component={ScannerScreen}
        options={{ tabBarLabel: "Scan" }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: "History" }}
      />
      <Tab.Screen
        name="AIAssistant"
        component={AIAssistantNavigator}
        options={{ tabBarLabel: "AI Assistant" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
};
