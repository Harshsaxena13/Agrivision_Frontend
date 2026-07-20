import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainTabParamList, RootStackParamList } from "../../navigation/types";

const { width } = Dimensions.get("window");

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, "History">,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

const GREEN_PRIMARY = "#0B7A3E";
const GREEN_LIGHT = "#BBF7D0";
const GREEN_DARK = "#065F46";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const BG_COLOR = "#F9FAFB";
const CARD_BG = "#FFFFFF";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";

interface TimelineEntry {
  id: string;
  dateLabel: string;
  dateShort: string;
  fullDate: string;
  age: string;
  ageDays: number;
  score: number;
  status: string;
  statusColor: string;
  growthStage: string;
  stageEmoji: string;
  heightCm: number;
  leafCount: number;
  image: string;
  notes: string;
  isToday?: boolean;
}

const TIMELINE_DATA: TimelineEntry[] = [
  {
    id: "1",
    dateLabel: "Today",
    dateShort: "5 Jun",
    fullDate: "5 Jun 2024",
    age: "34 Days",
    ageDays: 34,
    score: 92,
    status: "Leaf Blight (25%)",
    statusColor: WARNING,
    growthStage: "Vegetative",
    stageEmoji: "🌿",
    heightCm: 48,
    leafCount: 14,
    image:
      "https://cdn.prod.website-files.com/66604a97df59732aab43fcc8/66c8a2e110b96c8d60ce5a02_wheat.webp",
    notes: "Mild leaf blight detected on outer leaves. Applied neem oil spray.",
    isToday: true,
  },
  {
    id: "2",
    dateLabel: "",
    dateShort: "20 May",
    fullDate: "20 May 2024",
    age: "20 Days",
    ageDays: 20,
    score: 96,
    status: "Healthy",
    statusColor: GREEN_PRIMARY,
    growthStage: "Seedling",
    stageEmoji: "🌱",
    heightCm: 28,
    leafCount: 8,
    image:
      "https://cdn.shopify.com/s/files/1/0550/9401/8125/files/Wheat_crop.png?v=1772449880",
    notes: "Excellent growth. Fertilizer applied as scheduled.",
  },
  {
    id: "3",
    dateLabel: "",
    dateShort: "10 May",
    fullDate: "10 May 2024",
    age: "10 Days",
    ageDays: 10,
    score: 98,
    status: "Healthy",
    statusColor: GREEN_PRIMARY,
    growthStage: "Germination",
    stageEmoji: "🌾",
    heightCm: 12,
    leafCount: 4,
    image:
      "https://prairiecalifornian.com/wp-content/uploads/2015/06/Crops-2015-4.jpg",
    notes: "Strong germination. Root system developing well.",
  },
  {
    id: "4",
    dateLabel: "",
    dateShort: "1 May",
    fullDate: "1 May 2024",
    age: "Day 1",
    ageDays: 1,
    score: 100,
    status: "Healthy",
    statusColor: GREEN_PRIMARY,
    growthStage: "Sowing",
    stageEmoji: "🌰",
    heightCm: 2,
    leafCount: 0,
    image:
      "https://prairiecalifornian.com/wp-content/uploads/2015/06/Crops-2014-original-8.jpg",
    notes: "Seeds sown in prepared soil. Initial watering done.",
  },
];

const FILTER_TABS = ["All", "Healthy", "Issues"];

// Collapsible timeline item
const TimelineItem: React.FC<{
  item: TimelineEntry;
  isLast: boolean;
  onCompare: () => void;
}> = ({ item, isLast, onCompare }) => {
  const [expanded, setExpanded] = useState(false);
  const animHeight = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    if (!expanded) {
      setExpanded(true);
      Animated.parallel([
        Animated.spring(animHeight, {
          toValue: 1,
          useNativeDriver: false,
          friction: 8,
        }),
        Animated.timing(animOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(animOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start(() => setExpanded(false));
    }
  };

  const maxH = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  const scoreColor =
    item.score >= 90 ? GREEN_PRIMARY : item.score >= 75 ? WARNING : DANGER;

  return (
    <View style={tlStyles.wrapper}>
      {/* ── Left rail ── */}
      <View style={tlStyles.rail}>
        <View
          style={[
            tlStyles.dot,
            item.isToday && tlStyles.dotToday,
            { borderColor: item.statusColor },
          ]}
        />
        {!isLast && <View style={tlStyles.connector} />}
      </View>

      {/* ── Card ── */}
      <View style={tlStyles.cardOuter}>
        {/* Date chip */}
        {item.isToday ? (
          <View style={tlStyles.todayChip}>
            <Text style={tlStyles.todayChipText}>Today · {item.fullDate}</Text>
          </View>
        ) : (
          <Text style={tlStyles.dateLabel}>{item.fullDate}</Text>
        )}

        <TouchableOpacity
          style={tlStyles.card}
          activeOpacity={0.92}
          onPress={toggle}
        >
          {/* Top row: image + details */}
          <View style={tlStyles.topRow}>
            <Image source={{ uri: item.image }} style={tlStyles.thumb} />

            <View style={tlStyles.details}>
              {/* Stage badge */}
              <View
                style={[
                  tlStyles.stageBadge,
                  { backgroundColor: item.statusColor + "1A" },
                ]}
              >
                <Text style={tlStyles.stageEmoji}>{item.stageEmoji}</Text>
                <Text style={[tlStyles.stageText, { color: item.statusColor }]}>
                  {item.growthStage}
                </Text>
              </View>

              <Text style={tlStyles.ageText}>{item.age}</Text>

              {/* Health bar */}
              <View style={tlStyles.scoreRow}>
                <Text style={tlStyles.scoreLabel}>Health</Text>
                <View style={tlStyles.barTrack}>
                  <View
                    style={[
                      tlStyles.barFill,
                      {
                        width: `${item.score}%` as any,
                        backgroundColor: scoreColor,
                      },
                    ]}
                  />
                </View>
                <Text style={[tlStyles.scoreNum, { color: scoreColor }]}>
                  {item.score}
                </Text>
              </View>

              {/* Status */}
              <Text
                style={[tlStyles.statusText, { color: item.statusColor }]}
                numberOfLines={1}
              >
                {item.status}
              </Text>
            </View>

            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={TEXT_MUTED}
              style={{ marginTop: 4 }}
            />
          </View>

          {/* Expanded panel */}
          {expanded && (
            <Animated.View
              style={[
                tlStyles.expandPanel,
                { maxHeight: maxH, opacity: animOpacity },
              ]}
            >
              <View style={tlStyles.divider} />

              {/* Metrics row */}
              <View style={tlStyles.metricsRow}>
                <View style={tlStyles.metricBox}>
                  <MaterialCommunityIcons
                    name="ruler"
                    size={18}
                    color={GREEN_PRIMARY}
                  />
                  <Text style={tlStyles.metricVal}>{item.heightCm} cm</Text>
                  <Text style={tlStyles.metricLbl}>Height</Text>
                </View>
                <View style={tlStyles.metricBox}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={18}
                    color={GREEN_PRIMARY}
                  />
                  <Text style={tlStyles.metricVal}>{item.leafCount}</Text>
                  <Text style={tlStyles.metricLbl}>Leaves</Text>
                </View>
                <View style={tlStyles.metricBox}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={GREEN_PRIMARY}
                  />
                  <Text style={tlStyles.metricVal}>{item.ageDays}d</Text>
                  <Text style={tlStyles.metricLbl}>Age</Text>
                </View>
              </View>

              {/* Note */}
              <View style={tlStyles.noteBox}>
                <Ionicons
                  name="document-text-outline"
                  size={14}
                  color={TEXT_MUTED}
                />
                <Text style={tlStyles.noteText}>{item.notes}</Text>
              </View>

              {/* Compare button */}
              <TouchableOpacity
                style={tlStyles.compareBtn}
                activeOpacity={0.8}
                onPress={onCompare}
              >
                <Ionicons name="git-compare-outline" size={15} color="#FFF" />
                <Text style={tlStyles.compareBtnText}>Compare with latest</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────────────
export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = TIMELINE_DATA.filter((item) => {
    if (activeFilter === "Healthy") return item.status === "Healthy";
    if (activeFilter === "Issues") return item.status !== "Healthy";
    return true;
  });

  // Avg health score
  const avgScore = Math.round(
    TIMELINE_DATA.reduce((s, i) => s + i.score, 0) / TIMELINE_DATA.length,
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Growth Timeline</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("CompareGrowth")}
          style={[styles.iconBtn, styles.compareIconBtn]}
        >
          <Ionicons
            name="git-compare-outline"
            size={22}
            color={GREEN_PRIMARY}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Summary banner ── */}
        <View style={styles.summaryBanner}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryTitle}>Wheat Plant #12</Text>
            <Text style={styles.summarySubtitle}>
              North Field · Sown 1 May 2024
            </Text>
            <View style={styles.avgRow}>
              <Ionicons name="heart" size={13} color={GREEN_PRIMARY} />
              <Text style={styles.avgText}>Avg Health: {avgScore}/100</Text>
            </View>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.scanCount}>{TIMELINE_DATA.length}</Text>
            <Text style={styles.scanLabel}>Scans</Text>
          </View>
        </View>

        {/* ── Photo growth strip ── */}
        <View style={styles.stripSection}>
          <Text style={styles.sectionTitle}>Growth Progression</Text>
          <FlatList
            data={[...TIMELINE_DATA].reverse()}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => "strip-" + item.id}
            contentContainerStyle={styles.stripList}
            renderItem={({ item, index }) => (
              <View style={styles.stripItem}>
                <Image source={{ uri: item.image }} style={styles.stripImage} />
                {index < TIMELINE_DATA.length - 1 && (
                  <View style={styles.stripArrow}>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={GREEN_LIGHT}
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.stripDot,
                    { backgroundColor: item.statusColor },
                  ]}
                />
                <Text style={styles.stripDate}>{item.dateShort}</Text>
                <Text style={styles.stripAge}>{item.ageDays}d</Text>
              </View>
            )}
          />
        </View>

        {/* ── Height growth bar ── */}
        <View style={styles.heightCard}>
          <Text style={styles.heightTitle}>📏 Height Growth</Text>
          <View style={styles.heightBars}>
            {[...TIMELINE_DATA].reverse().map((item) => {
              const maxH = 48;
              const barH = Math.max(8, (item.heightCm / maxH) * 80);
              return (
                <View key={"bar-" + item.id} style={styles.heightBarCol}>
                  <Text style={styles.heightBarVal}>{item.heightCm}cm</Text>
                  <View style={styles.heightBarTrack}>
                    <View
                      style={[
                        styles.heightBarFill,
                        {
                          height: barH,
                          backgroundColor:
                            item.heightCm === maxH
                              ? GREEN_PRIMARY
                              : GREEN_LIGHT,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.heightBarDate}>{item.dateShort}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Filters ── */}
        <View style={styles.filterRow}>
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                activeFilter === tab && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === tab && styles.filterTabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Timeline ── */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Scan History</Text>
          {filtered.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              isLast={index === filtered.length - 1}
              onCompare={() => navigation.navigate("CompareGrowth")}
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Timeline item styles ─────────────────────────────────────────────────────
const tlStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    marginBottom: 4,
  },
  rail: {
    width: 28,
    alignItems: "center",
    paddingTop: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFF",
    borderWidth: 2.5,
    zIndex: 2,
  },
  dotToday: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: GREEN_PRIMARY,
    borderColor: GREEN_PRIMARY,
  },
  connector: {
    flex: 1,
    width: 2,
    backgroundColor: GREEN_LIGHT,
    marginTop: 4,
    marginBottom: -4,
  },
  cardOuter: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 20,
  },
  todayChip: {
    alignSelf: "flex-start",
    backgroundColor: GREEN_PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  todayChipText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  dateLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "500",
    marginBottom: 8,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  stageBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 5,
  },
  stageEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  stageText: {
    fontSize: 11,
    fontWeight: "700",
  },
  ageText: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    width: 38,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    marginHorizontal: 6,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  scoreNum: {
    fontSize: 12,
    fontWeight: "700",
    width: 24,
    textAlign: "right",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Expanded panel
  expandPanel: {
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  metricBox: {
    alignItems: "center",
  },
  metricVal: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
    marginTop: 4,
  },
  metricLbl: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  noteBox: {
    flexDirection: "row",
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 12,
    color: TEXT_DARK,
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  compareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN_PRIMARY,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  compareBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
});

// ── Main screen styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  compareIconBtn: {
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: TEXT_DARK },
  scrollContent: { paddingTop: 16 },

  // Summary banner
  summaryBanner: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: GREEN_DARK,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    alignItems: "center",
  },
  summaryLeft: { flex: 1 },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 3,
  },
  summarySubtitle: { fontSize: 12, color: "#BBF7D0", marginBottom: 8 },
  avgRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  avgText: { fontSize: 13, color: "#BBF7D0", fontWeight: "600" },
  summaryRight: { alignItems: "center" },
  scanCount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFF",
  },
  scanLabel: { fontSize: 12, color: "#BBF7D0", fontWeight: "600" },

  // Growth strip
  stripSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  stripList: { paddingHorizontal: 16 },
  stripItem: {
    alignItems: "center",
    marginRight: 4,
    position: "relative",
  },
  stripImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: GREEN_LIGHT,
  },
  stripArrow: {
    position: "absolute",
    right: -14,
    top: 29,
    zIndex: 2,
  },
  stripDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginBottom: 3,
  },
  stripDate: { fontSize: 10, color: TEXT_MUTED, fontWeight: "600" },
  stripAge: { fontSize: 10, color: TEXT_DARK, fontWeight: "700" },

  // Height chart
  heightCard: {
    marginHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  heightTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 16,
  },
  heightBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 110,
  },
  heightBarCol: { alignItems: "center", flex: 1 },
  heightBarVal: {
    fontSize: 10,
    color: TEXT_MUTED,
    fontWeight: "600",
    marginBottom: 4,
  },
  heightBarTrack: {
    width: 28,
    height: 80,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  heightBarFill: {
    width: "100%",
    borderRadius: 6,
  },
  heightBarDate: {
    fontSize: 10,
    color: TEXT_MUTED,
    marginTop: 6,
    fontWeight: "500",
  },

  // Filters
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterTabActive: {
    backgroundColor: GREEN_PRIMARY,
    borderColor: GREEN_PRIMARY,
  },
  filterTabText: { fontSize: 13, fontWeight: "600", color: TEXT_MUTED },
  filterTabTextActive: { color: "#FFF" },

  // Timeline
  timelineSection: {
    paddingHorizontal: 16,
  },
});
