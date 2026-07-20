import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { Colors, BorderRadius, Shadows } from "../theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padding?: number;
  noBorder?: boolean;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  padding = 16,
  noBorder = false,
  glow = false,
}) => (
  <View style={[styles.wrapper, glow && Shadows.glow, style]}>
    <BlurView
      intensity={intensity}
      tint="dark"
      style={[styles.blur, { padding }]}
    >
      {!noBorder && <View style={styles.border} pointerEvents="none" />}
      {children}
    </BlurView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    backgroundColor: Colors.surfaceGlass,
  },
  blur: { borderRadius: BorderRadius.xl },
  border: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceGlassBorder,
  },
});
