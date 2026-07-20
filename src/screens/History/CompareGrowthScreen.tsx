import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

const { width } = Dimensions.get("window");

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CompareGrowth">;
};

const GREEN_PRIMARY = "#0B7A3E";
const GREEN_DARK = "#065F46";
const GREEN_LIGHT = "#BBF7D0";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const CARD_BG = "#FFFFFF";
const BG_COLOR = "#F9FAFB";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";

interface Snapshot {
  id: string;
  dateLabel: string;
  fullDate: string;
  age: string;
  ageDays: number;
  score: number;
  heightCm: number;
  leafCount: number;
  status: string;
  statusColor: string;
  growthStage: string;
  stageEmoji: string;
  image: string;
  notes: string;
}

const SNAPSHOTS: Snapshot[] = [
  {
    id: "1",
    dateLabel: "Today",
    fullDate: "5 Jun 2024",
    age: "34 Days",
    ageDays: 34,
    score: 92,
    heightCm: 48,
    leafCount: 14,
    status: "Leaf Blight (25%)",
    statusColor: WARNING,
    growthStage: "Vegetative",
    stageEmoji: "🌿",
    image:
      "https://cdn.prod.website-files.com/66604a97df59732aab43fcc8/66c8a2e110b96c8d60ce5a02_wheat.webp",
    notes:
      "Mild leaf blight detected on outer leaves. Treatment applied. Root system strong.",
  },
  {
    id: "2",
    dateLabel: "20 May",
    fullDate: "20 May 2024",
    age: "20 Days",
    ageDays: 20,
    score: 96,
    heightCm: 28,
    leafCount: 8,
    status: "Healthy",
    statusColor: GREEN_PRIMARY,
    growthStage: "Seedling",
    stageEmoji: "🌱",
    image:
      "https://cdn.shopify.com/s/files/1/0550/9401/8125/files/Wheat_crop.png?v=1772449880",
    notes: "Excellent growth. Fertilizer applied as scheduled.",
  },
  {
    id: "3",
    dateLabel: "10 May",
    fullDate: "10 May 2024",
    age: "10 Days",
    ageDays: 10,
    score: 98,
    heightCm: 12,
    leafCount: 4,
    status: "Healthy",
    statusColor: GREEN_PRIMARY,
    growthStage: "Germination",
    stageEmoji: "🌾",
    image:
      "https://prairiecalifornian.com/wp-content/uploads/2015/06/Crops-2015-4.jpg",
    notes: "Strong germination. Root system developing well.",
  },
  {
    id: "4",
    dateLabel: "1 May",
    fullDate: "1 May 2024",
    age: "Day 1",
    ageDays: 1,
    score: 100,
    heightCm: 2,
    leafCount: 0,
    status: "Healthy",
    statusColor: GREEN_PRIMARY,
    growthStage: "Sowing",
    stageEmoji: "🌰",
    image:
      "https://prairiecalifornian.com/wp-content/uploads/2015/06/Crops-2014-original-8.jpg",
    notes: "Seeds sown in prepared soil. Initial watering done.",
  },
];

// ── Metric delta card ────────────────────────────────────────────────────────
const DeltaCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  before: string | number;
  after: string | number;
  delta: string;
  positive: boolean;
  unit?: string;
  fillBefore: number;
  fillAfter: number;
  fillColor: string;
}> = ({
  icon,
  label,
  before,
  after,
  delta,
  positive,
  unit = "",
  fillBefore,
  fillAfter,
  fillColor,
}) => (
  <View style={dcStyles.card}>
    <View style={dcStyles.header}>
      {icon}
      <Text style={dcStyles.label}>{label}</Text>
      <View
        style={[
          dcStyles.deltaBadge,
          { backgroundColor: positive ? "#DCFCE7" : "#FEF3C7" },
        ]}
      >
        <Ionicons
          name={positive ? "arrow-up" : "arrow-down"}
          size={10}
          color={positive ? GREEN_PRIMARY : WARNING}
        />
        <Text
          style={[
            dcStyles.deltaText,
            { color: positive ? GREEN_PRIMARY : WARNING },
          ]}
        >
          {delta}
        </Text>
      </View>
    </View>

    <View style={dcStyles.barArea}>
      {/* Before bar */}
      <View style={dcStyles.barRow}>
        <Text style={dcStyles.barLabel}>Before</Text>
        <View style={dcStyles.barTrack}>
          <View
            style={[
              dcStyles.barFill,
              {
                width: `${fillBefore}%` as any,
                backgroundColor: fillColor + "66",
              },
            ]}
          />
        </View>
        <Text style={dcStyles.barVal}>
          {before}
          {unit}
        </Text>
      </View>
      {/* After bar */}
      <View style={dcStyles.barRow}>
        <Text style={dcStyles.barLabel}>After</Text>
        <View style={dcStyles.barTrack}>
          <View
            style={[
              dcStyles.barFill,
              { width: `${fillAfter}%` as any, backgroundColor: fillColor },
            ]}
          />
        </View>
        <Text style={dcStyles.barVal}>
          {after}
          {unit}
        </Text>
      </View>
    </View>
  </View>
);

const dcStyles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
    flex: 1,
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  deltaText: { fontSize: 11, fontWeight: "700" },
  barArea: { gap: 8 },
  barRow: { flexDirection: "row", alignItems: "center" },
  barLabel: { fontSize: 11, color: TEXT_MUTED, width: 40, fontWeight: "500" },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 5,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 5 },
  barVal: { fontSize: 12, fontWeight: "700", color: TEXT_DARK, width: 38 },
});

// ── Snapshot Picker Modal ────────────────────────────────────────────────────
const PickerModal: React.FC<{
  visible: boolean;
  selected: Snapshot;
  onSelect: (s: Snapshot) => void;
  onClose: () => void;
  exclude: string;
}> = ({ visible, selected, onSelect, onClose, exclude }) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <TouchableOpacity
      style={pmStyles.overlay}
      activeOpacity={1}
      onPress={onClose}
    />
    <View style={pmStyles.sheet}>
      <View style={pmStyles.handle} />
      <Text style={pmStyles.title}>Select Snapshot</Text>
      <FlatList
        data={SNAPSHOTS.filter((s) => s.id !== exclude)}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              pmStyles.item,
              item.id === selected.id && pmStyles.itemActive,
            ]}
            onPress={() => {
              onSelect(item);
              onClose();
            }}
          >
            <Image source={{ uri: item.image }} style={pmStyles.itemThumb} />
            <View style={{ flex: 1 }}>
              <Text style={pmStyles.itemDate}>{item.fullDate}</Text>
              <Text style={pmStyles.itemAge}>{item.age}</Text>
            </View>
            <View
              style={[
                pmStyles.statusDot,
                { backgroundColor: item.statusColor },
              ]}
            />
            <Text style={[pmStyles.itemScore, { color: item.statusColor }]}>
              {item.score}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  </Modal>
);

const pmStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "60%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  itemActive: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  itemDate: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  itemAge: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  itemScore: { fontSize: 16, fontWeight: "800", marginLeft: 4 },
});

// ── Main Screen ──────────────────────────────────────────────────────────────
export const CompareGrowthScreen: React.FC<Props> = ({ navigation }) => {
  const [leftSnap, setLeftSnap] = useState<Snapshot>(SNAPSHOTS[2]); // 10 May
  const [rightSnap, setRightSnap] = useState<Snapshot>(SNAPSHOTS[0]); // Today
  const [pickerTarget, setPickerTarget] = useState<"left" | "right" | null>(
    null,
  );

  // Computed deltas
  const heightDelta = rightSnap.heightCm - leftSnap.heightCm;
  const heightPct = Math.round((heightDelta / leftSnap.heightCm) * 100);
  const leafDelta = rightSnap.leafCount - leftSnap.leafCount;
  const scoreDelta = rightSnap.score - leftSnap.score;
  const daysDelta = rightSnap.ageDays - leftSnap.ageDays;

  const scoreColor = (s: number) =>
    s >= 90 ? GREEN_PRIMARY : s >= 75 ? WARNING : DANGER;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Growth</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("PlantProfile")}
          style={[styles.iconBtn, styles.reportBtn]}
        >
          <Ionicons name="bar-chart-outline" size={20} color={GREEN_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Selector row ── */}
        <View style={styles.selectorRow}>
          {/* Left selector */}
          <TouchableOpacity
            style={styles.selectorBox}
            activeOpacity={0.8}
            onPress={() => setPickerTarget("left")}
          >
            <Text style={styles.selectorLabel}>Before</Text>
            <Text style={styles.selectorDate}>{leftSnap.fullDate}</Text>
            <Text style={styles.selectorAge}>{leftSnap.age}</Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={TEXT_MUTED}
              style={{ marginTop: 2 }}
            />
          </TouchableOpacity>

          {/* VS badge */}
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Right selector */}
          <TouchableOpacity
            style={[styles.selectorBox, styles.selectorBoxRight]}
            activeOpacity={0.8}
            onPress={() => setPickerTarget("right")}
          >
            <Text style={[styles.selectorLabel, { color: GREEN_PRIMARY }]}>
              After
            </Text>
            <Text style={styles.selectorDate}>{rightSnap.fullDate}</Text>
            <Text style={styles.selectorAge}>{rightSnap.age}</Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={GREEN_PRIMARY}
              style={{ marginTop: 2 }}
            />
          </TouchableOpacity>
        </View>

        {/* ── Image compare block ── */}
        <View style={styles.imageBlock}>
          {/* Left image */}
          <View style={styles.imageCol}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: leftSnap.image }} style={styles.plantImg} />
              <View style={styles.imgLabelBefore}>
                <Text style={styles.imgLabelText}>Before</Text>
              </View>
              <View
                style={[
                  styles.imgScoreBadge,
                  { backgroundColor: scoreColor(leftSnap.score) },
                ]}
              >
                <Text style={styles.imgScoreText}>{leftSnap.score}</Text>
              </View>
            </View>

            {/* Stage chip */}
            <View style={styles.stageChipRow}>
              <Text style={styles.stageEmoji}>{leftSnap.stageEmoji}</Text>
              <Text style={styles.stageLabel}>{leftSnap.growthStage}</Text>
            </View>

            {/* Quick stats */}
            <View style={styles.quickStats}>
              <Text style={styles.qsVal}>{leftSnap.heightCm}cm</Text>
              <Text style={styles.qsKey}>Height</Text>
            </View>
            <View style={styles.quickStats}>
              <Text style={styles.qsVal}>{leftSnap.leafCount}</Text>
              <Text style={styles.qsKey}>Leaves</Text>
            </View>
            <Text style={[styles.statusPill, { color: leftSnap.statusColor }]}>
              {leftSnap.status}
            </Text>
          </View>

          {/* Center arrows */}
          <View style={styles.centerCol}>
            <Ionicons name="arrow-forward" size={22} color={GREEN_PRIMARY} />
            <View style={styles.daysBubble}>
              <Text style={styles.daysBubbleNum}>+{daysDelta}</Text>
              <Text style={styles.daysBubbleLbl}>days</Text>
            </View>
          </View>

          {/* Right image */}
          <View style={styles.imageCol}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: rightSnap.image }}
                style={styles.plantImg}
              />
              <View style={styles.imgLabelAfter}>
                <Text style={styles.imgLabelText}>After</Text>
              </View>
              <View
                style={[
                  styles.imgScoreBadge,
                  { backgroundColor: scoreColor(rightSnap.score) },
                ]}
              >
                <Text style={styles.imgScoreText}>{rightSnap.score}</Text>
              </View>
            </View>

            <View style={styles.stageChipRow}>
              <Text style={styles.stageEmoji}>{rightSnap.stageEmoji}</Text>
              <Text style={styles.stageLabel}>{rightSnap.growthStage}</Text>
            </View>

            <View style={styles.quickStats}>
              <Text style={[styles.qsVal, { color: GREEN_PRIMARY }]}>
                {rightSnap.heightCm}cm
              </Text>
              <Text style={styles.qsKey}>Height</Text>
            </View>
            <View style={styles.quickStats}>
              <Text style={[styles.qsVal, { color: GREEN_PRIMARY }]}>
                {rightSnap.leafCount}
              </Text>
              <Text style={styles.qsKey}>Leaves</Text>
            </View>
            <Text style={[styles.statusPill, { color: rightSnap.statusColor }]}>
              {rightSnap.status}
            </Text>
          </View>
        </View>

        {/* ── Metric deltas ── */}
        <Text style={styles.sectionTitle}>Growth Metrics</Text>

        <DeltaCard
          icon={
            <MaterialCommunityIcons
              name="ruler"
              size={20}
              color={GREEN_PRIMARY}
            />
          }
          label="Plant Height"
          before={leftSnap.heightCm}
          after={rightSnap.heightCm}
          delta={`+${heightPct}%`}
          positive={heightDelta > 0}
          unit=" cm"
          fillBefore={(leftSnap.heightCm / 60) * 100}
          fillAfter={(rightSnap.heightCm / 60) * 100}
          fillColor={GREEN_PRIMARY}
        />

        <DeltaCard
          icon={
            <MaterialCommunityIcons name="leaf" size={20} color="#16A34A" />
          }
          label="Leaf Count"
          before={leftSnap.leafCount}
          after={rightSnap.leafCount}
          delta={`+${leafDelta} leaves`}
          positive={leafDelta >= 0}
          fillBefore={(leftSnap.leafCount / 20) * 100}
          fillAfter={(rightSnap.leafCount / 20) * 100}
          fillColor="#16A34A"
        />

        <DeltaCard
          icon={
            <Ionicons
              name="heart-outline"
              size={20}
              color={scoreColor(rightSnap.score)}
            />
          }
          label="Health Score"
          before={leftSnap.score}
          after={rightSnap.score}
          delta={`${scoreDelta >= 0 ? "+" : ""}${scoreDelta} pts`}
          positive={scoreDelta >= 0}
          fillBefore={leftSnap.score}
          fillAfter={rightSnap.score}
          fillColor={scoreColor(rightSnap.score)}
        />

        {/* ── AI Summary ── */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconBg}>
              <MaterialCommunityIcons
                name="robot-outline"
                size={20}
                color={GREEN_PRIMARY}
              />
            </View>
            <Text style={styles.aiTitle}>AI Growth Summary</Text>
          </View>

          <View style={styles.aiBullets}>
            {[
              {
                icon: "shield-checkmark-outline" as const,
                text: `Plant height grew by ${heightPct}% (${leftSnap.heightCm}cm → ${rightSnap.heightCm}cm)`,
                color: GREEN_PRIMARY,
              },
              {
                icon: "leaf-outline" as const,
                text: `Leaf count increased from ${leftSnap.leafCount} to ${rightSnap.leafCount} leaves`,
                color: GREEN_PRIMARY,
              },
              {
                icon:
                  scoreDelta >= 0
                    ? ("checkmark-circle-outline" as const)
                    : ("warning-outline" as const),
                text:
                  scoreDelta >= 0
                    ? `Health maintained at ${rightSnap.score}/100`
                    : `Health score dropped by ${Math.abs(scoreDelta)} pts`,
                color: scoreDelta >= 0 ? GREEN_PRIMARY : WARNING,
              },
              {
                icon: "time-outline" as const,
                text: `Growth observed over ${daysDelta} days`,
                color: TEXT_MUTED,
              },
            ].map((b, i) => (
              <View key={i} style={styles.aiBulletRow}>
                <Ionicons name={b.icon} size={18} color={b.color} />
                <Text style={styles.aiBulletText}>{b.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("PlantProfile")}
          >
            <Ionicons name="bar-chart-outline" size={18} color="#FFF" />
            <Text style={styles.primaryBtnText}>View Full Report</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Picker Modals ── */}
      <PickerModal
        visible={pickerTarget === "left"}
        selected={leftSnap}
        onSelect={setLeftSnap}
        onClose={() => setPickerTarget(null)}
        exclude={rightSnap.id}
      />
      <PickerModal
        visible={pickerTarget === "right"}
        selected={rightSnap}
        onSelect={setRightSnap}
        onClose={() => setPickerTarget(null)}
        exclude={leftSnap.id}
      />
    </SafeAreaView>
  );
};

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
  reportBtn: {
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: TEXT_DARK },
  scroll: { paddingTop: 20, paddingHorizontal: 16 },

  // Selector row
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  selectorBox: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  selectorBoxRight: {
    borderColor: GREEN_PRIMARY + "55",
    backgroundColor: "#F0FDF4",
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  selectorDate: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 2,
  },
  selectorAge: { fontSize: 12, color: TEXT_MUTED },
  vsBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GREEN_DARK,
    alignItems: "center",
    justifyContent: "center",
  },
  vsText: { color: "#FFF", fontSize: 12, fontWeight: "800" },

  // Image compare block
  imageBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  imageCol: { flex: 1 },
  imageWrapper: {
    position: "relative",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 10,
  },
  plantImg: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 18,
  },
  imgLabelBefore: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  imgLabelAfter: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: GREEN_DARK + "CC",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  imgLabelText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  imgScoreBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  imgScoreText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  stageChipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  stageEmoji: { fontSize: 14 },
  stageLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  quickStats: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 4,
  },
  qsVal: { fontSize: 15, fontWeight: "800", color: TEXT_DARK },
  qsKey: { fontSize: 11, color: TEXT_MUTED },
  statusPill: { fontSize: 11, fontWeight: "700", marginTop: 4 },

  centerCol: {
    width: 48,
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  daysBubble: {
    backgroundColor: GREEN_DARK,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  daysBubbleNum: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  daysBubbleLbl: { color: GREEN_LIGHT, fontSize: 10, fontWeight: "600" },

  // Section title
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 14,
  },

  // AI Card
  aiCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  aiIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  aiTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  aiBullets: { gap: 12, marginBottom: 18 },
  aiBulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  aiBulletText: {
    fontSize: 13,
    color: TEXT_DARK,
    flex: 1,
    lineHeight: 20,
  },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN_PRIMARY,
    borderRadius: 14,
    paddingVertical: 15,
    gap: 8,
  },
  primaryBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});
