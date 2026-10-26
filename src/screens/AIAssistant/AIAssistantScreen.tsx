import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { requireOptionalNativeModule } from "expo";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Camera from "lucide-react-native/icons/camera";
import File from "lucide-react-native/icons/file";
import Leaf from "lucide-react-native/icons/leaf";
import Mic from "lucide-react-native/icons/mic";
import { useAppStore } from "../../store/appStore";
import { useSettingsStore } from "../../store/settingsStore";
import {
  askAssistant,
  getChatHistory,
  sendVoiceQuestion,
} from "../../api/aiApi";
import { analyzeWithDiseaseModel } from "../../api/diseaseModelApi";
import { saveDetailedScan, uploadScanImage } from "../../api/scanApi";
import {
  AIAssistantStackParamList,
  ChatAttachment,
  ChatMessage,
  ScanAnalysis,
} from "../../navigation/types";
import { Theme } from "../../theme";
import { ChatHeader, ChatLanguage } from "../../components/chat/ChatHeader";
import { ChatInputBar } from "../../components/chat/ChatInputBar";
import { MessageBubble, MessageTag } from "../../components/chat/MessageBubble";
import { AttachSheet } from "../../components/chat/AttachSheet";

// Loaded on first use: expo-audio throws on import in a build without its
// native code, which would otherwise crash the whole app
const VoiceModeScreen = React.lazy(() =>
  import("./VoiceModeScreen").then((m) => ({ default: m.VoiceModeScreen })),
);

const SUGGESTIONS = [
  "What is leaf blight?",
  "Best organic fertilizer for wheat?",
  "गेहूं की कटाई कब करें?",
];

const timeNow = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Drop markdown symbols so text-to-speech doesn't read them out
const toSpeechText = (markdown: string) =>
  markdown
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // headings
    .replace(/^\s*[-*+•]\s+/gm, "") // bullet markers
    .replace(/[*_`~]+/g, ""); // bold, italic, code, strikethrough

// Tag shown on an AI reply to a photo, e.g. "Likely: Early blight"
const scanTag = (result: ScanAnalysis): MessageTag => {
  if (result.disease) {
    return { label: `Likely: ${result.disease.name}`, note: "from your photo" };
  }
  return result.healthStatus === "Healthy"
    ? { label: "Looks healthy", note: "from your photo", tone: "success" }
    : { label: result.healthStatus, note: "from your photo" };
};

type Props = {
  navigation: NativeStackNavigationProp<AIAssistantStackParamList, "AIChat">;
};

export const AIAssistantScreen: React.FC<Props> = ({ navigation }) => {
  const {
    chatHistory,
    addChatMessage,
    setChatHistory,
    addScan,
    user,
    activeConversationId,
    setActiveConversationId,
  } = useAppStore();

  // The chat language follows the app-wide language setting
  const settingsLanguage = useSettingsStore((s) => s.language);
  const settingsLoaded = useSettingsStore((s) => s.loaded);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const language: ChatLanguage = settingsLanguage === "Hindi" ? "hi" : "en";

  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [voiceLoaded, setVoiceLoaded] = useState(false);
  const [voiceVisible, setVoiceVisible] = useState(false);
  const afterVoiceClose = useRef<(() => void) | null>(null);
  const [loading, setLoading] = useState(false);
  const [typingLabel, setTypingLabel] = useState("Thinking…");
  const [initializing, setInitializing] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    Record<string, "saving" | "saved">
  >({});
  const speechRef = useRef<typeof import("expo-speech") | null>(null);
  const stopVoiceReply = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!settingsLoaded) loadSettings();
  }, [settingsLoaded, loadSettings]);

  // Stop any audio when leaving the chat
  useFocusEffect(
    useCallback(
      () => () => {
        speechRef.current?.stop();
        stopVoiceReply.current?.();
      },
      [],
    ),
  );

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
    if ((!text && attachments.length === 0) || loading) return;

    const sent = attachments;
    addChatMessage({
      id: `u-${Date.now()}`,
      text,
      isBot: false,
      timestamp: timeNow(),
      attachments: sent.length > 0 ? sent : undefined,
    });
    setInputText("");
    setAttachments([]);
    setTypingLabel("Thinking…");
    setLoading(true);

    try {
      // The assistant only takes text, so a photo goes through the disease
      // model first and its result is passed along as crop/disease context
      const photo = sent.find((a) => a.kind === "image");
      let crop: string | null = null;
      let disease: string | null = null;
      let scan: ChatMessage["scan"];
      if (photo) {
        setTypingLabel("Checking your photo…");
        const analysis = await analyzeWithDiseaseModel(
          photo.uri,
          photo.mimeType,
        );
        if (analysis.modelAvailable !== false) {
          crop = analysis.plantName || null;
          disease = analysis.disease?.name ?? null;
          scan = { photo, result: analysis };
        }
        setTypingLabel("Thinking…");
      }

      const fileNames = sent.filter((a) => a.kind === "pdf").map((a) => a.name);
      const fallbackMessage = photo
        ? "What is wrong with my crop in this photo?"
        : `I've shared ${fileNames.join(", ")}.`;

      const response = await askAssistant({
        message: text || fallbackMessage,
        conversation_id: activeConversationId,
        farmer_name: user?.name || null,
        location: user?.location || null,
        crop,
        disease,
        language,
      });

      if (response.conversation_id) {
        setActiveConversationId(response.conversation_id);
      }

      addChatMessage({
        id: response.request_id || `b-${Date.now()}`,
        text: response.answer,
        isBot: true,
        timestamp: timeNow(),
        scan,
      });
    } catch {
      addChatMessage({
        id: `err-${Date.now()}`,
        text: "⚠️ Could not reach the AI server. Please check your connection and try again.",
        isBot: true,
        timestamp: timeNow(),
      });
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (l: ChatLanguage) =>
    updateSettings({ language: l === "hi" ? "Hindi" : "English" });

  const handleMicPress = () => {
    if (!requireOptionalNativeModule("ExpoAudio")) {
      Alert.alert(
        "Update needed",
        "Voice mode needs the latest version of the app.",
      );
      return;
    }
    stopVoiceReply.current?.();
    setVoiceLoaded(true);
    setVoiceVisible(true);
  };

  // iOS can't show another modal until voice mode has fully closed
  const closeVoiceMode = (then?: () => void) => {
    setVoiceVisible(false);
    if (!then) return;
    if (Platform.OS === "ios") {
      afterVoiceClose.current = then;
    } else {
      then();
    }
  };

  const playVoiceReply = async (clips: string[]) => {
    stopVoiceReply.current?.();
    try {
      // Loaded on first use, like voice mode itself
      const { playBase64Wavs } = await import("../../lib/voicePlayback");
      stopVoiceReply.current = await playBase64Wavs(clips);
    } catch (error) {
      console.warn("[AIAssistant] Could not play the spoken answer:", error);
    }
  };

  const handleVoiceRecorded = async (uri: string) => {
    closeVoiceMode();
    setTypingLabel("Thinking…");
    setLoading(true);

    try {
      const reply = await sendVoiceQuestion({
        audioUri: uri,
        conversationId: activeConversationId,
        languageCode: language === "hi" ? "hi-IN" : "unknown",
      });

      if (reply.conversation_id) {
        setActiveConversationId(reply.conversation_id);
      }
      addChatMessage({
        id: `u-${Date.now()}`,
        text: reply.transcript?.trim() || "Voice question",
        isBot: false,
        timestamp: timeNow(),
      });
      addChatMessage({
        id: `b-${Date.now()}`,
        text: reply.answer_text,
        isBot: true,
        timestamp: timeNow(),
      });
      if (reply.audios?.length) playVoiceReply(reply.audios);
    } catch (error) {
      addChatMessage({
        id: `err-${Date.now()}`,
        text: `⚠️ Couldn't answer your voice question. ${
          error instanceof Error ? error.message : "Please try again."
        }`,
        isBot: true,
        timestamp: timeNow(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Past scans live on the History tab
  const openScanHistory = () => {
    navigation.getParent()?.navigate("History");
  };

  const handleListen = async (msg: ChatMessage) => {
    stopVoiceReply.current?.();
    try {
      // Loaded on first use: like the document picker, it throws on import
      // in a build without its native code
      const Speech = speechRef.current ?? (await import("expo-speech"));
      speechRef.current = Speech;
      await Speech.stop();

      if (speakingId === msg.id) {
        setSpeakingId(null);
        return;
      }

      const clear = () => setSpeakingId((id) => (id === msg.id ? null : id));
      setSpeakingId(msg.id);
      Speech.speak(toSpeechText(msg.text), {
        language: language === "hi" ? "hi-IN" : "en-IN",
        onDone: clear,
        onStopped: clear,
        onError: clear,
      });
    } catch (error) {
      console.warn("[AIAssistant] Read aloud failed:", error);
      setSpeakingId(null);
      Alert.alert(
        "Can't read aloud",
        "Listening isn't available in this build of the app yet.",
      );
    }
  };

  // Saves the photo and diagnosis the same way the Scanner does
  const handleSaveToHistory = async (msg: ChatMessage) => {
    if (!msg.scan || saveStatus[msg.id]) return;
    const { photo, result } = msg.scan;
    setSaveStatus((s) => ({ ...s, [msg.id]: "saving" }));

    try {
      // Only the uploaded server URL is stored, never the local file:// URI
      const imageUri = await uploadScanImage(photo.uri, photo.mimeType);
      await Promise.all([
        saveDetailedScan(imageUri, result),
        addScan({ imageUri, result }),
      ]);
      setSaveStatus((s) => ({ ...s, [msg.id]: "saved" }));
    } catch (error) {
      console.warn("[AIAssistant] Save to History failed:", error);
      setSaveStatus(({ [msg.id]: _failed, ...rest }) => rest);
      Alert.alert(
        "Couldn't save to History",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const quickActions = [
    {
      label: "Photo of crop",
      Icon: Camera,
      bg: "#DCFCE7",
      fg: Theme.colors.primary,
      onPress: () => setSheetVisible(true),
    },
    {
      label: "Soil report",
      Icon: File,
      bg: "#FEF3C7",
      fg: "#92400E",
      onPress: () => setSheetVisible(true),
    },
    {
      label: "Ask by voice",
      Icon: Mic,
      bg: "#DBEAFE",
      fg: "#1E40AF",
      onPress: handleMicPress,
    },
  ];

  const renderTyping = () => (
    <View style={styles.typing}>
      <View style={styles.typingDots}>
        <View style={[styles.dot, { backgroundColor: Theme.colors.primary }]} />
        <View style={[styles.dot, { backgroundColor: "#86EFAC" }]} />
        <View style={[styles.dot, { backgroundColor: Theme.colors.border }]} />
      </View>
      <Text style={styles.typingText}>{typingLabel}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Leaf size={40} color={Theme.colors.primary} />
      </View>
      <View style={styles.emptyCopy}>
        <Text style={styles.emptyTitle}>Namaste! How can I help?</Text>
        <Text style={styles.emptySubtitle}>
          Type, speak, or send a photo of your crop. I can also read soil
          reports and documents.
        </Text>
      </View>

      <View style={styles.actions}>
        {quickActions.map(({ label, Icon, bg, fg, onPress }) => (
          <TouchableOpacity
            key={label}
            style={styles.action}
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <View style={[styles.actionIcon, { backgroundColor: bg }]}>
              <Icon size={20} color={fg} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.suggestions}>
        <Text style={styles.suggestionsTitle}>Try asking</Text>
        {SUGGESTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            style={styles.suggestion}
            onPress={() => setInputText(s)}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={styles.suggestionText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ChatHeader
        language={language}
        onLanguageChange={changeLanguage}
        onHistoryPress={() => navigation.navigate("AIChatHistory")}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {initializing ? (
          <View style={styles.initLoader}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={styles.initText}>Loading your chat...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatHistory}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble
                {...item}
                tag={item.scan ? scanTag(item.scan.result) : undefined}
                speaking={speakingId === item.id}
                onListenPress={
                  item.isBot ? () => handleListen(item) : undefined
                }
                saveStatus={saveStatus[item.id] ?? "idle"}
                onSavePress={
                  item.scan ? () => handleSaveToHistory(item) : undefined
                }
              />
            )}
            extraData={[speakingId, saveStatus]}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={loading ? renderTyping : undefined}
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

        <ChatInputBar
          value={inputText}
          onChangeText={setInputText}
          attachments={attachments}
          onRemoveAttachment={(id) =>
            setAttachments((prev) => prev.filter((a) => a.id !== id))
          }
          onAttachPress={() => setSheetVisible(true)}
          onSend={handleSend}
          onMicPress={handleMicPress}
          placeholder="Ask about your crops…"
          loading={loading}
        />
      </KeyboardAvoidingView>

      <AttachSheet
        visible={sheetVisible}
        existingCount={attachments.length}
        onClose={() => setSheetVisible(false)}
        onAdd={(added) => setAttachments((prev) => [...prev, ...added])}
        onPastScanPress={openScanHistory}
      />

      {voiceLoaded && (
        <Suspense fallback={null}>
          <VoiceModeScreen
            visible={voiceVisible}
            language={language}
            onLanguageChange={changeLanguage}
            onSend={handleVoiceRecorded}
            onClose={() => closeVoiceMode()}
            onSwitchToKeyboard={() => closeVoiceMode()}
            onAddPhoto={() => closeVoiceMode(() => setSheetVisible(true))}
            onDismiss={() => {
              afterVoiceClose.current?.();
              afterVoiceClose.current = null;
            }}
          />
        </Suspense>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  flex: { flex: 1 },

  // List
  listContent: { paddingVertical: 12 },
  listContentEmpty: { flexGrow: 1 },

  // Empty state
  empty: {
    alignItems: "center",
    gap: 18,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCopy: { alignItems: "center", gap: 6 },
  emptyTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 22,
    color: Theme.colors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.muted,
    textAlign: "center",
  },
  actions: { flexDirection: "row", gap: 10, alignSelf: "stretch" },
  action: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 13,
    color: Theme.colors.text,
    textAlign: "center",
  },
  suggestions: { alignSelf: "stretch", gap: 8 },
  suggestionsTitle: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 12,
    color: Theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  suggestion: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.primaryLight,
  },
  suggestionText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: "#166534",
  },

  // Typing indicator
  typing: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  typingDots: { flexDirection: "row", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  typingText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.muted,
  },

  // Init loader
  initLoader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  initText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
  },
});
