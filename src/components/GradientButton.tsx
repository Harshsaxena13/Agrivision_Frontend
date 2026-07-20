import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, BorderRadius, Spacing } from "../theme";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  style,
  icon,
  fullWidth = false,
}) => {
  const sizeMap = {
    sm: { height: 40, fontSize: Typography.fontSize.sm, px: 16 },
    md: { height: 52, fontSize: Typography.fontSize.base, px: 24 },
    lg: { height: 60, fontSize: Typography.fontSize.md, px: 32 },
  };
  const s = sizeMap[size];
  const isDisabled = disabled || loading;

  if (variant === "outline") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.outlineBtn,
          {
            height: s.height,
            paddingHorizontal: s.px,
            opacity: isDisabled ? 0.5 : 1,
          },
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <Text style={[styles.outlineBtnText, { fontSize: s.fontSize }]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  if (variant === "ghost") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.ghostBtn,
          {
            height: s.height,
            paddingHorizontal: s.px,
            opacity: isDisabled ? 0.5 : 1,
          },
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <Text style={[styles.ghostBtnText, { fontSize: s.fontSize }]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  const gradients = {
    primary: [Colors.secondary, Colors.primaryLight] as [string, string],
    secondary: [Colors.primaryLight, Colors.primary] as [string, string],
    accent: [Colors.accent, Colors.accentLight] as [string, string],
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.btnWrapper,
        fullWidth && styles.fullWidth,
        { opacity: isDisabled ? 0.5 : 1 },
        style,
      ]}
    >
      <LinearGradient
        colors={gradients[variant as "primary" | "secondary" | "accent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, { height: s.height, paddingHorizontal: s.px }]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textOnDark} size="small" />
        ) : (
          <>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <Text style={[styles.btnText, { fontSize: s.fontSize }]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnWrapper: { borderRadius: BorderRadius.lg, overflow: "hidden" },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
  },
  btnText: {
    color: Colors.textOnDark,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
  },
  outlineBtnText: {
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  ghostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostBtnText: {
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  iconWrap: { marginRight: 8 },
  fullWidth: { width: "100%" },
});
