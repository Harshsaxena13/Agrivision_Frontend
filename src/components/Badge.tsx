import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Typography, BorderRadius, Spacing } from "../theme";

interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "primary" | "muted";
  size?: "sm" | "md";
}

const variantMap = {
  success: {
    bg: Colors.successLight,
    text: Colors.success,
    border: Colors.success,
  },
  warning: {
    bg: Colors.warningLight,
    text: Colors.warning,
    border: Colors.warning,
  },
  danger: {
    bg: Colors.dangerLight,
    text: Colors.danger,
    border: Colors.danger,
  },
  info: { bg: Colors.infoLight, text: Colors.info, border: Colors.info },
  primary: {
    bg: "rgba(124,181,24,0.15)",
    text: Colors.secondary,
    border: Colors.secondary,
  },
  muted: {
    bg: "rgba(255,255,255,0.05)",
    text: Colors.textMuted,
    border: Colors.textMuted,
  },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "primary",
  size = "md",
}) => {
  const v = variantMap[variant];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: v.bg, borderColor: `${v.border}40` },
        size === "sm" && styles.small,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: v.text },
          size === "sm" && styles.smallText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

interface SeverityBadgeProps {
  severity: "Low" | "Medium" | "High" | "Critical";
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const map = {
    Low: "success",
    Medium: "warning",
    High: "danger",
    Critical: "danger",
  } as const;
  const dots = { Low: "●", Medium: "●●", High: "●●●", Critical: "🔴" };
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantMap[map[severity]].bg,
          borderColor: `${variantMap[map[severity]].border}40`,
        },
      ]}
    >
      <Text
        style={{
          color: variantMap[map[severity]].text,
          fontSize: 8,
          marginRight: 4,
        }}
      >
        {dots[severity]}
      </Text>
      <Text style={[styles.text, { color: variantMap[map[severity]].text }]}>
        {severity}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  small: { paddingHorizontal: 8, paddingVertical: 3 },
  smallText: { fontSize: 10 },
});
