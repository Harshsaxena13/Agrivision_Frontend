import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "../../theme";
import { GlassCard } from "../../components/GlassCard";
import { GradientButton } from "../../components/GradientButton";
import { Badge } from "../../components/Badge";
import { useAppStore } from "../../store/appStore";
import { Crop } from "../../navigation/types";

const CROP_OPTIONS = [
  { name: "Tomato", hindiName: "टमाटर", emoji: "🍅", color: "#E53E3E" },
  { name: "Wheat", hindiName: "गेहूँ", emoji: "🌾", color: "#D69E2E" },
  { name: "Rice", hindiName: "धान", emoji: "🌾", color: "#2B6CB0" },
  { name: "Maize", hindiName: "मक्का", emoji: "🌽", color: "#F6AD55" },
  { name: "Cotton", hindiName: "कपास", emoji: "🌿", color: "#68D391" },
  { name: "Sugarcane", hindiName: "गन्ना", emoji: "🎋", color: "#48BB78" },
  { name: "Soybean", hindiName: "सोयाबीन", emoji: "🫘", color: "#68D391" },
  { name: "Potato", hindiName: "आलू", emoji: "🥔", color: "#B7791F" },
];

export const MyCropsScreen: React.FC = () => {
  const { crops, addCrop, removeCrop } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<
    (typeof CROP_OPTIONS)[0] | null
  >(null);
  const [area, setArea] = useState("");

  const handleAddCrop = () => {
    if (!selectedCrop) return;
    const crop: Crop = {
      id: Date.now().toString(),
      name: selectedCrop.name,
      hindiName: selectedCrop.hindiName,
      emoji: selectedCrop.emoji,
      color: selectedCrop.color,
      sowingDate: new Date().toISOString().split("T")[0],
      growthStage: 5,
      stageName: "Germination",
      nextAction: "Ensure adequate moisture for germination",
      area: area || "1 acre",
    };
    addCrop(crop);
    setShowAddModal(false);
    setSelectedCrop(null);
    setArea("");
  };

  const getStageBadge = (stage: number) => {
    if (stage < 20) return { label: "Germination", variant: "info" as const };
    if (stage < 50) return { label: "Vegetative", variant: "primary" as const };
    if (stage < 80) return { label: "Flowering", variant: "warning" as const };
    if (stage < 95) return { label: "Fruiting", variant: "warning" as const };
    return { label: "Harvest Ready", variant: "success" as const };
  };

  return (
    <LinearGradient colors={["#0A1A06", "#0F2209"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>🌾 My Crops</Text>
              <Text style={styles.pageSubtitle}>
                {crops.length} crops being tracked
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={styles.addBtn}
            >
              <LinearGradient
                colors={[Colors.secondary, Colors.primaryLight]}
                style={styles.addBtnInner}
              >
                <Ionicons name="add" size={24} color={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {crops.map((crop) => {
            const stageBadge = getStageBadge(crop.growthStage);
            return (
              <GlassCard key={crop.id} style={styles.cropCard} padding={16}>
                <View style={styles.cropHeader}>
                  <Text style={styles.cropEmoji}>{crop.emoji}</Text>
                  <View style={styles.cropInfo}>
                    <Text style={styles.cropName}>{crop.name}</Text>
                    <Text style={styles.cropHindi}>{crop.hindiName}</Text>
                    {crop.area && (
                      <Text style={styles.cropArea}>📐 {crop.area}</Text>
                    )}
                  </View>
                  <View style={styles.cropRight}>
                    <Badge
                      label={stageBadge.label}
                      variant={stageBadge.variant}
                      size="sm"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert("Remove Crop", `Remove ${crop.name}?`, [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Remove",
                            onPress: () => removeCrop(crop.id),
                            style: "destructive",
                          },
                        ])
                      }
                      style={styles.removeBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color={Colors.danger}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Growth Progress */}
                <View style={styles.progressSection}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Growth Progress</Text>
                    <Text style={styles.progressPct}>{crop.growthStage}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${crop.growthStage}%`,
                          backgroundColor: crop.color,
                        },
                      ]}
                    />
                  </View>

                  {/* Stage Indicators */}
                  <View style={styles.stageRow}>
                    {["Seed", "Seedling", "Veg", "Flower", "Harvest"].map(
                      (s, i) => (
                        <Text
                          key={i}
                          style={[
                            styles.stageLabel,
                            crop.growthStage >= i * 25 && { color: crop.color },
                          ]}
                        >
                          {s}
                        </Text>
                      ),
                    )}
                  </View>
                </View>

                {/* Dates */}
                {crop.sowingDate && (
                  <View style={styles.datesRow}>
                    <View style={styles.dateItem}>
                      <Text style={styles.dateLabel}>🌱 Sown</Text>
                      <Text style={styles.dateValue}>{crop.sowingDate}</Text>
                    </View>
                    {crop.harvestDate && (
                      <View style={styles.dateItem}>
                        <Text style={styles.dateLabel}>🌾 Harvest</Text>
                        <Text style={styles.dateValue}>{crop.harvestDate}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Next Action */}
                <View style={styles.nextActionBox}>
                  <Text style={styles.nextActionLabel}>⏭️ Next Action</Text>
                  <Text style={styles.nextActionText}>{crop.nextAction}</Text>
                </View>
              </GlassCard>
            );
          })}

          {crops.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyTitle}>No crops added yet</Text>
              <Text style={styles.emptyDesc}>
                Tap the + button to start tracking your crops
              </Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Add Crop Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <GlassCard style={styles.modalCard} padding={24} intensity={40}>
              <Text style={styles.modalTitle}>Add New Crop</Text>
              <Text style={styles.modalSubtitle}>
                Select a crop to start tracking
              </Text>

              <ScrollView
                style={styles.cropGrid}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.cropGridInner}>
                  {CROP_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.name}
                      onPress={() => setSelectedCrop(opt)}
                      style={[
                        styles.cropOption,
                        selectedCrop?.name === opt.name && {
                          borderColor: opt.color,
                          borderWidth: 2,
                        },
                      ]}
                    >
                      <Text style={styles.cropOptionEmoji}>{opt.emoji}</Text>
                      <Text style={styles.cropOptionName}>{opt.name}</Text>
                      <Text style={styles.cropOptionHindi}>
                        {opt.hindiName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.areaInput}>
                <Text style={styles.areaLabel}>Land Area (optional)</Text>
                <TextInput
                  style={styles.areaField}
                  placeholder="e.g. 1.5 acres"
                  placeholderTextColor={Colors.textMuted}
                  value={area}
                  onChangeText={setArea}
                />
              </View>

              <View style={styles.modalButtons}>
                <GradientButton
                  title="Cancel"
                  onPress={() => setShowAddModal(false)}
                  variant="outline"
                  style={styles.modalBtn}
                />
                <GradientButton
                  title="Add Crop"
                  onPress={handleAddCrop}
                  disabled={!selectedCrop}
                  style={styles.modalBtn}
                />
              </View>
            </GlassCard>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.screenPadding, paddingTop: 16 },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing[5],
  },
  pageTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  addBtn: { borderRadius: BorderRadius.full, overflow: "hidden" },
  addBtnInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cropCard: { marginBottom: Spacing[4] },
  cropHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cropEmoji: { fontSize: 40, marginRight: 12 },
  cropInfo: { flex: 1 },
  cropName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  cropHindi: { fontSize: Typography.fontSize.sm, color: Colors.textMuted },
  cropArea: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
    marginTop: 4,
  },
  cropRight: { alignItems: "flex-end", gap: 8 },
  removeBtn: { padding: 4 },
  progressSection: { marginBottom: 12 },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
  progressPct: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: "100%", borderRadius: BorderRadius.full },
  stageRow: { flexDirection: "row", justifyContent: "space-between" },
  stageLabel: { fontSize: 9, color: Colors.textMuted },
  datesRow: { flexDirection: "row", gap: Spacing[6], marginBottom: 12 },
  dateItem: {},
  dateLabel: { fontSize: 10, color: Colors.textMuted },
  dateValue: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  nextActionBox: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.md,
    padding: 10,
  },
  nextActionLabel: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: 4,
  },
  nextActionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  emptyState: { alignItems: "center", paddingVertical: 80 },
  emptyEmoji: { fontSize: 72, marginBottom: 16 },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  modalCard: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  cropGrid: { maxHeight: 300 },
  cropGridInner: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cropOption: {
    width: "22%",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cropOptionEmoji: { fontSize: 28, marginBottom: 4 },
  cropOptionName: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.semiBold,
    textAlign: "center",
  },
  cropOptionHindi: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: "center",
  },
  areaInput: { marginTop: 16 },
  areaLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  areaField: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    height: 44,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.fontSize.base,
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 16 },
  modalBtn: { flex: 1 },
});
