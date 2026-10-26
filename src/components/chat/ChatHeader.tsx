import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import History from "lucide-react-native/icons/rotate-ccw-clock";
import Leaf from "lucide-react-native/icons/leaf";
import { Theme } from "../../theme";

export type ChatLanguage = "en" | "hi";

interface ChatHeaderProps {
  language: ChatLanguage;
  onLanguageChange: (language: ChatLanguage) => void;
  onHistoryPress: () => void;
  isOnline?: boolean;
}

const LANGUAGES: { value: ChatLanguage; label: string; a11yLabel: string }[] = [
  { value: "en", label: "EN", a11yLabel: "English" },
  { value: "hi", label: "हिं", a11yLabel: "Hindi" },
];

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  language,
  onLanguageChange,
  onHistoryPress,
  isOnline = true,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logo}>
          <Leaf size={20} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.title}>AI Assistant</Text>
          <View style={styles.status}>
            <View style={[styles.dot, !isOnline && styles.dotOffline]} />
            <Text style={styles.statusText}>
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.toggle} accessibilityRole="radiogroup">
          {LANGUAGES.map((l) => {
            const active = l.value === language;
            return (
              <TouchableOpacity
                key={l.value}
                style={[styles.toggleOption, active && styles.toggleActive]}
                onPress={() => onLanguageChange(l.value)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityLabel={l.a11yLabel}
                accessibilityState={{ checked: active }}
              >
                <Text
                  style={[styles.toggleText, active && styles.toggleTextActive]}
                >
                  {l.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.historyBtn}
          onPress={onHistoryPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Chat history"
        >
          <History size={22} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 17,
    color: Theme.colors.text,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  dotOffline: {
    backgroundColor: "#9CA3AF",
  },
  statusText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.muted,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggle: {
    flexDirection: "row",
    padding: 2,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.primaryLight,
  },
  toggleOption: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: Theme.colors.primary,
  },
  toggleText: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 13,
    color: Theme.colors.primary,
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  historyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
