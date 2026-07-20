import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthBootstrap } from './src/components/AuthBootstrap';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthBootstrap>
          <NavigationContainer>
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </AuthBootstrap>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
