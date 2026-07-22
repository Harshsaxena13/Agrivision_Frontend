import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, MainTabParamList } from "../../navigation/types";
import { useAppStore } from "../../store/appStore";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Achievements">;
};

type Filter = "all" | "unlocked" | "locked";

type Achievement = {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  icon: keyof typeof Ionicons.glyphMap;
  route: MainTabParamList[keyof MainTabParamList] extends undefined
    ? keyof MainTabParamList
    : keyof MainTabParamList;
};

const GREEN = "#0B7A3E";
const GREEN_SOFT = "#DCFCE7";
const GREEN_TINT = "#ECFDF5";
const BG = "#F9FAFB";
const CARD = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const BORDER = "#E5E7EB";
const LOCKED = "#F3F4F6";
const GOLD = "#F4A226";
const BLUE = "#2563EB";

const clampProgress = (value: number, target: number) =>
  Math.min(Math.max(value, 0), target);

export const AchievementsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, scanHistory, crops, fields, chatHistory, posts } =
    useAppStore();
  const [filter, setFilter] = React.useState<Filter>("all");

  const totalScans = user?.totalScans ?? scanHistory.length;
  const diseasesDetected =
    user?.diseasesDetected ??
    scanHistory.filter((scan) => scan.result.disease).length;
  const healthyScans = scanHistory.filter(
    (scan) => scan.result.healthStatus === "Healthy",
  ).length;
  const uniqueScanDays = new Set(scanHistory.map((scan) => scan.date)).size;
  const activeFields = fields.filter(
    (field) => field.status === "Active",
  ).length;
  const profileComplete = [
    user?.name,
    user?.location,
    user?.landArea,
    user?.cropType,
  ].filter(Boolean).length;
  const likedPosts = posts.filter((post) => post.liked).length;
  const readyCrops = crops.filter((crop) => crop.growthStage >= 90).length;
  const plannedCrops = crops.filter((crop) => crop.harvestDate).length;

  const achievements: Achievement[] = [
    {
      id: "first-scan",
      title: "First Scan",
      description: "Complete your first plant scan",
      current: totalScans,
      target: 1,
      icon: "scan-outline",
      route: "Scan",
    },
    {
      id: "consistent-farmer",
      title: "Consistent Farmer",
      description: "Scan plants on 7 different days",
      current: uniqueScanDays,
      target: 7,
      icon: "calendar-outline",
      route: "Scan",
    },
    {
      id: "plant-doctor",
      title: "Plant Doctor",
      description: "Detect disease in 10 plants",
      current: diseasesDetected,
      target: 10,
      icon: "medkit-outline",
      route: "History",
    },
    {
      id: "growth-tracker",
      title: "Growth Tracker",
      description: "Track 3 crops through growth stages",
      current: crops.length,
      target: 3,
      icon: "trending-up-outline",
      route: "History",
    },
    {
      id: "field-steward",
      title: "Field Steward",
      description: "Keep 4 fields active",
      current: activeFields,
      target: 4,
      icon: "map-outline",
      route: "Profile",
    },
    {
      id: "crop-collector",
      title: "Crop Collector",
      description: "Add 3 crop types to your farm",
      current: user?.crops?.length || crops.length,
      target: 3,
      icon: "leaf-outline",
      route: "Profile",
    },
    {
      id: "healthy-harvest",
      title: "Healthy Harvest",
      description: "Record 5 healthy plant scans",
      current: healthyScans,
      target: 5,
      icon: "shield-checkmark-outline",
      route: "Scan",
    },
    {
      id: "ai-learner",
      title: "AI Learner",
      description: "Ask the assistant 10 crop questions",
      current: chatHistory.filter((message) => !message.isBot).length,
      target: 10,
      icon: "chatbubbles-outline",
      route: "AIAssistant",
    },
    {
      id: "community-supporter",
      title: "Community Supporter",
      description: "Like a helpful farming post",
      current: likedPosts,
      target: 1,
      icon: "heart-outline",
      route: "Home",
    },
    {
      id: "profile-builder",
      title: "Profile Builder",
      description: "Complete your farm profile",
      current: profileComplete,
      target: 4,
      icon: "person-circle-outline",
      route: "Profile",
    },
    {
      id: "weather-ready",
      title: "Weather Ready",
      description: "Set your farm location",
      current: user?.location ? 1 : 0,
      target: 1,
      icon: "partly-sunny-outline",
      route: "Profile",
    },
    {
      id: "harvest-planner",
      title: "Harvest Planner",
      description: "Plan harvest dates for 3 crops",
      current: plannedCrops,
      target: 3,
      icon: "flag-outline",
      route: "Profile",
    },
    {
      id: "season-pro",
      title: "Season Pro",
      description: "Bring 1 crop close to harvest",
      current: readyCrops,
      target: 1,
      icon: "ribbon-outline",
      route: "History",
    },
    {
      id: "farm-recordkeeper",
      title: "Farm Recordkeeper",
      description: "Save 15 scan records",
      current: scanHistory.length,
      target: 15,
      icon: "document-text-outline",
      route: "History",
    },
    {
      id: "expert-farmer",
      title: "Expert Farmer",
      description: "Unlock 12 achievements",
      current: 0,
      target: 12,
      icon: "trophy-outline",
      route: "Profile",
    },
  ];

  const unlockedWithoutExpert = achievements.filter(
    (achievement) =>
      achievement.id !== "expert-farmer" &&
      achievement.current >= achievement.target,
  ).length;

  const completedAchievements = achievements.map((achievement) =>
    achievement.id === "expert-farmer"
      ? { ...achievement, current: unlockedWithoutExpert }
      : achievement,
  );

  const unlockedCount = completedAchievements.filter(
    (achievement) => achievement.current >= achievement.target,
  ).length;

  const visibleAchievements = completedAchievements.filter((achievement) => {
    const unlocked = achievement.current >= achievement.target;
    if (filter === "unlocked") return unlocked;
    if (filter === "locked") return !unlocked;
    return true;
  });

  const completionPercent = Math.round(
    (unlockedCount / completedAchievements.length) * 100,
  );

  const openAchievement = (achievement: Achievement) => {
    navigation.navigate("Main", { screen: achievement.route });
  };

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

        <Text style={styles.headerTitle}>Achievements</Text>

        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={["#F8FFF9", "#EAF7ED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressCard}
        >
          <View style={styles.progressCopy}>
            <Text style={styles.progressLabel}>Your Progress</Text>
            <Text style={styles.progressCount}>
              {unlockedCount}
              <Text style={styles.progressTotal}>
                {" / "}
                {completedAchievements.length}
              </Text>
            </Text>
            <Text style={styles.progressSub}>Achievements Unlocked</Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completionPercent}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.trophyWrap}>
            <View style={styles.trophyGlow} />
            <Ionicons name="trophy" size={76} color={GOLD} />
            <View style={styles.trophyBadge}>
              <Ionicons name="leaf" size={18} color={CARD} />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.filterWrap}>
          {(["all", "unlocked", "locked"] as Filter[]).map((item) => {
            const active = filter === item;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.filterBtn, active && styles.filterBtnActive]}
                onPress={() => setFilter(item)}
                activeOpacity={0.75}
              >
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.listCard}>
          {visibleAchievements.map((achievement, index) => (
            <AchievementRow
              key={achievement.id}
              achievement={achievement}
              onPress={() => openAchievement(achievement)}
              isLast={index === visibleAchievements.length - 1}
            />
          ))}
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

type AchievementRowProps = {
  achievement: Achievement;
  onPress: () => void;
  isLast: boolean;
};

const AchievementRow: React.FC<AchievementRowProps> = ({
  achievement,
  onPress,
  isLast,
}) => {
  const current = clampProgress(achievement.current, achievement.target);
  const unlocked = current >= achievement.target;
  const progressPercent = Math.round((current / achievement.target) * 100);

  return (
    <TouchableOpacity
      style={[styles.achievementRow, isLast && styles.achievementRowLast]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.achievementIcon,
          unlocked
            ? styles.achievementIconUnlocked
            : styles.achievementIconLocked,
        ]}
      >
        <Ionicons
          name={unlocked ? achievement.icon : "lock-closed-outline"}
          size={18}
          color={unlocked ? GREEN : TEXT_LIGHT}
        />
      </View>

      <View style={styles.achievementBody}>
        <View style={styles.achievementTitleRow}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          {unlocked ? (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={16} color={GREEN} />
            </View>
          ) : (
            <Text style={styles.progressText}>
              {current}
              {" / "}
              {achievement.target}
            </Text>
          )}
        </View>

        <Text style={styles.achievementDesc}>{achievement.description}</Text>

        {unlocked ? (
          <Text style={styles.unlockedText}>Badge Unlocked</Text>
        ) : (
          <View style={styles.rowProgressTrack}>
            <View
              style={[styles.rowProgressFill, { width: `${progressPercent}%` }]}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  progressCard: {
    minHeight: 128,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDF2E4",
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  progressCopy: {
    flex: 1,
    zIndex: 2,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  progressCount: {
    fontSize: 28,
    fontWeight: "900",
    color: GREEN,
    lineHeight: 32,
  },
  progressTotal: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  progressSub: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MUTED,
    marginTop: 3,
    marginBottom: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#DCEBE1",
    overflow: "hidden",
    width: "86%",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#16A34A",
  },
  trophyWrap: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
  },
  trophyGlow: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFF4C7",
    opacity: 0.8,
  },
  trophyBadge: {
    position: "absolute",
    bottom: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#F8FFF9",
  },
  filterWrap: {
    flexDirection: "row",
    backgroundColor: CARD,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 3,
    marginBottom: 12,
  },
  filterBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: GREEN_TINT,
    borderWidth: 1,
    borderColor: "#9AD7B1",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "800",
    color: TEXT_LIGHT,
  },
  filterTextActive: {
    color: GREEN,
  },
  listCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  achievementRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  achievementRowLast: {
    borderBottomWidth: 0,
  },
  achievementIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  achievementIconUnlocked: {
    backgroundColor: GREEN_SOFT,
  },
  achievementIconLocked: {
    backgroundColor: LOCKED,
  },
  achievementBody: {
    flex: 1,
  },
  achievementTitleRow: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  achievementTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: TEXT_DARK,
    marginRight: 10,
  },
  achievementDesc: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MUTED,
    marginTop: 2,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    minWidth: 42,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "800",
    color: TEXT_MUTED,
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: "800",
    color: GREEN,
    marginTop: 5,
  },
  rowProgressTrack: {
    width: "62%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    marginTop: 8,
  },
  rowProgressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: BLUE,
  },
});
