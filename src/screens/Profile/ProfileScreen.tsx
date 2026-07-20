import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

const GREEN = "#0B7A3E";
const GREEN_LIGHT = "#DCFCE7";
const BG = "#F9FAFB";
const CARD = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const RED = "#DC2626";
const RED_LIGHT = "#FEE2E2";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const { user, scanHistory, chatHistory } = useAppStore();
  const signOut = useAuthStore((s) => s.signOut);
  const navigation = useNavigation<NavProp>();
  const [signingOut, setSigningOut] = React.useState(false);

  // Derived stats
  const totalScans = user?.totalScans ?? scanHistory.length;
  const healthyScans = scanHistory.filter(
    (s) => s.result.healthStatus === "Healthy",
  ).length;
  const diseasedScans =
    user?.diseasesDetected ??
    scanHistory.filter((s) => s.result.disease).length;
  const avgHealth =
    scanHistory.length > 0
      ? Math.round(
        scanHistory.reduce((sum, s) => sum + s.result.overallScore, 0) /
        scanHistory.length,
      )
      : 0;

  const MENU_ITEMS = [
    {
      icon: "home-outline" as const,
      iconLib: "ionicons" as const,
      label: "My Fields",
      sub: "Manage your fields and plants",
      onPress: () => navigation.navigate("MyFields"),
    },
    {
      icon: "leaf-outline" as const,
      iconLib: "ionicons" as const,
      label: "Plant Profiles",
      sub: "View all your plant digital twins",
      onPress: () => navigation.navigate("PlantProfile"),
    },
    {
      icon: "trending-up-outline" as const,
      iconLib: "ionicons" as const,
      label: "Growth Timeline",
      sub: "Track growth over time",
      onPress: () => navigation.navigate("CompareGrowth"),
    },
    {
      icon: "trophy-outline" as const,
      iconLib: "ionicons" as const,
      label: "Achievements",
      sub: "Badges and milestones",
      onPress: () => navigation.navigate("Achievements"),
    },
    {
      icon: "document-text-outline" as const,
      iconLib: "ionicons" as const,
      label: "Reports",
      sub: "View and export reports",
      onPress: () => Alert.alert("Coming Soon", "Reports feature coming soon."),
    },
    {
      icon: "chatbubble-ellipses-outline" as const,
      iconLib: "ionicons" as const,
      label: "AI Assistant History",
      sub: "View your chat history",
      onPress: () =>
        navigation.navigate("Main", {
          screen: "AIAssistant",
          params: { screen: "AIChatHistory" },
        }),
    },
    {
      icon: "settings-outline" as const,
      iconLib: "ionicons" as const,
      label: "Settings",
      sub: "App preferences and more",
      onPress: () => navigation.navigate("Settings"),
    },
  ];

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setSigningOut(true);
            await signOut();
          } catch {
            Alert.alert("Error", "Unable to sign out. Please try again.");
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={22} color={GREEN} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Avatar + Name ── */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              {user?.avatarUri ? (
                <Image
                  source={{ uri: user.avatarUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarEmoji}>👨‍🌾</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.editBadge}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Ionicons name="pencil" size={12} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || "Farmer"}</Text>

          <View style={styles.rolePill}>
            <Text style={styles.roleText}>
              {user?.cropType ? `${user.cropType} Farmer` : "Farmer"}
            </Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={15} color={TEXT_MUTED} />
            <Text style={styles.locationText}>
              {user?.location || "Location not set"}
            </Text>
          </View>
        </View>

        {/* ── Stats Grid ── */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Scans</Text>
            <Text style={[styles.statValue, { color: TEXT_DARK }]}>
              {totalScans}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Healthy</Text>
            <Text style={[styles.statValue, { color: GREEN }]}>
              {healthyScans}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Diseased</Text>
            <Text style={[styles.statValue, { color: RED }]}>
              {diseasedScans}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg. Health</Text>
            <Text style={[styles.statValue, { color: GREEN }]}>
              {avgHealth > 0 ? `${avgHealth}%` : "—"}
            </Text>
          </View>
        </View>

        {/* ── Menu List ── */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={20} color={TEXT_DARK} />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
              {i < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutRow}
          onPress={handleLogout}
          activeOpacity={0.7}
          disabled={signingOut}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={RED}
            style={{ marginRight: 10 }}
          />
          <Text style={styles.logoutText}>
            {signingOut ? "Logging out..." : "Logout"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: BG,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: TEXT_DARK },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 60 },

  // Avatar + profile
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarWrap: { position: "relative", marginBottom: 14 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: GREEN,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarEmoji: { fontSize: 48 },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  rolePill: {
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  roleText: { fontSize: 13, fontWeight: "600", color: GREEN },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: { fontSize: 14, color: TEXT_MUTED, fontWeight: "500" },

  // Stats
  statsCard: {
    flexDirection: "row",
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginBottom: 6,
    fontWeight: "500",
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statDivider: { width: 1, backgroundColor: BORDER, marginVertical: 6 },

  // Menu
  menuCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "600", color: TEXT_DARK },
  menuSub: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  menuDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginLeft: 68,
  },

  // Logout
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: RED_LIGHT,
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: RED },
});
