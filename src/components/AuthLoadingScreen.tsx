import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const GREEN_PRIMARY = "#0B7A3E";

export const AuthLoadingScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.emoji}>🌱</Text>
    <Text style={styles.title}>AgriVision AI</Text>
    <ActivityIndicator
      size="large"
      color={GREEN_PRIMARY}
      style={styles.spinner}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});
