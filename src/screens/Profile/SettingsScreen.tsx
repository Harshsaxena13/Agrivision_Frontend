import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import {
  useSettingsStore,
  Language,
  Units,
  AutoBackup,
} from "../../store/settingsStore";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Settings">;
};

const GREEN = "#0B7A3E";
const GREEN_LIGHT = "#ECFDF5";
const BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const BORDER = "#E5E7EB";

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  showChevron?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
};

const SettingsRow: React.FC<RowProps> = ({
  icon,
  label,
  value,
  showChevron,
  toggle,
  toggleValue,
  onToggle,
  onPress,
  isLast,
}) => {
  const content = (
    <>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={GREEN} />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>

      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: "#D1D5DB", true: GREEN }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#D1D5DB"
        />
      ) : showChevron ? (
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      ) : null}
    </>
  );

  if (toggle) {
    return (
      <View style={[styles.row, !isLast && styles.rowBorder]}>{content}</View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {content}
    </TouchableOpacity>
  );
};

type PickerModalProps<T extends string> = {
  visible: boolean;
  title: string;
  options: T[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

function PickerModal<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: PickerModalProps<T>) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.modalSheet}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((option) => {
            const isSelected = option === selected;
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.modalOption,
                  isSelected && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    isSelected && styles.modalOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={18} color={GREEN} />
                )}
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const settings = useSettingsStore();
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const [picker, setPicker] = useState<"language" | "units" | "backup" | null>(
    null,
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="globe-outline"
            label="Language"
            value={settings.language}
            showChevron
            onPress={() => setPicker("language")}
          />
          <SettingsRow
            icon="resize-outline"
            label="Units"
            value={settings.units}
            showChevron
            onPress={() => setPicker("units")}
          />
          <SettingsRow
            icon="moon-outline"
            label="Dark Mode"
            toggle
            toggleValue={settings.darkMode}
            onToggle={() =>
              Alert.alert(
                "Coming Soon",
                "Dark mode will be available in a future update.",
              )
            }
          />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            toggle
            toggleValue={settings.notifications}
            onToggle={(notifications) => updateSettings({ notifications })}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>Data & Sync</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="cloud-download-outline"
            label="Auto Backup"
            value={settings.autoBackup}
            showChevron
            onPress={() => setPicker("backup")}
          />
          <SettingsRow
            icon="sync-outline"
            label="Sync Over Wi-Fi Only"
            toggle
            toggleValue={settings.syncWifiOnly}
            onToggle={(syncWifiOnly) => updateSettings({ syncWifiOnly })}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>App Preferences</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="sparkles-outline"
            label="AI Suggestions"
            toggle
            toggleValue={settings.aiSuggestions}
            onToggle={(aiSuggestions) => updateSettings({ aiSuggestions })}
          />
          <SettingsRow
            icon="leaf-outline"
            label="Data Saver Mode"
            toggle
            toggleValue={settings.dataSaverMode}
            onToggle={(dataSaverMode) => updateSettings({ dataSaverMode })}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="help-circle-outline"
            label="Help & FAQ"
            showChevron
            onPress={() =>
              Alert.alert(
                "Help & FAQ",
                "Visit our help center at agrivision.ai/help for guides and answers.",
              )
            }
          />
          <SettingsRow
            icon="chatbubble-ellipses-outline"
            label="Contact Support"
            showChevron
            onPress={() =>
              Alert.alert(
                "Contact Support",
                "Email us at support@agrivision.ai and we'll get back to you within 24 hours.",
              )
            }
            isLast
          />
        </View>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} AgriVision AI. All rights reserved.
        </Text>
      </ScrollView>

      <PickerModal<Language>
        visible={picker === "language"}
        title="Language"
        options={["English", "Hindi"]}
        selected={settings.language}
        onSelect={(language) => updateSettings({ language })}
        onClose={() => setPicker(null)}
      />

      <PickerModal<Units>
        visible={picker === "units"}
        title="Units"
        options={["Metric (cm, kg)", "Imperial (ft, lb)"]}
        selected={settings.units}
        onSelect={(units) => updateSettings({ units })}
        onClose={() => setPicker(null)}
      />

      <PickerModal<AutoBackup>
        visible={picker === "backup"}
        title="Auto Backup"
        options={["Daily", "Weekly", "Monthly", "Off"]}
        selected={settings.autoBackup}
        onSelect={(autoBackup) => updateSettings({ autoBackup })}
        onClose={() => setPicker(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerBtn: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_MUTED,
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 4,
  },
  card: {
    backgroundColor: BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 64,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  rowValue: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 3,
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 32,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 34,
    paddingHorizontal: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  modalOptionSelected: {
    backgroundColor: GREEN_LIGHT,
  },
  modalOptionText: {
    fontSize: 16,
    color: TEXT_DARK,
  },
  modalOptionTextSelected: {
    color: GREEN,
    fontWeight: "600",
  },
});
