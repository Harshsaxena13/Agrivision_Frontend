import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, MainTabParamList } from "../../navigation/types";
import { useAppStore } from "../../store/appStore";

const { width } = Dimensions.get("window");

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, "Home">,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

const GREEN_PRIMARY = "#0B7A3E";
const LIGHT_GREEN = "#EAF5EC";
const LIGHT_BLUE = "#F0F4FA";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scanHistory = useAppStore((state) => state.scanHistory);

  return (
    <View style={styles.container}>
      {/* ── Top Dark Green Background ── */}
      <View style={[styles.headerBackground, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.greetingTitle}>Hello, Farmer 👋</Text>
            <Text style={styles.greetingSub}>Good Morning!</Text>
          </View>
          <TouchableOpacity style={styles.bellIcon}>
            <Ionicons name="notifications-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* ── Overlapping Field Card ── */}
        <View style={styles.fieldCard}>
          <View style={styles.fieldInfo}>
            <TouchableOpacity style={styles.fieldSelector}>
              <Text style={styles.fieldName}>Field A - Wheat</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={TEXT_DARK}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
            <Text style={styles.fieldSub}>Crop Status Overview</Text>
          </View>
          <Image
            source={require("../../../assets/wheat.avif")}
            style={styles.fieldImage}
            resizeMode="contain"
          />
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: "#16A34A" }]}>
              Healthy
            </Text>
            <Text style={[styles.statValue, { color: "#16A34A" }]}>18</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: "#DC2626" }]}>
              Diseased
            </Text>
            <Text style={[styles.statValue, { color: "#DC2626" }]}>3</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: "#2563EB" }]}>
              Avg. Age
            </Text>
            <Text style={[styles.statValue, { color: "#2563EB" }]}>
              34<Text style={styles.statUnit}> Days</Text>
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Risk</Text>
            <Text style={[styles.statValue, { color: "#16A34A" }]}>Low</Text>
          </View>
        </View>

        {/* ── 2x2 Grid Actions ── */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            {/* Scan Plant */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: LIGHT_GREEN }]}
              onPress={() => navigation.navigate("Scan")}
              activeOpacity={0.8}
            >
              <View style={styles.actionHeader}>
                <Text style={styles.actionTitle}>Scan{"\n"}Plant</Text>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="camera-outline"
                    size={24}
                    color={GREEN_PRIMARY}
                  />
                </View>
              </View>
              <Text style={styles.actionDesc}>
                Detect disease & estimate age
              </Text>
            </TouchableOpacity>

            {/* AI Assistant */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: LIGHT_BLUE }]}
              onPress={() => navigation.navigate("AIAssistant")}
              activeOpacity={0.8}
            >
              <View style={styles.actionHeader}>
                <Text style={styles.actionTitle}>AI{"\n"}Assistant</Text>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons
                    name="robot-outline"
                    size={24}
                    color="#2563EB"
                  />
                </View>
              </View>
              <Text style={styles.actionDesc}>
                Ask anything about your crop
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            {/* Growth History */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: LIGHT_GREEN }]}
              onPress={() => navigation.navigate("History")}
              activeOpacity={0.8}
            >
              <View style={styles.actionHeader}>
                <Text style={styles.actionTitle}>Growth{"\n"}History</Text>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={24}
                    color={GREEN_PRIMARY}
                  />
                </View>
              </View>
              <Text style={styles.actionDesc}>
                View past records and trends
              </Text>
            </TouchableOpacity>

            {/* Reports */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: LIGHT_BLUE }]}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <View style={styles.actionHeader}>
                <Text style={styles.actionTitle}>Reports</Text>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color="#2563EB"
                  />
                </View>
              </View>
              <Text style={styles.actionDesc}>Generate and share reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent Scans ── */}
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Scans</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentList}>
          {scanHistory.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                color: TEXT_MUTED,
                paddingVertical: 12,
              }}
            >
              No recent scans found.
            </Text>
          ) : (
            scanHistory.slice(0, 3).map((scan, index) => {
              const status = scan.result.healthStatus || "Unknown";
              const isHealthy = status.toLowerCase() === "healthy";
              const statusColor = isHealthy ? "#16A34A" : "#F59E0B";

              return (
                <View key={scan.id}>
                  <TouchableOpacity
                    style={styles.scanItem}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate("ScanResult", {
                        result: scan.result,
                        imageUri: scan.imageUri,
                      })
                    }
                  >
                    <Image
                      source={{ uri: scan.imageUri }}
                      style={styles.scanImage}
                    />
                    <View style={styles.scanDetails}>
                      <Text style={styles.scanItemTitle}>
                        {scan.result.plantName || "Unknown Plant"}
                      </Text>
                      <Text style={styles.scanItemDate}>{scan.date}</Text>
                    </View>
                    <View style={styles.scanRight}>
                      <Text style={[styles.scanStatus, { color: statusColor }]}>
                        {status}
                      </Text>
                      {scan.result.disease && (
                        <Text style={styles.scanAge}>
                          {scan.result.disease.severity} Severity
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  {index < Math.min(scanHistory.length, 3) - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  headerBackground: {
    backgroundColor: GREEN_PRIMARY,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 60,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
  },
  greetingTitle: { fontSize: 22, fontWeight: "700", color: "#FFF" },
  greetingSub: { fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  bellIcon: { width: 40, height: 40, alignItems: "flex-end" },

  scrollContent: {
    paddingTop: 120, // Overlaps the header
    paddingHorizontal: 20,
  },

  fieldCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  fieldInfo: { flex: 1 },
  fieldSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  fieldName: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  fieldSub: { fontSize: 13, color: TEXT_MUTED },
  fieldImage: { width: 80, height: 80 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statUnit: { fontSize: 12, fontWeight: "600" },

  gridContainer: { marginBottom: 20 },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 6,
    minHeight: 130,
  },
  actionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_DARK,
    lineHeight: 22,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionDesc: { fontSize: 13, color: TEXT_MUTED, lineHeight: 18 },

  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  recentTitle: { fontSize: 18, fontWeight: "700", color: TEXT_DARK },
  seeAll: { fontSize: 14, fontWeight: "600", color: GREEN_PRIMARY },

  recentList: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scanItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  scanImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
  },
  scanDetails: { flex: 1 },
  scanItemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 4,
  },
  scanItemDate: { fontSize: 12, color: TEXT_MUTED },
  scanRight: { alignItems: "flex-end" },
  scanStatus: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  scanAge: { fontSize: 12, color: TEXT_MUTED },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 8 },
});
