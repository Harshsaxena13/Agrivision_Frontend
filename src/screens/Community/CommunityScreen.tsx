import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "../../theme";
import { GlassCard } from "../../components/GlassCard";
import { Badge } from "../../components/Badge";
import { useAppStore } from "../../store/appStore";

export const CommunityScreen: React.FC = () => {
  const { posts, togglePostLike } = useAppStore();
  const [activeTab, setActiveTab] = useState<"feed" | "questions">("feed");

  return (
    <LinearGradient colors={["#0A1A06", "#0F2209"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.pageTitle}>👥 Community</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Post feature coming in next update!",
                )
              }
              style={styles.postBtn}
            >
              <LinearGradient
                colors={[Colors.secondary, Colors.primaryLight]}
                style={styles.postBtnInner}
              >
                <Ionicons name="add" size={20} color={Colors.white} />
                <Text style={styles.postBtnText}>Post</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {[
              { icon: "👨‍🌾", label: "12,450 Farmers" },
              { icon: "💬", label: "3,200 Posts" },
              { icon: "🌍", label: "18 States" },
            ].map((s, i) => (
              <GlassCard key={i} style={styles.statCard} padding={12}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </GlassCard>
            ))}
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {(["feed", "questions"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab === "feed" ? "📰 News Feed" : "❓ Questions"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Posts */}
          {posts.map((post) => (
            <GlassCard key={post.id} style={styles.postCard} padding={16}>
              {/* Author */}
              <View style={styles.authorRow}>
                <Text style={styles.authorAvatar}>{post.avatar}</Text>
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.authorMeta}>
                    {post.location} · {post.timeAgo}
                  </Text>
                </View>
                {post.isExpertAnswered && (
                  <Badge label="Expert ✓" variant="success" size="sm" />
                )}
              </View>

              {/* Content */}
              <Text style={styles.postContent}>{post.content}</Text>

              {/* Tags */}
              <View style={styles.tagsRow}>
                {post.tags.map((tag, i) => (
                  <Badge
                    key={i}
                    label={`#${tag}`}
                    variant="primary"
                    size="sm"
                  />
                ))}
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={() => togglePostLike(post.id)}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name={post.liked ? "heart" : "heart-outline"}
                    size={18}
                    color={post.liked ? Colors.danger : Colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.actionCount,
                      post.liked && { color: Colors.danger },
                    ]}
                  >
                    {post.likes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Coming Soon", "Comments feature coming soon!")
                  }
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.actionCount}>{post.comments}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons
                    name="share-social-outline"
                    size={18}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.actionCount}>Share</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing[4],
  },
  pageTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.textPrimary,
  },
  postBtn: { borderRadius: BorderRadius.lg, overflow: "hidden" },
  postBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  postBtnText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semiBold,
    fontSize: Typography.fontSize.sm,
  },
  statsRow: { flexDirection: "row", gap: Spacing[3], marginBottom: Spacing[4] },
  statCard: { flex: 1, alignItems: "center" },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statLabel: { fontSize: 10, color: Colors.textMuted, textAlign: "center" },
  tabs: {
    flexDirection: "row",
    marginBottom: Spacing[4],
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: BorderRadius.md,
  },
  tabActive: { backgroundColor: Colors.secondary },
  tabText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.semiBold,
  },
  tabTextActive: { color: Colors.white },
  postCard: { marginBottom: Spacing[3] },
  authorRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  authorAvatar: { fontSize: 32, marginRight: 10 },
  authorInfo: { flex: 1 },
  authorName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  authorMeta: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  postContent: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing[5],
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionCount: { fontSize: Typography.fontSize.sm, color: Colors.textMuted },
});
