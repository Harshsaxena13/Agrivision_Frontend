import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AIAssistantStackParamList } from "./types";
import { AIAssistantScreen } from "../screens/AIAssistant/AIAssistantScreen";
import { AIChatHistoryScreen } from "../screens/AIAssistant/AIChatHistoryScreen";

const Stack = createNativeStackNavigator<AIAssistantStackParamList>();

export const AIAssistantNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AIChat" component={AIAssistantScreen} />
      <Stack.Screen
        name="AIChatHistory"
        component={AIChatHistoryScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
};
