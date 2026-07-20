import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path, Circle, Line, Text as SvgText } from "react-native-svg";
import { RootStackParamList } from "../../navigation/types";

const { width } = Dimensions.get("window");

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "PlantProfile">;
};

const GREEN_PRIMARY = "#0B7A3E";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const BG_COLOR = "#FFFFFF";

// Helper for the chart
const CHART_WIDTH = width - 72; // Padding 20 on each side + 16 internal
const CHART_HEIGHT = 160;
const GRAPH_DATA = [50, 70, 75, 85, 80, 92, 85, 80, 94, 90, 88, 92];
const Y_MIN = 0;
const Y_MAX = 100;

export const PlantProfileScreen: React.FC<Props> = ({ navigation }) => {
  // Chart calculation
  const points = GRAPH_DATA.map((val, i) => {
    const x = (i / (GRAPH_DATA.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - ((val - Y_MIN) / (Y_MAX - Y_MIN)) * CHART_HEIGHT;
    return { x, y, val };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? "M " + p.x + " " + p.y : "L " + p.x + " " + p.y))
    .join(" ");

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
        <Text style={styles.headerTitle}>Plant Profile</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Top ID Card ── */}
        <View style={styles.idCard}>
          <Image
            source={{
              uri: "https://cdn.shopify.com/s/files/1/0550/9401/8125/files/Wheat_crop.png?v=1772449880",
            }}
            style={styles.profileImage}
          />
          <View style={styles.idInfo}>
            <Text style={styles.plantName}>Wheat Plant #12</Text>
            <Text style={styles.fieldSub}>Field A</Text>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={TEXT_MUTED} />
              <Text style={styles.locationText}>Location: North Field</Text>
            </View>

            <Text style={styles.dateText}>Sowing Date: 1 May 2024</Text>

            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>
        </View>

        {/* ── 2x3 Info Grid ── */}
        <View style={styles.gridContainer}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            <View style={styles.gridBox}>
              <Text style={styles.gridLabel}>Current Age</Text>
              <Text style={styles.gridValue}>
                34<Text style={styles.gridValueSmall}> Days</Text>
              </Text>
            </View>
            <View style={styles.gridBox}>
              <Text style={styles.gridLabel}>Health Score</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.gridValue}>92</Text>
                <Text style={styles.gridValueSmall}> / 100</Text>
              </View>
            </View>
            <View style={styles.gridBox}>
              <Text style={styles.gridLabel}>Disease</Text>
              <Text
                style={[styles.gridValueText, { fontSize: 13, marginTop: 4 }]}
              >
                Leaf Blight
              </Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.gridRow}>
            <View style={styles.gridBox}>
              <Text style={styles.gridLabel}>Severity</Text>
              <Text style={styles.gridValueText}>25%</Text>
            </View>
            <View style={styles.gridBox}>
              <Text style={styles.gridLabel}>Growth Stage</Text>
              <Text style={[styles.gridValueText, { fontSize: 13 }]}>
                Vegetative
              </Text>
            </View>
            <View style={styles.gridBox}>
              <Text style={styles.gridLabel}>Risk Level</Text>
              <Text style={[styles.gridValueText, { color: SUCCESS }]}>
                Low
              </Text>
            </View>
          </View>
        </View>

        {/* ── Trend Graph Card ── */}
        <View style={styles.graphCard}>
          <Text style={styles.graphTitle}>Health Score Trend</Text>

          <View style={styles.graphWrapper}>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 30}>
              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y =
                  CHART_HEIGHT -
                  ((val - Y_MIN) / (Y_MAX - Y_MIN)) * CHART_HEIGHT;
                return (
                  <React.Fragment key={"grid-" + val}>
                    <Line
                      x1="20"
                      y1={y}
                      x2={CHART_WIDTH}
                      y2={y}
                      stroke="#F3F4F6"
                      strokeWidth="1"
                    />
                    <SvgText
                      x="15"
                      y={y + 4}
                      fontSize="10"
                      fill={TEXT_MUTED}
                      textAnchor="end"
                    >
                      {val}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* Data Line */}
              <Path
                d={pathD}
                fill="none"
                stroke={GREEN_PRIMARY}
                strokeWidth="2"
                transform="translate(20, 0)"
              />

              {/* Data Points */}
              {points.map((p, i) => (
                <Circle
                  key={"point-" + i}
                  cx={p.x + 20}
                  cy={p.y}
                  r="4"
                  fill={GREEN_PRIMARY}
                  stroke="#FFF"
                  strokeWidth="1.5"
                />
              ))}

              {/* Last Value Badge */}
              <View
                style={[
                  styles.badgeOverlay,
                  {
                    left: points[points.length - 1].x + 5,
                    top: points[points.length - 1].y - 25,
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {GRAPH_DATA[GRAPH_DATA.length - 1]}
                </Text>
              </View>

              {/* X-Axis Labels */}
              <SvgText
                x={20}
                y={CHART_HEIGHT + 20}
                fontSize="10"
                fill={TEXT_MUTED}
                textAnchor="middle"
              >
                1 May
              </SvgText>
              <SvgText
                x={20 + CHART_WIDTH * 0.33}
                y={CHART_HEIGHT + 20}
                fontSize="10"
                fill={TEXT_MUTED}
                textAnchor="middle"
              >
                10 May
              </SvgText>
              <SvgText
                x={20 + CHART_WIDTH * 0.66}
                y={CHART_HEIGHT + 20}
                fontSize="10"
                fill={TEXT_MUTED}
                textAnchor="middle"
              >
                20 May
              </SvgText>
              <SvgText
                x={20 + CHART_WIDTH}
                y={CHART_HEIGHT + 20}
                fontSize="10"
                fill={TEXT_MUTED}
                textAnchor="end"
              >
                5 Jun
              </SvgText>
            </Svg>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: TEXT_DARK },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  idCard: {
    flexDirection: "row",
    backgroundColor: "#F0FDF4", // very light green
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  idInfo: {
    flex: 1,
    justifyContent: "center",
  },
  plantName: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 2,
  },
  fieldSub: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  activeBadge: {
    backgroundColor: "#BBF7D0",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    fontWeight: "600",
    color: GREEN_PRIMARY,
  },

  gridContainer: {
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  gridBox: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "500",
    marginBottom: 6,
    textAlign: "center",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  gridValue: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  gridValueSmall: {
    fontSize: 12,
    fontWeight: "500",
    color: TEXT_MUTED,
  },
  gridValueText: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
    marginTop: 2,
  },

  graphCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 16,
  },
  graphWrapper: {
    position: "relative",
  },
  badgeOverlay: {
    position: "absolute",
    backgroundColor: GREEN_PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
