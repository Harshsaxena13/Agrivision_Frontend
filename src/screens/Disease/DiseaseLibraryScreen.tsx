import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "../../theme";
import { GlassCard } from "../../components/GlassCard";
import { SeverityBadge } from "../../components/Badge";
import { DISEASE_DATABASE } from "../../api/geminiApi";

const FILTER_CROPS = ["All", "Tomato", "Wheat", "Rice", "Mango", "Brinjal"];

export const DiseaseLibraryScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = DISEASE_DATABASE.filter((d) => {
    const matchSearch =
      search === "" ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.plantType.toLowerCase().includes(search.toLowerCase());
    const matchCrop =
      selectedCrop === "All" || d.plantType.includes(selectedCrop);
    return matchSearch && matchCrop;
  });

  return (
    <LinearGradient colors={["#0A1A06", "#0F2209"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <Text style={styles.pageTitle}>📚 Disease Library</Text>
          <Text style={styles.pageSubtitle}>
            {DISEASE_DATABASE.length} diseases in database
          </Text>

          {/* Search */}
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={18}
              color={Colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search diseases or crops..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search !== "" && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
          >
            {FILTER_CROPS.map((crop) => (
              <TouchableOpacity
                key={crop}
                onPress={() => setSelectedCrop(crop)}
                style={[
                  styles.filterChip,
                  selectedCrop === crop && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCrop === crop && styles.filterChipTextActive,
                  ]}
                >
                  {crop}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Results */}
          <Text style={styles.resultsCount}>{filtered.length} results</Text>

          {filtered.map((disease) => (
            <TouchableOpacity
              key={disease.id}
              onPress={() =>
                setExpandedId(expandedId === disease.id ? null : disease.id)
              }
              activeOpacity={0.9}
            >
              <GlassCard style={styles.diseaseCard} padding={16}>
                <View style={styles.diseaseHeader}>
                  <Text style={styles.diseaseEmoji}>{disease.emoji}</Text>
                  <View style={styles.diseaseInfo}>
                    <Text style={styles.diseaseName}>{disease.name}</Text>
                    <Text style={styles.diseaseScientific}>
                      {disease.scientificName}
                    </Text>
                    <Text style={styles.diseasePlant}>
                      🌱 {disease.plantType}
                    </Text>
                  </View>
                  <View style={styles.rightCol}>
                    <SeverityBadge severity={disease.severity} />
                    <Ionicons
                      name={
                        expandedId === disease.id
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={16}
                      color={Colors.textMuted}
                      style={{ marginTop: 8 }}
                    />
                  </View>
                </View>

                {expandedId === disease.id && (
                  <View style={styles.expandedSection}>
                    <View style={styles.divider} />
                    <Text style={styles.subTitle}>🔍 Symptoms</Text>
                    {disease.symptoms.map((s, i) => (
                      <Text key={i} style={styles.bulletItem}>
                        • {s}
                      </Text>
                    ))}
                    <Text style={styles.subTitle}>🌿 Organic Treatment</Text>
                    {disease.organicTreatment.slice(0, 2).map((t, i) => (
                      <Text key={i} style={styles.bulletItem}>
                        • {t}
                      </Text>
                    ))}
                    <Text style={styles.subTitle}>🛡️ Prevention</Text>
                    {disease.prevention.slice(0, 2).map((p, i) => (
                      <Text key={i} style={styles.bulletItem}>
                        • {p}
                      </Text>
                    ))}
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          ))}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>
                No diseases found for "{search}"
              </Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.screenPadding, paddingTop: 16 },
  pageTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: Spacing[4],
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 48,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
  },
  filterRow: { marginBottom: Spacing[3] },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceHigh,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.semiBold,
  },
  filterChipTextActive: { color: Colors.white },
  resultsCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing[3],
  },
  diseaseCard: { marginBottom: Spacing[3] },
  diseaseHeader: { flexDirection: "row", alignItems: "flex-start" },
  diseaseEmoji: { fontSize: 36, marginRight: 12, marginTop: 2 },
  diseaseInfo: { flex: 1 },
  diseaseName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  diseaseScientific: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontStyle: "italic",
    marginTop: 2,
  },
  diseasePlant: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
    marginTop: 4,
  },
  rightCol: { alignItems: "flex-end" },
  expandedSection: { marginTop: 12 },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
  subTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  bulletItem: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: Typography.fontSize.base, color: Colors.textMuted },
});
