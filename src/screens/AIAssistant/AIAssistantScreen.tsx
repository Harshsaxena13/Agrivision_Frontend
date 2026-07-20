import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppStore } from "../../store/appStore";
import { askAssistant, getChatHistory } from "../../api/aiApi";
import { AIAssistantStackParamList, ChatMessage } from "../../navigation/types";

const GREEN_PRIMARY = "#166534";
const GREEN_BTN = "#0B7A3E";
const BG_COLOR = "#F9FAFB";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const BORDER_COLOR = "#E5E7EB";

type Props = {
  navigation: NativeStackNavigationProp<AIAssistantStackParamList, "AIChat">;
};

export const AIAssistantScreen: React.FC<Props> = ({ navigation }) => {
  const {
    chatHistory,
    addChatMessage,
    setChatHistory,
    user,
    activeConversationId,
    setActiveConversationId,
  } = useAppStore();

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Load chat history from backend on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (activeConversationId) {
        try {
          const session = await getChatHistory(activeConversationId);
          const msgs: ChatMessage[] = session.messages.map((m, i) => ({
            id: `hist-${i}-${m.created_at}`,
            text: m.content,
            isBot: m.role === "assistant",
            timestamp: new Date(m.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setChatHistory(msgs);
        } catch {
          setActiveConversationId(null);
          setChatHistory([]);
        }
      }
      setInitializing(false);
    };
    loadHistory();
  }, []);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      text,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    addChatMessage(userMsg);
    setInputText("");
    setLoading(true);

    try {
      const response = await askAssistant({
        message: text,
        conversation_id: activeConversationId,
        farmer_name: user?.name || null,
        location: user?.location || null,
        crop: null,
        disease: null,
        language: "en",
      });

      if (response.conversation_id) {
        setActiveConversationId(response.conversation_id);
      }

      addChatMessage({
        id: response.request_id || `b-${Date.now()}`,
        text: response.answer,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } catch {
      addChatMessage({
        id: `err-${Date.now()}`,
        text: "⚠️ Could not reach the AI server. Please check your connection and try again.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.row, item.isBot ? styles.rowBot : styles.rowUser]}>
      {item.isBot && (
        <View style={styles.avatar}>
          <Ionicons name="leaf" size={14} color={GREEN_BTN} />
        </View>
      )}
      <View style={[styles.bubble, item.isBot ? styles.bubbleBot : styles.bubbleUser]}>
        {item.text.split("\n").map((line, i) => (
          <Text key={i} style={item.isBot ? styles.textBot : styles.textUser}>
            {line}
          </Text>
        ))}
        <Text style={[styles.ts, !item.isBot && styles.tsRight]}>
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  const renderTyping = () => (
    <View style={[styles.row, styles.rowBot]}>
      <View style={styles.avatar}>
        <Ionicons name="leaf" size={14} color={GREEN_BTN} />
      </View>
      <View style={[styles.bubble, styles.bubbleBot, { flexDirection: "row", alignItems: "center", paddingVertical: 14 }]}>
        <ActivityIndicator size="small" color={GREEN_BTN} />
        <Text style={[styles.textBot, { marginLeft: 10 }]}>Thinking...</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="leaf" size={40} color={GREEN_BTN} />
      </View>
      <Text style={styles.emptyTitle}>AgriVision AI Assistant</Text>
      <Text style={styles.emptySubtitle}>
        Ask me anything about your crops, diseases, weather, or farming practices.
      </Text>
      <View style={styles.suggestionsWrap}>
        {[
          "What is Leaf Blight?",
          "How to treat my tomato?",
          "Best organic fertilizers?",
          "When to harvest wheat?",
        ].map((s) => (
          <TouchableOpacity
            key={s}
            style={styles.suggestion}
            onPress={() => setInputText(s)}
          >
            <Ionicons name="chatbubble-outline" size={14} color={GREEN_BTN} style={{ marginRight: 8 }} />
            <Text style={styles.suggestionText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="leaf" size={18} color="#FFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSub}>Powered by GPT-4o</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.onlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => navigation.navigate("AIChatHistory")}
          >
            <Ionicons name="time-outline" size={20} color={GREEN_BTN} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Body ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {initializing ? (
          <View style={styles.initLoader}>
            <ActivityIndicator size="large" color={GREEN_BTN} />
            <Text style={styles.initText}>Loading your chat...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatHistory}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={loading ? renderTyping : null}
            contentContainerStyle={[
              styles.listContent,
              chatHistory.length === 0 && styles.listContentEmpty,
            ]}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* ── Input Bar ── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about farming..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || loading) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: GREEN_BTN,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  headerSub: { fontSize: 11, color: TEXT_MUTED },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  onlinePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#22C55E" },
  onlineText: { fontSize: 11, fontWeight: "600", color: GREEN_BTN },
  historyBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
  },

  // List
  listContent: { padding: 16, paddingBottom: 12 },
  listContentEmpty: { flex: 1 },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  suggestionsWrap: { width: "100%", gap: 10 },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionText: { fontSize: 14, color: GREEN_BTN, fontWeight: "500" },

  // Messages
  row: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-end",
  },
  rowBot: { justifyContent: "flex-start" },
  rowUser: { justifyContent: "flex-end" },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: GREEN_PRIMARY,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderBottomLeftRadius: 4,
  },
  textUser: { fontSize: 15, color: "#FFF", lineHeight: 22 },
  textBot: { fontSize: 15, color: TEXT_DARK, lineHeight: 22 },
  ts: { fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 4 },
  tsRight: { textAlign: "right" },

  // Input
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 12 : 10,
    backgroundColor: CARD_BG,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: BG_COLOR,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: TEXT_DARK,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GREEN_BTN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  sendBtnDisabled: { backgroundColor: "#D1FAE5" },

  // Init loader
  initLoader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  initText: { fontSize: 14, color: TEXT_MUTED },
});
