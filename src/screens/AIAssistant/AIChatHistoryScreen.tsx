import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AIAssistantStackParamList } from "../../navigation/types";
import { useAppStore } from "../../store/appStore";

const GREEN_BTN = "#0B7A3E";
const BG = "#F9FAFB";
const CARD = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const GREEN_LIGHT = "#DCFCE7";

type Props = {
  navigation: NativeStackNavigationProp<
    AIAssistantStackParamList,
    "AIChatHistory"
  >;
};

export const AIChatHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { chatHistory, setChatHistory, setActiveConversationId } =
    useAppStore();

  // Group messages into conversation previews
  const userMessages = chatHistory.filter((m) => !m.isBot);
  const hasHistory = chatHistory.length > 0;

  const handleClearHistory = () => {
    Alert.alert(
      "Clear Chat History",
      "This will clear your entire conversation. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setChatHistory([]);
            setActiveConversationId(null);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: (typeof chatHistory)[0];
    index: number;
  }) => {
    if (item.isBot) return null;
    // Find the bot reply right after
    const botReply = chatHistory[chatHistory.indexOf(item) + 1];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.cardHeader}>
          <View style={styles.userBubbleIcon}>
            <Ionicons name="person" size={14} color={GREEN_BTN} />
          </View>
          <Text style={styles.cardNum}>Message {index + 1}</Text>
          <Text style={styles.cardTime}>{item.timestamp}</Text>
        </View>
        <Text style={styles.cardQuestion} numberOfLines={2}>
          {item.text}
        </Text>
        {botReply && (
          <View style={styles.replyPreview}>
            <Ionicons
              name="leaf"
              size={12}
              color={GREEN_BTN}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.replyText} numberOfLines={2}>
              {botReply.text}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat History</Text>
        {hasHistory ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearHistory}
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {!hasHistory ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="chatbubbles-outline" size={48} color={GREEN_BTN} />
          </View>
          <Text style={styles.emptyTitle}>No Conversations Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start chatting with the AI Assistant to see your conversation
            history here.
          </Text>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={18}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.startBtnText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Stats bar */}
          <View style={styles.statsBar}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{userMessages.length}</Text>
              <Text style={styles.statLabel}>Questions Asked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>
                {chatHistory.filter((m) => m.isBot).length}
              </Text>
              <Text style={styles.statLabel}>AI Responses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{chatHistory.length}</Text>
              <Text style={styles.statLabel}>Total Messages</Text>
            </View>
          </View>

          <FlatList
            data={chatHistory.filter((m) => !m.isBot)}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </>
      )}
    </SafeAreaView>
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
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: TEXT_DARK },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },

  statsBar: {
    flexDirection: "row",
    backgroundColor: CARD,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "800", color: GREEN_BTN },
  statLabel: { fontSize: 11, color: TEXT_MUTED, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: BORDER },

  list: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userBubbleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cardNum: { fontSize: 12, fontWeight: "600", color: TEXT_MUTED, flex: 1 },
  cardTime: { fontSize: 11, color: TEXT_MUTED },
  cardQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 8,
    lineHeight: 20,
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 10,
  },
  replyText: { fontSize: 13, color: GREEN_BTN, flex: 1, lineHeight: 18 },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  startBtn: {
    flexDirection: "row",
    backgroundColor: GREEN_BTN,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  startBtnText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
});
