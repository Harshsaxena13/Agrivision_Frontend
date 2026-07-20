import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import { RootStackParamList } from "../../navigation/types";

const { width } = Dimensions.get("window");

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ScanResult">;
  route: RouteProp<RootStackParamList, "ScanResult">;
};

const GREEN_PRIMARY = "#0B7A3E";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#DC2626";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const LIGHT_BG = "#F9FAFB";

export const ScanResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { result, imageUri } = route.params;
  const { disease, plantName, healthStatus, overallScore, tips } = result;
  const isModelUnavailable = result.modelAvailable === false;

  const handleShare = async () => {
    const text = isModelUnavailable
      ? `⚠️ Analysis unavailable\nPlant: ${plantName}\nNo diagnosis was produced. Please scan again later.`
      : disease
        ? `🚨 Disease Alert!\nPlant: ${plantName}\nDisease: ${disease.name}\nSeverity: ${disease.severity}\n\nIdentified using AgriVisionAI 🌿`
        : `✅ ${plantName} is healthy!\nHealth Score: ${overallScore}/100\n\nChecked with AgriVisionAI 🌿`;
    await Share.share({ message: text });
  };

  const scoreText = isModelUnavailable
    ? "Unavailable"
    : overallScore >= 80
      ? "Great!"
      : overallScore >= 50
        ? "Fair"
        : "Poor";
  const scoreColor = isModelUnavailable
    ? WARNING
    : overallScore >= 80
      ? SUCCESS
      : overallScore >= 50
        ? WARNING
        : DANGER;

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  // Mock data for age and growth stage (fallback if not in result)
  const age = "34 Days";
  const growthStage = "Vegetative";
  const severityPercentage = disease
    ? disease.severity === "Critical"
      ? 90
      : disease.severity === "High"
        ? 75
        : disease.severity === "Medium"
          ? 50
          : 25
    : 0;

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
        <Text style={styles.headerTitle}>Scan Result</Text>
        <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
          <Ionicons name="share-social-outline" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Image Card ── */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                imageUri ||
                "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
            }}
            style={styles.plantImage}
          />
          <TouchableOpacity
            style={styles.cameraBtnOverlay}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.cameraBtnInner}>
              <Ionicons name="camera" size={24} color={GREEN_PRIMARY} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Health Score Card ── */}
        <View style={styles.card}>
          <View style={styles.scoreLeft}>
            <Text style={styles.cardTitle}>
              {isModelUnavailable ? "Analysis Status" : "Health Score"}
            </Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreNumber}>
                {isModelUnavailable ? "—" : overallScore}
              </Text>
              {!isModelUnavailable && (
                <Text style={styles.scoreTotal}> / 100</Text>
              )}
            </View>
            <Text style={[styles.scoreText, { color: scoreColor }]}>
              {scoreText}
            </Text>
          </View>

          <View style={styles.scoreRight}>
            <Svg width="90" height="90" viewBox="0 0 90 90">
              {/* Background Circle */}
              <Circle
                cx="45"
                cy="45"
                r={radius}
                stroke="#EAF5EC"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress Circle */}
              <Circle
                cx="45"
                cy="45"
                r={radius}
                stroke={scoreColor}
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 45 45)"
              />
            </Svg>
          </View>
        </View>

        {/* ── 2x2 Info Grid ── */}
        <View style={styles.gridRow}>
          {/* Disease Card */}
          <View style={[styles.card, styles.gridCard]}>
            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: "#EAF5EC" }]}>
                <MaterialCommunityIcons
                  name="shield-bug-outline"
                  size={20}
                  color={GREEN_PRIMARY}
                />
              </View>
              <View>
                <Text style={styles.infoLabel}>Disease</Text>
                <Text style={styles.infoValue}>
                  {isModelUnavailable
                    ? "Unavailable"
                    : disease
                      ? disease.name
                      : "None"}
                </Text>
              </View>
            </View>
            <View style={[styles.infoRow, { marginTop: 16 }]}>
              <View style={[styles.iconBox, { backgroundColor: "#EAF5EC" }]}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={GREEN_PRIMARY}
                />
              </View>
              <View>
                <Text style={styles.infoLabel}>Confidence</Text>
                <Text style={styles.infoValue}>
                  {isModelUnavailable
                    ? "—"
                    : disease
                      ? `${disease.confidence}%`
                      : "100%"}
                </Text>
              </View>
            </View>
          </View>

          {/* Age Card */}
          <View style={[styles.card, styles.gridCard]}>
            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="calendar-outline" size={20} color="#374151" />
              </View>
              <View>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{age}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, { marginTop: 16 }]}>
              <View style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="leaf-outline" size={20} color={SUCCESS} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Growth Stage</Text>
                <Text style={styles.infoValue}>{growthStage}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Severity Card ── */}
        <View style={styles.card}>
          <View style={styles.severityHeader}>
            <Text style={styles.cardTitle}>Severity</Text>
            <Text style={styles.severityPercent}>
              {isModelUnavailable ? "—" : `${severityPercentage}%`}
            </Text>
          </View>

          <View style={styles.barContainer}>
            <LinearGradient
              colors={[SUCCESS, WARNING, DANGER]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.severityBar}
            />
            {/* Indicator Thumb */}
            <View
              style={[
                styles.indicatorThumb,
                { left: `${severityPercentage}%` },
              ]}
            />
          </View>

          <View style={styles.severityLabels}>
            <Text style={styles.severityLabelText}>Healthy</Text>
            <Text style={styles.severityLabelText}>Severe</Text>
          </View>
        </View>

        {/* ── AI Recommendation Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Recommendation</Text>
          <Text style={styles.recommendationText}>
            {isModelUnavailable
              ? `No diagnosis was produced because the disease model could not be reached.\n${tips[0]}`
              : disease
                ? `It seems like a ${disease.severity.toLowerCase()} case of ${disease.name}.\n${disease.chemicalTreatment[0]?.product ? "Use recommended fungicide and ensure proper field hygiene." : tips[0]}`
                : `Your plant is healthy. ${tips[0]}`}
          </Text>
          <TouchableOpacity
            style={styles.detailsBtn}
            activeOpacity={0.8}
            onPress={isModelUnavailable ? () => navigation.goBack() : undefined}
          >
            <Text style={styles.detailsBtnText}>
              {isModelUnavailable ? "Scan Again" : "View Details"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT_BG },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
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

  imageContainer: {
    width: "100%",
    height: 240,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  plantImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  cameraBtnOverlay: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  scoreLeft: { flex: 1, justifyContent: "center" },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  scoreRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 4 },
  scoreNumber: { fontSize: 42, fontWeight: "800", color: GREEN_PRIMARY },
  scoreTotal: { fontSize: 16, fontWeight: "600", color: TEXT_MUTED },
  scoreText: { fontSize: 16, fontWeight: "700" },
  scoreRight: { position: "absolute", right: 20, top: 20 },

  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gridCard: { flex: 1, marginHorizontal: 4, padding: 16, marginBottom: 0 },
  infoRow: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: { fontSize: 12, color: TEXT_MUTED, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },

  severityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  severityPercent: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  barContainer: { height: 24, justifyContent: "center", marginBottom: 8 },
  severityBar: { height: 6, borderRadius: 3, width: "100%" },
  indicatorThumb: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: GREEN_PRIMARY,
    borderWidth: 2,
    borderColor: "#FFF",
    marginLeft: -8, // Center over the percentage point
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  severityLabels: { flexDirection: "row", justifyContent: "space-between" },
  severityLabelText: { fontSize: 12, color: TEXT_MUTED },

  recommendationText: {
    fontSize: 14,
    color: TEXT_DARK,
    lineHeight: 22,
    marginBottom: 16,
  },
  detailsBtn: {
    backgroundColor: GREEN_PRIMARY,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 24,
  },
  detailsBtnText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
});
